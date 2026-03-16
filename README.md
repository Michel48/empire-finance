# 💰 Empire Finance — Tableau de Bord Financier

Application PWA de suivi financier avec base de données Supabase (gratuit).

## 🚀 Mise en route rapide

```bash
cd empire-finance
npm install
cp .env.example .env
# Editer .env avec tes clés Supabase (optionnel)
npm run dev
```

> **Sans Supabase**, l'app fonctionne à 100% en mode localStorage.  
> **Avec Supabase**, tes données sont sauvegardées dans le cloud et persistantes.

---

## 🗄️ Configurer Supabase (gratuit, 5 min)

### Étape 1 — Créer le projet

1. Va sur [supabase.com](https://supabase.com) → Sign Up (gratuit)
2. Clique **New Project**
3. Nom : `empire-finance`
4. Mot de passe BDD : choisis un mot de passe fort
5. Région : choisir la plus proche (ex: Frankfurt)
6. Clique **Create new project** — attends ~2 min

### Étape 2 — Créer les tables

1. Dans ton projet Supabase, va dans **SQL Editor** (menu gauche)
2. Clique **New Query**
3. Copie-colle le contenu entier du fichier `supabase-schema.sql`
4. Clique **Run** (le bouton vert)
5. Tu devrais voir "Success. No rows returned" — c'est normal

### Étape 3 — Récupérer les clés API

1. Va dans **Settings** → **API** (menu gauche)
2. Copie :
   - **Project URL** : `https://xxxxxxxx.supabase.co`
   - **anon public key** : `eyJhbGc...` (la longue clé)

### Étape 4 — Configurer l'app

Crée un fichier `.env` à la racine du projet :

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...ta_clé_ici
```

Relance `npm run dev` — tu verras le badge **"Synced"** en vert.

---

## 🌐 Déployer sur Vercel (gratuit)

### Étape 1 — Push sur GitHub

```bash
git init
git add .
git commit -m "Empire Finance v2"
git branch -M main
git remote add origin https://github.com/TON-USER/empire-finance.git
git push -u origin main
```

### Étape 2 — Déployer

1. Va sur [vercel.com](https://vercel.com) → connecte GitHub
2. **New Project** → sélectionne `empire-finance`
3. **IMPORTANT** : Avant de cliquer Deploy, va dans **Environment Variables**
4. Ajoute :
   - `VITE_SUPABASE_URL` → ta Project URL Supabase
   - `VITE_SUPABASE_ANON_KEY` → ta anon key Supabase
5. Clique **Deploy**

Ton app est live sur `empire-finance-xxx.vercel.app` avec la BDD !

### Étape 3 — Installer sur téléphone

1. Ouvre l'URL dans Chrome/Safari
2. **Chrome** : Menu ⋮ → "Ajouter à l'écran d'accueil"
3. **Safari** : Partager → "Sur l'écran d'accueil"

---

## 📁 Architecture

```
empire-finance/
├── .env.example              # Template variables d'environnement
├── supabase-schema.sql       # Script SQL à exécuter dans Supabase
├── src/
│   ├── utils/
│   │   ├── supabase.js       # Client Supabase
│   │   ├── database.js       # Couche CRUD (Supabase + localStorage)
│   │   ├── constants.js      # Config (salaire, catégories, objectifs)
│   │   ├── format.js         # Utilitaires de formatage
│   │   └── reportGenerator.js # Génération PDF
│   ├── hooks/
│   │   └── useStore.js       # Hook hybride Supabase/localStorage + theme
│   ├── components/
│   │   ├── Navigation.jsx    # Nav desktop + bottom bar mobile
│   │   └── UI.jsx            # Composants réutilisables
│   ├── pages/
│   │   ├── Dashboard.jsx     # Tableau de bord + graphiques
│   │   ├── Depenses.jsx      # Suivi dépenses
│   │   ├── Epargne.jsx       # Épargne multi-objectifs
│   │   ├── Brvm.jsx          # Investissements BRVM
│   │   └── Rapport.jsx       # Rapports PDF/CSV
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css             # Thèmes dark/light + safe areas
├── index.html
├── package.json
├── vite.config.js            # Vite + PWA
└── tailwind.config.js
```

## 🔒 Sécurité

L'app utilise la clé **anon** de Supabase avec RLS (Row Level Security).
Pour un usage strictement personnel, c'est suffisant car :
- La clé anon est conçue pour être exposée côté client
- Les politiques RLS contrôlent l'accès aux données
- Seul toi connais l'URL de ton app

Pour renforcer la sécurité plus tard, tu peux activer l'**Auth Supabase** (email/password ou magic link).

## 💡 Personnalisation

Édite `src/utils/constants.js` pour changer :
- Salaire, budget max, catégories de dépenses
- Objectifs d'épargne prédéfinis
- Stratégie BRVM

---

**Build your empire.** 🏆
