// ════════════════════════════════════════════════
// AI SERVICE — Anthropic Claude API with Web Search
// ════════════════════════════════════════════════

const API_URL = 'https://api.anthropic.com/v1/messages';
const getApiKey = () => import.meta.env.VITE_ANTHROPIC_API_KEY;

export const isAIConfigured = () => !!getApiKey();

// Cache to avoid hammering the API
const cache = {};
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

function getCached(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.time > CACHE_TTL) { delete cache[key]; return null; }
  return entry.data;
}

function setCache(key, data) {
  cache[key] = { data, time: Date.now() };
}

// ─── Core API call ───
async function callClaude({ system, prompt, useSearch = false }) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API key not configured');

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system,
    messages: [{ role: 'user', content: prompt }],
  };

  if (useSearch) {
    body.tools = [{ type: 'web_search_20250305', name: 'web_search' }];
  }

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
  // Extract text from response content blocks
  return data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');
}

// ════════════════════════════════════════════════
// PUBLIC FUNCTIONS
// ════════════════════════════════════════════════

/**
 * Get live BRVM market info
 */
export async function fetchBRVMNews() {
  const cached = getCached('brvm_news');
  if (cached) return cached;

  const result = await callClaude({
    system: `Tu es un analyste financier spécialisé dans la BRVM (Bourse Régionale des Valeurs Mobilières). 
Réponds toujours en français. Sois concis et structure ta réponse en sections claires avec des emojis.
Format: utilise des sections courtes, pas de markdown lourd.`,
    prompt: `Donne-moi un résumé actualisé du marché BRVM aujourd'hui :
1. Performance des indices (BRVM Composite, BRVM 30)
2. Top 3 des actions en hausse et en baisse
3. Volumes de transactions
4. Actualités importantes des sociétés cotées
5. Dividendes récents ou à venir

Sois factuel et concis. Maximum 800 mots.`,
    useSearch: true,
  });

  setCache('brvm_news', result);
  return result;
}

/**
 * Get personalized financial advice based on user data
 */
export async function fetchFinancialAdvice({ expenses, savings, brvmInvests, config }) {
  const cached = getCached('financial_advice');
  if (cached) return cached;

  // Build data summary for Claude
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth = (() => { const d = new Date(); d.setMonth(d.getMonth() - 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; })();

  const monthExp = expenses.filter(e => e.date?.startsWith(thisMonth));
  const prevMonthExp = expenses.filter(e => e.date?.startsWith(lastMonth));
  const totalExp = monthExp.reduce((s, e) => s + Number(e.amount), 0);
  const prevTotalExp = prevMonthExp.reduce((s, e) => s + Number(e.amount), 0);

  const totalSaved = savings.reduce((s, e) => s + Number(e.amount), 0);
  const monthSav = savings.filter(e => e.date?.startsWith(thisMonth)).reduce((s, e) => s + Number(e.amount), 0);
  const totalBrvm = brvmInvests.reduce((s, e) => s + Number(e.amount), 0);

  // Category breakdown
  const catBreakdown = config.categories.map(c => {
    const spent = monthExp.filter(e => e.category === c.id).reduce((s, e) => s + Number(e.amount), 0);
    return `${c.label}: ${spent.toLocaleString('fr-FR')} FCFA`;
  }).filter(s => !s.endsWith('0 FCFA')).join(', ');

  // Goals status
  const goalsStatus = config.savingsGoals.map(g => {
    const current = savings.filter(s => s.goal === g.id).reduce((s, e) => s + Number(e.amount), 0);
    return `${g.label}: ${current.toLocaleString('fr-FR')}/${g.target.toLocaleString('fr-FR')} FCFA (${g.target > 0 ? Math.round(current/g.target*100) : 0}%)`;
  }).join('; ');

  // BRVM portfolio
  const portfolio = {};
  brvmInvests.forEach(b => {
    const k = b.ticker || 'Divers';
    portfolio[k] = (portfolio[k] || 0) + Number(b.amount);
  });
  const portfolioStr = Object.entries(portfolio).map(([k, v]) => `${k}: ${v.toLocaleString('fr-FR')} FCFA`).join(', ');

  const result = await callClaude({
    system: `Tu es un conseiller financier personnel expert, spécialisé dans l'investissement en Afrique de l'Ouest et la BRVM.
Tu donnes des conseils personnalisés basés sur les données réelles de l'utilisateur.
Réponds toujours en français. Sois direct, actionnable, et motivant.
Structure ta réponse avec des emojis et des sections claires.
IMPORTANT: Rappelle toujours que tu n'es pas un conseiller financier agréé et que l'investissement comporte des risques.`,
    prompt: `Voici mes données financières actuelles :

PROFIL:
- Salaire: ${config.salary.toLocaleString('fr-FR')} FCFA/mois
- Budget dépenses max: ${config.maxDepenses.toLocaleString('fr-FR')} FCFA/mois
- Budget investissement: ${config.monthlyInvestBudget.toLocaleString('fr-FR')} FCFA/mois

CE MOIS:
- Dépenses: ${totalExp.toLocaleString('fr-FR')} FCFA (mois dernier: ${prevTotalExp.toLocaleString('fr-FR')})
- Épargne ce mois: ${monthSav.toLocaleString('fr-FR')} FCFA
- Détail dépenses: ${catBreakdown || 'Aucune donnée'}

PATRIMOINE TOTAL:
- Épargne totale: ${totalSaved.toLocaleString('fr-FR')} FCFA
- Portefeuille BRVM: ${totalBrvm.toLocaleString('fr-FR')} FCFA (${portfolioStr || 'vide'})
- Patrimoine net: ${(totalSaved + totalBrvm).toLocaleString('fr-FR')} FCFA

OBJECTIFS:
${goalsStatus || 'Aucun objectif défini'}

Donne-moi :
1. 🏆 Score financier du mois (note sur 10 avec explication)
2. ✅ 3 points positifs ce mois
3. ⚠️ 3 points d'amélioration avec actions concrètes
4. 📈 Conseil investissement BRVM du mois (recherche les opportunités actuelles)
5. 🎯 Objectif du mois prochain (un seul, clair et mesurable)
6. 💡 Astuce d'enrichissement du mois

Maximum 600 mots, sois percutant.`,
    useSearch: true,
  });

  setCache('financial_advice', result);
  return result;
}

/**
 * Get quick market pulse (lighter call, for auto-refresh)
 */
export async function fetchMarketPulse() {
  const cached = getCached('market_pulse');
  if (cached) return cached;

  const result = await callClaude({
    system: 'Tu es un bot de veille BRVM. Réponds en français, ultra-concis, avec emojis. Max 200 mots.',
    prompt: 'Donne le pulse rapide du marché BRVM : indices, tendance, 1 opportunité, 1 risque. Aujourd\'hui.',
    useSearch: true,
  });

  setCache('market_pulse', result);
  return result;
}

/**
 * Ask a custom question to the AI
 */
export async function askAI(question, context = '') {
  return callClaude({
    system: `Tu es un conseiller financier IA spécialisé Afrique de l'Ouest / BRVM. Réponds en français, concis et actionnable. ${context}
IMPORTANT: Rappelle que tu n'es pas un conseiller agréé et que l'investissement comporte des risques.`,
    prompt: question,
    useSearch: true,
  });
}
