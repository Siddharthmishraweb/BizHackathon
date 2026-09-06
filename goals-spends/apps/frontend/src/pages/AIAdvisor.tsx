import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { aiApi } from '@/utils/api';
import { Bot, Send, User, Zap, TrendingUp, Shield, Target, Calculator, ArrowRight, Sparkles, BrainCircuit, SlidersHorizontal, RotateCcw, Clock3, Gauge, HelpCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { ChatMessage } from '@/types';

const QUICK_ACTIONS = [
  { label: 'Tax Saving Tips', icon: Calculator, prompt: 'How can I save more tax this year?' },
  { label: 'Portfolio Review', icon: TrendingUp, prompt: 'Review my portfolio and suggest improvements' },
  { label: 'Goal Planning', icon: Target, prompt: 'Am I on track with my financial goals?' },
  { label: 'Insurance Check', icon: Shield, prompt: 'Do I have adequate insurance coverage?' },
  { label: 'Spending Analysis', icon: Zap, prompt: 'Analyze my spending and suggest savings' },
  { label: 'Net Worth', icon: Sparkles, prompt: 'What is my current net worth and how to grow it?' },
];

const INITIAL_MESSAGE: ChatMessage = {
  id: '0',
  role: 'assistant',
  content: `Namaste Arjun! 👋 I'm your WealthAI co-pilot.\n\nHere's your **quick snapshot** for today:\n📊 Net Worth: **₹71.2L** (↑₹2.3L this month)\n💰 Portfolio: **₹26.5L** (↑₹12,450 today)\n🎯 Health Score: **72/100** (Grade B+)\n⚡ Active Alerts: **3** items need attention\n\nI can help you with:\n• 📊 Portfolio analysis & recommendations\n• 💸 Tax planning & optimization\n• 🎯 Goal tracking & projections\n• 📈 Spending insights\n• 🛡️ Insurance gap analysis\n• 💡 Investment recommendations\n\nWhat would you like to explore today?`,
  timestamp: new Date().toISOString(),
};

function formatAIMessage(text: string) {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    // Bold
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullets
    if (line.startsWith('•')) {
      return <div key={i} className="flex gap-2 my-0.5"><span className="text-indigo-400 flex-shrink-0">•</span><span dangerouslySetInnerHTML={{ __html: line.slice(1).trim() }} /></div>;
    }
    // Numbered
    if (/^\d+\./.test(line)) {
      const num = line.match(/^\d+/)?.[0];
      return <div key={i} className="flex gap-2 my-0.5"><span className="text-indigo-400 flex-shrink-0 font-bold">{num}.</span><span dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, '').trim() }} /></div>;
    }
    if (!line.trim()) return <div key={i} className="h-2" />;
    return <div key={i} className="my-0.5" dangerouslySetInnerHTML={{ __html: line }} />;
  });
}

function FutureLens() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(35000);
  const [oneTimeBoost, setOneTimeBoost] = useState(0);
  const [horizon, setHorizon] = useState(10);
  const [stressScenario, setStressScenario] = useState<'market' | 'income' | 'inflation'>('market');

  const currentWealth = 7120000;
  const annualReturn = 0.115;
  const monthlyRate = annualReturn / 12;
  const futureWealth = currentWealth * Math.pow(1 + annualReturn, horizon)
    + monthlyInvestment * ((Math.pow(1 + monthlyRate, horizon * 12) - 1) / monthlyRate) * (1 + monthlyRate)
    + oneTimeBoost * Math.pow(1 + annualReturn, horizon);
  const baselineWealth = currentWealth * Math.pow(1 + annualReturn, horizon)
    + 35000 * ((Math.pow(1 + monthlyRate, horizon * 12) - 1) / monthlyRate) * (1 + monthlyRate);
  const difference = futureWealth - baselineWealth;
  const stressConfig = {
    market: { label: 'Market shock', detail: '25% drawdown in year 2, then recovery', icon: AlertTriangle, color: 'text-rose-300', rate: 0.075, pauseYears: 0 },
    income: { label: 'Career pause', detail: 'No new investments for 18 months', icon: Clock3, color: 'text-amber-300', rate: annualReturn, pauseYears: 1.5 },
    inflation: { label: 'Inflation spike', detail: 'Living costs rise 3% faster for 4 years', icon: TrendingUp, color: 'text-cyan-300', rate: 0.09, pauseYears: 0 },
  } as const;
  const activeStress = stressConfig[stressScenario];
  const stressMonths = Math.max(0, horizon * 12 - Math.round(activeStress.pauseYears * 12));
  const stressWealth = currentWealth * Math.pow(1 + activeStress.rate, horizon)
    + monthlyInvestment * ((Math.pow(1 + activeStress.rate / 12, stressMonths) - 1) / (activeStress.rate / 12)) * (1 + activeStress.rate / 12)
    + oneTimeBoost * Math.pow(1 + activeStress.rate, horizon);
  const resilienceScore = Math.max(54, Math.min(96, Math.round(100 - ((futureWealth - stressWealth) / futureWealth) * 100)));
  const bufferNeeded = Math.round((monthlyInvestment * 6) / 5000) * 5000;
  const years = Array.from({ length: horizon + 1 }, (_, year) => year);
  const projection = years.map(year => currentWealth * Math.pow(1 + annualReturn, year)
    + monthlyInvestment * ((Math.pow(1 + monthlyRate, year * 12) - 1) / monthlyRate) * (1 + monthlyRate)
    + oneTimeBoost * Math.pow(1 + annualReturn, year));
  const maxProjection = projection[projection.length - 1];
  const formatLakhs = (value: number) => `₹${(value / 100000).toFixed(1)}L`;

  const reset = () => {
    setMonthlyInvestment(35000);
    setOneTimeBoost(0);
    setHorizon(10);
    setStressScenario('market');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card flex-1 min-h-0 overflow-y-auto p-5 lg:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-[0.18em] mb-2">
            <BrainCircuit size={15} /> Future Lens
          </div>
          <h2 className="text-2xl font-bold text-slate-100">See the version of you that acts today.</h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">A live counterfactual model of your wealth. Change one lever and watch the opportunity cost move in real time.</p>
        </div>
        <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 transition-colors">
          <RotateCcw size={13} /> Reset model
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[270px_1fr] gap-5">
        <div className="space-y-5">
          <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-slate-400 flex items-center gap-2"><SlidersHorizontal size={13} /> Monthly investment</label>
              <span className="text-sm font-bold text-cyan-300">₹{monthlyInvestment.toLocaleString('en-IN')}</span>
            </div>
            <input aria-label="Monthly investment" type="range" min="10000" max="100000" step="5000" value={monthlyInvestment} onChange={e => setMonthlyInvestment(Number(e.target.value))} className="w-full accent-cyan-400" />
            <div className="flex justify-between text-[10px] text-slate-600 mt-2"><span>₹10K</span><span>₹1L</span></div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-slate-400 flex items-center gap-2"><Zap size={13} /> One-time boost</label>
              <span className="text-sm font-bold text-amber-300">{oneTimeBoost ? `₹${(oneTimeBoost / 1000).toFixed(0)}K` : 'None'}</span>
            </div>
            <input aria-label="One-time boost" type="range" min="0" max="1000000" step="50000" value={oneTimeBoost} onChange={e => setOneTimeBoost(Number(e.target.value))} className="w-full accent-amber-400" />
            <div className="flex justify-between text-[10px] text-slate-600 mt-2"><span>₹0</span><span>₹10L</span></div>
          </div>
          <div className="rounded-2xl border border-white/5 bg-black/10 p-4">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs text-slate-400 flex items-center gap-2"><Clock3 size={13} /> Time horizon</label>
              <span className="text-sm font-bold text-indigo-300">{horizon} years</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {[5, 10, 15].map(value => <button key={value} onClick={() => setHorizon(value)} className={`py-2 rounded-lg text-xs font-semibold transition-colors ${horizon === value ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-400/30' : 'bg-white/[0.03] text-slate-500 border border-transparent hover:text-slate-300'}`}>{value}Y</button>)}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="stat-card p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Projected wealth</p><p className="text-xl font-bold gradient-text mt-1">{formatLakhs(futureWealth)}</p></div>
            <div className="stat-card p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Growth from today</p><p className="text-xl font-bold text-emerald-400 mt-1">{formatLakhs(futureWealth - currentWealth)}</p></div>
            <div className="stat-card p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Scenario edge</p><p className="text-xl font-bold text-amber-300 mt-1">{difference >= 0 ? '+' : ''}{formatLakhs(difference)}</p></div>
            <div className="stat-card p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Model confidence</p><p className="text-xl font-bold text-cyan-300 mt-1">87%</p></div>
          </div>

          <div className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-indigo-500/[0.12] to-cyan-500/[0.04] p-4 sm:p-5">
            <div className="flex items-center justify-between mb-5"><div><p className="text-sm font-semibold text-slate-200">Your wealth trajectory</p><p className="text-xs text-slate-500">Assumes 11.5% annual return, compounded monthly</p></div><div className="flex items-center gap-1.5 text-xs text-emerald-300"><Gauge size={14} /> On a strong path</div></div>
            <div className="h-48 flex items-end gap-1 sm:gap-2 border-b border-white/10">
              {projection.map((value, index) => <div key={index} className="flex-1 h-full flex flex-col justify-end gap-2 group"><div className="relative w-full rounded-t-md bg-gradient-to-t from-indigo-500/40 to-cyan-300/80 transition-all duration-500" style={{ height: `${Math.max(8, (value / maxProjection) * 100)}%` }}><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{formatLakhs(value)}</span></div><span className="text-[10px] text-slate-600 text-center">{index === 0 ? 'Now' : `${index}Y`}</span></div>)}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-rose-300/10 bg-black/10 p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-300" /><p className="text-sm font-semibold text-slate-200">Resilience Lab</p></div><p className="text-xs text-slate-500 mt-1">How does your plan behave when life refuses to follow the spreadsheet?</p></div>
              <div className="text-right"><p className="text-[10px] uppercase tracking-wider text-slate-600">Resilience score</p><p className="text-xl font-bold text-emerald-300">{resilienceScore}<span className="text-xs text-slate-600">/100</span></p></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              {(Object.keys(stressConfig) as Array<keyof typeof stressConfig>).map(key => {
                const scenario = stressConfig[key];
                const Icon = scenario.icon;
                return <button key={key} onClick={() => setStressScenario(key)} className={`text-left rounded-xl p-3 border transition-all ${stressScenario === key ? 'border-rose-300/25 bg-rose-300/[0.08]' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'}`}><Icon size={15} className={scenario.color} /><p className="text-xs font-semibold text-slate-300 mt-2">{scenario.label}</p><p className="text-[10px] text-slate-600 mt-1 leading-snug">{scenario.detail}</p></button>;
              })}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-600">Stress-tested wealth</p><p className="text-lg font-bold text-slate-200 mt-1">{formatLakhs(stressWealth)}</p><p className="text-[10px] text-rose-300/80 mt-1">{formatLakhs(futureWealth - stressWealth)} below ideal</p></div>
              <div className="rounded-xl bg-white/[0.03] p-3"><p className="text-[10px] uppercase tracking-wider text-slate-600">Suggested safety buffer</p><p className="text-lg font-bold text-slate-200 mt-1">{formatLakhs(bufferNeeded)}</p><p className="text-[10px] text-emerald-300/80 mt-1">6 months of investing</p></div>
            </div>
            <p className="text-xs text-slate-500 mt-4 leading-relaxed"><strong className="text-slate-300">Scenario intelligence:</strong> {activeStress.label} is survivable for your current plan. Keep the safety buffer liquid, and avoid stopping your SIP during a drawdown unless cash flow forces the decision.</p>
          </div>

          <div className="mt-4 flex gap-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.06] p-4">
            <HelpCircle size={17} className="text-amber-300 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed text-slate-400"><strong className="text-amber-200">The AI read:</strong> {difference > 100000 ? `this scenario creates ${formatLakhs(difference)} more than your baseline. Your biggest unlock is consistency: the earlier each rupee enters the market, the longer it compounds.` : 'your baseline is already strong. A small increase in monthly investing could meaningfully change the ending balance without changing your lifestyle overnight.'}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AIAdvisor() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<'chat' | 'future'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await aiApi.chat(msg) as any;
      if (res.success) {
        setMessages(prev => [...prev, {
          id: res.data.id,
          role: 'assistant',
          content: res.data.content,
          timestamp: res.data.timestamp,
        }]);
      }
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please try again.",
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[800px] gap-4">
      {/* Quick Stats Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-4 flex items-center gap-6"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Bot size={20} className="text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-sm font-bold text-slate-200">WealthAI Advisor</h2>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Online · Powered by AI · Personalized for Arjun Sharma
          </div>
        </div>
        <button onClick={() => setActiveMode(activeMode === 'chat' ? 'future' : 'chat')} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all ${activeMode === 'future' ? 'bg-cyan-400/15 text-cyan-300 border border-cyan-300/20' : 'bg-white/[0.03] text-slate-400 border border-white/5 hover:text-slate-200'}`}>
          <BrainCircuit size={15} /> {activeMode === 'chat' ? 'Open Future Lens' : 'Back to Advisor'}
        </button>
        {[
          { label: 'Net Worth', value: '₹71.2L' },
          { label: 'Health Score', value: '72/100' },
          { label: 'Alerts', value: '3 Active' },
        ].map(stat => (
          <div key={stat.label} className="text-center hidden sm:block">
            <p className="text-sm font-bold gradient-text">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {activeMode === 'future' ? <FutureLens /> : <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col glass-card overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                    msg.role === 'user'
                      ? 'text-white'
                      : 'bg-indigo-500/20 text-indigo-300'
                  }`} style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' } : {}}>
                    {msg.role === 'user' ? 'AS' : <Bot size={16} />}
                  </div>

                  {/* Bubble */}
                  <div className={`max-w-[80%] ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'} px-4 py-3`}>
                    <div className={`text-sm leading-relaxed ai-message ${msg.role === 'user' ? 'text-white' : 'text-slate-300'}`}>
                      {msg.role === 'assistant' ? formatAIMessage(msg.content) : msg.content}
                    </div>
                    <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/50 text-right' : 'text-slate-600'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-indigo-300" />
                </div>
                <div className="chat-bubble-ai px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, delay: i * 0.15, duration: 0.5 }}
                        className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                      />
                    ))}
                    <span className="text-xs text-slate-500 ml-2">AI is thinking...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Ask about investments, taxes, goals, insurance..."
                className="input-field flex-1"
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="w-56 flex-shrink-0 space-y-3">
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <motion.button
                    key={action.label}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(action.prompt)}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all hover:bg-indigo-500/10 group"
                    style={{ border: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-500/20 transition-colors">
                      <Icon size={13} className="text-indigo-400" />
                    </div>
                    <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">{action.label}</span>
                    <ArrowRight size={11} className="text-slate-600 ml-auto group-hover:text-slate-400 transition-colors" />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* AI Context */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Context</h3>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Income', value: '₹1.5L/mo' },
                { label: 'Savings Rate', value: '39%' },
                { label: 'Portfolio', value: '₹26.5L' },
                { label: 'Risk Profile', value: 'Moderate-Agg.' },
                { label: 'Open Alerts', value: '3' },
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-slate-500">{item.label}</span>
                  <span className="text-slate-300 font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Prompts */}
          <div className="glass-card p-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Try Asking</h3>
            <div className="space-y-2">
              {[
                "What's my FIRE number?",
                "Best SIP for 2025?",
                "How to reduce debt faster?",
                "Rebalance my portfolio",
              ].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="w-full text-left text-xs text-slate-500 hover:text-indigo-400 transition-colors py-1 border-b border-white/5 last:border-0"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
