/* ══════════════════════════════════════════════════════════
   FEATURE TOUR
══════════════════════════════════════════════════════════ */
let tourActive = false;
let tourCurrentStep = 0;

/*
 * Chaque étape :
 *   screen      – l'id d'écran qu'on attend que l'utilisateur atteigne
 *   pill        – numéro affiché (1/5, 2/5 …)
 *   title       – titre de la carte
 *   desc        – description courte
 *   hintIcon    – emoji dans le hint
 *   hintText    – texte du hint (HTML autorisé)
 *   canSkip     – affiche le bouton "Passer →"
 *   mandatory   – affiche le badge obligatoire
 *   triggeredBy – l'écran qui déclenche le passage à cette étape
 *                 (null = première étape, lancée manuellement)
 */
const tourSteps = [
  {
    triggeredBy: null,
    screen: 's-home',
    title: 'Tableau de bord 🏠',
    desc: 'Ici tu vois en temps réel ton impact écologique, ta liberté financière et ta progression vers chaque objectif.',
    hintIcon: '👇',
    hintText: 'Explore cette page, puis appuie sur <strong>Historique</strong> dans la barre en bas.',
    canSkip: true,
    mandatory: false,
    spotlightFn: () => document.querySelector('#s-home .b-nav button:nth-child(2)'),
    spotlightRadius: '14px',
  },
  {
    triggeredBy: 's-hist',
    screen: 's-hist',
    title: 'Historique 📋',
    desc: 'Retrouve ici toutes tes résistances et dépenses. Chaque ligne te raconte ton chemin.',
    hintIcon: '👇',
    hintText: 'Jette un œil, puis tape sur <strong>Compagnon</strong> (icône au centre de la barre).',
    canSkip: true,
    mandatory: false,
    spotlightFn: () => document.querySelector('#s-hist .b-nav button:nth-child(4)'),
    spotlightRadius: '14px',
  },
  {
    triggeredBy: 's-comp',
    screen: 's-comp',
    title: 'Compagnon 🦊',
    desc: 'Ton compagnon évolue avec toi. Plus tu résistes, plus il monte en niveau. Il peut aussi te conseiller en chat.',
    hintIcon: '👇',
    hintText: 'Découvre son évolution, puis va sur <strong>Profil</strong> (icône en bas à droite).',
    canSkip: true,
    mandatory: false,
    spotlightFn: () => document.querySelector('#s-comp .b-nav button:nth-child(5)'),
    spotlightRadius: '14px',
  },
  {
    triggeredBy: 's-profil',
    screen: 's-profil',
    title: 'Mon Profil 👤',
    desc: 'Personnalise ton expérience : thème, compagnon, paramètres. Et surtout — définis tes ambitions !',
    hintIcon: '🎯',
    hintText: 'Appuie sur <strong>Mes Ambitions</strong> dans la liste pour les préciser.',
    canSkip: false,
    mandatory: false,
    spotlightFn: () => document.querySelector("[onclick=\"go('s-param-ambitions')\"]"),
    spotlightRadius: '12px',
  },
  {
    triggeredBy: 's-param-ambitions',
    screen: 's-param-ambitions',
    title: 'Mes Ambitions ✨',
    desc: 'C\'est ici que tout commence. Définis tes objectifs SMART pour que Miroir puisse t\'aider concrètement.',
    hintIcon: '✍️',
    hintText: 'Tape sur un objectif pour le préciser avec la méthode <strong>SMART</strong>.',
    canSkip: false,
    mandatory: true,
    spotlightFn: () => document.querySelector('.smart-obj-card.primary'),
    spotlightRadius: '16px',
  },
];

/* ── Positionne le spotlight sur l'élément cible ── */
function positionSpotlight(el, radius) {
  const spot = document.getElementById('tour-spotlight');
  if (!el) { spot.classList.remove('visible', 'pulse'); return; }

  const phone = document.querySelector('.phone');
  const pRect = phone.getBoundingClientRect();
  const eRect = el.getBoundingClientRect();

  // Si l'élément n'est pas visible (display:none parent), skip
  if (eRect.width === 0 && eRect.height === 0) {
    spot.classList.remove('visible', 'pulse');
    return;
  }

  const pad = 10;
  spot.style.left   = (eRect.left - pRect.left - pad) + 'px';
  spot.style.top    = (eRect.top  - pRect.top  - pad) + 'px';
  spot.style.width  = (eRect.width  + pad * 2) + 'px';
  spot.style.height = (eRect.height + pad * 2) + 'px';
  spot.style.borderRadius = radius || '14px';

  spot.classList.add('visible');
  // Relancer le pulse
  spot.classList.remove('pulse');
  spot.offsetHeight; // reflow
  spot.classList.add('pulse');
}

let tourDone = false;
function startTour() {
  if (tourDone) return;   // ne relance pas le tuto (ex. après réenregistrement)
  tourDone = true;
  tourActive = true;
  tourCurrentStep = 0;
  renderTourStep(0);
  document.getElementById('tour-overlay').classList.add('active');
}

function renderTourStep(index) {
  const step = tourSteps[index];
  const total = tourSteps.length;

  // Pill
  document.getElementById('tour-step-num').textContent = index + 1;
  document.getElementById('tour-step-total').textContent = total;

  // Contenu
  document.getElementById('tour-title').textContent = step.title;
  document.getElementById('tour-desc').textContent = step.desc;
  document.getElementById('tour-hint-icon').textContent = step.hintIcon;
  document.getElementById('tour-hint-text').innerHTML = step.hintText;

  // Badge obligatoire
  const badge = document.getElementById('tour-mandatory-badge');
  badge.style.display = step.mandatory ? 'flex' : 'none';

  // Bouton skip
  const skipBtn = document.getElementById('tour-skip-btn');
  skipBtn.style.display = step.canSkip ? 'block' : 'none';

  // Dots
  const dotsEl = document.getElementById('tour-dots');
  dotsEl.innerHTML = '';
  tourSteps.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'tour-dot' + (i === index ? ' on' : '');
    dotsEl.appendChild(d);
  });

  // Ré-animer la carte
  const card = document.getElementById('tour-card');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = 'tourSlideUp 0.35s cubic-bezier(.22,.68,0,1.2) both';

  // Spotlight — légèrement différé pour que l'écran soit rendu
  setTimeout(() => {
    if (step.spotlightFn) positionSpotlight(step.spotlightFn(), step.spotlightRadius);
  }, 60);
}

/*
 * Appelé par go() à chaque changement d'écran pendant le tour.
 * Si l'écran correspond au déclencheur de l'étape suivante → avancer.
 */
function onTourNavigate(screenId) {
  if (!tourActive) return;

  const nextIndex = tourCurrentStep + 1;
  if (nextIndex >= tourSteps.length) return;

  const nextStep = tourSteps[nextIndex];
  if (nextStep.triggeredBy === screenId) {
    tourCurrentStep = nextIndex;
    renderTourStep(nextIndex);

    // Dernière étape → tutoriel Mes Ambitions
    if (nextIndex === tourSteps.length - 1) {
      // Auto-ouvre le SMART popup après 2.5s pour démontrer
      // (utilise la PREMIÈRE ambition réelle de l'utilisateur)
      setTimeout(() => {
        endTour();
        if (typeof openSmart === 'function') {
          const first = (typeof userAmbitions !== 'undefined' && userAmbitions.length) ? userAmbitions[0] : null;
          if (first) {
            openSmart(first.key, first.label, first.emoji, first.smartLabel || null);
          }
        }
      }, 2500);
    }
  }
}

/*
 * "Passer →" : saute directement au profil pour forcer
 * l'utilisateur à parcourir Profil → Mes Ambitions.
 */
function skipTour() {
  // Cherche l'index de l'étape Profil
  const profilIdx = tourSteps.findIndex(s => s.screen === 's-profil');
  tourCurrentStep = profilIdx;
  renderTourStep(profilIdx);
  // Naviguer vers le profil (sans re-déclencher l'avancement)
  tourActive = false; // pause temporaire pour éviter boucle
  go('s-profil');
  tourActive = true;
}

function endTour() {
  tourActive = false;
  const overlay = document.getElementById('tour-overlay');
  const spot = document.getElementById('tour-spotlight');
  spot.classList.remove('visible', 'pulse');
  // Fade out
  overlay.style.transition = 'opacity 0.4s';
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.classList.remove('active');
    overlay.style.opacity = '';
    overlay.style.transition = '';
  }, 420);
}

/* ── Thèmes par compagnon ── */
const themes = {
  foxy: { og: '#ff7e00', og2: '#e8563a', mx1: '#f25023', mx2: '#ff6338', mx3: '#ffa43a', name: 'Foxy', img: 'assets/comp-foxy.png', clip: false, iconFilter: 'none',                                                       bgFilter: 'none' },
  malo: { og: '#f472b6', og2: '#a855f7', mx1: '#e879c8', mx2: '#c026d3', mx3: '#d946ef', name: 'Malo', img: 'assets/comp-malo.png', clip: false, iconFilter: 'hue-rotate(315deg) saturate(1.4) brightness(1.05)',           bgFilter: 'hue-rotate(-60deg) saturate(0.95)' },
  elio: { og: '#f59e0b', og2: '#92400e', mx1: '#d97706', mx2: '#b45309', mx3: '#fbbf24', name: 'Élio', img: 'assets/comp-elio.png', clip: false, iconFilter: 'hue-rotate(28deg) saturate(0.9) brightness(0.85)',            bgFilter: 'hue-rotate(15deg) saturate(0.8) brightness(0.92)' },
  ryo:  { og: '#3aa6e8', og2: '#1d6fd4', mx1: '#2f8fd6', mx2: '#1d6fd4', mx3: '#7cc6f2', name: 'Ryo',  img: 'assets/comp-ryo.png',  clip: false, iconFilter: 'hue-rotate(190deg) saturate(1.35) brightness(1.1)',           bgFilter: 'hue-rotate(190deg) saturate(1.1) brightness(1.02)' },
};
let currentTheme = 'foxy';

function applyTheme(key) {
  const t = themes[key];
  if (!t) return;
  currentTheme = key;
  try { localStorage.setItem('visioncopieComp', key); } catch(e) {}   // mémorise le compagnon choisi
  const root = document.documentElement;
  root.style.setProperty('--og',  t.og);
  root.style.setProperty('--og2', t.og2);

  // Recolorer les mosaïques pixel
  const mxAll = document.querySelectorAll('.mx');
  const mxColors = [t.mx1, t.mx2, t.og, t.mx3, t.og2, t.mx1, t.mx2, t.og, t.mx3, t.og2];
  mxAll.forEach((mx, i) => { mx.style.background = mxColors[i % mxColors.length]; });

  // Remplacer TOUS les animaux mascotte dans l'app
  const clipStyle  = 'position:absolute;width:576%;height:650%;left:-183%;top:-369%;image-rendering:pixelated;';
  const plainStyle = 'position:relative;left:0;top:0;width:100%;height:100%;object-fit:contain;image-rendering:pixelated;';
  document.querySelectorAll('.dyn-comp').forEach(img => {
    img.src = t.img;
    img.style.cssText = t.clip ? clipStyle : plainStyle;
  });

  // Nom compagnon + bouton chat
  const nameEl = document.getElementById('chatCompName');
  if (nameEl) nameEl.textContent = t.name;
  const btn = document.querySelector('.foxy-btn');
  if (btn) btn.textContent = 'Discute avec ' + t.name;

  // Mettre à jour obj-tag couleur (SAUF esprit critique qui reste violet)
  document.querySelectorAll('.obj-tag').forEach(tag => {
    if (tag.classList.contains('obj-tag-ec')) return; // esprit critique → toujours violet
    tag.style.background = `color-mix(in srgb, ${t.og} 12%, transparent)`;
    tag.style.color = t.og;
  });

  // Filtres icônes navbar (active = couleur du thème)
  root.style.setProperty('--icon-active-filter', t.iconFilter);

  // Filtre couleur sur les IMAGES fond + mosaïque (orange → couleur compagnon)
  root.style.setProperty('--bg-filter', t.bgFilter);

  // Comp-cards : image propre + sleep si pas sélectionnée
  document.querySelectorAll('.comp-card').forEach(function(card) {
    var k = card.dataset.comp;
    var th = themes[k];
    if(!th) return;
    var img = card.querySelector('img');
    if(!img) return;
    var isSelected = card.classList.contains('active');
    var bkCard = COMP_BLINK_SPRITES[k];
    img.src = (!isSelected && bkCard && bkCard.sleep) ? bkCard.sleep : th.img;
  });

  // Vision-card thumbnails : endormis (décoratifs, pas le compagnon actif)
  var bkT = COMP_BLINK_SPRITES[key];
  if(bkT && bkT.sleep) {
    document.querySelectorAll('.vision-thumb .dyn-comp, .vision-card .dyn-comp').forEach(function(img){
      img.src = bkT.sleep;
    });
  }

  // Démarrer l'animation de clignement si des sprites existent
  _startBlink(key);
}

/* ── Animation clignement compagnon ── */
const COMP_BLINK_SPRITES = {
  foxy: {
    close: 'assets/comp-foxy-close-eyes.png',
    sleep: 'assets/comp-foxy-sleep.png',
    dirs:  ['assets/comp-foxy-upright-eyes.png','assets/comp-foxy-downright-eyes.png','assets/comp-foxy-downleft-eyes.png']
  },
  malo: {
    close: 'assets/comp-malo-close-eyes.png',
    sleep: 'assets/comp-malo-sleep.png',
    dirs:  ['assets/comp-malo-upright-eyes.png','assets/comp-malo-downright-eyes.png','assets/comp-malo-downleft-eyes.png']
  },
  elio: {
    close: 'assets/comp-elio-close-eyes.png',
    sleep: 'assets/comp-elio-sleep.png',
    dirs:  ['assets/comp-elio-upright-eyes.png','assets/comp-elio-downright-eyes.png','assets/comp-elio-downleft-eyes.png']
  },
  ryo: {
    close: 'assets/comp-ryo-close-eyes.png',
    sleep: 'assets/comp-ryo-sleep.png',
    dirs:  ['assets/comp-ryo-upright-eyes.png','assets/comp-ryo-downright-eyes.png','assets/comp-ryo-downleft-eyes.png']
  }
};
let _blinkT = null;
let _wakeT  = null;
let _wakePlayedThisSession = false;
let _lastActivity = 0;
document.addEventListener('scroll',     function(){ _lastActivity = Date.now(); }, true);
document.addEventListener('touchstart', function(){ _lastActivity = Date.now(); }, true);
document.addEventListener('touchmove',  function(){ _lastActivity = Date.now(); }, true);

function _stopBlink(){ if(_blinkT){ clearTimeout(_blinkT); _blinkT = null; } }

// Swap uniquement les renards principaux (pas les vision-thumbs qui restent endormis)
function _swapMain(src){
  document.querySelectorAll('.dyn-comp').forEach(function(img){
    if(!img.closest('.vision-thumb') && !img.closest('.vision-card')) img.src = src;
  });
}

// Réveil : sleep → cligne → éveillé, puis démarre le blink loop
function _wakeUpFox(){
  var bk = COMP_BLINK_SPRITES[currentTheme];
  var normalSrc = themes[currentTheme] ? themes[currentTheme].img : null;
  if(!normalSrc) return;
  if(_wakeT){ clearTimeout(_wakeT); _wakeT = null; }
  _stopBlink();
  _swapMain(bk && bk.sleep ? bk.sleep : normalSrc);
  _wakeT = setTimeout(function(){
    if(bk && bk.close) _swapMain(bk.close);
    _wakeT = setTimeout(function(){
      _swapMain(normalSrc);
      _startBlink(currentTheme);
    }, 200);
  }, 500);
}

// Réveil/sommeil des vision-thumbs selon le nombre de cartes actives
function _updateVisionThumbs() {
  var bk  = COMP_BLINK_SPRITES[currentTheme];
  var normalSrc = themes[currentTheme] ? themes[currentTheme].img : null;
  var sleepSrc  = bk && bk.sleep ? bk.sleep : null;
  if(!normalSrc) return;
  var activeCount = document.querySelectorAll('.vision-card.active').length;

  document.querySelectorAll('.vision-card').forEach(function(card) {
    var img = card.querySelector('.vision-thumb img');
    if(!img) return;
    var isActive = card.classList.contains('active');
    if(activeCount >= MAX_VISIONS && isActive) {
      // Réveil animé : sleep → close-eyes → normal
      if(sleepSrc) img.src = sleepSrc;
      setTimeout(function(){
        if(bk && bk.close) img.src = bk.close;
        setTimeout(function(){ img.src = normalSrc; }, 200);
      }, 400);
    } else {
      img.src = sleepSrc || normalSrc;
    }
  });
}

function _startBlink(key){
  _stopBlink();
  var bk = COMP_BLINK_SPRITES[key];
  if(!bk) return;
  var normalSrc = themes[key].img;

  function doBlink(cb){
    _swapMain(bk.close);
    setTimeout(function(){ _swapMain(normalSrc); if(cb) cb(); }, 150);
  }

  function schedule(){
    var idle = Date.now() - _lastActivity;
    var base = idle < 3000 ? 4500 : 2500;
    var delay = base + Math.random() * 3000;

    _blinkT = setTimeout(function(){
      var r = Math.random();
      if(r < 0.25){
        var dir = bk.dirs[Math.floor(Math.random() * bk.dirs.length)];
        _swapMain(dir);
        setTimeout(function(){ _swapMain(normalSrc); schedule(); }, 700 + Math.random() * 800);
      } else if(r < 0.45){
        doBlink(function(){ setTimeout(function(){ doBlink(schedule); }, 100); });
      } else {
        doBlink(schedule);
      }
    }, delay);
  }

  _blinkT = setTimeout(schedule, 1000 + Math.random() * 1500);
}

/* ── Prénom utilisateur ── */
let userName = 'Léa';
function continueName() {
  const input = document.getElementById('nameInput');
  const name = input.value.trim();
  if (!name) { input.focus(); return; }
  userName = name;
  // Mettre à jour tous les .user-name
  document.querySelectorAll('.user-name').forEach(el => el.textContent = name);
  // Adapter le chat (prénom dans les messages)
  go('s-intro-1');
}

/* Descriptions par compagnon (affichées sous la grille) */
const COMP_DESC = {
  foxy: "Ce renard est stratège. Toujours un coup d'avance, il sera toujours là pour te réorienter en cas de coup dur.",
  malo: "Cette méduse est apaisante. Elle t'aide à prendre du recul et à calmer tes impulsions.",
  elio: "Cet ours est rassurant. Stable et bienveillant, il t'accompagne pas à pas vers tes objectifs.",
  ryo:  "Ce pingouin est discipliné. Rigoureux et constant, il te garde sur la bonne voie."
};
function selectComp(card) {
  card.closest('#compGrid').querySelectorAll('.comp-card').forEach(c => c.classList.remove('active'));
  card.classList.add('active');
  const comp = card.dataset.comp;
  applyTheme(comp);
  // Met à jour la description du compagnon
  const desc = document.getElementById('comp-desc');
  if (desc && COMP_DESC[comp]) desc.textContent = COMP_DESC[comp];
}

/* Validation prénom sur la page Compagnon — bloque si vide */
function continueComp() {
  const input = document.getElementById('compNameInput');
  const name = input ? input.value.trim() : '';
  if (!name) {
    if (input) {
      input.focus();
      input.style.outline = '2px solid var(--og)';
      setTimeout(() => { input.style.outline = ''; }, 1500);
    }
    return;
  }
  userName = name;
  document.querySelectorAll('.user-name').forEach(el => el.textContent = name);
  go('s-intro-2');
}

/* ── Chips passions ── */
function toggleChip(el) { el.classList.toggle('on'); updatePassionCount(); }
function updatePassionCount() {
  const n = document.querySelectorAll('#chipArea .chip.on').length;
  document.getElementById('passionCount').textContent = n + ' passion' + (n > 1 ? 's' : '') + ' sélectionnée' + (n > 1 ? 's' : '');
}
function addChip() {
  const name = prompt('Ajoute une passion :');
  if (!name || !name.trim()) return;
  const area = document.getElementById('chipArea');
  const addBtn = area.querySelector('.chip-add');
  const chip = document.createElement('div');
  chip.className = 'chip on';
  chip.textContent = name.trim();
  chip.onclick = function() { toggleChip(this); };
  area.insertBefore(chip, addBtn);
  updatePassionCount();
}
