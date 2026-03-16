// ════════════════════════════════════════════════
// DEFAULTS — Valeurs par défaut, modifiables dans Paramètres
// ════════════════════════════════════════════════

export const DEFAULT_CONFIG = {
  // Profil financier
  salary: 566000,
  maxDepenses: 150000,
  currency: 'FCFA',
  userName: 'Michem',

  // Catégories de dépenses
  categories: [
    { id: 'transport', label: 'Transport', icon: '🚌', color: '#3B82F6', budget: 35000 },
    { id: 'telephone', label: 'Téléphone/Internet', icon: '📱', color: '#8B5CF6', budget: 15000 },
    { id: 'famille', label: 'Contribution famille', icon: '👨‍👩‍👦', color: '#EC4899', budget: 50000 },
    { id: 'alimentation', label: 'Alimentation', icon: '🍽️', color: '#F97316', budget: 0 },
    { id: 'loisirs', label: 'Sorties/Loisirs', icon: '🎉', color: '#F59E0B', budget: 30000 },
    { id: 'sante', label: 'Santé', icon: '💊', color: '#EF4444', budget: 0 },
    { id: 'vetements', label: 'Vêtements/Soins', icon: '👔', color: '#14B8A6', budget: 0 },
    { id: 'divers', label: 'Divers/Imprévus', icon: '📦', color: '#6B7280', budget: 20000 },
  ],

  // Objectifs d'épargne
  savingsGoals: [
    { id: 'emmenagement', label: 'Emménagement Angré', icon: '🏠', target: 930000, color: '#3B82F6' },
    { id: 'urgence', label: "Fonds d'urgence", icon: '🛡️', target: 500000, color: '#F59E0B' },
    { id: 'business', label: 'Capital e-commerce', icon: '🏪', target: 300000, color: '#8B5CF6' },
  ],

  // Plans d'investissement
  investmentPlans: [
    { id: 'brvm_dividendes', label: 'Blue chips dividendes', pct: 60, examples: 'SONATEL, Orange CI, BOA CI, Coris Bank', color: '#3B82F6' },
    { id: 'brvm_croissance', label: 'Actions croissance', pct: 25, examples: 'SAPH, PALM CI, Nestlé CI', color: '#10B981' },
    { id: 'brvm_obligations', label: 'Obligations / FCP', pct: 15, examples: 'FCP via SGI, obligations BOAD', color: '#8B5CF6' },
  ],
  monthlyInvestBudget: 80000,
};

// Constantes non-modifiables
export const MONTHS_FR = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
export const MONTHS_SHORT = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

// Palette d'icônes disponibles pour les catégories
export const AVAILABLE_ICONS = ['🚌', '📱', '👨‍👩‍👦', '🍽️', '🎉', '💊', '👔', '📦', '🏠', '🛡️', '🏪', '💰', '📈', '🎓', '⚡', '🚗', '✈️', '🎮', '💻', '🏋️', '🎵', '📚', '🔧', '🛒', '💳', '🏦', '🎁', '💡', '🔑', '⭐', '🚀', '💎', '🏆', '🎯'];

// Palette de couleurs disponibles
export const AVAILABLE_COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#F59E0B', '#EF4444', '#14B8A6', '#6B7280', '#10B981', '#E11D48', '#7C3AED', '#0891B2', '#CA8A04', '#059669', '#DC2626', '#4F46E5', '#0D9488', '#D946EF'];
