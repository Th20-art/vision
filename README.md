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

---

## 🧪 Copie de travail (`copie/`)

Le dossier **`copie/`** est un duplicata complet de l'app, pour expérimenter sans toucher à l'original.

- En ligne : **https://Th20-art.github.io/vision/copie/**
- En local : `python -m http.server 8080` puis `http://localhost:8080/copie/`
- Elle a ses **propres données** (clés `visioncopie_*` dans le localStorage) et son propre cache hors-ligne, donc elle ne mélange rien avec l'app principale. Seule la clé API Claude est partagée.
- Installable séparément sous le nom « Vision copie ».

### Étape 1 — Fiabiliser (fait dans `copie/`)

- **Capsule conservée** : la vidéo ou l'audio est stocké dans IndexedDB et revient après rechargement.
- **Arrêt d'enregistrement** : une seule fonction `stopRecording`, qui coupe vraiment caméra et micro.
- **Textes protégés** : saisies et réponses IA passent par `escHTML()` avant d'être affichées.
- **Effacer mes données** : bouton en bas du Profil (objectifs, journal, règles, compagnon, capsule ; la clé API est gardée).

### Étape 2 — Restructurer (fait dans `copie/`)

`copie/index.html` ne contient plus que le HTML des écrans ; le style et le code sont dans des fichiers séparés, chargés dans cet ordre :

```
copie/
├── index.html            HTML des 31 écrans
├── css/
│   ├── base.css          Intro, onboarding, formulaires, capsule
│   ├── app.css           Accueil, navigation, historique, compagnon, profil
│   └── demos.css         Bureau Android, esprit critique, Amazon, îlot, émotion
└── js/
    ├── core.js           escHTML(), go() : navigation entre écrans
    ├── esprit-critique.js Démo article / YouTube + analyse IA
    ├── amazon.js         Flux Amazon : scan, capsule, émotion, renoncement
    ├── dynamic-island.js Îlot dynamique (5 états)
    ├── onboarding.js     Tutoriel, thèmes compagnon, prénom, passions
    ├── ambitions.js      Objectifs, journal, règles, accueil, notifications
    ├── progression.js    XP, stades, série sans craquage, historique des tentations
    ├── affiner.js        Pause réglable + respiration, bilan des déclencheurs, pastilles de chat, clavier
    ├── ia-chat.js        API Claude, chat, objectifs SMART
    ├── capsule.js        Enregistrement, sauvegarde IndexedDB, relecture
    └── boot.js           Plein écran, service worker, démarrage
```

Les scripts sont classiques (pas de modules ES) : les fonctions restent globales, donc les `onclick` du HTML fonctionnent sans changement. Les grosses images ont été réduites (assets de la copie : 10,3 → 5,7 Mo pour les 6 plus lourdes).

### Étape 3 — Enrichir (fait dans `copie/`)

- **Humeur en 2 niveaux** (écran émotion) : une humeur sur 5 (😣 → 😄), puis une ou plusieurs émotions.
- **Série sans craquage** : compteur réel sur l'accueil ; un achat confirmé la remet à zéro et garde le record.
- **XP liée aux actions** : +150 XP par résistance, +300 XP à chaque palier de 25 % d'un objectif chiffré, +20 XP par jour de série. Stades : Sauvage (0), Dompter (1 000), Maître (4 000), Légendaire (10 000). Cœurs, barre, popup et notifications affichent les vraies valeurs.
- **Règles sur tout produit** : le contrôle local compare les règles au nom, à la marque et à la catégorie du produit scanné par l'IA (sinon, au produit de la démo).
- **Historique des tentations** (`visioncopie_events`) : chaque résistance ou achat garde humeur, émotions, raison, produit et prix — base du futur bilan des déclencheurs.

### Étape 4 — Affiner (fait dans `copie/`)

- **Pause respiration** : durée réglable de 3 à 30 s dans le Profil (« Pause avant d'acheter ») ; pendant la pause, « Inspire… / Expire… » toutes les 4 s et l'anneau respire.
- **Bilan des déclencheurs** (écran Historique) : émotions les plus fréquentes, moments des tentations, humeur moyenne quand on résiste ou achète, raisons données, conseil sur le moment le plus à risque.
- **Réponses suggérées** dans le chat : 3 pastilles sous chaque message du compagnon (proposées par l'IA si une clé est saisie, sinon selon l'objectif).
- **Accessibilité** : tous les boutons ont un nom (barre de navigation, enregistrement) ; les 116 éléments cliquables non-boutons sont atteignables au clavier (Tab, Entrée, Espace) ; contour de focus visible ; gris trop pâles foncés ou éclaircis pour atteindre le contraste AA. Reste hors AA : le texte blanc sur l'orange de la marque (2,55:1).

### Gamification façon Duolingo (boucle gantelet, dans `copie/`)

Socle commun `js/game.js` : graines 🌱 (monnaie gagnée en résistant et en finissant des quêtes, jamais d'argent réel), boucliers de série (absorbent un achat), 3 quêtes du jour, ligue de la semaine (participants fictifs, signalés comme tels), événement `vision:game` partagé. Chaque écran est un module `js/g-*.js` + `css/g-*.css` :

| Module | Ce qu'il ajoute |
| --- | --- |
| `g-accueil` | Barre de statut (ligue, flamme grise tant que rien n'est fait aujourd'hui, graines, boucliers), bulle du compagnon, carte « À suivre » vers la prochaine quête |
| `g-celebration` | Écran de fête après une résistance (XP, € mis de côté, série) avec bouton « Récupérer », et après une quête |
| `g-serie` | Écran série : gros compteur, flamme qui grandit, semaine, calendrier du mois, boucliers, état « série sauvée » |
| `g-quetes` | Quêtes du jour : barres « x / y », coffres, bonus des 3 quêtes, compte à rebours, bouton vers l'action |
| `g-ligue` | Ligue de la semaine : 7 niveaux (Graine → Forêt), podium, zones de montée/descente, ta ligne mise en avant |
| `g-boutique` | Boutique : bouclier de série contre des graines, feuille de confirmation, comment gagner des graines |
| `g-mascotte` | Compagnon expressif : série protégée, nouveau départ après un achat (sans culpabiliser), montée/descente de ligue |
| `g-rappels` | Proposition de rappel quotidien (matin/midi/soir), bandeau doux quand rien n'est fait aujourd'hui, notifications basées sur tes vraies données |

