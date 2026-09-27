/* ════════════════════════════════════════════════════════════
   Morceau gantelet « accueil » — barre de statut + héros de l'accueil
   · Barre : ligue, flamme de série (grise tant qu'aujourd'hui n'est
     pas actif), graines 🌱, boucliers 🛡 — vraies valeurs de game.js
   · Héros : le compagnon parle (bulle), carte « À suivre » = prochaine
     quête du jour non faite, barre « x / y », bouton 3D
   · Rafraîchi par renderProgress() (donc go('s-home')) et par chaque
     événement 'vision:game'
   · Icônes en pixel art (SVG), dans l'esprit des sprites compagnons
════════════════════════════════════════════════════════════ */

/* ── Icônes pixel : chaque lettre = une couleur (variable CSS), '.' = vide ── */
const ACC_ICONS = {
  flame: { pal: { o: '--acc-f1', y: '--acc-f2', w: '--acc-f3' }, rows: [
    '......o.....',
    '.....oo.....',
    '.....ooo....',
    '....oooo....',
    '....ooooo.o.',
    '...oooooo.oo',
    '...ooooooooo',
    '..ooooyooooo',
    '.oooooyyoooo',
    '.ooooyyyyooo',
    'oooyyyyyyooo',
    'oooyywwyyyoo',
    'ooyywwwwyyoo',
    '.ooywwwwyoo.',
    '..oooooooo..'
  ] },
  seed: { pal: { g: '#58cc02', G: '#46a302', s: '#3c8d00', b: '#c9854a', B: '#9c6232' }, rows: [
    '........ggg.',
    '.gg....ggggg',
    'gggg..gggggG',
    'ggggg.ggggG.',
    '.gggGsgggG..',
    '..gGGsGG....',
    '.....s......',
    '.....s......',
    '...bbbbbb...',
    '..bbbbbbbB..',
    '..bbbbbbBB..',
    '...bBBBBB...'
  ] },
  shield: { pal: { b: '#2ec0ff', d: '#1899d6', l: '#a6e6ff' }, rows: [
    '.bbbbbddddd.',
    'bbbbbbdddddd',
    'bllbbbdddddd',
    'blbbbbdddddd',
    'blbbbbdddddd',
    'bbbbbbdddddd',
    'bbbbbbdddddd',
    '.bbbbbddddd.',
    '.bbbbbddddd.',
    '..bbbbdddd..',
    '...bbbddd...',
    '....bbdd....',
    '.....bd.....'
  ] },
  medal: { pal: { r: '#ff4b4b', R: '#1cb0f6', c: '--acc-l1', C: '--acc-l2', h: '--acc-l0', w: '#ffffff' }, rows: [
    'rr........RR',
    'rrr......RRR',
    '.rrr....RRR.',
    '..rrr..RRR..',
    '...rrrRRR...',
    '...cccccC...',
    '..chhcccCC..',
    '.chhccwccCC.',
    '.chccwwwcCC.',
    '.cccccwcCCC.',
    '.ccccccCCCC.',
    '..cccCCCCC..',
    '...cCCCCC...'
  ] },
  chest: { pal: { b: '#d08a45', B: '#a8662c', d: '#6e4219', y: '#ffc800', Y: '#e5a500' }, rows: [
    '..bbbbbbbbbb..',
    '.bbbbbbbbbbbb.',
    'ybbbbbbbbbbbby',
    'yBBBBBBBBBBBBy',
    'yyyyyyYYyyyyyy',
    'ybbbbbYYbbbbby',
    'ybbbbbddbbbbby',
    'ybbbbbbbbbbbby',
    'ybbbbbbbbbbbby',
    'yBBBBBBBBBBBBy',
    'YYYYYYYYYYYYYY'
  ] },
  bolt: { pal: { y: '#ffc800', Y: '#f0a800' }, rows: [
    '....yyy',
    '...yyy.',
    '..yyy..',
    '.yyyyyY',
    '....yY.',
    '...yY..',
    '..Y....'
  ] }
};

/* Construit un SVG « net » (crispEdges) en fusionnant les pixels voisins d'une ligne */
function _accPx(name){
  const ic = ACC_ICONS[name]; if (!ic) return '';
  const h = ic.rows.length, w = ic.rows[0].length;
  let out = '';
  ic.rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const ch = row[x];
      if (ch === '.') { x++; continue; }
      let run = 1; while (x + run < w && row[x + run] === ch) run++;
      const col = ic.pal[ch] || '#000';
      const fill = col.startsWith('--') ? 'var(' + col + ')' : col;
      out += '<rect x="' + x + '" y="' + y + '" width="' + run + '" height="1.02" style="fill:' + fill + '"/>';
      x += run;
    }
  });
  return '<svg viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + out + '</svg>';
}

/* Couleur de chaque niveau de ligue (icône, ombre, texte lisible AA) */
const ACC_LEAGUE_COLORS = [
  { h: '#f6c28e', c: '#e0934a', C: '#b8702e', t: '#9a5a1c' },   // Graine (bronze)
  { h: '#c4f08f', c: '#7fd13b', C: '#58a700', t: '#3f7d00' },   // Pousse
  { h: '#9df0e0', c: '#2fd0b5', C: '#12a38c', t: '#0c7a69' },   // Bourgeon
  { h: '#ffc2de', c: '#ff7ab8', C: '#e0468f', t: '#c01f68' },   // Fleur
  { h: '#b5e6ff', c: '#49c0f8', C: '#1899d6', t: '#0a72ab' },   // Arbuste
  { h: '#dcc0f8', c: '#b77df0', C: '#8f4fd6', t: '#7a3bc0' },   // Arbre
  { h: '#fff0a8', c: '#ffd23f', C: '#e5a500', t: '#8a6700' }    // Forêt (or)
];

/* ── Utilitaires couleur : teinte du compagnon rendue lisible (WCAG) ── */
function _accRgb(c){
  c = String(c || '').trim();
  if (c[0] === '#') {
    if (c.length === 4) c = '#' + c[1] + c[1] + c[2] + c[2] + c[3] + c[3];
    return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  }
  const m = c.match(/[\d.]+/g); return m ? m.slice(0, 3).map(Number) : [255, 126, 0];
}
function _accLum(rgb){
  const v = rgb.map(x => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function _accRatio(a, b){ const x = _accLum(a), y = _accLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function _accHex(rgb){ return '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
/* Assombrit `rgb` jusqu'à atteindre `ratio` contre `bg` */
function _accShade(rgb, bg, ratio){
  let k = 1, out = rgb.slice();
  while (_accRatio(out, bg) < ratio && k > 0.2) { k -= 0.02; out = rgb.map(v => v * k); }
  return out;
}

/* ── Navigation protégée : les écrans série / boutique / quêtes / ligue
      arrivent en parallèle ; on n'y va que s'ils existent ── */
function accGo(id){ if (document.getElementById(id)) { go(id); return true; } return false; }

/* Bouton de la carte du jour : écran Quêtes, sinon l'action de la quête */
function accTodayTap(){
  if (accGo('s-quetes')) return;
  const q = _accNextQuest();
  const t = q ? q.type : '';
  if (t === 'capsule' && accGo('s-param-video')) return;
  if (t === 'analyse' && accGo('s-youtube')) return;
  if (typeof openJournal === 'function') openJournal();
}

function _accNextQuest(){
  const list = (typeof dailyQuests === 'function') ? dailyQuests() : [];
  return list.find(q => !q.done) || null;
}

function _accGreeting(){
  const h = new Date().getHours();
  return (h >= 5 && h < 18) ? 'Bonjour' : 'Bonsoir';
}

function _accFmt(n){ return Math.round(n || 0).toLocaleString('fr-FR'); }

let _accIconsDone = false;
function _accPaintIcons(){
  if (_accIconsDone) return;
  document.querySelectorAll('#acc-top [data-px]').forEach(el => { el.innerHTML = _accPx(el.dataset.px); });
  _accIconsDone = true;
}

/* ── Rendu principal ── */
function renderAccueil(){
  const root = document.getElementById('acc-top');
  if (!root || typeof gameSnapshot !== 'function') return;
  const s = gameSnapshot(); if (!s) return;
  _accPaintIcons();
  const $ = id => document.getElementById(id);

  /* Teinte du compagnon → bouton 3D, étiquette et barre lisibles */
  const og = _accRgb(getComputedStyle(document.documentElement).getPropertyValue('--og') || '#ff7e00');
  const white = [255, 255, 255];
  const face = _accShade(og, white, 3.05);                 // texte blanc 19px gras = grand texte (≥ 3:1)
  const lip = face.map(v => v * 0.78);
  const tint = og.map(v => v + (255 - v) * 0.86);
  const ink = _accShade(og, tint, 4.6);                    // petit texte coloré sur la teinte (≥ 4.5:1)
  root.style.setProperty('--acc-btn', _accHex(face));
  root.style.setProperty('--acc-btn-lip', _accHex(lip));
  root.style.setProperty('--acc-tint', _accHex(tint));
  root.style.setProperty('--acc-ink', _accHex(ink));

  /* Flamme : grise tant qu'aucune action aujourd'hui */
  const lit = !!s.activeToday;
  const flame = $('acc-flame');
  flame.classList.toggle('is-off', !lit);
  const streakEl = $('home-streak');
  if (streakEl) streakEl.textContent = _accFmt(s.streak);
  flame.setAttribute('aria-label', 'Série : ' + s.streak + (s.streak > 1 ? ' jours' : ' jour') + ' sans craquage, '
    + (lit ? 'flamme allumée aujourd’hui' : 'flamme pas encore allumée aujourd’hui'));

  /* Graines et boucliers */
  $('acc-gems').textContent = _accFmt(s.gems);
  $('acc-gems-btn').setAttribute('aria-label', _accFmt(s.gems) + (s.gems > 1 ? ' graines' : ' graine') + ', ouvrir la boutique');
  $('acc-freezes').textContent = _accFmt(s.freezes);
  $('acc-freezes-btn').classList.toggle('is-empty', !s.freezes);
  $('acc-freezes-btn').setAttribute('aria-label', s.freezes + (s.freezes > 1 ? ' boucliers' : ' bouclier') + ' de série, ouvrir la boutique');

  /* Ligue */
  const li = Math.max(0, Math.min(ACC_LEAGUE_COLORS.length - 1, s.league || 0));
  const lc = ACC_LEAGUE_COLORS[li];
  const lg = $('acc-league');
  lg.style.setProperty('--acc-l0', lc.h); lg.style.setProperty('--acc-l1', lc.c);
  lg.style.setProperty('--acc-l2', lc.C); lg.style.setProperty('--acc-lt', lc.t);

  /* Niveau du compagnon (pastille sous le sprite, cœurs rendus par renderProgress) */
  if (typeof stageInfo === 'function' && typeof progress !== 'undefined') {
    const st = stageInfo(progress.xp);
    $('acc-stage-name').textContent = st.name;
    $('acc-level').setAttribute('aria-label', 'Ton compagnon est au stade ' + (st.index + 1) + ' : ' + st.name);
  }
  $('acc-league-name').textContent = s.leagueName;
  let rankTxt = '';
  if (typeof leagueStandings === 'function') {
    const me = leagueStandings().find(p => p.me);
    if (me) rankTxt = ', tu es ' + (me.rank === 1 ? '1re' : me.rank + 'e');
  }
  lg.setAttribute('aria-label', 'Ligue ' + s.leagueName + rankTxt + ', voir le classement');

  /* Bulle du compagnon */
  const list = s.quests || [];
  const doneN = list.filter(q => q.done).length;
  const allDone = list.length > 0 && doneN === list.length;
  $('acc-hello-word').textContent = _accGreeting();
  const days = '<b>' + _accFmt(s.streak) + (s.streak > 1 ? ' jours' : ' jour') + ' sans craquage</b>';
  let say;
  if (allDone) say = 'Tout est fait pour aujourd’hui. Je suis fier de toi !';
  else if (lit) say = 'Ta flamme brille aujourd’hui. On continue sur cette lancée ?';
  else if (s.streak > 0) say = days + ' ! Une petite action et ta flamme s’allume.';
  else say = 'Nouveau départ, en douceur. Une petite action allume ta flamme.';
  $('acc-say').innerHTML = say;
  root.classList.toggle('is-lit', lit);

  /* Carte « À suivre » : prochaine quête non faite */
  const q = list.find(x => !x.done);
  const card = $('acc-today');
  card.classList.toggle('is-done', allDone);
  const dots = $('acc-dots');
  dots.innerHTML = list.map((x, i) => '<i class="' + (i < doneN ? 'on' : (i === doneN ? 'cur' : '')) + '"></i>').join('');
  $('acc-count').textContent = doneN + ' / ' + (list.length || 3);
  $('acc-count-wrap').setAttribute('aria-label', doneN + ' quête' + (doneN > 1 ? 's' : '') + ' faite' + (doneN > 1 ? 's' : '') + ' sur ' + (list.length || 3));

  const gemsPerQuest = (typeof GAME !== 'undefined') ? GAME.gems.quest : 15;
  const gemsBonus = (typeof GAME !== 'undefined') ? GAME.gems.allQuests : 30;
  const tag = $('acc-tag'), title = $('acc-title'), cta = $('acc-cta');
  let cur = 0, tot = 1, xp = 0, gems = gemsPerQuest;
  if (q) {
    tag.textContent = 'À suivre';
    title.textContent = q.label;
    cur = q.progress; tot = q.target; xp = q.xp;
    cta.textContent = lit ? 'Gagner ' + gems + ' graines' : 'Allumer ma flamme';
  } else {
    tag.textContent = 'Bonus débloqué';
    title.textContent = list.length ? 'Journée bouclée, bravo !' : 'Tes quêtes arrivent';
    cur = doneN; tot = list.length || 3; xp = 0; gems = gemsBonus;
    cta.textContent = 'Voir mes récompenses';
  }
  $('acc-xp').textContent = '+' + _accFmt(xp);
  $('acc-xp-chip').hidden = !xp;
  $('acc-gain').textContent = '+' + _accFmt(gems);
  const pct = tot ? Math.max(0, Math.min(1, cur / tot)) : 0;
  $('acc-pfill').style.width = (pct ? Math.max(pct * 100, 9) : 0) + '%';
  $('acc-ptxt').textContent = _accFmt(cur) + ' / ' + _accFmt(tot);
  $('acc-pbar').classList.toggle('is-full', pct >= 1);
  $('acc-pbar').setAttribute('aria-label', 'Progression : ' + _accFmt(cur) + ' sur ' + _accFmt(tot));
  cta.setAttribute('aria-label', cta.textContent + (q ? ' : ' + q.label : '') + ', voir les quêtes du jour');
}

/* Chaque gain (graines, quête, bouclier, série…) rafraîchit l'accueil */
window.addEventListener('vision:game', function(){ try { renderAccueil(); } catch(e){} });
