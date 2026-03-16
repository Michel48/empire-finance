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
        const wait = (i + 1) * 15000; // 15s, 30s
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
    prompt: 'Pulse BRVM: indices, tendance, 5 opportunité, 1 risque.',
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
