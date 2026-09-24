import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AlertTriangle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingPage } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import { useToast } from '../components/ui/Toast';
import { useRole } from '../context/RoleContext';

function GapCard({ gap, onUpdate, canUpdate }) {
  const toast = useToast();
  const [updating, setUpdating] = useState(false);

  async function changeStatus(status) {
    setUpdating(true);
    try {
      await api.put(`/gaps/${gap.id}`, { status });
      onUpdate(gap.id, status);
      toast('Gap status updated');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className={`border rounded-lg p-4 ${gap.priority === 'Critical' ? 'border-red-200 bg-red-50/30' : gap.priority === 'High' ? 'border-orange-200 bg-orange-50/30' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-start gap-3">
        <Badge label={gap.priority} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{gap.description}</p>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Link to={`/inventory/${gap.aiSystemId}`} className="text-primary-600 hover:underline flex items-center gap-1">
              {gap.systemName} <ExternalLink className="w-3 h-3" />
            </Link>
            · {gap.article}
          </p>
          <div className="mt-2 p-3 bg-white border border-gray-200 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-1">Recommended Action</p>
            <p className="text-xs text-gray-700">{gap.recommendedAction}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge label={gap.status} />
          {canUpdate && gap.status !== 'Resolved' && (
            <select
              value={gap.status}
              onChange={e => changeStatus(e.target.value)}
              disabled={updating}
              className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Accepted">Accepted</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

function RequirementRow({ req, expanded, onToggle, gaps, onGapUpdate, canUpdate }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 bg-white hover:bg-gray-50 text-left transition-colors"
      >
        <span className="text-xs font-bold text-primary-700 bg-primary-50 px-2 py-1 rounded shrink-0">{req.article}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{req.title}</p>
          <p className="text-xs text-gray-500">{req.systemName} {req.ownerName ? `· ${req.ownerName}` : ''} {req.dueDate ? `· Due ${new Date(req.dueDate).toLocaleDateString()}` : ''}</p>
        </div>
        <Badge label={req.status} />
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>
      {expanded && gaps && gaps.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Gaps ({gaps.length})</p>
          {gaps.map(g => (
            <GapCard key={g.id} gap={{ ...g, systemName: req.systemName, aiSystemId: req.aiSystemId }} onUpdate={onGapUpdate} canUpdate={canUpdate} />
          ))}
        </div>
      )}
      {expanded && (!gaps || gaps.length === 0) && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 text-sm text-gray-400 text-center">No gaps for this requirement</div>
      )}
    </div>
  );
}

export default function RequirementsGaps() {
  const [searchParams] = useSearchParams();
  const [requirements, setRequirements] = useState([]);
  const [gaps, setGaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('requirements');
  const [expanded, setExpanded] = useState(null);
  const [filterPriority, setFilterPriority] = useState(searchParams.get('priority') || '');
  const [filterStatus, setFilterStatus] = useState('');
  const { role } = useRole();

  const canUpdate = ['Compliance Manager', 'Manager'].includes(role);

  useEffect(() => {
    const systemId = searchParams.get('systemId');
    const params = systemId ? `?systemId=${systemId}` : '';
    Promise.all([
      api.get(`/requirements${params}`),
      api.get(`/gaps${params}`),
    ])
      .then(([r, g]) => { setRequirements(r.data); setGaps(g.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function onGapUpdate(gapId, status) {
    setGaps(gs => gs.map(g => g.id === gapId ? { ...g, status } : g));
  }

  if (loading) return <LoadingPage />;

  const filteredGaps = gaps.filter(g => {
    return (!filterPriority || g.priority === filterPriority) && (!filterStatus || g.status === filterStatus);
  });

  const getReqGaps = (reqId) => gaps.filter(g => g.requirementId === reqId);

  const stats = {
    total: requirements.length,
    open: requirements.filter(r => r.status === 'Open').length,
    inProgress: requirements.filter(r => r.status === 'In Progress').length,
    complete: requirements.filter(r => r.status === 'Complete').length,
    critical: gaps.filter(g => g.priority === 'Critical' && g.status === 'Open').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Requirements & Gaps</h1>
        <p className="text-sm text-gray-500 mt-1">EU AI Act compliance obligations and open gaps</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {[
          { label: 'Total Requirements', value: stats.total, color: 'text-gray-900' },
          { label: 'Open', value: stats.open, color: 'text-red-600' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-amber-600' },
          { label: 'Complete', value: stats.complete, color: 'text-emerald-600' },
          { label: 'Critical Gaps', value: stats.critical, color: 'text-red-700' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card">
            <div className="card-body py-4">
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {['requirements', 'gaps'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t === 'requirements' ? `Requirements (${requirements.length})` : `Gaps (${gaps.length})`}
          </button>
        ))}
      </div>

      {tab === 'requirements' && (
        <div className="space-y-2">
          {requirements.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No requirements" message="Run an EU AI Act assessment to generate compliance requirements." />
          ) : (
            requirements.map(r => (
              <RequirementRow
                key={r.id}
                req={r}
                expanded={expanded === r.id}
                onToggle={() => setExpanded(p => p === r.id ? null : r.id)}
                gaps={getReqGaps(r.id)}
                onGapUpdate={onGapUpdate}
                canUpdate={canUpdate}
              />
            ))
          )}
        </div>
      )}

      {tab === 'gaps' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <select className="input-field sm:w-40" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
              <option value="">All Priorities</option>
              {['Critical','High','Medium','Low'].map(p => <option key={p}>{p}</option>)}
            </select>
            <select className="input-field sm:w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              {['Open','In Progress','Resolved','Accepted'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {filteredGaps.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="No gaps found" message="All requirements are met or filter is too narrow." />
          ) : (
            <div className="space-y-3">
              {filteredGaps.map(g => (
                <GapCard key={g.id} gap={g} onUpdate={onGapUpdate} canUpdate={canUpdate} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
