import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bot, RefreshCw, Send, TrendingUp, Brain, Zap, Clock, AlertTriangle, MessageCircle } from 'lucide-react';
import { SectionCard, SectionTitle, EmptyState } from '../components/UI';
import { useConfig } from '../hooks/useConfig';
import { isAIConfigured, fetchBRVMNews, fetchFinancialAdvice, fetchMarketPulse, askAI } from '../utils/ai';
import { fmtCompact } from '../utils/format';

// ─── Auto-refresh interval ───
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 min

// ─── Loading skeleton ───
function Skeleton({ lines = 4 }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded-full bg-empire-border/60" style={{ width: `${65 + Math.random() * 35}%` }} />
      ))}
    </div>
  );
}

// ─── AI Response renderer (handles basic formatting) ───
function AIResponse({ text }) {
  if (!text) return null;
  // Split by double newlines for paragraphs, render with basic formatting
  const paragraphs = text.split(/\n{2,}/);
  return (
    <div className="space-y-3 text-[13px] text-empire-text-secondary leading-relaxed">
      {paragraphs.map((p, i) => {
        // Handle lines that start with emoji or number as section headers
        const lines = p.split('\n');
        return (
          <div key={i} className="space-y-1">
            {lines.map((line, j) => {
              const trimmed = line.trim();
              if (!trimmed) return null;
              // Section headers (start with emoji or number+dot)
              const isHeader = /^[\p{Emoji}]/u.test(trimmed) && trimmed.length < 80;
              // Bold markers
              const formatted = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="text-empire-text font-semibold">$1</strong>');
              if (isHeader) {
                return <p key={j} className="text-sm font-bold text-empire-text mt-2" dangerouslySetInnerHTML={{ __html: formatted }} />;
              }
              return <p key={j} dangerouslySetInnerHTML={{ __html: formatted }} />;
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Countdown timer ───
function useCountdown(targetTime) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!targetTime) return;
    const tick = () => {
      const diff = Math.max(0, targetTime - Date.now());
      const min = Math.floor(diff / 60000);
      const sec = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${min}:${String(sec).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetTime]);
  return timeLeft;
}

// ════════════════════════════════════════════════
// MAIN AI PAGE
// ════════════════════════════════════════════════
export default function AIInsights({ expenses, savings, brvmInvests }) {
  const { config } = useConfig();
  const [activeTab, setActiveTab] = useState('advice');
  const [marketNews, setMarketNews] = useState(null);
  const [advice, setAdvice] = useState(null);
  const [pulse, setPulse] = useState(null);
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [lastRefresh, setLastRefresh] = useState({});
  const [nextRefresh, setNextRefresh] = useState(null);

  // Chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const countdown = useCountdown(nextRefresh);

  // ─── Fetch functions ───
  const loadAdvice = useCallback(async () => {
    setLoading(l => ({ ...l, advice: true }));
    setErrors(e => ({ ...e, advice: null }));
    try {
      const result = await fetchFinancialAdvice({ expenses, savings, brvmInvests, config });
      setAdvice(result);
      setLastRefresh(r => ({ ...r, advice: Date.now() }));
    } catch (err) {
      setErrors(e => ({ ...e, advice: err.message }));
    }
    setLoading(l => ({ ...l, advice: false }));
  }, [expenses, savings, brvmInvests, config]);

  const loadMarket = useCallback(async () => {
    setLoading(l => ({ ...l, market: true }));
    setErrors(e => ({ ...e, market: null }));
    try {
      const result = await fetchBRVMNews();
      setMarketNews(result);
      setLastRefresh(r => ({ ...r, market: Date.now() }));
    } catch (err) {
      setErrors(e => ({ ...e, market: err.message }));
    }
    setLoading(l => ({ ...l, market: false }));
  }, []);

  const loadPulse = useCallback(async () => {
    setLoading(l => ({ ...l, pulse: true }));
    setErrors(e => ({ ...e, pulse: null }));
    try {
      const result = await fetchMarketPulse();
      setPulse(result);
      setLastRefresh(r => ({ ...r, pulse: Date.now() }));
    } catch (err) {
      setErrors(e => ({ ...e, pulse: err.message }));
    }
    setLoading(l => ({ ...l, pulse: false }));
  }, []);

  // ─── Auto-refresh every 30 min ───
  useEffect(() => {
    if (!isAIConfigured()) return;

    // Initial load
    loadPulse();

    // Set up 30 min refresh
    setNextRefresh(Date.now() + REFRESH_INTERVAL);
    const interval = setInterval(() => {
      loadPulse();
      setNextRefresh(Date.now() + REFRESH_INTERVAL);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadPulse]);

  // ─── Chat handler ───
  const sendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const question = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: question }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const context = `Données utilisateur: Salaire ${fmtCompact(config.salary)}, Patrimoine ${fmtCompact(
        savings.reduce((s, e) => s + Number(e.amount), 0) + brvmInvests.reduce((s, e) => s + Number(e.amount), 0)
      )}, basé à Abidjan.`;
      const answer = await askAI(question, context);
      setChatMessages(prev => [...prev, { role: 'ai', text: answer }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', text: `❌ Erreur: ${err.message}` }]);
    }
    setChatLoading(false);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // ─── Not configured state ───
  if (!isAIConfigured()) {
    return (
      <div className="flex flex-col gap-4">
        <SectionCard glow>
          <div className="text-center py-8">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="text-lg font-bold text-empire-text mb-2">IA Conseils</h2>
            <p className="text-xs text-empire-muted max-w-sm mx-auto leading-relaxed mb-6">
              Active l'IA pour recevoir des conseils d'investissement personnalisés, des infos BRVM en temps réel, et un coaching financier intelligent.
            </p>
            <div className="card !p-4 max-w-md mx-auto text-left">
              <p className="text-xs font-bold text-empire-accent mb-2">⚙️ Configuration requise :</p>
              <ol className="text-[11px] text-empire-muted space-y-1.5 list-decimal list-inside leading-relaxed">
                <li>Va sur <span className="font-mono text-empire-text">console.anthropic.com</span></li>
                <li>Crée une API Key</li>
                <li>Ajoute dans ton fichier <span className="font-mono text-empire-text">.env</span> :</li>
              </ol>
              <div className="mt-2 p-2.5 rounded-xl bg-empire-bg-soft font-mono text-[10px] text-empire-accent border border-empire-border">
                VITE_ANTHROPIC_API_KEY=sk-ant-...
              </div>
              <p className="text-[10px] text-empire-muted mt-3">
                Sur Vercel: Settings → Environment Variables → ajouter la clé.
              </p>
            </div>
          </div>
        </SectionCard>
      </div>
    );
  }

  const TABS = [
    { id: 'advice', label: 'Conseils', icon: Brain },
    { id: 'market', label: 'Marché', icon: TrendingUp },
    { id: 'chat', label: 'Chat IA', icon: MessageCircle },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Pulse banner — always visible */}
      <SectionCard className="!p-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Zap size={16} className="text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-empire-muted font-semibold uppercase tracking-wider">Pulse BRVM</p>
              {loading.pulse ? (
                <div className="h-3 w-40 rounded-full bg-empire-border/60 animate-pulse mt-1" />
              ) : pulse ? (
                <p className="text-[11px] text-empire-text-secondary mt-0.5 line-clamp-2">{pulse.slice(0, 150)}...</p>
              ) : (
                <p className="text-[11px] text-empire-muted">Chargement...</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <button onClick={loadPulse} disabled={loading.pulse} className="p-1.5 rounded-lg text-empire-muted hover:text-empire-accent hover:bg-empire-accent/10 transition-colors disabled:opacity-30">
              <RefreshCw size={14} className={loading.pulse ? 'animate-spin' : ''} />
            </button>
            {countdown && <span className="text-[8px] text-empire-muted font-mono flex items-center gap-0.5"><Clock size={8} />{countdown}</span>}
          </div>
        </div>
      </SectionCard>

      {/* Tab selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 ${
            activeTab === t.id
              ? 'bg-[var(--accent)] text-[#0A0E18] shadow-sm'
              : 'text-empire-muted border border-empire-border hover:border-empire-muted/40'
          }`}>
            <t.icon size={14} />{t.label}
          </button>
        ))}
      </div>

      {/* ═══ ADVICE TAB ═══ */}
      {activeTab === 'advice' && (
        <SectionCard glow>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon="🧠">Conseils personnalisés</SectionTitle>
            <button onClick={loadAdvice} disabled={loading.advice} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-empire-accent border border-empire-accent/25 hover:bg-[var(--accent)]/5 transition-colors disabled:opacity-40">
              <RefreshCw size={12} className={loading.advice ? 'animate-spin' : ''} />
              {advice ? 'Actualiser' : 'Analyser mes finances'}
            </button>
          </div>

          {errors.advice && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs mb-3">
              <AlertTriangle size={14} /> {errors.advice}
            </div>
          )}

          {loading.advice ? <Skeleton lines={8} /> : advice ? (
            <>
              <AIResponse text={advice} />
              {lastRefresh.advice && (
                <p className="text-[9px] text-empire-muted mt-4 flex items-center gap-1">
                  <Clock size={9} /> Mis à jour {new Date(lastRefresh.advice).toLocaleTimeString('fr-FR')}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <Brain size={40} className="text-empire-muted/30 mx-auto mb-3" />
              <p className="text-xs text-empire-muted">Clique sur "Analyser mes finances" pour recevoir tes conseils personnalisés basés sur tes données réelles.</p>
            </div>
          )}

          <div className="mt-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/15 text-[10px] text-amber-500/80">
            ⚠️ Ces conseils sont générés par IA et ne constituent pas du conseil financier professionnel. L'investissement comporte des risques de perte en capital.
          </div>
        </SectionCard>
      )}

      {/* ═══ MARKET TAB ═══ */}
      {activeTab === 'market' && (
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <SectionTitle icon="📊">Infos Marché BRVM</SectionTitle>
            <button onClick={loadMarket} disabled={loading.market} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold text-amber-500 border border-amber-500/25 hover:bg-amber-500/5 transition-colors disabled:opacity-40">
              <RefreshCw size={12} className={loading.market ? 'animate-spin' : ''} />
              {marketNews ? 'Actualiser' : 'Charger les infos'}
            </button>
          </div>

          {errors.market && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-xs mb-3">
              <AlertTriangle size={14} /> {errors.market}
            </div>
          )}

          {loading.market ? <Skeleton lines={10} /> : marketNews ? (
            <>
              <AIResponse text={marketNews} />
              {lastRefresh.market && (
                <p className="text-[9px] text-empire-muted mt-4 flex items-center gap-1">
                  <Clock size={9} /> Mis à jour {new Date(lastRefresh.market).toLocaleTimeString('fr-FR')}
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <TrendingUp size={40} className="text-empire-muted/30 mx-auto mb-3" />
              <p className="text-xs text-empire-muted">Clique pour charger les dernières infos du marché BRVM avec données en temps réel.</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* ═══ CHAT TAB ═══ */}
      {activeTab === 'chat' && (
        <SectionCard className="!p-0 overflow-hidden">
          <div className="p-4 pb-2 border-b border-empire-border">
            <SectionTitle icon="💬">Chat avec l'IA</SectionTitle>
            <p className="text-[10px] text-empire-muted -mt-2 mb-1">Pose n'importe quelle question sur tes finances, la BRVM, ou l'investissement.</p>
          </div>

          {/* Messages */}
          <div className="px-4 py-3 space-y-3 max-h-[400px] overflow-y-auto" style={{ minHeight: chatMessages.length ? 200 : 120 }}>
            {chatMessages.length === 0 && (
              <div className="text-center py-6">
                <Bot size={32} className="text-empire-muted/20 mx-auto mb-2" />
                <p className="text-[11px] text-empire-muted">Exemples de questions :</p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {[
                    'Quelle action BRVM acheter ?',
                    'Comment optimiser mon épargne ?',
                    'SONATEL est-elle surévaluée ?',
                    'Quand vendre mes actions ?',
                  ].map(q => (
                    <button key={q} onClick={() => { setChatInput(q); }} className="text-[10px] px-2.5 py-1.5 rounded-lg border border-empire-border text-empire-muted hover:text-empire-accent hover:border-empire-accent/30 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-[var(--accent)] text-[#0A0E18] rounded-br-md'
                    : 'bg-empire-bg-soft border border-empire-border rounded-bl-md'
                }`}>
                  {msg.role === 'ai' ? <AIResponse text={msg.text} /> : <p className="text-xs font-medium">{msg.text}</p>}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-empire-bg-soft border border-empire-border rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-empire-muted animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 rounded-full bg-empire-muted animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 rounded-full bg-empire-muted animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-empire-border flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              placeholder="Pose ta question..."
              className="!rounded-xl !py-2.5 !text-xs flex-1"
              disabled={chatLoading}
            />
            <button onClick={sendChat} disabled={chatLoading || !chatInput.trim()} className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center text-[#0A0E18] disabled:opacity-30 active:scale-95 transition-transform flex-shrink-0">
              <Send size={16} />
            </button>
          </div>
        </SectionCard>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <button onClick={() => { setActiveTab('advice'); loadAdvice(); }} disabled={loading.advice} className="card !p-3.5 flex items-center gap-2.5 hover:bg-empire-card-hover transition-colors text-left disabled:opacity-50">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0"><Brain size={16} className="text-emerald-500" /></div>
          <div><p className="text-[11px] font-bold text-empire-text">Bilan du mois</p><p className="text-[9px] text-empire-muted">Analyse IA complète</p></div>
        </button>
        <button onClick={() => { setActiveTab('market'); loadMarket(); }} disabled={loading.market} className="card !p-3.5 flex items-center gap-2.5 hover:bg-empire-card-hover transition-colors text-left disabled:opacity-50">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center flex-shrink-0"><TrendingUp size={16} className="text-amber-500" /></div>
          <div><p className="text-[11px] font-bold text-empire-text">Flash BRVM</p><p className="text-[9px] text-empire-muted">Infos marché live</p></div>
        </button>
      </div>
    </div>
  );
}
