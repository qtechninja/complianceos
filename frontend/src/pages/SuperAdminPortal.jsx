import { useState, useEffect } from 'react';
import { Shield, Users, Building2, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingPage } from '../components/ui/Loading';
import Modal from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import { useRole } from '../context/RoleContext';

function AddTenantModal({ open, onClose, onCreated }) {
  const toast = useToast();
  const [form, setForm] = useState({ name: '', industry: '', country: '', employeeCount: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.industry.trim()) e.industry = 'Required';
    if (!form.country.trim()) e.country = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await api.post('/tenants', { ...form, employeeCount: parseInt(form.employeeCount) || 0 });
      onCreated(res.data);
      toast('Tenant created');
      onClose();
      setForm({ name: '', industry: '', country: '', employeeCount: '' });
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal open={open} onClose={onClose} title="Add Organisation">
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Organisation Name *</label>
          <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Acme Corp" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry *</label>
            <input className="input-field" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Finance" />
            {errors.industry && <p className="text-xs text-red-500 mt-1">{errors.industry}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
            <input className="input-field" value={form.country} onChange={e => set('country', e.target.value)} placeholder="e.g. Germany" />
            {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee Count</label>
          <input className="input-field" type="number" value={form.employeeCount} onChange={e => set('employeeCount', e.target.value)} placeholder="e.g. 500" />
        </div>
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1" disabled={loading}>{loading ? 'Creating…' : 'Create Organisation'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function SuperAdminPortal() {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { role } = useRole();

  useEffect(() => {
    api.get('/tenants/stats')
      .then(r => setTenants(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;

  const isAdmin = role === 'Compliance Manager' || role === 'Auditor';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary-600" /> Super Admin Portal
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage organisations and platform settings</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowAdd(true)} className="btn-primary gap-2">
            <Plus className="w-4 h-4" /> Add Organisation
          </button>
        )}
      </div>

      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Super Admin portal is view-only for your role ({role}). Switch to Compliance Manager or Auditor for management access.
        </div>
      )}

      {/* Platform stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Building2, label: 'Organisations', value: tenants.length },
          { icon: Users, label: 'Total Users', value: tenants.reduce((s, t) => s + (t.userCount || 0), 0) },
          { icon: Shield, label: 'Total AI Systems', value: tenants.reduce((s, t) => s + (t.systemCount || 0), 0) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card">
            <div className="card-body flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{value}</div>
                <div className="text-sm text-gray-500">{label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tenants table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-900">Organisations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Organisation', 'Industry', 'Country', 'Employees', 'AI Systems', 'Users', 'Readiness', 'Created'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tenants.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 text-sm font-medium text-gray-900">{t.name}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{t.industry}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{t.country}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{t.employeeCount.toLocaleString()}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{t.systemCount || 0}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">{t.userCount || 0}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${t.readinessScore >= 70 ? 'bg-emerald-500' : t.readinessScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${t.readinessScore}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">{t.readinessScore}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">{new Date(t.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddTenantModal open={showAdd} onClose={() => setShowAdd(false)} onCreated={t => setTenants(p => [...p, { ...t, systemCount: 0, userCount: 0 }])} />
    </div>
  );
}
