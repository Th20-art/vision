# Miroir v7.4 — Dossier complet

Projet de fin d'études — Théo · CY École de Design

---

## 📂 Structure du dossier

```
miroir-v7.4-complet/
├── extension/        Extension Chrome (Manifest V3)
│   ├── manifest.json
│   ├── content.js    Script injecté dans toutes les pages
│   ├── background.js Service worker (appels Claude API)
│   ├── popup.html    Interface du popup (3 onglets)
│   └── popup.js
│
├── pwa/              Progressive Web App (à héberger)
│   └── miroir_v7.html
│
├── demo/             Démo mobile pour la soutenance
│   └── miroir_demo.html
│
└── README.md         Ce fichier
```

---

## 🛠️ Comment installer chaque partie

### Extension Chrome

1. Ouvre Chrome → `chrome://extensions`
2. Active le mode développeur (en haut à droite)
3. « Charger l'extension non empaquetée »
4. Sélectionne le dossier `extension/`
5. Clique sur l'icône Miroir → renseigne ta clé API Anthropic (`sk-ant-…`)
6. Coche tes ambitions, ajoute tes passions, valide

### PWA

Le fichier `pwa/miroir_v7.html` est destiné à être hébergé sur GitHub Pages
ou tout serveur statique. URL actuelle : th20-art.github.io/mirror-page/

Pour mettre à jour ton hébergement :
1. Pousse `miroir_v7.html` sur ta branche `main`
2. GitHub Pages le sert automatiquement à l'URL configurée

### Démo mobile (pour la soutenance)

Ouvre `demo/miroir_demo.html` dans n'importe quel navigateur :
- Sur **desktop** : cadre Galaxy S24 stylé au centre, sidebar à droite avec 2 scènes
- Sur **téléphone** : plein écran sans cadre, comme une vraie app

**Raccourcis clavier :**
- `F` plein écran (cache la sidebar)
- `→` étape suivante
- `1` / `2` switch scène Shein / TikTok
- `R` reset

---

## ✨ Fonctionnalités principales

### Extension (analyse produit)
- Analyse IA des pages produits via Claude (~$0.001/analyse)
- 3 alternatives par produit : 🔄 Plus malin · ✨ Plus toi · 🌿 Plus libre
- Modal tirelire après résistance (QR SEPA prérempli + 6 banques)
- Coût en temps : € → heures de salaire / jours d'épicerie / cafés
- Mode strict : délai 60s sur les achats classés "danger"
- Analyse médias YouTube/TikTok/Instagram en arrière-plan

### PWA (tableau de bord)
- Onboarding 6 étapes : ambitions → goals → compte → domaines → passions → loc
- Écran Impact avec 6 blocs : épargne / tirelire / timeline / domaines / heatmap / sessions médias
- Engagements hebdomadaires bidirectionnels avec l'extension
- Export JSON / CSV pour analyse

### Démo mobile
- 2 scènes scriptées : Shein (achat + tirelire) et TikTok (analyse + dérive)
- Cadre Galaxy S24 fidèle ou plein écran sur téléphone
- Aucune dépendance externe ni clé API requise

---

## 🔌 Synchronisation extension ↔ PWA

Les deux surfaces communiquent via :
- `localStorage` (fallback persistant)
- `postMessage` (sync live)

Quand l'extension détecte que tu es sur la PWA, elle pousse automatiquement
profil + journal. Quand tu modifies un engagement hebdo dans la PWA,
l'extension le récupère et l'applique à toutes tes navigations.

---

## 📝 Versions

- **v7.4** : Analyse médias + démo mobile (actuel)
- **v7.3** : Passions + 3 alternatives typées
- **v7.2** : Tirelire + QR SEPA + slide compte épargne
- **v7.1** : Journal d'interceptions + écran Impact PWA
- **v7.0** : Refonte ambitions concrètes (vs ikigai abstrait)

---

## 🪞 Philosophie

Miroir transforme les achats impulsifs en choix conscients, en confrontant
l'utilisateur à ses engagements concrets au moment de la tentation.

« Concrete beats abstract. »

