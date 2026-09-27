/* ════════════════════════════════════════════════════════════
   QUÊTES — écran « Quêtes du jour » (#s-quetes)
   · Les 3 quêtes du jour (game.js : dailyQuests / questEvent)
   · Coffre bonus quand les trois sont faites (GAME.gems.allQuests)
   · Compte à rebours en direct jusqu'aux nouvelles quêtes (minuit)
   · Se redessine à l'entrée (go) et sur les événements 'vision:game'
   Tout est préfixé vq / _vq pour ne pas heurter les autres morceaux.
════════════════════════════════════════════════════════════ */

/* ── Couleurs dérivées du thème du compagnon (contraste AA garanti) ── */
function _vqRgb(hex){
  const h = String(hex || '').trim().replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}
function _vqHex(rgb){ return '#' + rgb.map(v => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join(''); }
function _vqLum(rgb){
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
function _vqContrast(a, b){ const x = _vqLum(a), y = _vqLum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function _vqToHsl(rgb){
  const [r, g, b] = rgb.map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6;
  }
  return [h, s, l];
}
function _vqFromHsl(h, s, l){
  if (!s) return [l * 255, l * 255, l * 255];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
  const t = x => { x = (x + 1) % 1; return x < 1 / 6 ? p + (q - p) * 6 * x : x < 1 / 2 ? q : x < 2 / 3 ? p + (q - p) * (2 / 3 - x) * 6 : p; };
  return [t(h + 1 / 3) * 255, t(h) * 255, t(h - 1 / 3) * 255];
}
/* Assombrit une couleur (même teinte) jusqu'à atteindre `target` de contraste contre `against` */
function _vqDeepen(rgb, target, against, satBoost){
  const [h, s0] = _vqToHsl(rgb); let l = _vqToHsl(rgb)[2];
  const s = Math.min(1, s0 * (satBoost || 1));
  let c = _vqFromHsl(h, s, l);
  while (l > 0.02 && _vqContrast(c, against) < target) { l -= 0.005; c = _vqFromHsl(h, s, l); }
  return c;
}
function _vqPalette(){
  const cs = getComputedStyle(document.documentElement);
  const th = (typeof themes !== 'undefined' && typeof currentTheme !== 'undefined') ? themes[currentTheme] : null;
  const og  = _vqRgb(cs.getPropertyValue('--og'))  || _vqRgb(th && th.og)  || [255, 126, 0];
  const og2 = _vqRgb(cs.getPropertyValue('--og2')) || _vqRgb(th && th.og2) || [232, 86, 58];
  const W = [255, 255, 255];
  const mid = og.map((v, i) => (v * 0.45 + og2[i] * 0.55));
  const band = _vqDeepen(mid, 4.9, W, 1.15);                 // bandeau : texte blanc AA (≥ 4,5:1) sans virer au brun
  const fill = _vqDeepen(mid, 4.6, W, 1.15);                 // barres : chiffres blancs AA (≥ 4,5:1)
  const ink = _vqDeepen(og, 4.8, W);                          // texte couleur thème sur blanc
  return { band: _vqHex(band), ink: _vqHex(ink), fill: _vqHex(fill), onFill: '#ffffff' };
}

/* ── Pixel art (même esprit que les compagnons) ── */
function _vqPix(rows, pal, cls){
  const w = rows[0].length, h = rows.length; let r = '';
  rows.forEach((row, y) => {
    for (let x = 0; x < w;) {
      const c = row[x]; let n = 1;
      while (x + n < w && row[x + n] === c) n++;
      if (c !== '.' && pal[c]) r += '<rect x="' + x + '" y="' + y + '" width="' + n + '" height="1" fill="' + pal[c] + '"/>';
      x += n;
    }
  });
  return '<svg class="' + cls + '" viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + r + '</svg>';
}
const VQ_CHEST_SHUT = [
  '....................',
  '....................',
  '....................',
  '..OOOOOOOOOOOOOOOO..',
  '.OHHHMHHHHHHHHMHHHO.',
  'OHLLLMLLLLLLLLMLLLLO',
  'OLLLLMLLLLLLLLMLLLLO',
  'OLLLLMLLLLLLLLMLLLLO',
  'ODDDDmDDDDDDDDmDDDDO',
  'OOOOOOOOYYYYOOOOOOOO',
  'OBBBBMBBYKKYBBMBBBBO',
  'OBBBBMBBYKKYBBMBBBBO',
  'OBBBBMBByyyyBBMBBBBO',
  'OBBBBMBBBBBBBBMBBBBO',
  'OBBBBMBBBBBBBBMBBBBO',
  'OEEEEmEEEEEEEEmEEEEO',
  'OOOOOOOOOOOOOOOOOOOO'
];
/* Coffre ouvert : une pousse (les graines !) en sort */
const VQ_CHEST_OPEN = [
  '......GGG..GGG......',
  '.....GGGGG.GGGGG....',
  '.....GgggGgGgggG....',
  '......GGGgggGGG.....',
  '...OOOOOOggOOOOOO...',
  '..OHHHHMHggHMHHHHO..',
  '..OIIIIIIggIIIIIIO..',
  '.OIIIIIIIggIIIIIIIO.',
  '.OIIIIIIIggIIIIIIIO.',
  'OOOOOOOOOggOOOOOOOOO',
  'OZZzZZZZzggZZzZZZzZO',
  'OOOOOOOOYYYYOOOOOOOO',
  'OBBBBMBBYKKYBBMBBBBO',
  'OBBBBMBByyyyBBMBBBBO',
  'OBBBBMBBBBBBBBMBBBBO',
  'OEEEEmEEEEEEEEmEEEEO',
  'OOOOOOOOOOOOOOOOOOOO'
];
const VQ_SPROUT = { G: '#7ee04f', g: '#3f9a1f', Z: '#fff1a8', z: '#ffcf3d', I: '#3b1d07' };
const VQ_CHEST_PAL = {
  bois:   { O: '#5a2d0c', H: '#f0a55a', L: '#d9822b', D: '#a85a17', B: '#c56f22', E: '#a85a17', M: '#7f8a99', m: '#5d6775', Y: '#ffd23f', y: '#e0a800', K: '#5a2d0c' },
  argent: { O: '#3a4452', H: '#f3f6f9', L: '#cfd8e1', D: '#98a6b5', B: '#b9c5d1', E: '#8f9dad', M: '#6f7c8c', m: '#566273', Y: '#ffd23f', y: '#e0a800', K: '#3a4452' },
  or:     { O: '#7a4300', H: '#fff2a6', L: '#ffd23f', D: '#e6a100', B: '#ffc21f', E: '#e09200', M: '#f08a00', m: '#c26a00', Y: '#ffffff', y: '#d5dde5', K: '#7a4300' }
};
function _vqChest(tier, open, cls){
  const pal = Object.assign({}, VQ_CHEST_PAL[tier] || VQ_CHEST_PAL.bois, VQ_SPROUT);
  if (tier !== 'bois') pal.I = tier === 'or' ? '#5a3300' : '#27303b';
  return _vqPix(open ? VQ_CHEST_OPEN : VQ_CHEST_SHUT, pal, cls);
}

/* ── Icônes des quêtes (pleines, lisibles en 24 px) ── */
const VQ_ICONS = {
  shield: '<path d="M12 2.4 4.2 5.3v6.1c0 5 3.3 8.7 7.8 10.2 4.5-1.5 7.8-5.2 7.8-10.2V5.3z" fill="#fff"/><path d="m8.4 12.1 2.5 2.5 4.9-5.1" fill="none" stroke="var(--c)" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
  heart:  '<path d="M12 20.6c-.4 0-.8-.1-1.1-.4C7.6 17.6 3.5 14.2 3.5 9.6 3.5 6.8 5.6 4.6 8.3 4.6c1.5 0 2.8.7 3.7 1.9.9-1.2 2.2-1.9 3.7-1.9 2.7 0 4.8 2.2 4.8 5 0 4.6-4.1 8-7.4 10.6-.3.3-.7.4-1.1.4z" fill="#fff"/>',
  pencil: '<path d="M15.2 4.3a2.3 2.3 0 0 1 3.3 0l1.2 1.2a2.3 2.3 0 0 1 0 3.3L9.1 19.4l-5.2 1.1 1.1-5.2z" fill="#fff"/><path d="m13.6 5.9 4.5 4.5" stroke="var(--c)" stroke-width="1.8"/>',
  play:   '<rect x="2.8" y="4.5" width="18.4" height="15" rx="4.2" fill="#fff"/><path d="M10 8.9v6.2c0 .5.5.8.9.5l4.7-3.1c.4-.3.4-.8 0-1.1l-4.7-3.1c-.4-.2-.9 0-.9.6z" fill="var(--c)"/>',
  search: '<circle cx="10.4" cy="10.4" r="6.1" fill="none" stroke="#fff" stroke-width="3.1"/><path d="m15.2 15.2 4.9 4.9" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>',
  bolt:   '<path d="M13.9 2.3 4.8 13.2c-.4.5 0 1.2.6 1.2h5.4l-1.4 7c-.1.7.8 1.1 1.2.5l9-10.9c.4-.5 0-1.2-.6-1.2h-5.4l1.5-7c.1-.7-.8-1.1-1.2-.5z" fill="#fff"/>'
};

/* Où faire chaque quête (et avec quels mots) */
const VQ_META = {
  resist:  { icon: 'shield', color: '#4c9a2a', cta: "S'entraîner",   act: () => go('s-amazon') },
  checkin: { icon: 'heart',  color: '#e5457d', cta: 'Faire le point', act: () => go('s-amazon') },
  journal: { icon: 'pencil', color: '#1b8de0', cta: 'Écrire',         act: () => { if (typeof openJournal === 'function') openJournal(); } },
  capsule: { icon: 'play',   color: '#8a56e8', cta: 'Revoir',         act: () => go('s-param-video') },
  analyse: { icon: 'search', color: '#5a3ff0', cta: 'Analyser',       act: () => go('s-article') },
  xp:      { icon: 'bolt',   color: '#f5a300', cta: "S'entraîner",   act: () => go('s-amazon') }
};
const VQ_TIERS = ['bois', 'argent', 'or'];

/* ── Temps restant, en français ── */
function _vqLeft(ms){
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  if (h >= 1) return h + ' h ' + String(m).padStart(2, '0') + ' min';
  if (m >= 1) return m + ' min ' + String(sec).padStart(2, '0') + ' s';
  return sec + ' s';
}

/* ── Barre de progression épaisse « x / y » ── */
function _vqBar(p, target, label, from){
  const pct = target ? Math.max(0, Math.min(100, p / target * 100)) : 0;
  const start = from == null ? pct : from;
  const txt = p + ' / ' + target;
  return '<div class="vq-bar' + (pct >= 100 ? ' is-full' : '') + '" role="progressbar" aria-valuemin="0" aria-valuemax="' + target + '" aria-valuenow="' + p + '" aria-label="' + escHTML(label) + '" aria-valuetext="' + p + ' sur ' + target + '" style="--p:' + start + '%" data-p="' + pct + '">'
    + '<span class="vq-bar-n" aria-hidden="true">' + txt + '</span>'
    + '<div class="vq-bar-on" aria-hidden="true"><span class="vq-bar-n">' + txt + '</span></div>'
    + '</div>';
}

let _vqPrev = {};        // progression affichée au dernier rendu (pour animer le remplissage)
let _vqTimer = null;
let _vqLastLeft = Infinity;

function renderQuetes(entering){
  const root = document.getElementById('vq-root');
  const screen = document.getElementById('s-quetes');
  if (!root || !screen || typeof dailyQuests !== 'function') return;
  const quests = dailyQuests();
  const s = typeof progress !== 'undefined' ? progress : {};
  const pal = _vqPalette();
  screen.style.setProperty('--vq-band', pal.band);
  screen.style.setProperty('--vq-ink', pal.ink);
  screen.style.setProperty('--vq-fill', pal.fill);
  screen.style.setProperty('--vq-on-fill', pal.onFill);

  const known = typeof themes !== 'undefined' && typeof currentTheme !== 'undefined' && !!themes[currentTheme];
  const th = known ? themes[currentTheme] : { name: 'Foxy' };
  const key = known ? currentTheme : 'foxy';
  const done = quests.filter(q => q.done).length, total = quests.length || 3;
  const all = total > 0 && done === total;
  const bonus = (typeof GAME !== 'undefined' && GAME.gems && GAME.gems.allQuests) || 30;
  const perQuest = (typeof GAME !== 'undefined' && GAME.gems && GAME.gems.quest) || 15;
  const gems = typeof s.gems === 'number' ? s.gems : 0;
  const prev = entering ? {} : _vqPrev;
  const next = {};

  const rows = quests.map((q, i) => {
    const m = VQ_META[q.type] || VQ_META.xp;
    const pct = q.target ? Math.min(100, q.progress / q.target * 100) : 0;
    next[q.id] = pct;
    const tier = VQ_TIERS[i % VQ_TIERS.length];
    const foot = q.done
      ? '<div class="vq-q-done"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="m3.5 8.4 2.9 2.9 6-6.4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>Fait · +' + q.xp + ' XP</div>'
      : '<button type="button" class="vq-cta" data-vq="' + escHTML(q.id) + '" aria-label="' + escHTML(m.cta + ' : ' + q.label) + '">' + escHTML(m.cta) + '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3.5 4.5 4.5L6 12.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button>';
    return '<li class="vq-q' + (q.done ? ' is-done' : '') + '" data-vq-row="' + escHTML(q.id) + '">'
      + '<div class="vq-ic" style="--c:' + m.color + '"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + VQ_ICONS[m.icon] + '</svg>'
      + (q.done ? '<span class="vq-ic-ok" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="m3.8 8.3 2.7 2.7 5.7-6" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' : '')
      + '</div>'
      + '<div class="vq-q-main"><h3 class="vq-q-t">' + escHTML(q.label) + '</h3>'
      + _vqBar(q.progress, q.target, q.label, prev[q.id] != null ? prev[q.id] : 0)
      + '<div class="vq-q-foot">' + foot + '</div></div>'
      + '<div class="vq-q-chest">' + _vqChest(tier, q.done, 'vq-chest') + '</div>'
      + '</li>';
  }).join('');
  next._all = total ? done / total * 100 : 0;

  const say = all ? 'Journée bouclée, bravo ! De nouvelles quêtes arrivent à minuit.'
    : 'Pas de pression : chaque pas compte, et de nouvelles quêtes arrivent chaque jour à minuit.';

  root.innerHTML =
    '<header class="vq-head">'
    + '<span class="vq-px" style="left:62%;top:30px;width:14px;height:14px"></span><span class="vq-px" style="left:86%;top:22px;width:9px;height:9px"></span><span class="vq-px" style="left:54%;top:118px;width:10px;height:10px"></span><span class="vq-px vq-px--soft" style="left:94%;top:150px;width:12px;height:12px"></span><span class="vq-px vq-px--soft" style="left:47%;top:66px;width:7px;height:7px"></span>'
    + '<div class="vq-top"><button type="button" class="vq-back" onclick="go(\'s-home\')" aria-label="Retour à l\'accueil"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5.5 8.5 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></button>'
    + '<div class="vq-gems" aria-label="' + gems + ' graines"><span aria-hidden="true">🌱</span><b>' + gems + '</b></div></div>'
    + '<h1 class="vq-h1">Quêtes du jour</h1>'
    + '<div class="vq-left"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8.6" r="5.9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M8 5.6v3.2l2 1.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.3 1.6h3.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><span>Nouvelles dans <span id="vq-left-t">' + _vqLeft(questsResetIn()) + '</span></span></div>'
    + '<span class="vq-halo" aria-hidden="true"></span><img class="vq-comp" src="assets/comp-' + key + '.png" alt="' + escHTML(th.name) + ', ton compagnon">'
    + '</header>'
    + '<section class="vq-bonus' + (all ? ' is-open' : '') + '" aria-label="Coffre bonus">'
    + '<div class="vq-bonus-main"><div class="vq-kicker">Coffre bonus</div>'
    + '<h2 class="vq-bonus-t">' + (all ? 'Coffre ouvert, bravo !' : 'Termine les ' + total + ' quêtes') + '</h2>'
    + _vqBar(done, total, 'Quêtes terminées aujourd\'hui', prev._all != null ? prev._all : 0)
    + '</div>'
    + '<div class="vq-bonus-chest">' + _vqChest('or', all, 'vq-chest vq-chest--big') + '<span class="vq-q-gain">+' + bonus + ' 🌱</span></div>'
    + '</section>'
    + '<div class="vq-sec"><h2>Aujourd\'hui</h2><span>+' + perQuest + ' <i aria-hidden="true">🌱</i> par quête</span></div>'
    + '<ol class="vq-list">' + rows + '</ol>'
    + '<p class="vq-note">' + escHTML(say) + '</p>';

  _vqPrev = next;
  // Remplissage animé : on part de l'ancienne valeur, puis on va à la nouvelle
  requestAnimationFrame(() => requestAnimationFrame(() => {
    root.querySelectorAll('.vq-bar').forEach(b => b.style.setProperty('--p', b.dataset.p + '%'));
  }));
  _vqStartTimer();
}

/* ── Compte à rebours en direct (seulement quand l'écran est affiché) ── */
function _vqStartTimer(){
  _vqLastLeft = questsResetIn();
  if (_vqTimer) return;
  _vqTimer = setInterval(() => {
    const scr = document.getElementById('s-quetes');
    if (!scr || !scr.classList.contains('active')) { clearInterval(_vqTimer); _vqTimer = null; return; }
    const left = questsResetIn();
    if (left > _vqLastLeft + 1000) { _vqLastLeft = left; renderQuetes(true); return; }   // minuit passé : nouvelles quêtes
    _vqLastLeft = left;
    const el = document.getElementById('vq-left-t');
    if (el) el.textContent = _vqLeft(left);
  }, 1000);
}

/* ── Actions (délégation : un seul écouteur) ── */
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('#s-quetes .vq-cta');
  if (!b) return;
  const q = (typeof dailyQuests === 'function' ? dailyQuests() : []).find(x => x.id === b.dataset.vq);
  const m = q && (VQ_META[q.type] || VQ_META.xp);
  if (m) m.act();
});

/* ── Réagit aux gains en direct (quête finie, coffre, graines) ── */
window.addEventListener('vision:game', e => {
  const t = e.detail && e.detail.type;
  const scr = document.getElementById('s-quetes');
  if (!scr || !scr.classList.contains('active')) return;
  if (t === 'quest-done' || t === 'quests-all-done' || t === 'gems' || t === 'xp') {
    renderQuetes();
    const id = t === 'quest-done' && e.detail.quest ? e.detail.quest.id : null;
    const el = id ? scr.querySelector('[data-vq-row="' + id + '"]') : (t === 'quests-all-done' ? scr.querySelector('.vq-bonus') : null);
    if (el) { el.classList.remove('vq-pop'); void el.offsetWidth; el.classList.add('vq-pop'); }
  }
});

/* ── Entrée sur l'écran : on enveloppe go() sans toucher core.js (et sans casser les autres enveloppes) ── */
(function(){
  if (typeof go !== 'function') return;
  const prevGo = go;
  go = function(id){
    const r = prevGo.apply(this, arguments);
    if (id === 's-quetes') { try { renderQuetes(true); } catch(err) { console.error(err); } }
    return r;
  };
})();

/* Premier rendu (écran caché) : le contenu existe dès le chargement */
try { renderQuetes(true); } catch(err) {}
