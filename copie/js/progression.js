/* ════════════════════════════════════════════════════════════
   PROGRESSION — XP du compagnon, stades, série sans craquage,
   historique des tentations (humeur, émotions, raison, produit)
   · Tout est stocké en local : visioncopie_progress, visioncopie_events
   · Alimenté par addJournalLine() (résistance / craquage)
════════════════════════════════════════════════════════════ */
const PROGRESS_KEY = 'visioncopie_progress';
const EVENTS_KEY   = 'visioncopie_events';
const DAY_MS = 86400000;

/* Barème (repris de la popup « Comment monter de niveau ») */
const XP_RULES = { resist: 150, milestone: 300, streakDay: 20 };
/* Seuils d'entrée de chaque stade */
const XP_STAGES = [
  { name: 'Sauvage',    min: 0 },
  { name: 'Dompter',    min: 1000 },
  { name: 'Maître',     min: 4000 },
  { name: 'Légendaire', min: 10000 }
];
const MILESTONE_STEPS = [25, 50, 75, 100];   // paliers d'un objectif chiffré (%)

function _loadProgress(){
  let p = null;
  try { p = JSON.parse(localStorage.getItem(PROGRESS_KEY) || 'null'); } catch(e){}
  if (!p || typeof p !== 'object') p = {};
  if (typeof p.xp !== 'number') p.xp = 0;
  if (typeof p.since !== 'number') p.since = Date.now();     // début de la série en cours
  if (typeof p.best !== 'number') p.best = 0;                 // record de jours
  if (typeof p.daysPaid !== 'number') p.daysPaid = 0;         // jours de série déjà convertis en XP
  if (!p.milestones || typeof p.milestones !== 'object') p.milestones = {};
  return p;
}
let progress = _loadProgress();
function _saveProgress(){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress)); } catch(e){} }

function loadEvents(){
  try { const s = JSON.parse(localStorage.getItem(EVENTS_KEY) || 'null'); if (Array.isArray(s)) return s; } catch(e){}
  return [];
}
function _addEvent(ev){
  const list = loadEvents();
  list.unshift(Object.assign({ ts: Date.now() }, ev));
  try { localStorage.setItem(EVENTS_KEY, JSON.stringify(list.slice(0, 200))); } catch(e){}
}

/* ── Série ── */
function streakDays(){ return Math.max(0, Math.floor((Date.now() - progress.since) / DAY_MS)); }

/* Convertit en XP les jours de série pas encore comptés */
function _payStreakDays(){
  const d = streakDays();
  if (d > progress.daysPaid) {
    const n = (d - progress.daysPaid) * XP_RULES.streakDay;
    progress.daysPaid = d;
    if (typeof addXp === 'function') addXp(n, 'serie', { quiet: true, passive: true }); else progress.xp += n;
  }
  if (d > progress.best) progress.best = d;
}

/* ── Stades ── */
function stageInfo(xp){
  let i = 0;
  while (i + 1 < XP_STAGES.length && xp >= XP_STAGES[i + 1].min) i++;
  const cur = XP_STAGES[i], next = XP_STAGES[i + 1] || null;
  const frac = next ? (xp - cur.min) / (next.min - cur.min) : 1;
  return { index: i, name: cur.name, next, frac: Math.max(0, Math.min(1, frac)) };
}

/* ── Paliers d'objectifs : +XP à chaque 25 % atteint (une seule fois par palier) ── */
function checkMilestones(){
  let gained = 0, steps = 0;
  (typeof userAmbitions !== 'undefined' ? userAmbitions : []).forEach(a => {
    const target = parseFloat(a.amount || 0);
    if (!(target > 0)) return;
    const saved = parseFloat(localStorage.getItem('visioncopie_saved_' + a.label) || '0');
    const pct = saved / target * 100;
    const done = progress.milestones[a.label] || 0;
    MILESTONE_STEPS.forEach(step => {
      if (step > done && pct >= step) { gained += XP_RULES.milestone; steps++; progress.milestones[a.label] = step; }
    });
  });
  if (gained) {
    if (typeof addXp === 'function') addXp(gained, 'palier'); else progress.xp += gained;
    if (typeof addGems === 'function') addGems(steps * GAME.gems.milestone, 'palier');
    _saveProgress(); renderProgress();
  }
  return gained;
}

/* ── Appelé par addJournalLine() ── */
function onProgressEvent(type, meta){
  meta = meta || {};
  _payStreakDays();
  if (type === 'resist') {
    _addEvent(Object.assign({ type: 'resist' }, meta));
    if (typeof addXp === 'function') addXp(XP_RULES.resist, 'resist'); else progress.xp += XP_RULES.resist;
    if (typeof addGems === 'function') addGems(GAME.gems.resist, 'resist');
    if (typeof questEvent === 'function') questEvent('resist');
  } else if (type === 'craq') {
    _addEvent(Object.assign({ type: 'craq' }, meta));
    // Un bouclier de série absorbe l'achat : la série continue
    const saved = (typeof useFreezeIfAny === 'function') && useFreezeIfAny();
    if (!saved) {
      const lost = streakDays();
      if (lost > progress.best) progress.best = lost;
      progress.since = Date.now();
      progress.daysPaid = 0;
      if (typeof emitGame === 'function') emitGame('streak-broken', { days: lost });
    }
    if (typeof markActiveDay === 'function') markActiveDay();
  } else if (type === 'analyse') {
    if (typeof questEvent === 'function') questEvent('analyse');
  } else {
    return;
  }
  _saveProgress();
  checkMilestones();
  renderProgress();
}

/* ── Affichage : accueil (cœurs + série), écran compagnon (XP), popup, notifs ── */
function renderProgress(){
  _payStreakDays(); _saveProgress();
  const st = stageInfo(progress.xp);
  const days = streakDays();
  const fmt = n => Math.round(n).toLocaleString('fr-FR');

  // Accueil : la flamme de la barre de statut affiche le nombre de jours (g-accueil.js)
  const streakEl = document.getElementById('home-streak');
  if (streakEl) streakEl.textContent = days.toLocaleString('fr-FR');

  const homeHearts = document.getElementById('home-hearts');
  if (homeHearts) {
    homeHearts.innerHTML = '';
    for (let i = 0; i <= st.index; i++) {
      const img = document.createElement('img');
      img.src = 'assets/heart.png'; img.className = 'home-heart'; img.alt = '';
      img.style.cssText = 'width:16px;height:14px;';
      homeHearts.appendChild(img);
    }
  }
  if (typeof renderAccueil === 'function') renderAccueil();

  const xpEl = document.getElementById('comp-xp');
  if (xpEl) xpEl.textContent = 'XP ' + fmt(progress.xp) + (st.next ? ' / ' + fmt(st.next.min) : '');
  const lbl = document.getElementById('comp-stage-lbl');
  if (lbl) lbl.textContent = 'Stade ' + (st.index + 1) + ' · ' + st.name;
  const fill = document.getElementById('comp-xp-fill');
  // Cœurs centrés à 12,5 / 37,5 / 62,5 / 87,5 % de la piste
  if (fill) fill.style.width = (st.next ? 12.5 + 25 * (st.index + st.frac) : 100) + '%';
  document.querySelectorAll('#s-comp .xp-h').forEach((h, i) => {
    const heart = h.querySelector('.sh'); if (heart) heart.classList.toggle('on', i <= st.index);
    const lb = h.querySelector('.xp-lb'); if (lb) lb.classList.toggle('active', i === st.index);
  });

  const help = document.getElementById('xp-help-status');
  if (help) help.textContent = st.next
    ? 'Tu es au stade ' + (st.index + 1) + ' (' + st.name + ') — il te manque ' + fmt(st.next.min - progress.xp) + ' XP pour atteindre ' + st.next.name + '.'
    : 'Tu as atteint le dernier stade : ' + st.name + ' !';
  const helpStages = document.getElementById('xp-help-stages');
  if (helpStages) {
    helpStages.innerHTML = XP_STAGES.map((s, i) => i === st.index
      ? '<strong style="color:var(--og);">' + s.name + '</strong>' : s.name).join('&nbsp;→ ');
  }
}

/* Textes des notifications « compagnon » et « série », à partir des vraies valeurs */
function progressNotifs(){
  const st = stageInfo(progress.xp);
  const days = streakDays();
  const name = (typeof themes !== 'undefined' && themes[currentTheme]) ? themes[currentTheme].name : 'Ton compagnon';
  const comp = st.next
    ? name + ' a ' + progress.xp.toLocaleString('fr-FR') + ' XP. Plus que ' + (st.next.min - progress.xp).toLocaleString('fr-FR') + ' XP avant le stade ' + st.next.name + '.'
    : name + ' est ' + st.name + ' : le dernier stade !';
  const serie = days === 0
    ? 'Ta série commence aujourd\'hui. Record : ' + progress.best + ' jour' + (progress.best > 1 ? 's' : '') + '.'
    : days + ' jour' + (days > 1 ? 's' : '') + ' sans craquage ! Ton record est à ' + Math.max(progress.best, days) + ' jours.';
  return { comp, serie };
}
