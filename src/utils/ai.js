// ════════════════════════════════════════════════
// AI SERVICE — Optimized for low-tier rate limits
// Uses Haiku (fast + cheap), small prompts, auto-retry
// ════════════════════════════════════════════════

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-haiku-4-5-20251001'; // Fast, cheap, low token usage
const getApiKey = () => import.meta.env.VITE_ANTHROPIC_API_KEY;

export const isAIConfigured = () => !!getApiKey();

// Cache 30 min
const cache = {};
const CACHE_TTL = 30 * 60 * 1000;
function getCached(key) { const e = cache[key]; if (!e) return null; if (Date.now() - e.time > CACHE_TTL) { delete cache[key]; return null; } return e.data; }
function setCache(key, data) { cache[key] = { data, time: Date.now() }; }

// Retry with backoff on 429
async function callWithRetry(fn, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); }
    catch (err) {
      if (err.message?.includes('429') && i < retries) {
        const wait = (i + 1) * 45000; // 15s, 30s
        await new Promise(r => setTimeout(r, wait));
        continue;
      }
      throw err;
    }
  }
}

async function callClaude({ system, prompt, useSearch = false }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Clé API non configurée');

  const body = {
    model: MODEL,
    max_tokens: 800,
    system,
    messages: [{ role: 'user', content: prompt }],
  };
  if (useSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
}

// ════════════════════════════════════
// PUBLIC API
// ════════════════════════════════════

export async function fetchBRVMNews() {
  const cached = getCached('brvm_news');
  if (cached) return cached;
  const result = await callWithRetry(() => callClaude({
    system: 'Analyste BRVM. Français, concis, emojis. Max 400 mots.',
    prompt: 'Résumé marché BRVM: indices, top hausse/baisse, actus sociétés cotées, dividendes.',
    useSearch: true,
  }));
  setCache('brvm_news', result);
  return result;
}

export async function fetchFinancialAdvice({ expenses, savings, brvmInvests, config }) {
  const cached = getCached('advice');
  if (cached) return cached;

  const now = new Date();
  const mm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const mExp = expenses.filter(e => e.date?.startsWith(mm));
  const totalExp = mExp.reduce((s, e) => s + Number(e.amount), 0);
  const totalSav = savings.reduce((s, e) => s + Number(e.amount), 0);
  const totalBrvm = brvmInvests.reduce((s, e) => s + Number(e.amount), 0);
  const monthSav = savings.filter(e => e.date?.startsWith(mm)).reduce((s, e) => s + Number(e.amount), 0);

  // Compact summary to minimize tokens
  const summary = `Salaire:${config.salary},BudgetMax:${config.maxDepenses},DépensesMois:${totalExp},EpargneMois:${monthSav},EpargneTotal:${totalSav},BRVM:${totalBrvm},Patrimoine:${totalSav + totalBrvm}`;

  const result = await callWithRetry(() => callClaude({
    system: 'Conseiller financier IA Afrique Ouest/BRVM. Français, direct, emojis. Max 500 mots. Rappelle que ce ne sont pas des conseils professionnels agréés.',
    prompt: `Données: ${summary}. Donne: 1)Score/10 2)3 points positifs 3)3 améliorations 4)Conseil BRVM du mois 5)1 objectif prochain mois 6)Astuce enrichissement`,
    useSearch: true,
  }));
  setCache('advice', result);
  return result;
}

export async function fetchMarketPulse() {
  const cached = getCached('pulse');
  if (cached) return cached;
  const result = await callWithRetry(() => callClaude({
    system: 'Bot veille BRVM. Français, ultra-concis. Max 150 mots.',
    prompt: 'Pulse BRVM: indices, tendance, 1 opportunité, 1 risque.',
    useSearch: true,
  }));
  setCache('pulse', result);
  return result;
}

export async function askAI(question, context = '') {
  return callWithRetry(() => callClaude({
    system: `Conseiller financier IA BRVM. Français, concis. ${context} Rappelle les risques d'investissement.`,
    prompt: question,
    useSearch: true,
  }));
}

/**
 * Fetch live data for watchlist tickers
 */
export async function fetchTickerData(tickers) {
  if (!tickers.length) return [];
  const cached = getCached('watchlist_' + tickers.join(','));
  if (cached) return cached;

  const result = await callWithRetry(() => callClaude({
    system: `Tu es un bot de données BRVM. Réponds UNIQUEMENT en JSON valide, rien d'autre. Pas de texte avant ou après le JSON.`,
    prompt: `Cherche les cours actuels de ces actions BRVM: ${tickers.join(', ')}. 
Réponds en JSON array: [{"ticker":"SNTS","name":"Sonatel","price":18500,"change":-1.2,"volume":"12K","status":"open"}]
Les champs: ticker, name (nom complet), price (dernier cours FCFA), change (variation % jour), volume (volume échangé), status (open/closed).
Si tu ne trouves pas un ticker, mets price:0 et change:0.`,
    useSearch: true,
  }));

  try {
    // Extract JSON from response (might have markdown fences)
    const cleaned = result.replace(/```json?\s*/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleaned);
    setCache('watchlist_' + tickers.join(','), data);
    return data;
  } catch {
    console.warn('[AI] Failed to parse ticker data:', result);
    return tickers.map(t => ({ ticker: t, name: t, price: 0, change: 0, volume: '—', status: 'unknown' }));
  }
}
