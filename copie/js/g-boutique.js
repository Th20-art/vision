/* ════════════════════════════════════════════════════════════
   BOUTIQUE — morceau gantelet « boutique »
   · Écran #s-boutique : solde de graines 🌱, Bouclier de série,
     feuille de confirmation + animation, « Gagner des graines ».
   · Rien ne s'achète avec de l'argent réel : les graines se gagnent
     en résistant, en réussissant des quêtes, en franchissant des paliers.
   · API commune : js/game.js (GAME, gameSnapshot, buyFreeze, 'vision:game')
   · Entrée : go('s-boutique') (go est enveloppé plus bas, sans toucher core.js)
════════════════════════════════════════════════════════════ */

/* ── Pixel art (même esprit que les compagnons) : une lettre = une couleur ── */
const BQ_PIX = {
  seed: { rows: [
    '...........',
    '........DD.',
    '.DD....DLLD',
    'DLLD..DLLGD',
    'DLGGD.DLGGD',
    '.DGGGDDGGD.',
    '..DDGSGDD..',
    '....DSD....',
    '....DSD....',
    '..BBBBBBB..',
    '...BBBBB...'],
    pal: { D: '#2f7d1f', L: '#9be15d', G: '#58cc02', S: '#3f9e1a', B: '#a0622d' } },
  shield: { rows: [
    '...oooooooooo...',
    '.oohhhhhhhhhhoo.',
    'ohhllllllllllbbo',
    'ohllllllylllbbbo',
    'ohlllllyylllbbbo',
    'ohllllyyyyllbbbo',
    'ohlllyyffyylbbbo',
    'ohlllyffffylbbbo',
    'ohlllyffwfylbbbo',
    'ohllllyffyllbbbo',
    '.ohllllyyllbbbo.',
    '.ohlllllllllbbo.',
    '..ohllllllbbbo..',
    '..ohlllllbbbbo..',
    '...ohlllbbbbo...',
    '....ohllbbbo....',
    '.....obbbbo.....',
    '......oooo......'],
    pal: { o: '#0a4a78', h: '#c9f0ff', l: '#5cc8f5', b: '#2a9fd8', y: '#ff9600', f: '#ffd23f', w: '#ffffff' } },
  check: { rows: [
    '.oooooooooo.',
    'oggggggggggo',
    'oggggggggwgo',
    'ogggggggwwgo',
    'oggggggwwwgo',
    'ogwgggwwwggo',
    'ogwwgwwwgggo',
    'ogwwwwwggggo',
    'oggwwwgggggo',
    'ogggwggggggo',
    'oddddddddddo',
    '.oooooooooo.'],
    pal: { o: '#1f6f0a', g: '#58cc02', w: '#ffffff', d: '#46a302' } },
  chest: { rows: [
    '..oooooooooooo..',
    '.oWWWWWWWWWWWWo.',
    'oWwwwgwwwwgwwwwo',
    'owwwwgwwwwgwwwwo',
    'oooooooooooooooo',
    'oggggggkkggggggo',
    'owwwwgkyykgwwwwo',
    'owwwwgkyykgwwwwo',
    'owwwwggkkggwwwwo',
    'owwwwgwwwwgwwwwo',
    'oddddgddddgddddo',
    'oooooooooooooooo'],
    pal: { o: '#5b3413', W: '#f0b060', w: '#d98a3a', g: '#ffc800', k: '#5b3413', y: '#fff2a8', d: '#b36a24' } },
  flag: { rows: [
    'oo..........',
    'orRRRRR.....',
    'orRRRRRRRR..',
    'orRRRRRRRRR.',
    'orRRRRrRRRR.',
    'orRRRRRRRR..',
    'orRRRRR.....',
    'or..........',
    'or..........',
    'or..........',
    'or..........',
    'oooo........'],
    pal: { o: '#5a5a5a', r: '#9a9a9a', R: '#ff4b4b' } },
  lock: { rows: [
    '...oooo...',
    '..o....o..',
    '.o......o.',
    '.o......o.',
    'oooooooooo',
    'oyyyyyyyyo',
    'oyyyooyyyo',
    'oyyyooyyyo',
    'oyyyyoyyyo',
    'oddddddddo',
    'oooooooooo'],
    pal: { o: '#6b6475', y: '#ffc800', d: '#e0a800' } },
  spark: { rows: [
    '..y..',
    '..y..',
    'yywyy',
    '..y..',
    '..y..'],
    pal: { y: '#ffc800', w: '#fff7cc' } }
};
/* Silhouette grise du bouclier : emplacement libre dans la réserve */
BQ_PIX.shieldEmpty = { rows: BQ_PIX.shield.rows,
  pal: { o: '#d4d4d4', h: '#ededed', l: '#ededed', b: '#e3e3e3', y: '#e3e3e3', f: '#e3e3e3', w: '#e3e3e3' } };

const _bqPixCache = {};
function _bqPix(name, cls){
  const key = name + '|' + (cls || '');
  if (_bqPixCache[key]) return _bqPixCache[key];
  const art = BQ_PIX[name]; if (!art) return '';
  const h = art.rows.length, w = art.rows[0].length;
  let rects = '';
  art.rows.forEach((row, y) => {
    let x = 0;
    while (x < w) {
      const c = row[x];
      if (!art.pal[c]) { x++; continue; }
      let n = 1; while (x + n < w && row[x + n] === c) n++;
      rects += '<rect x="' + x + '" y="' + y + '" width="' + n + '" height="1" fill="' + art.pal[c] + '"/>';
      x += n;
    }
  });
  return (_bqPixCache[key] = '<svg class="bq-pix ' + (cls || '') + '" viewBox="0 0 ' + w + ' ' + h +
    '" width="' + w + '" height="' + h + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + rects + '</svg>');
}

/* ── Couleurs du thème compagnon, rendues lisibles (AA) ── */
function _bqRgb(c){
  c = String(c || '').trim();
  let m = /^#([0-9a-f]{3})$/i.exec(c);
  if (m) c = '#' + m[1].split('').map(x => x + x).join('');
  m = /^#([0-9a-f]{6})$/i.exec(c);
  if (m) return [0, 2, 4].map(i => parseInt(m[1].substr(i, 2), 16));
  m = c.match(/[\d.]+/g);
  return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null;
}
function _bqLum(rgb){
  const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(rgb[0]) + 0.7152 * f(rgb[1]) + 0.0722 * f(rgb[2]);
}
function _bqRatio(a, b){ const A = _bqLum(a), B = _bqLum(b); return (Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05); }
function _bqMix(a, b, t){ return a.map((v, i) => Math.round(v * (1 - t) + b[i] * t)); }
function _bqHex(rgb){ return '#' + rgb.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join(''); }
/* Assombrit une couleur jusqu'à obtenir le contraste voulu sur un fond */
function _bqReadable(rgb, bg, target){
  let t = 0, c = rgb;
  while (_bqRatio(c, bg) < target && t < 0.9) { t += 0.02; c = _bqMix(rgb, [0, 0, 0], t); }
  return c;
}
function _bqApplyTheme(root){
  const cs = getComputedStyle(document.documentElement);
  const og = _bqRgb(cs.getPropertyValue('--og')) || [255, 126, 0];
  const og2 = _bqRgb(cs.getPropertyValue('--og2')) || [232, 86, 58];
  const white = [255, 255, 255];
  /* Bouton : dégradé de marque, assombri juste assez pour du texte blanc gras ≥ 18,66 px (AA grand texte, 3:1) */
  const ctaA = _bqReadable(og, white, 3.1), ctaB = _bqReadable(og2, white, 3.1);
  const cta = _bqReadable(_bqMix(og, og2, 0.5), white, 4.6);
  const tint = _bqMix(white, og, 0.1);
  root.style.setProperty('--bq-cta', _bqHex(cta));
  root.style.setProperty('--bq-cta-a', _bqHex(ctaA));
  root.style.setProperty('--bq-cta-b', _bqHex(ctaB));
  root.style.setProperty('--bq-lip', _bqHex(_bqMix(_bqMix(ctaA, ctaB, 0.5), [0, 0, 0], 0.3)));
  root.style.setProperty('--bq-tint', _bqHex(tint));
  root.style.setProperty('--bq-ring', _bqHex(_bqMix(white, og, 0.35)));
  root.style.setProperty('--bq-ink', _bqHex(_bqReadable(og2, tint, 4.6)));
}

/* ── Utilitaires ── */
function _bqNum(n){ return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f'); }   // 1 250 : espace fine insécable
function _bqPlural(n, one, many){ return n + '\u00a0' + (n > 1 ? many : one); }
function _bqCompImg(variant){
  const key = (typeof currentTheme !== 'undefined' && typeof themes !== 'undefined' && themes[currentTheme]) ? currentTheme : 'foxy';
  if (variant === 'happy' && typeof COMP_BLINK_SPRITES !== 'undefined' && COMP_BLINK_SPRITES[key] && COMP_BLINK_SPRITES[key].close) return COMP_BLINK_SPRITES[key].close;
  return (typeof themes !== 'undefined' && themes[key]) ? themes[key].img : 'assets/comp-foxy.png';
}
function _bqCompName(){
  return (typeof themes !== 'undefined' && typeof currentTheme !== 'undefined' && themes[currentTheme]) ? themes[currentTheme].name : 'ton compagnon';
}
function _bqState(){
  const snap = (typeof gameSnapshot === 'function') ? gameSnapshot() : null;
  const gems = snap ? snap.gems : 0, owned = snap ? snap.freezes : 0;
  const price = GAME.freeze.price, max = GAME.freeze.max;
  return { gems, owned, price, max, missing: Math.max(0, price - gems),
    status: owned >= max ? 'max' : (gems >= price ? 'ok' : 'short') };
}
function _bqSlots(owned, max){
  let s = '';
  for (let i = 0; i < max; i++) s += '<span class="bq-slot' + (i < owned ? ' on' : '') + '">' + _bqPix(i < owned ? 'shield' : 'shieldEmpty') + '</span>';
  return s;
}

/* ── Solde (compteur en haut à droite) ── */
let _bqAnimating = false;
function _bqSetBalance(n){
  const el = document.getElementById('bq-balance');
  const sr = document.getElementById('bq-balance-sr');
  if (el) el.textContent = _bqNum(n);
  if (sr) sr.textContent = n > 1 ? 'graines' : 'graine';
  const w = document.getElementById('bq-wallet');
  if (w) w.setAttribute('aria-label', 'Solde : ' + _bqPlural(n, 'graine', 'graines'));
}
function _bqCountTo(from, to, ms){
  const el = document.getElementById('bq-balance'); if (!el) return;
  _bqAnimating = true;
  const wallet = document.getElementById('bq-wallet');
  if (wallet) {
    wallet.setAttribute('aria-busy', 'true');   // pas d'annonce des valeurs intermédiaires
    wallet.classList.remove('bq-bump'); void wallet.offsetWidth; wallet.classList.add('bq-bump');
    const fly = document.createElement('span');
    fly.className = 'bq-fly'; fly.setAttribute('aria-hidden', 'true');
    fly.textContent = (to < from ? '−' : '+') + _bqNum(Math.abs(to - from));
    wallet.appendChild(fly);
    setTimeout(() => fly.remove(), 1100);
  }
  const t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / ms), e = 1 - Math.pow(1 - k, 3);
    el.textContent = _bqNum(Math.round(from + (to - from) * e));
    if (k < 1) requestAnimationFrame(step);
    else { _bqAnimating = false; _bqSetBalance(to); if (wallet) wallet.removeAttribute('aria-busy'); }
  };
  requestAnimationFrame(step);
}

/* ── Rendu principal ── */
function renderBoutique(){
  const root = document.getElementById('s-boutique');
  const scroll = document.getElementById('bq-scroll');
  if (!root || !scroll || typeof GAME === 'undefined') return;
  _bqApplyTheme(root);
  const st = _bqState();
  if (!_bqAnimating) _bqSetBalance(st.gems);
  document.querySelectorAll('#bq-wallet [data-pix]').forEach(n => { if (!n.firstChild) n.innerHTML = _bqPix(n.dataset.pix); });

  const g = GAME.gems;
  const seed = _bqPix('seed', 'bq-seed');

  /* Bloc d'action selon l'état */
  let action = '';
  if (st.status === 'ok') {
    action = '<button class="bq-btn" type="button" id="bq-buy" onclick="openBoutiqueSheet()">Obtenir un bouclier</button>';
  } else if (st.status === 'short') {
    const pct = Math.max(4, Math.round(st.gems / st.price * 100));
    const nRes = Math.ceil(st.missing / g.resist), nQ = Math.ceil(st.missing / g.quest);
    action =
      '<div class="bq-need">' +
        '<div class="bq-bar" role="progressbar" aria-label="Graines réunies pour le prochain bouclier" aria-valuemin="0" aria-valuemax="' + st.price + '" aria-valuenow="' + st.gems + '">' +
          '<span class="bq-bar-fill" style="width:' + pct + '%"></span>' +
          '<span class="bq-bar-txt">' + _bqNum(st.gems) + ' / ' + _bqNum(st.price) + '</span>' +
        '</div>' +
        '<p class="bq-need-txt">Résiste à <b>' + _bqPlural(nRes, 'tentation', 'tentations') + '</b> ou réussis <b>' +
          _bqPlural(nQ, 'quête', 'quêtes') + '</b>, et&nbsp;il&nbsp;est&nbsp;à&nbsp;toi.</p>' +
      '</div>' +
      '<button class="bq-btn" type="button" disabled>Encore ' + _bqNum(st.missing) + ' graine' + (st.missing > 1 ? 's' : '') + '</button>';
  } else {
    action =
      '<div class="bq-full" id="bq-full" tabindex="-1">' + _bqPix('check', 'bq-full-ic') +
        '<p><b>Réserve pleine.</b> Tes ' + st.max + ' boucliers veillent&nbsp;: ils s’activent tout seuls si tu craques.</p>' +
      '</div>';
  }

  const steps = (typeof MILESTONE_STEPS !== 'undefined' && MILESTONE_STEPS.length) ? MILESTONE_STEPS : [25, 50, 75, 100];
  const stepsTxt = 'À ' + steps.slice(0, -1).join(', ') + ' et ' + steps[steps.length - 1] + '\u00a0%';
  /* Quêtes du jour : où en est-on (sans pression) */
  let qList = [];
  try { qList = (typeof dailyQuests === 'function') ? dailyQuests() : []; } catch(e){}
  const qTotal = qList.length || GAME.quests.perDay, qDone = qList.filter(q => q.done).length;
  const qLeft = qTotal - qDone;
  const qSub = !qList.length ? qTotal + ' nouvelles chaque matin'
    : qDone === 0 ? qTotal + ' t’attendent aujourd’hui'
    : qLeft > 0 ? 'Encore ' + qLeft + ' aujourd’hui'
    : 'Toutes réussies aujourd’hui';
  const bonusDone = !!(typeof progress !== 'undefined' && progress.quests && progress.quests.bonus && qList.length);
  const earn = [
    { ic: '<img src="assets/heart.png" alt="" class="bq-earn-heart">', t: 'Résister à une tentation', s: 'Chaque achat impulsif évité', n: g.resist },
    { ic: _bqPix('check', 'bq-earn-px'), t: 'Réussir une quête', s: qSub, n: g.quest },
    { ic: _bqPix('chest', 'bq-earn-px bq-earn-chest'), t: 'Toutes les quêtes', s: bonusDone ? 'Bonus gagné aujourd’hui, bravo' : 'Le bonus de la journée', n: g.allQuests },
    { ic: _bqPix('flag', 'bq-earn-px'), t: 'Palier d’objectif', s: stepsTxt, n: g.milestone }
  ];

  scroll.innerHTML =
    '<h2 class="bq-h2">Protège ta série</h2>' +
    '<section class="bq-card bq-item" data-state="' + st.status + '" aria-labelledby="bq-item-name">' +
      '<div class="bq-item-top">' +
        '<div class="bq-illu" aria-hidden="true">' +
          '<img class="bq-illu-comp" src="' + _bqCompImg() + '" alt="">' +
          _bqPix('shield', 'bq-illu-shield') +
        '</div>' +
        '<div class="bq-item-txt">' +
          '<h3 class="bq-item-name" id="bq-item-name">Bouclier de série</h3>' +
          '<p class="bq-item-desc">Si tu craques, il absorbe l’achat impulsif&nbsp;: ta série continue.</p>' +
          '<span class="bq-price"><span class="bq-sr">Prix : </span>' + seed + _bqNum(st.price) + '<span class="bq-sr"> graines</span></span>' +
        '</div>' +
      '</div>' +
      '<div class="bq-stock">' +
        '<span class="bq-label">En réserve</span>' +
        '<span class="bq-slots" aria-hidden="true">' + _bqSlots(st.owned, st.max) + '</span>' +
        '<span class="bq-stock-n">' + st.owned + '<span class="bq-stock-max">&nbsp;/&nbsp;' + st.max + '</span><span class="bq-sr"> boucliers</span></span>' +
      '</div>' +
      action +
    '</section>' +

    '<h2 class="bq-h2">Gagne des graines</h2>' +
    '<p class="bq-ethic">' + _bqPix('lock', 'bq-ethic-ic') +
      '<span><b>Rien ici ne coûte d’argent réel.</b> Les graines se gagnent, un «&nbsp;non&nbsp;merci&nbsp;» après l’autre.</span></p>' +
    '<ul class="bq-card bq-earn" aria-label="Comment gagner des graines">' +
      earn.map(r =>
        '<li class="bq-earn-row">' +
          '<span class="bq-earn-ic" aria-hidden="true">' + r.ic + '</span>' +
          '<span class="bq-earn-txt"><b>' + r.t + '</b><span>' + r.s + '</span></span>' +
          '<span class="bq-gain">+' + r.n + seed + '<span class="bq-sr"> graines</span></span>' +
        '</li>').join('') +
    '</ul>';
}

/* ── Feuille de confirmation + animation d'achat ── */
let _bqLastFocus = null, _bqCloseTimer = 0;
function _bqKey(e){
  if (e.key === 'Escape') { closeBoutiqueSheet(); return; }
  if (e.key !== 'Tab') return;
  const sheet = document.querySelector('#bq-sheet .bq-sheet');
  const f = sheet ? [...sheet.querySelectorAll('button:not([disabled])')] : [];
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
function openBoutiqueSheet(){
  const wrap = document.getElementById('bq-sheet'), body = document.getElementById('bq-sheet-body');
  if (!wrap || !body) return;
  const st = _bqState();
  if (st.status !== 'ok') { renderBoutique(); return; }
  clearTimeout(_bqCloseTimer);
  _bqLastFocus = document.activeElement;
  const after = st.gems - st.price;
  const arrow = '<span class="bq-arrow" aria-hidden="true">→</span><span class="bq-sr"> devient </span>';
  body.innerHTML =
    '<div class="bq-sh-wallet" aria-hidden="true">' + _bqPix('seed', 'bq-seed') + _bqNum(st.gems) + '</div>' +
    '<div class="bq-sh-illu" aria-hidden="true">' + _bqPix('shield', 'bq-sh-shield') + '</div>' +
    '<h2 class="bq-sh-title" id="bq-sheet-title">Échanger ' + _bqNum(st.price) + ' graines contre un bouclier&nbsp;?</h2>' +
    '<p class="bq-sh-sub">Il reste en réserve et protège ta série le jour où tu craques.</p>' +
    '<div class="bq-sh-sum">' +
      '<div class="bq-sh-row"><span>Tes graines</span><span class="bq-sh-val">' + _bqNum(st.gems) + arrow + '<b>' + _bqNum(after) + '</b></span></div>' +
      '<div class="bq-sh-row"><span>Boucliers en réserve</span><span class="bq-sh-val">' + st.owned + arrow + '<b>' + (st.owned + 1) + '</b></span></div>' +
    '</div>' +
    '<button class="bq-btn" type="button" id="bq-confirm" onclick="confirmBoutiqueBuy()">Confirmer l’échange</button>' +
    '<button class="bq-link" type="button" onclick="closeBoutiqueSheet()">Pas maintenant</button>';
  wrap.hidden = false;
  wrap.classList.remove('bq-open', 'bq-won', 'bq-closing'); void wrap.offsetWidth; wrap.classList.add('bq-open');
  document.addEventListener('keydown', _bqKey);
  setTimeout(() => { const b = document.getElementById('bq-confirm'); if (b) b.focus({ preventScroll: true }); }, 60);
}
function closeBoutiqueSheet(instant){
  const wrap = document.getElementById('bq-sheet');
  if (!wrap || wrap.hidden) return;
  document.removeEventListener('keydown', _bqKey);
  const done = () => { wrap.hidden = true; wrap.classList.remove('bq-closing', 'bq-won'); };
  wrap.classList.remove('bq-open');
  clearTimeout(_bqCloseTimer);
  if (instant) done();
  else { wrap.classList.add('bq-closing'); _bqCloseTimer = setTimeout(done, 240); }
  renderBoutique();
  const back = (_bqLastFocus && document.contains(_bqLastFocus)) ? _bqLastFocus : (document.getElementById('bq-buy') || document.getElementById('bq-full'));
  if (back && !instant) try { back.focus({ preventScroll: true }); } catch(e){}
  _bqLastFocus = null;
}
function confirmBoutiqueBuy(){
  const before = _bqState();
  _bqAnimating = true;   // le solde défile au lieu de sauter (buyFreeze émet 'vision:game')
  const res = (typeof buyFreeze === 'function') ? buyFreeze() : { ok: false, why: 'etat' };
  const body = document.getElementById('bq-sheet-body');
  if (!res.ok || !body) { _bqAnimating = false; closeBoutiqueSheet(); return; }
  const st = _bqState();
  _bqCountTo(before.gems, st.gems, 750);
  const sparks = [0, 1, 2, 3, 4, 5].map(i => '<span class="bq-spark bq-spark' + i + '">' + _bqPix('spark') + '</span>').join('');
  body.innerHTML =
    '<div class="bq-win">' +
      '<div class="bq-win-illu" aria-hidden="true">' +
        '<span class="bq-rays"></span>' + sparks +
        '<img class="bq-win-comp" src="' + _bqCompImg('happy') + '" alt="">' +
        _bqPix('shield', 'bq-win-shield') +
      '</div>' +
      '<h2 class="bq-win-title" id="bq-sheet-title">Bouclier prêt&nbsp;!</h2>' +
      '<p class="bq-win-txt">' + _bqCompName() + ' le garde au chaud. Si tu craques un jour, ta série continue. Aucune pression.</p>' +
      '<div class="bq-win-stock"><span class="bq-label">En réserve</span><span class="bq-slots">' + _bqSlots(st.owned, st.max) + '</span><span class="bq-stock-n">' + st.owned + '<span class="bq-stock-max">&nbsp;/&nbsp;' + st.max + '</span></span></div>' +
      '<button class="bq-btn" type="button" id="bq-win-ok" onclick="closeBoutiqueSheet()">Continuer</button>' +
    '</div>';
  document.getElementById('bq-sheet').classList.add('bq-won');
  setTimeout(() => { const b = document.getElementById('bq-win-ok'); if (b) b.focus({ preventScroll: true }); }, 60);
}

/* ── Branchements : entrée d'écran (go enveloppé), événements du jeu ── */
(function initBoutique(){
  if (typeof go === 'function') {
    const _go = go;
    go = function(id){
      const r = _go.apply(this, arguments);
      if (id === 's-boutique') {
        renderBoutique();
        const sc = document.getElementById('bq-scroll'); if (sc) sc.scrollTop = 0;
      } else closeBoutiqueSheet(true);
      return r;
    };
  }
  window.addEventListener('vision:game', () => {
    const s = document.getElementById('s-boutique');
    if (s && s.classList.contains('active')) renderBoutique();
  });
  const sc = document.getElementById('bq-scroll');
  if (sc) sc.addEventListener('scroll', () => {
    const nav = document.querySelector('#s-boutique .bq-nav');
    if (nav) nav.classList.toggle('bq-scrolled', sc.scrollTop > 4);
  }, { passive: true });
  const dim = document.getElementById('bq-dim');
  if (dim) dim.addEventListener('click', () => closeBoutiqueSheet());
  try { renderBoutique(); } catch(e){}
})();
