import { Link } from 'react-router-dom';
import { Shield, CheckCircle, AlertTriangle, FileSearch, MessageSquare, ArrowRight, Zap } from 'lucide-react';

const FEATURES = [
  { icon: Shield, title: 'EU AI Act Compliance', desc: 'Automated risk classification per Annex III. Know your obligations in minutes.' },
  { icon: FileSearch, title: 'AI System Inventory', desc: 'Register every AI tool in use — from ChatGPT to custom models — with risk tags and ownership.' },
  { icon: AlertTriangle, title: 'Gap Analysis', desc: 'Prioritised list of compliance gaps with recommended actions and due dates.' },
  { icon: MessageSquare, title: 'Ask ComplianceOS', desc: 'Contextual AI assistant answers "Can I use this data?" with sources and recommended actions.' },
  { icon: CheckCircle, title: 'Requirements Tracker', desc: 'Track Art. 9–16 obligations per system with owner assignment and status.' },
  { icon: Zap, title: 'Role-Aware Views', desc: 'Employee, Manager, Compliance Manager, and Auditor dashboards — right information, right person.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-6 lg:px-8 h-16 border-b border-gray-100 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">ComplianceOS</span>
        </div>
        <Link to="/dashboard" className="btn-primary gap-2">
          Open Dashboard <ArrowRight className="w-4 h-4" />
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Hero */}
        <div className="py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 text-primary-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <Zap className="w-3 h-3" /> EU AI Act — In force August 2024
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            AI Compliance,<br />
            <span className="text-primary-600">Without the Complexity</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            ComplianceOS helps organisations inventory their AI systems, assess EU AI Act obligations,
            track compliance gaps, and answer "is this allowed?" — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/dashboard" className="btn-primary text-base px-6 py-3 gap-2">
              Explore Demo <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/login" className="btn-secondary text-base px-6 py-3">
              Sign In
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-12 border-y border-gray-100">
          {[
            { label: 'AI systems tracked', value: '6' },
            { label: 'Open compliance gaps', value: '8' },
            { label: 'Readiness score', value: '62%' },
            { label: 'High risk systems', value: '2' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-1">{value}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="py-20">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Everything you need for AI compliance</h2>
          <p className="text-gray-500 text-center mb-12 max-w-xl mx-auto">Built specifically for the EU AI Act — from risk classification to gap remediation.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:shadow-md transition-shadow duration-200">
                <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-primary-600 rounded-2xl p-12 text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to explore the demo?</h2>
          <p className="text-primary-200 mb-8">Pre-loaded with a sample financial services organisation and realistic compliance data.</p>
          <Link to="/dashboard" className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors">
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
