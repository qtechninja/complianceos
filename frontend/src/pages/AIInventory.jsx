import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Database, ExternalLink } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingPage } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useRole } from '../context/RoleContext';

const SENSITIVITY_OPTS = ['Low', 'Medium', 'High', 'Critical'];

function AddSystemModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', provider: '', purpose: '', dataSensitivity: 'Low', customerFacing: false, department: '', useCase: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.provider.trim()) e.provider = 'Required';
    if (!form.purpose.trim()) e.purpose = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/ai-systems', form);
      onCreated(res.data);
      toast('AI system registered successfully');
      onClose();
      setForm({ name: '', provider: '', purpose: '', dataSensitivity: 'Low', customerFacing: false, department: '', useCase: '' });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title="Register AI System" size="lg">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">System Name *</label>
            <input className="input-field" placeholder="e.g. ChatGPT Enterprise" value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider *</label>
            <input className="input-field" placeholder="e.g. OpenAI" value={form.provider} onChange={e => set('provider', e.target.value)} />
            {errors.provider && <p className="text-xs text-red-500 mt-1">{errors.provider}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Use Case *</label>
          <textarea className="input-field" rows={2} placeholder="Describe what this AI system does" value={form.purpose} onChange={e => set('purpose', e.target.value)} />
          {errors.purpose && <p className="text-xs text-red-500 mt-1">{errors.purpose}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Sensitivity</label>
            <select className="input-field" value={form.dataSensitivity} onChange={e => set('dataSensitivity', e.target.value)}>
              {SENSITIVITY_OPTS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input className="input-field" placeholder="e.g. Engineering" value={form.department} onChange={e => set('department', e.target.value)} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input type="checkbox" id="cf" checked={form.customerFacing} onChange={e => set('customerFacing', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
          <label htmlFor="cf" className="text-sm text-gray-700">Customer-facing system</label>
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>
            {loading ? 'Saving…' : 'Register System'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function AIInventory() {
  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const { role } = useRole();

  useEffect(() => {
    api.get('/ai-systems')
      .then(r => setSystems(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;
  if (error) return <div className="text-center py-16 text-red-600">{error}</div>;

  const filtered = systems.filter(s => {
    const q = search.toLowerCase();
    const match = !q || s.name.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q) || s.purpose.toLowerCase().includes(q);
    const statusMatch = !filterStatus || s.euAiActStatus === filterStatus;
    return match && statusMatch;
  });

  const canAdd = ['Manager', 'Compliance Manager'].includes(role);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI System Inventory</h1>
          <p className="text-sm text-gray-500 mt-1">{systems.length} systems registered</p>
        </div>
        {canAdd && (
          <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" /> Register System
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input className="input-field pl-9" placeholder="Search systems…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-field sm:w-48" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {['Not Assessed', 'In Progress', 'Compliant', 'Non-Compliant', 'Exempt'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Database} title="No systems found" message="Try adjusting your search or register a new AI system." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['System', 'Provider', 'Department', 'Data Sensitivity', 'Customer Facing', 'Approval', 'EU AI Act Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 text-sm">{s.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{s.purpose}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{s.provider}</td>
                    <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{s.department || '—'}</td>
                    <td className="px-4 py-4 whitespace-nowrap"><Badge label={s.dataSensitivity} /></td>
                    <td className="px-4 py-4 text-sm text-center">
                      {s.customerFacing ? <span className="text-emerald-600">Yes</span> : <span className="text-gray-400">No</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap"><Badge label={s.approvalStatus} /></td>
                    <td className="px-4 py-4 whitespace-nowrap"><Badge label={s.euAiActStatus} /></td>
                    <td className="px-4 py-4">
                      <Link to={`/inventory/${s.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
                        View <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AddSystemModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={s => setSystems(p => [s, ...p])} />
    </div>
  );
}
