import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, RefreshCw, TrendingUp, TrendingDown, Minus, Star, Clock, AlertTriangle, Eye } from 'lucide-react';
import { SectionCard, SectionTitle, FormField, EmptyState } from '../components/UI';
import { fmtCompact } from '../utils/format';
import { isAIConfigured, fetchTickerData } from '../utils/ai';

const STORAGE_KEY = 'empire_watchlist';
const POPULAR_TICKERS = [
  { ticker: 'SNTS', name: 'Sonatel' },
  { ticker: 'ORAC', name: 'Orange CI' },
  { ticker: 'SGBC', name: 'SGBCI' },
  { ticker: 'BOAC', name: 'BOA CI' },
  { ticker: 'SIBC', name: 'SIB CI' },
  { ticker: 'PALC', name: 'Palm CI' },
  { ticker: 'SAPC', name: 'SAPH CI' },
  { ticker: 'TTLC', name: 'TotalEnergies CI' },
  { ticker: 'ECOC', name: 'Ecobank CI' },
  { ticker: 'NSBC', name: 'NSIA Banque' },
  { ticker: 'CBIB', name: 'Coris Bank' },
  { ticker: 'ONTB', name: 'Onatel BF' },
  { ticker: 'SDCC', name: 'SODECI' },
  { ticker: 'NEIC', name: 'NEI CEDA' },
  { ticker: 'STBC', name: 'Sitab CI' },
];

function loadWatchlist() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || ['SNTS', 'ORAC', 'BOAC']; }
  catch { return ['SNTS', 'ORAC', 'BOAC']; }
}
function saveWatchlist(list) { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }

function ChangeIndicator({ change }) {
  if (change === 0 || !change) return <span className="flex items-center gap-0.5 text-[11px] text-empire-muted font-mono"><Minus size={10} /> 0%</span>;
  const positive = change > 0;
  return (
    <span className={`flex items-center gap-0.5 text-[11px] font-bold font-mono px-2 py-0.5 rounded-lg ${positive ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>
      {positive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {positive ? '+' : ''}{change.toFixed(2)}%
    </span>
  );
}

export default function Watchlist() {
  const [tickers, setTickers] = useState(loadWatchlist);
  const [tickerData, setTickerData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [customTicker, setCustomTicker] = useState('');

  const refresh = useCallback(async () => {
    if (!isAIConfigured() || tickers.length === 0) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTickerData(tickers);
      setTickerData(data);
      setLastRefresh(Date.now());
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }, [tickers]);

  // Auto-refresh on mount and every 30 min
  useEffect(() => {
    if (isAIConfigured() && tickers.length > 0) refresh();
    const interval = setInterval(refresh, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refresh]);

  const addTicker = (ticker) => {
    const upper = ticker.toUpperCase().trim();
    if (!upper || tickers.includes(upper)) return;
    const updated = [...tickers, upper];
    setTickers(updated);
    saveWatchlist(updated);
    setShowAdd(false);
    setCustomTicker('');
  };

  const removeTicker = (ticker) => {
    const updated = tickers.filter(t => t !== ticker);
    setTickers(updated);
    saveWatchlist(updated);
    setTickerData(prev => prev.filter(d => d.ticker !== ticker));
  };

  if (!isAIConfigured()) {
    return (
      <SectionCard glow>
        <div className="text-center py-8">
          <Eye size={40} className="text-empire-muted/30 mx-auto mb-3" />
          <h2 className="text-sm font-bold mb-2">Watchlist BRVM</h2>
          <p className="text-xs text-empire-muted max-w-xs mx-auto">Configure ta clé API Anthropic dans l'onglet Config pour activer le suivi en temps réel des tickers BRVM.</p>
        </div>
      </SectionCard>
    );
  }

  // Merge ticker data with watchlist order
  const mergedData = tickers.map(t => {
    const found = tickerData.find(d => d.ticker === t);
    return found || { ticker: t, name: t, price: 0, change: 0, volume: '—', status: 'loading' };
  });

  // Stats
  const totalUp = mergedData.filter(d => d.change > 0).length;
  const totalDown = mergedData.filter(d => d.change < 0).length;
  const totalNeutral = mergedData.filter(d => d.change === 0).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center !py-3">
          <p className="text-[10px] text-empire-muted uppercase tracking-wider font-semibold">Hausse</p>
          <p className="text-lg font-bold font-mono text-emerald-500">{totalUp}</p>
        </div>
        <div className="card text-center !py-3">
          <p className="text-[10px] text-empire-muted uppercase tracking-wider font-semibold">Baisse</p>
          <p className="text-lg font-bold font-mono text-red-500">{totalDown}</p>
        </div>
        <div className="card text-center !py-3">
          <p className="text-[10px] text-empire-muted uppercase tracking-wider font-semibold">Stable</p>
          <p className="text-lg font-bold font-mono text-empire-muted">{totalNeutral}</p>
        </div>
      </div>

      {/* Main watchlist */}
      <SectionCard glow>
        <div className="flex items-center justify-between mb-1">
          <SectionTitle icon="👁️">Watchlist</SectionTitle>
          <div className="flex items-center gap-2">
            {lastRefresh && (
              <span className="text-[8px] text-empire-muted font-mono flex items-center gap-0.5">
                <Clock size={8} /> {new Date(lastRefresh).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={refresh} disabled={loading} className="p-1.5 rounded-lg text-empire-muted hover:text-empire-accent hover:bg-empire-accent/10 transition-colors disabled:opacity-30">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-500 text-[11px] mb-3">
            <AlertTriangle size={12} /> {error.slice(0, 100)}
          </div>
        )}

        {tickers.length === 0 ? (
          <EmptyState message="Ajoute des tickers pour commencer à surveiller le marché." icon="📊" />
        ) : (
          <div className="space-y-0.5">
            {mergedData.map(d => (
              <div key={d.ticker} className="flex items-center justify-between py-3 px-2 border-b border-empire-border/40 last:border-0 group hover:bg-empire-bg-soft/50 rounded-xl transition-colors -mx-2">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-[10px] ${
                    d.change > 0 ? 'bg-emerald-500/10 text-emerald-500' : d.change < 0 ? 'bg-red-500/10 text-red-500' : 'bg-empire-border/50 text-empire-muted'
                  }`}>
                    {d.ticker.slice(0, 4)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-empire-text">{d.ticker}</div>
                    <div className="text-[10px] text-empire-muted mt-0.5">{d.name !== d.ticker ? d.name : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    {d.price > 0 ? (
                      <>
                        <div className="text-sm font-bold font-mono text-empire-text">{d.price.toLocaleString('fr-FR')}</div>
                        <div className="text-[9px] text-empire-muted font-mono">Vol: {d.volume}</div>
                      </>
                    ) : loading ? (
                      <div className="h-4 w-16 rounded bg-empire-border/50 animate-pulse" />
                    ) : (
                      <div className="text-[10px] text-empire-muted">—</div>
                    )}
                  </div>
                  <ChangeIndicator change={d.change} />
                  <button onClick={() => removeTicker(d.ticker)} className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-empire-muted hover:text-red-500 hover:bg-red-500/10 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Add ticker */}
      {!showAdd ? (
        <button onClick={() => setShowAdd(true)} className="card flex items-center justify-center gap-2 py-4 text-empire-accent font-semibold text-sm border-dashed !border-[1.5px] !border-empire-accent/30 cursor-pointer hover:bg-empire-card-hover transition-colors">
          <Plus size={18} /> Ajouter un ticker
        </button>
      ) : (
        <SectionCard className="!border-empire-accent/20">
          <SectionTitle icon="➕">Ajouter à la watchlist</SectionTitle>

          {/* Quick add from popular */}
          <div className="mb-4">
            <p className="text-[10px] text-empire-muted uppercase tracking-wider font-semibold mb-2">Actions populaires</p>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_TICKERS.filter(p => !tickers.includes(p.ticker)).map(p => (
                <button key={p.ticker} onClick={() => addTicker(p.ticker)} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold border border-empire-border text-empire-muted hover:text-empire-accent hover:border-empire-accent/30 hover:bg-empire-accent/5 transition-all">
                  <Plus size={10} /> {p.ticker} <span className="text-empire-muted/60">({p.name})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom ticker */}
          <div className="flex gap-2">
            <div className="flex-1">
              <input type="text" value={customTicker} onChange={e => setCustomTicker(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && addTicker(customTicker)} placeholder="Code ticker (ex: SNTS)" className="!py-2.5 !text-xs" />
            </div>
            <button onClick={() => addTicker(customTicker)} disabled={!customTicker.trim()} className="px-4 py-2.5 rounded-xl font-bold text-xs bg-[var(--accent)] text-[#0A0E18] disabled:opacity-30">Ajouter</button>
          </div>

          <button onClick={() => setShowAdd(false)} className="w-full mt-3 py-2 rounded-xl text-xs font-semibold text-empire-muted border border-empire-border">Fermer</button>
        </SectionCard>
      )}

      {/* Market info disclaimer */}
      <div className="text-center text-[9px] text-empire-muted py-2 leading-relaxed">
        Données indicatives obtenues par recherche web. Peuvent être en décalage avec le temps réel.<br />
        Pour des données exactes, consulte brvm.org ou ton SGI.
      </div>
    </div>
  );
}
