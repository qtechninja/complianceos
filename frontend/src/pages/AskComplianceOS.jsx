import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, BookOpen, Sparkles, ChevronDown } from 'lucide-react';
import { api } from '../lib/api';
import { LoadingSpinner } from '../components/ui/Loading';
import { useToast } from '../components/ui/Toast';
import { useRole } from '../context/RoleContext';

const SUGGESTED = [
  'Can I upload customer data to ChatGPT?',
  'What are our obligations for LoanSense AI?',
  'What does High Risk mean under EU AI Act?',
  'What do we need before deploying HireIQ?',
  'What are the penalties for non-compliance?',
  'Is GitHub Copilot subject to EU AI Act?',
];

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${isUser ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-900 rounded-tl-sm shadow-sm'}`}>
        <div className="text-sm whitespace-pre-line leading-relaxed">
          {msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part
          )}
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 font-medium mb-1.5 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Sources
            </p>
            <div className="flex flex-wrap gap-1">
              {msg.sources.map((s, i) => (
                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AskComplianceOS() {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { role } = useRole();
  const [systems, setSystems] = useState([]);
  const [selectedSystem, setSelectedSystem] = useState(searchParams.get('system') || '');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m ComplianceOS. I can help you understand your EU AI Act obligations, data usage policies, and compliance requirements.\n\nTry asking me about a specific AI system or use one of the suggested questions below.',
      sources: [],
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    api.get('/ai-systems').then(r => setSystems(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send(question) {
    const q = (question || input).trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await api.post('/ask', { question: q, aiSystemId: selectedSystem || null, role });
      setMessages(m => [...m, { role: 'assistant', content: res.data.answer, sources: res.data.sources }]);
    } catch (err) {
      toast(err.message, 'error');
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.', sources: [] }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  const showSuggestions = messages.length <= 1;

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" /> Ask ComplianceOS
          </h1>
          <p className="text-sm text-gray-500 mt-1">Context-aware compliance assistant · Role: {role}</p>
        </div>
        <div className="relative">
          <select
            className="input-field pr-8 text-sm w-52"
            value={selectedSystem}
            onChange={e => setSelectedSystem(e.target.value)}
          >
            <option value="">No specific system</option>
            {systems.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Chat area */}
      <div className="card">
        <div className="h-[480px] overflow-y-auto p-6 space-y-4">
          {messages.map((m, i) => <MessageBubble key={i} msg={m} />)}
          {loading && (
            <div className="flex justify-start">
              <div className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center mr-2 mt-1 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                <LoadingSpinner size="sm" />
                <span className="text-sm text-gray-500">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && (
          <div className="px-6 pb-4">
            <p className="text-xs text-gray-400 font-medium mb-2">Suggested questions</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map(s => (
                <button key={s} onClick={() => send(s)} className="text-xs bg-gray-50 hover:bg-primary-50 hover:text-primary-700 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-4 flex gap-3">
          <textarea
            ref={inputRef}
            className="input-field flex-1 resize-none text-sm"
            rows={2}
            placeholder="Ask about EU AI Act compliance, data policies, or specific AI systems…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
          />
          <button
            onClick={() => send()}
            disabled={loading || !input.trim()}
            className="btn-primary self-end gap-2 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        ComplianceOS provides guidance based on EU AI Act text and your organisation's policies. Not legal advice.
      </p>
    </div>
  );
}
