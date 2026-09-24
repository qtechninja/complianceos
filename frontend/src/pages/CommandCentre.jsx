import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Shield, Activity, CheckCircle, Clock, TrendingUp, ArrowRight, Flame } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingPage } from '../components/ui/Loading';
import Badge from '../components/ui/Badge';
import { useRole } from '../context/RoleContext';

function ReadinessGauge({ score }) {
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r="54" fill="none" stroke="#e5e7eb" strokeWidth="12" />
        <circle
          cx="70" cy="70" r="54"
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x="70" y="65" textAnchor="middle" fontSize="28" fontWeight="700" fill="#111827">{score}</text>
        <text x="70" y="85" textAnchor="middle" fontSize="12" fill="#6b7280">/ 100</text>
      </svg>
      <span className="text-sm font-medium text-gray-600 -mt-2">Readiness Score</span>
    </div>
  );
}

const ROLE_ACTIONS = {
  Employee: [
    { label: 'Check AI use policy', to: '/ask', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { label: 'View approved AI tools', to: '/inventory', color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
  ],
  Manager: [
    { label: 'Review pending approvals', to: '/inventory', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { label: 'Assign gap owners', to: '/requirements', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
    { label: 'Ask a compliance question', to: '/ask', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  ],
  'Compliance Manager': [
    { label: 'Resolve critical gaps (3)', to: '/requirements', color: 'bg-red-50 text-red-700 hover:bg-red-100' },
    { label: 'Complete LoanSense assessment', to: '/inventory/3/assessment', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { label: 'Approve HireIQ system', to: '/inventory/5', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
    { label: 'Register FraudGuard in EU DB', to: '/requirements', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
  ],
  Auditor: [
    { label: 'Download compliance report', to: '/requirements', color: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
    { label: 'Review incident log', to: '/dashboard', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
    { label: 'View assessment results', to: '/inventory', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
  ],
};

export default function CommandCentre() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { role } = useRole();

  useEffect(() => {
    api.get('/dashboard/summary')
      .then(r => setData(r.data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingPage />;
  if (error) return (
    <div className="text-center py-16">
      <p className="text-red-600 mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-secondary">Retry</button>
    </div>
  );

  const { stats, recentIncidents, recentGaps, tenant } = data;

  const STAT_CARDS = [
    { label: 'AI Systems', value: stats.totalSystems, icon: Shield, color: 'text-primary-600 bg-primary-50', to: '/inventory' },
    { label: 'Open Gaps', value: stats.openGaps, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50', to: '/requirements' },
    { label: 'Critical Gaps', value: stats.criticalGaps, icon: Flame, color: 'text-red-600 bg-red-50', to: '/requirements?priority=Critical' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, color: 'text-blue-600 bg-blue-50', to: '/inventory' },
    { label: 'Open Incidents', value: stats.openIncidents, icon: Activity, color: 'text-orange-600 bg-orange-50', to: '/dashboard' },
    { label: 'Non-Compliant', value: stats.nonCompliant, icon: TrendingUp, color: 'text-red-600 bg-red-50', to: '/inventory' },
  ];

  const actions = ROLE_ACTIONS[role] || ROLE_ACTIONS['Employee'];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Command Centre</h1>
          <p className="text-sm text-gray-500 mt-1">{tenant.name} · {tenant.industry} · {tenant.country}</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-medium">Live</span>
      </div>

      {/* Top section: gauge + stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-body flex flex-col items-center justify-center">
            <ReadinessGauge score={stats.readinessScore} />
            <p className="text-xs text-gray-400 mt-2 text-center">
              {stats.readinessScore < 50 ? 'Below target — action required' : stats.readinessScore < 70 ? 'Making progress' : 'On track'}
            </p>
          </div>
        </div>
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, to }) => (
            <Link key={label} to={to} className="card hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="card-body flex flex-col gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* What needs attention + incidents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attention panel */}
        <div className="card">
          <div className="card-body">
            <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary-600" />
              What Needs Attention Today
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-auto">as {role}</span>
            </h2>
            <div className="space-y-2">
              {actions.map(({ label, to, color }) => (
                <Link key={label} to={to} className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${color}`}>
                  {label}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Top gaps */}
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Top Open Gaps
              </h2>
              <Link to="/requirements" className="text-xs text-primary-600 hover:underline">View all</Link>
            </div>
            <div className="space-y-3">
              {recentGaps.map(g => (
                <div key={g.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Badge label={g.priority} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{g.description.slice(0, 70)}…</p>
                    <p className="text-xs text-gray-400 mt-0.5">{g.systemName} · {g.article}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Incidents */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-orange-500" /> Recent Incidents
          </h2>
          <div className="space-y-3">
            {recentIncidents.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No incidents recorded</p>}
            {recentIncidents.map(inc => (
              <div key={inc.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                <Badge label={inc.severity} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{inc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{inc.systemName || 'Organisation-wide'} · Reported by {inc.reportedBy}</p>
                </div>
                <Badge label={inc.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
