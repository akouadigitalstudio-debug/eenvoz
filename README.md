# 🎤 EenVoz

> **Une question. Ta vraie réponse. Chaque jour.**

Application mobile-first de sondages d'opinion quotidiens avec réponses vocales, classements mondiaux, streaks et partage viral.

---

## 🚀 Stack technique

| Outil | Version |
|---|---|
| **Framework** | React + Vite |
| **Language** | JSX (JavaScript) |
| **Styling** | CSS-in-JS (inline styles + `<style>` tag) |
| **Déploiement** | Vercel |
| **Node requis** | ≥ 18.x |

---

## 📁 Structure du projet

```
/eenvoz
├── public/
│   └── favicon.svg          # Icône de l'application
├── src/
│   ├── components/
│   │   └── EenVozApp.jsx    # Composant principal (app entière)
│   └── main.jsx             # Point d'entrée React
├── .env.example             # Variables d'environnement (modèle)
├── .gitignore
├── index.html               # HTML de base (Vite)
├── package.json
├── vercel.json              # Config Vercel (SPA routing)
├── vite.config.js
└── README.md
```

---

## ⚙️ Lancer en local

### 1. Installer les dépendances
```bash
npm install
```

### 2. Créer le fichier `.env.local`
```bash
cp .env.example .env.local
# Éditer .env.local avec vos valeurs
```

### 3. Lancer le serveur de développement
```bash
npm run dev
# → http://localhost:3000
```

---

## 🏗️ Build de production

```bash
npm run build
# Les fichiers compilés sont dans /dist
```

### Prévisualiser le build en local
```bash
npm run preview
```

---

## 🌍 Déploiement sur Vercel

### Option A – Via GitHub (recommandé)
1. Pusher ce repo sur GitHub
2. Aller sur [vercel.com](https://vercel.com) → **New Project**
3. Importer le repo GitHub
4. Vercel détecte automatiquement **Vite** → cliquer **Deploy**

### Option B – Via Vercel CLI
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Variables d'environnement sur Vercel
Dans **Project Settings → Environment Variables**, ajouter :

| Variable | Valeur |
|---|---|
| `VITE_APP_URL` | `https://eenvoz.app` (ou votre domaine) |
| `VITE_APP_NAME` | `EenVoz` |

> ⚠️ Toutes les variables Vite **doivent** commencer par `VITE_` pour être exposées côté client.

---

## 🌐 Fonctionnalités

- 🗳️ **Question du jour** – vote en 1 clic (OUI / NON / ÇA DÉPEND)
- 🎤 **Réponse vocale** – enregistrement jusqu'à 10 secondes
- 📊 **Résultats en temps réel** – monde / pays / ville
- 🔥 **Streaks & Badges** – fidélisation quotidienne
- 🏆 **Leaderboard mondial** – classement par points
- 📤 **Partage viral** – carte de résultat partageable
- ⚡ **Défis d'amis** – challenge system
- 🌍 **5 langues** – FR, EN, ES, PT, NL
- 📱 **Mobile-first** – optimisé iOS/Android

---

## 📄 Licence

Propriétaire – © 2025 EenVoz. Tous droits réservés.
