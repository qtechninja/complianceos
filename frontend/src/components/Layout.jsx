import { Link, useLocation } from 'react-router-dom';
import { Shield, LayoutDashboard, Database, ClipboardCheck, MessageSquare, Settings, ChevronDown } from 'lucide-react';
import { useRole, ROLES } from '../context/RoleContext';
import { useState } from 'react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Command Centre', icon: LayoutDashboard },
  { to: '/inventory', label: 'AI Inventory', icon: Database },
  { to: '/requirements', label: 'Requirements & Gaps', icon: ClipboardCheck },
  { to: '/ask', label: 'Ask ComplianceOS', icon: MessageSquare },
];

const ROLE_COLORS = {
  'Employee': 'bg-gray-100 text-gray-700',
  'Manager': 'bg-blue-100 text-blue-700',
  'Compliance Manager': 'bg-primary-100 text-primary-700',
  'Auditor': 'bg-amber-100 text-amber-700',
};

export default function Layout({ children }) {
  const location = useLocation();
  const { role, setRole } = useRole();
  const [roleOpen, setRoleOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg">ComplianceOS</span>
              </Link>
              <div className="hidden md:flex items-center gap-1">
                {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                      location.pathname.startsWith(to)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setRoleOpen(o => !o)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${ROLE_COLORS[role]} hover:opacity-80`}
                >
                  <span>{role}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {roleOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg border border-gray-200 shadow-lg z-50">
                    <div className="p-2">
                      <p className="text-xs text-gray-400 px-2 pb-1 font-medium">Switch Role (Demo)</p>
                      {ROLES.map(r => (
                        <button
                          key={r}
                          onClick={() => { setRole(r); setRoleOpen(false); }}
                          className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${r === role ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to="/admin"
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Super Admin"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {roleOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setRoleOpen(false)} />
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
