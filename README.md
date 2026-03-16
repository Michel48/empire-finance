# 💰 Empire Finance — Tableau de Bord Financier Personnel

Application web progressive (PWA) de suivi financier conçue pour construire ton empire, un franc à la fois.

## ✨ Fonctionnalités

### 📊 Tableau de Bord
- Vue d'ensemble KPIs en temps réel (dépenses, épargne, patrimoine, BRVM)
- Graphique camembert des dépenses par catégorie
- Graphique barres évolution sur 6 mois
- Barres de progression par objectif d'épargne
- Suivi budget par catégorie avec alertes

### 💸 Suivi des Dépenses
- 8 catégories (transport, téléphone, famille, alimentation, loisirs, santé, vêtements, divers)
- Budget plafond à 150 000 FCFA/mois
- Alertes automatiques en cas de dépassement
- Historique filtrable par mois

### 🏦 Épargne Multi-Objectifs
- 3 objectifs prédéfinis (emménagement, fonds d'urgence, capital e-commerce)
- Création d'objectifs personnalisés illimités
- Barres de progression visuelles
- Historique des versements

### 📈 Investissement BRVM
- Stratégie recommandée (60% blue chips / 25% croissance / 15% obligations)
- Suivi par ticker avec agrégation portefeuille
- Graphique tendance investissements
- Historique complet

### 📄 Rapports & Export
- **Rapport PDF** professionnel avec mise en page soignée
- Sélection de période rapide (ce mois, mois dernier, 3 mois, année, tout)
- Sélection de dates personnalisées
- Aperçu avant téléchargement
- **Export CSV** par catégorie (dépenses, épargne, BRVM)
- Compatible Excel et Google Sheets

### 📱 Mobile-First
- Interface responsive optimisée mobile
- Navigation bottom-bar tactile
- Installable en PWA (icône sur l'écran d'accueil)
- Fonctionne hors-ligne

---

## 🚀 Déploiement Gratuit (Vercel)

### Étape 1 : Préparer le projet

```bash
# Cloner ou copier les fichiers du projet
cd empire-finance

# Installer les dépendances
npm install

# Tester en local
npm run dev
```

### Étape 2 : Push sur GitHub

```bash
git init
git add .
git commit -m "Empire Finance v1"
git branch -M main
git remote add origin https://github.com/TON-USERNAME/empire-finance.git
git push -u origin main
```

### Étape 3 : Déployer sur Vercel (100% gratuit)

1. Va sur [vercel.com](https://vercel.com) et connecte ton compte GitHub
2. Clique "New Project"
3. Sélectionne le repo `empire-finance`
4. Vercel détecte automatiquement Vite — clique "Deploy"
5. En 30 secondes, ton app est live sur `empire-finance-xxx.vercel.app`

### Étape 4 : Installer sur téléphone

1. Ouvre l'URL Vercel dans Chrome sur ton téléphone
2. Menu ⋮ → "Ajouter à l'écran d'accueil"
3. L'app s'installe comme une application native !

---

## 🔧 Alternatives d'hébergement gratuit

| Service | URL | Avantages |
|---------|-----|-----------|
| **Vercel** | vercel.com | Le plus simple, auto-deploy |
| **Netlify** | netlify.com | Drag & drop le dossier `dist/` |
| **GitHub Pages** | pages.github.com | Intégré à GitHub |
| **Cloudflare Pages** | pages.cloudflare.com | CDN mondial rapide |

Pour Netlify en drag & drop :
```bash
npm run build
# Puis drag & drop le dossier dist/ sur app.netlify.com/drop
```

---

## 🛠️ Stack Technique

- **React 18** — Interface utilisateur
- **Vite** — Build ultra-rapide
- **Tailwind CSS** — Styling utilitaire
- **Recharts** — Graphiques interactifs
- **jsPDF + autoTable** — Génération PDF
- **date-fns** — Manipulation de dates
- **Lucide React** — Icônes
- **vite-plugin-pwa** — Progressive Web App
- **LocalStorage** — Persistance des données

---

## 📁 Structure du Projet

```
empire-finance/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navigation.jsx    # Nav desktop + bottom bar mobile
│   │   └── UI.jsx            # Composants réutilisables
│   ├── hooks/
│   │   └── useStore.js       # Hook localStorage
│   ├── pages/
│   │   ├── Dashboard.jsx     # Tableau de bord
│   │   ├── Depenses.jsx      # Suivi dépenses
│   │   ├── Epargne.jsx       # Épargne multi-objectifs
│   │   ├── Brvm.jsx          # Investissements BRVM
│   │   └── Rapport.jsx       # Rapports PDF/CSV
│   ├── utils/
│   │   ├── constants.js      # Configuration
│   │   ├── format.js         # Utilitaires formatage
│   │   └── reportGenerator.js # Génération PDF
│   ├── App.jsx               # App principale
│   ├── main.jsx              # Point d'entrée
│   └── index.css             # Styles globaux
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

---

## 💡 Personnalisation

### Changer le salaire et budgets
Édite `src/utils/constants.js` :
```js
export const SALARY = 566000;        // Ton salaire
export const MAX_DEPENSES = 150000;  // Plafond dépenses
```

### Ajouter des catégories
Dans le même fichier, ajoute au tableau `CATEGORIES` :
```js
{ id: 'education', label: 'Formation', icon: '📚', color: '#06B6D4', budget: 20000 },
```

### Ajouter des objectifs
Ajoute au tableau `SAVINGS_GOALS` ou utilise le bouton "Ajouter" dans l'app.

---

**Build your empire.** 🏆
