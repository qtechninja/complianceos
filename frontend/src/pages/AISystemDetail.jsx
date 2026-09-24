import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ClipboardCheck, AlertTriangle, CheckCircle, User } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingPage } from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import { useRole } from '../context/RoleContext';

export default function AISystemDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useRole();

  useEffect(() => {
    api.get(`/ai-systems/${id}`)
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingPage />;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

  const { assessment, requirements, openGaps, ...system } = data;

  const canManage = ['Compliance Manager', 'Manager'].includes(role);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-secondary p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{system.name}</h1>
          <p className="text-sm text-gray-500">{system.provider} · {system.department || 'Unassigned'}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Badge label={system.euAiActStatus} />
          <Badge label={system.approvalStatus} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="card-body">
              <h2 className="text-base font-semibold text-gray-900 mb-4">System Details</h2>
              <dl className="grid grid-cols-2 gap-4">
                {[
                  ['Provider', system.provider],
                  ['Department', system.department || '—'],
                  ['Data Sensitivity', <Badge key="ds" label={system.dataSensitivity} />],
                  ['Customer Facing', system.customerFacing ? 'Yes' : 'No'],
                  ['Owner', system.ownerName || '—'],
                  ['Registered', new Date(system.createdAt).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs font-medium text-gray-500">{k}</dt>
                    <dd className="text-sm text-gray-900 mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
              {system.purpose && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <dt className="text-xs font-medium text-gray-500 mb-1">Purpose</dt>
                  <dd className="text-sm text-gray-700">{system.purpose}</dd>
                </div>
              )}
              {system.useCase && (
                <div className="mt-3">
                  <dt className="text-xs font-medium text-gray-500 mb-1">Use Cases</dt>
                  <dd className="text-sm text-gray-700">{system.useCase}</dd>
                </div>
              )}
            </div>
          </div>

          {/* Assessment result */}
          {assessment && (
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                    <ClipboardCheck className="w-4 h-4 text-primary-600" /> EU AI Act Assessment
                  </h2>
                  <Badge label={assessment.riskLevel} />
                </div>
                <div className={`p-4 rounded-lg mb-4 ${
                  assessment.riskLevel === 'High' ? 'bg-orange-50 border border-orange-200' :
                  assessment.riskLevel === 'Unacceptable' ? 'bg-red-50 border border-red-200' :
                  'bg-emerald-50 border border-emerald-200'
                }`}>
                  <p className="text-sm font-semibold text-gray-900 mb-1">{assessment.applicabilityResult}</p>
                  <p className="text-sm text-gray-700">{assessment.pathway}</p>
                </div>
                {canManage && (
                  <Link to={`/inventory/${id}/assessment`} className="btn-secondary text-sm">
                    Update Assessment
                  </Link>
                )}
              </div>
            </div>
          )}

          {!assessment && (
            <div className="card border-dashed border-2 border-gray-200">
              <div className="card-body text-center py-10">
                <ClipboardCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">No Assessment Yet</p>
                <p className="text-xs text-gray-400 mb-4">Run the EU AI Act questionnaire to determine compliance obligations.</p>
                {canManage && (
                  <Link to={`/inventory/${id}/assessment`} className="btn-primary text-sm">
                    Start Assessment
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Requirements */}
          {requirements && requirements.length > 0 && (
            <div className="card">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Compliance Requirements</h2>
                  <span className="text-xs text-red-600 font-medium">{openGaps} open gaps</span>
                </div>
                <div className="space-y-2">
                  {requirements.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {r.status === 'Complete' ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                        <div>
                          <span className="text-sm font-medium text-gray-900">{r.article}</span>
                          <span className="text-sm text-gray-600 ml-2">— {r.title}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.ownerName && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User className="w-3 h-3" /> {r.ownerName}
                          </span>
                        )}
                        <Badge label={r.status} />
                      </div>
                    </div>
                  ))}
                </div>
                <Link to={`/requirements?systemId=${id}`} className="btn-secondary text-sm mt-4">
                  View All Requirements & Gaps
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card">
            <div className="card-body">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <Link to={`/inventory/${id}/assessment`} className="btn-secondary w-full justify-center text-sm">Run Assessment</Link>
                <Link to={`/ask?system=${id}`} className="btn-secondary w-full justify-center text-sm">Ask about this system</Link>
                <Link to={`/requirements?systemId=${id}`} className="btn-secondary w-full justify-center text-sm">View Requirements</Link>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Status Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Total Requirements</span>
                  <span className="font-medium">{requirements?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Complete</span>
                  <span className="font-medium text-emerald-600">{requirements?.filter(r => r.status === 'Complete').length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">In Progress</span>
                  <span className="font-medium text-amber-600">{requirements?.filter(r => r.status === 'In Progress').length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Open Gaps</span>
                  <span className="font-medium text-red-600">{openGaps || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
