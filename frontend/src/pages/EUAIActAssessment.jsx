import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingPage } from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';
import Badge from '../components/ui/Badge';

const STEPS = [
  {
    id: 'purpose',
    title: 'System Purpose',
    questions: [
      { key: 'purpose', type: 'textarea', label: 'Describe the primary purpose and function of this AI system', required: true },
      { key: 'recruitment', type: 'checkbox', label: 'Used for recruitment, CV screening, or candidate assessment?' },
      { key: 'creditScoring', type: 'checkbox', label: 'Used for credit scoring or creditworthiness evaluation?' },
      { key: 'lawEnforcement', type: 'checkbox', label: 'Used by or for law enforcement agencies?' },
    ],
  },
  {
    id: 'users',
    title: 'Users & Deployment',
    questions: [
      { key: 'users', type: 'text', label: 'Who uses this system? (e.g. loan officers, customers, HR team)', required: true },
      { key: 'customerFacing', type: 'checkbox', label: 'Does the system interact directly with customers / end users?' },
      { key: 'vulnerable', type: 'checkbox', label: 'Does the system make decisions that could affect vulnerable groups (minors, elderly, financially distressed)?' },
      { key: 'geography', type: 'text', label: 'Geographic scope (e.g. EU customers only, global)', required: true },
    ],
  },
  {
    id: 'data',
    title: 'Data & Oversight',
    questions: [
      { key: 'dataTypes', type: 'multicheck', label: 'Types of data processed', options: ['Personal identifiers','Financial data','Health data','Biometric data','Employment data','Behavioural data','Location data','Criminal record data'] },
      { key: 'biometricData', type: 'checkbox', label: 'Does the system process or generate biometric data?' },
      { key: 'oversight', type: 'textarea', label: 'Describe the human oversight mechanism in place', required: true },
    ],
  },
];

function StepForm({ step, values, onChange, errors }) {
  return (
    <div className="space-y-5">
      {step.questions.map(q => (
        <div key={q.key}>
          {q.type === 'text' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{q.label} {q.required && <span className="text-red-500">*</span>}</label>
              <input className="input-field" value={values[q.key] || ''} onChange={e => onChange(q.key, e.target.value)} />
              {errors[q.key] && <p className="text-xs text-red-500 mt-1">{errors[q.key]}</p>}
            </div>
          )}
          {q.type === 'textarea' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{q.label} {q.required && <span className="text-red-500">*</span>}</label>
              <textarea className="input-field" rows={3} value={values[q.key] || ''} onChange={e => onChange(q.key, e.target.value)} />
              {errors[q.key] && <p className="text-xs text-red-500 mt-1">{errors[q.key]}</p>}
            </div>
          )}
          {q.type === 'checkbox' && (
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={!!values[q.key]} onChange={e => onChange(q.key, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-primary-600" />
              <span className="text-sm text-gray-700">{q.label}</span>
            </label>
          )}
          {q.type === 'multicheck' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{q.label}</label>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(values[q.key] || []).includes(opt)}
                      onChange={e => {
                        const cur = values[q.key] || [];
                        onChange(q.key, e.target.checked ? [...cur, opt] : cur.filter(x => x !== opt));
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600"
                    />
                    <span className="text-sm text-gray-600">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const RISK_ICONS = { Unacceptable: XCircle, High: AlertTriangle, Limited: AlertTriangle, Minimal: CheckCircle };
const RISK_COLORS = { Unacceptable: 'text-red-600', High: 'text-orange-600', Limited: 'text-amber-600', Minimal: 'text-emerald-600' };

export default function EUAIActAssessment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/ai-systems/${id}`)
      .then(r => {
        setSystem(r.data);
        if (r.data.assessment) setResult(r.data.assessment);
      })
      .catch(e => toast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  function set(k, v) { setValues(p => ({ ...p, [k]: v })); }

  function validateStep() {
    const e = {};
    STEPS[step].questions.filter(q => q.required).forEach(q => {
      if (!values[q.key] || values[q.key] === '') e[q.key] = 'This field is required';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validateStep()) return;
    setStep(s => s + 1);
    setErrors({});
  }

  async function submit() {
    if (!validateStep()) return;
    setSubmitting(true);
    try {
      const res = await api.post(`/ai-systems/${id}/assessment`, { questionnaireData: values });
      setResult(res.data);
      toast('Assessment complete');
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <LoadingPage />;

  const RiskIcon = result ? (RISK_ICONS[result.riskLevel] || CheckCircle) : null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/inventory/${id}`} className="btn-secondary p-2"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">EU AI Act Assessment</h1>
          <p className="text-sm text-gray-500">{system?.name}</p>
        </div>
      </div>

      {result ? (
        <div className="card">
          <div className="card-body space-y-5">
            <div className="flex items-center gap-3">
              {RiskIcon && <RiskIcon className={`w-8 h-8 ${RISK_COLORS[result.riskLevel]}`} />}
              <div>
                <p className="text-lg font-bold text-gray-900">{result.applicabilityResult}</p>
                <Badge label={result.riskLevel} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{result.pathway}</p>
            </div>
            {result.riskLevel === 'High' && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-orange-800 mb-2">Required actions for High Risk systems:</p>
                <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
                  <li>Implement risk management system (Art. 9)</li>
                  <li>Conduct data bias audit (Art. 10)</li>
                  <li>Complete technical documentation (Art. 11)</li>
                  <li>Configure automatic logging (Art. 12)</li>
                  <li>Implement human oversight mechanisms (Art. 14)</li>
                  <li>Register in EU AI database before deployment (Art. 16)</li>
                </ul>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setResult(null); setStep(0); setValues({}); }} className="btn-secondary flex-1">Redo Assessment</button>
              <Link to={`/requirements?systemId=${id}`} className="btn-primary flex-1 justify-center">View Requirements</Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="card-body">
            {/* Progress */}
            <div className="flex items-center gap-2 mb-6">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-sm ${i === step ? 'font-medium text-gray-900' : 'text-gray-400'}`}>{s.title}</span>
                  {i < STEPS.length - 1 && <div className="flex-1 h-px bg-gray-200 w-6" />}
                </div>
              ))}
            </div>

            <h2 className="text-base font-semibold text-gray-900 mb-4">{STEPS[step].title}</h2>
            <StepForm step={STEPS[step]} values={values} onChange={set} errors={errors} />

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-secondary gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < STEPS.length - 1 ? (
                <button onClick={next} className="btn-primary ml-auto gap-2">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={submit} disabled={submitting} className="btn-primary ml-auto gap-2">
                  {submitting ? 'Analysing…' : 'Get Assessment'} <CheckCircle className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
