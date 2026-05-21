# Vision

Projet de fin d'études — Théo · CY École de Design

**Vision** est un compagnon mobile qui transforme les achats impulsifs en choix conscients : au moment de la tentation, il confronte l'utilisateur à ses objectifs concrets (épargne, écologie, esprit critique…) via un compagnon évolutif, une capsule vidéo de soi, et des interventions contextuelles.

🔗 **App en ligne** : https://Th20-art.github.io/vision/

---

## 📂 Structure du dossier

```
vision/
├── index.html        ⭐ L'application complète (maquette interactive, un seul fichier)
├── manifest.json     Manifest PWA (installation écran d'accueil)
├── sw.js             Service worker (cache hors-ligne)
├── assets/           Images, icônes, sprites des compagnons, captures Amazon
└── README.md         Ce fichier
```

> L'app actuelle est **`index.html`** (anciennement `miroir-v8.html`).

---

## 🚀 Lancer l'application

### En ligne (recommandé)
Ouvre **https://Th20-art.github.io/vision/** — sur téléphone elle s'affiche plein écran et la caméra fonctionne (HTTPS).

**Installer comme une app** :
- Android (Chrome) : menu ⋮ → *Ajouter à l'écran d'accueil*
- iPhone (Safari) : Partager → *Sur l'écran d'accueil*

### En local
- **Double-clic sur `index.html`** : fonctionne, mais la **caméra/micro** (capsule vidéo) sont désactivés en `file://` et la PWA n'est pas installable.
- **Serveur local** (caméra OK) :
  ```bash
  python -m http.server 8080
  ```
  puis ouvre `http://localhost:8080/`.

---

## ✨ Fonctionnalités

- **Onboarding** : choix de 2 objectifs (si un seul → écologie ajoutée auto), méthode SMART pour quantifier, choix du compagnon, enregistrement d'une capsule vidéo.
- **Compagnon évolutif** : 4 personnages (Foxy, Malo, Élio, Ryo/pingouin), chacun avec sa **couleur de thème** qui recolore toute l'interface. Barre d'XP en cœurs (4 stades : Sauvage → Dompter → Maître → Légendaire) + popup d'explication.
- **Home dynamique** : objectifs, chips et journal qui varient selon les objectifs choisis ; bandeau objectif collant au scroll ; journal limité aux 3 dernières entrées.
- **Esprit critique** : module activable + page de paramétrage dédiée (violet, indépendant du compagnon).
- **Flux Amazon (démo d'intervention)** : fiche produit + panier (captures réelles), **Dynamic Island** animé, puis au paiement → capsule vidéo + sous-titres → écran émotion (chrono 30 s, bouton « J'y vais quand même » déverrouillé après le compte à rebours) → écran de renoncement.
- **Capsule** : enregistrement vidéo réel (getUserMedia/MediaRecorder en HTTPS) + transcription animée, relecture dans « Ta capsule ».

---

## 🛠️ Mettre à jour le site

```bash
git add -A
git commit -m "maj"
git push
```
GitHub Pages se redéploie automatiquement (~1 min) sur https://Th20-art.github.io/vision/.

---

## ⚠️ Notes

- C'est une **maquette interactive** : aucune donnée n'est sauvegardée (tout se réinitialise au rechargement, pas de backend).
- La caméra/capsule nécessite **HTTPS ou localhost** (jamais en `file://`).
- Les icônes PWA (`assets/icon-192.png`, `assets/icon-512.png`) sont des placeholders — à remplacer par de vraies icônes carrées.

---

## 🪞 Philosophie

Vision transforme les achats impulsifs en choix conscients, en confrontant
l'utilisateur à ses engagements concrets au moment de la tentation.

« Concrete beats abstract. »
