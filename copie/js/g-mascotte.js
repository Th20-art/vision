/* ════════════════════════════════════════════════════════════
   Morceau gantelet « mascotte » — le compagnon en plein écran
   · showMascot(kind, detail) : ouvre un calque expressif, un seul à la fois
       kind = 'freeze-used'   → série protégée par un bouclier (fier, soulagé)
              'streak-broken' → nouvelle série après un achat (doux, tourné vers l'avant)
              'league-change' → montée (fête) ou descente (encouragement) de ligue
              ('league-up' / 'league-down' acceptés aussi)
   · Écoute 'vision:game' : freeze-used, streak-broken, league-change
     (xp, gems, quest-done appartiennent au morceau « célébration »)
   · File d'attente : jamais deux calques ; attend qu'une célébration,
     la capsule ou l'onboarding soient terminés.
   · Le compagnon est un sprite pixel : l'émotion vient du mouvement
     (saut, écrasement-étirement, flottement), des yeux (sprites
     variantes) et d'effets dessinés au même pas de pixel.
════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Pixel art : bitmap texte → SVG net ── */
  function pxSVG(rows, pal, cell, cls){
    const h = rows.length, w = Math.max.apply(null, rows.map(r => r.length));
    let rects = '';
    rows.forEach((r, y) => {
      let x = 0;
      while (x < r.length) {
        const c = r[x];
        if (!pal[c]) { x++; continue; }
        let x2 = x; while (x2 < r.length && r[x2] === c) x2++;
        rects += '<rect x="' + x + '" y="' + y + '" width="' + (x2 - x) + '" height="1" fill="' + pal[c] + '"/>';
        x = x2;
      }
    });
    return '<svg class="' + (cls || '') + '" viewBox="0 0 ' + w + ' ' + h + '" width="' + (w * cell) + '" height="' + (h * cell) +
      '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + rects + '</svg>';
  }

  /* Grand bouclier (blason) généré sur une grille */
  function shieldRows(){
    const W = 22, H = 25, rows = [];
    const inside = (x, y) => {
      if (y < 0 || y >= H || x < 0 || x >= W) return false;
      const cx = (W - 1) / 2, dx = Math.abs(x - cx);
      let hw;
      if (y === 0) hw = 8.6; else if (y === 1) hw = 10; else if (y < 12) hw = 10.6;
      else { const t = (y - 11) / (H - 11); hw = 10.6 * Math.sqrt(Math.max(0, 1 - t * t)) - t * 1.2; }
      return dx <= hw;
    };
    for (let y = 0; y < H; y++) {
      let r = '';
      for (let x = 0; x < W; x++) {
        if (!inside(x, y)) { r += '.'; continue; }
        const edge = !inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1);
        const rim = !edge && (!inside(x - 2, y) || !inside(x + 2, y) || !inside(x, y - 2) || !inside(x, y + 2));
        if (edge) r += 'o';
        else if (rim) r += 'r';
        else r += (y > 16 ? 'g' : 'f');
      }
      rows.push(r);
    }
    return rows;
  }
  const SHIELD_PAL = { o: '#2DB2F5', r: '#C4ECFF', f: '#E6F7FF', g: '#D8F2FF', h: '#FFFFFF' };

  const ART = {
    sparkle: ['...a...', '...a...', '..aba..', 'aabbbaa', '..aba..', '...a...', '...a...'],
    cloud: [
      '......aaaa......',
      '...aa.aaaaaa....',
      '..aaaaaaaaaaaa..',
      '.aaaaaaaaaaaaaa.',
      'aaaaaaaaaaaaaaaa',
      'aaaaaaaaaaaaaaaa',
      '.bbbbbbbbbbbbbb.'
    ],
    sprout: [
      '.LL.......LL.',
      'LLLL.....LLLL',
      'LLLLD...DLLLL',
      '.LLLLD.DLLLL.',
      '..DLLLSLLLD..',
      '....DDSDD....',
      '......S......',
      '......S......',
      '......S......',
      '...MMMMMMM...',
      '.MMNNNNNNNMM.'
    ],
    sun: [
      '.....y.....',
      '.y...y...y.',
      '..y.....y..',
      '....ooo....',
      '...ooooo...',
      'yy.ooooo.yy',
      '...ooooo...',
      '....ooo....',
      '..y.....y..',
      '.y...y...y.',
      '.....y.....'
    ],
    sweat: ['...o...', '..oao..', '..oao..', '.oaaao.', '.oahao.', 'oaahaao', 'oaaaaao', '.oaaao.', '..ooo..'],
    flag: ['pcccc.', 'pccccc', 'pcccc.', 'pccc..', 'p.....', 'p.....', 'p.....', 'p.....'],
    flame: [
      '....o.....',
      '....oo....',
      '...ooo..o.',
      '..oooyo.oo',
      '..ooyyoooo',
      '.ooyyyyooo',
      '.ooyywyyoo',
      '.oywwwwyoo',
      '..oywwyoo.',
      '...oooooo.'
    ],
    shield: [
      '.oooooooo.',
      'offffffffo',
      'ohffffffbo',
      'ohffffffbo',
      'ohffffffbo',
      '.offffffo.',
      '.offfffbo.',
      '..offfbo..',
      '...offo...',
      '....oo....'
    ],
    trophy: [
      '.oooooooo.',
      'oyyyyyyyyo',
      'o.yywyyy.o',
      'o.yywyyy.o',
      '.oyyyyyyo.',
      '...oyyo...',
      '....yy....',
      '...oyyo...',
      '..oooooo..',
      '..oooooo..'
    ],
    seed: [
      '..LL..LL..',
      '.LLLLLLLL.',
      '..LLLLLL..',
      '....SS....',
      '....SS....',
      '....SS....',
      '..MMMMMM..',
      '.MMMMMMMM.',
      '..........',
      '..........'
    ],
    goal: ['.pccccc.', '.pcccccc', '.pccccc.', '.pcccc..', '.p......', '.p......', '.p......', 'ppp.....'],
    arrowUp: [
      '....oo....',
      '...oyyo...',
      '..oyyyyo..',
      '.oyyyyyyo.',
      'oooyyyyooo',
      '...oyyo...',
      '...oyyo...',
      '...oyyo...',
      '...oooo...',
      '..........'
    ]
  };
  const ICON_PAL = {
    flame:   { o: '#F2600C', y: '#FFB020', w: '#FFE7A0' },
    shield:  { o: '#0277BD', f: '#7FD1FA', h: '#FFFFFF', b: '#3BB0EE' },
    trophy:  { o: '#B77800', y: '#FFC800', w: '#FFF3B0' },
    seed:    { L: '#58CC02', S: '#3E9A0A', M: '#B98B5E' },
    arrowUp: { o: '#6D28D9', y: '#B99BFF' },
    goal:    { p: '#6B6680', c: '#7C3AED' }
  };
  const icon = (name, cell) => pxSVG(ART[name], ICON_PAL[name], cell || 2.4, 'gm-ic');

  /* ── Petites aides ── */
  const plural = (n, w) => n + ' ' + w + (n > 1 ? 's' : '');
  const ordinal = n => n === 1 ? '1er' : n + 'e';
  const esc = s => (typeof escHTML === 'function') ? escHTML(s) : String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tierName = i => (typeof LEAGUE_TIERS !== 'undefined' && LEAGUE_TIERS[i]) ? LEAGUE_TIERS[i] : 'Graine';
  function compKey(){ return (typeof currentTheme !== 'undefined' && typeof themes !== 'undefined' && themes[currentTheme]) ? currentTheme : 'foxy'; }
  function compName(){ const k = compKey(); return (typeof themes !== 'undefined' && themes[k]) ? themes[k].name : 'Ton compagnon'; }
  function sprites(){
    const k = compKey();
    return {
      normal:   'assets/comp-' + k + '.png',
      close:    'assets/comp-' + k + '-close-eyes.png',
      up:       'assets/comp-' + k + '-upright-eyes.png',
      downleft: 'assets/comp-' + k + '-downleft-eyes.png',
      downright:'assets/comp-' + k + '-downright-eyes.png'
    };
  }
  const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  function card(color, label, iconName, value){
    return '<div class="gm-card" style="--c:' + color + '">' +
      '<div class="gm-card-h">' + label + '</div>' +
      '<div class="gm-card-b">' + icon(iconName) + '<span>' + value + '</span></div></div>';
  }
  function sparkles(list, pal){
    return list.map((s, i) => '<span class="gm-spark" style="left:' + s[0] + '%;top:' + s[1] + 'px;--d:' + (i * 0.23).toFixed(2) + 's;--s:' + (s[2] || 1) + '">' +
      pxSVG(ART.sparkle, pal, 3) + '</span>').join('');
  }
  function bits(list, cls){
    return list.map((b, i) => '<i class="' + cls + '" style="left:' + b[0] + '%;top:' + b[1] + 'px;--c:' + b[2] + ';--d:' + (b[3] != null ? b[3] : i * 0.17).toFixed(2) + 's;--r:' + (b[4] || 0) + 'deg"></i>').join('');
  }

  /* ── Les humeurs : chacune décrit sa scène, son texte, son bouton et le jeu des yeux ── */
  const MOODS = {
    /* Série protégée : fier et soulagé, blason lumineux */
    'freeze-used': function(d){
      const snap = (typeof gameSnapshot === 'function') ? gameSnapshot() : null;
      const streak = Math.max(0, d.streak != null ? d.streak : (snap ? snap.streak : 0));
      const left = Math.max(0, d.freezes != null ? d.freezes : (snap ? snap.freezes : 0));
      return {
        cls: 'gm-m-shield',
        label: 'Série protégée',
        fx: '<div class="gm-glow"></div><div class="gm-ripple"></div><div class="gm-ripple gm-ripple2"></div>' +
            '<div class="gm-shieldbig">' + pxSVG(shieldRows(), SHIELD_PAL, 12) + '</div>' +
            bits([[6, 40, '#BDE9FF'], [88, 26, '#D6F1FF'], [14, 214, '#CDEEFF'], [84, 190, '#BDE9FF'], [26, 6, '#E0F5FF'], [70, 262, '#D6F1FF']], 'gm-bit') +
            sparkles([[10, 96, 1.1], [83, 74, 1.3], [74, 236, 0.9], [18, 250, 0.8], [50, -6, 0.9]], { a: '#1CB0F6', b: '#9BE0FF' }),
        heroPos: 'shield',
        sticker: true,
        heroExtra: '<span class="gm-sweat">' + pxSVG(ART.sweat, { o: '#1D8FD8', a: '#9ADCFB', h: '#FFFFFF' }, 3) + '</span>',
        title: 'Ouf, série protégée !',
        sub: 'Ton bouclier a absorbé cet achat. ' + (streak > 0 ? 'Tes ' + plural(streak, 'jour') + ' sans craquage continuent.' : 'Ta série continue.'),
        cards: card('#C2410C', 'Série intacte', 'flame', plural(streak, 'jour')) +
               card('#0277BD', 'Boucliers', 'shield', left + ' restant' + (left > 1 ? 's' : '')),
        cta: 'Continuer ma série',
        eyes: [['up', 0], ['close', 1900], ['up', 2040], ['normal', 3600], ['close', 5200], ['normal', 5340], ['up', 6400]],
        loopEyesFrom: 3600,
        rest: 'up'
      };
    },

    /* Nouvelle série après un achat : compréhensif, record gardé, graine qui pousse */
    'streak-broken': function(d){
      const lost = Math.max(0, d.days || 0);
      const best = Math.max(lost, (typeof progress !== 'undefined' && progress.best) || 0);
      const name = compName();
      return {
        cls: 'gm-m-fresh',
        label: 'Nouveau départ',
        fx: '<div class="gm-floor"></div>' +
            '<div class="gm-sun">' + pxSVG(ART.sun, { o: '#FFC800', y: '#FFD84D' }, 6) + '</div>' +
            '<div class="gm-cloud">' + pxSVG(ART.cloud, { a: '#DDE3EA', b: '#C4CDD7' }, 8) +
              '<i class="gm-drop" style="--x:26px;--d:0s"></i><i class="gm-drop" style="--x:48px;--d:.42s"></i><i class="gm-drop" style="--x:70px;--d:.2s"></i><i class="gm-drop" style="--x:92px;--d:.66s"></i></div>' +
            '<div class="gm-sprout">' + pxSVG(ART.sprout, { L: '#7ED957', D: '#58A700', S: '#58A700', M: '#C9A27E', N: '#B08560' }, 6) + '</div>' +
            sparkles([[20, 236, 0.6]], { a: '#58CC02', b: '#C8F59E' }),
        heroPos: 'fresh',
        title: 'On repart ensemble',
        sub: 'Un achat n’efface pas le chemin parcouru. ' + esc(name) + ' reste à tes côtés.',
        cards: card('#9A6300', 'Ton record', 'trophy', best > 0 ? plural(best, 'jour') : 'À venir') +
               card('#2F7D12', 'Nouvelle série', 'seed', 'Jour 1'),
        cta: 'Lancer ma nouvelle série',
        eyes: [['downleft', 0], ['close', 2300], ['downleft', 2440], ['up', 3400], ['normal', 4700], ['downleft', 5600]],
        loopEyesFrom: 2300,
        rest: 'downleft'
      };
    },

    /* Montée de ligue : fête, élan, confettis */
    'league-up': function(d){
      const to = tierName(d.to), rank = d.rank || 1, name = compName();
      const conf = ['#7C3AED', '#FFC800', '#58CC02', '#1CB0F6', '#FF7AB6', '#B99BFF'];
      const pieces = [];
      for (let i = 0; i < 16; i++) pieces.push([4 + (i * 61) % 92, -20 - (i * 37) % 60, conf[i % conf.length], (i * 0.19) % 1.6, (i * 47) % 90]);
      return {
        cls: 'gm-m-up',
        label: 'Montée de ligue',
        fx: '<div class="gm-speed"><i></i><i></i><i></i><i></i><i></i></div>' + bits(pieces, 'gm-confetti') +
            sparkles([[12, 70, 1.2], [84, 120, 1], [76, 24, 0.8]], { a: '#7C3AED', b: '#D9C8FF' }),
        heroPos: 'fly',
        sticker: true,
        title: 'Bienvenue en ligue ' + esc(to) + ' !',
        sub: 'Tu as fini ' + ordinal(rank) + ' de ta ligue cette semaine. ' + esc(name) + ' grandit avec toi.',
        cards: card('#6D28D9', 'Classement', 'arrowUp', ordinal(rank)) +
               card('#2F7D12', 'Nouvelle ligue', 'seed', esc(to)),
        cta: 'Continuer l’ascension',
        eyes: [['up', 0], ['close', 2500], ['up', 2640]],
        loopEyesFrom: 2500,
        rest: 'up',
        haptic: [18, 60, 18]
      };
    },

    /* Descente de ligue : encourageant, nouvel élan */
    'league-down': function(d){
      const to = tierName(d.to);
      return {
        cls: 'gm-m-down',
        label: 'Nouvelle semaine',
        fx: '<div class="gm-floor"></div>' +
            '<div class="gm-steps"><i class="gm-step gm-step1"></i><i class="gm-step gm-step2"></i>' +
              '<span class="gm-flag">' + pxSVG(ART.flag, { p: '#8E8A9C', c: '#7C3AED' }, 6) + '</span></div>' +
            sparkles([[86, 128, 1], [66, 176, 0.7], [16, 70, 0.7]], { a: '#7C3AED', b: '#D9C8FF' }),
        heroPos: 'ready',
        title: 'Nouvelle semaine, nouvel élan',
        sub: 'Tu repars en ligue ' + esc(to) + '. Le top 3 remonte dimanche : on y va ensemble ?',
        cards: card('#6D28D9', 'Objectif', 'goal', 'Top 3') +
               card('#2F7D12', 'Ta ligue', 'seed', esc(to)),
        cta: 'Relever le défi',
        eyes: [['up', 0], ['close', 2100], ['up', 2240], ['normal', 3600], ['up', 4800]],
        loopEyesFrom: 2100,
        rest: 'up'
      };
    }
  };
  const ALIASES = { shield: 'freeze-used', freeze: 'freeze-used', reset: 'streak-broken', broken: 'streak-broken' };

  /* ── État du calque ── */
  const queue = [];
  let root = null, openKind = null, timers = [], lastFocus = null, pollT = null;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  function clearTimers(){ timers.forEach(clearTimeout); timers = []; }

  function ensureRoot(){
    if (root) return root;
    root = document.getElementById('g-mascotte');
    if (!root) {
      root = document.createElement('div');
      root.id = 'g-mascotte';
      (document.querySelector('.phone') || document.body).appendChild(root);
    }
    root.className = 'gm';
    root.hidden = true;
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'gm-title');
    root.setAttribute('aria-describedby', 'gm-sub');
    root.tabIndex = -1;
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); closeMascot(); }
      else if (e.key === 'Tab') { e.preventDefault(); const b = root.querySelector('.gm-btn'); if (b) b.focus(); }
    });
    return root;
  }

  /* Un autre calque plein écran occupe-t-il déjà la scène ? */
  function _bigVisible(el){
    if (!el || el === root || (root && root.contains(el))) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false;
    const r = el.getBoundingClientRect();
    const ph = (document.querySelector('.phone') || document.body).getBoundingClientRect();
    return r.width >= ph.width * 0.6 && r.height >= ph.height * 0.5;
  }
  const OUTSIDE_APP = /^s-(widget|splash|intro|step|record|emo|slip|amazon)/;
  function blocked(){
    try { if (typeof window.isCelebrationOpen === 'function' && window.isCelebrationOpen()) return true; } catch(e){}
    if (window.celebrationOpen === true) return true;
    const sel = '[id*="celebr" i], [class*="celebr" i], [data-celebration], #cap-overlay.on, #imp-overlay.on, #tour-overlay.active';
    for (const el of document.querySelectorAll(sel)) if (_bigVisible(el)) return true;
    const act = document.querySelector('.screen.active');
    if (act && OUTSIDE_APP.test(act.id)) return true;
    return false;
  }

  function pump(){
    if (pollT) { clearTimeout(pollT); pollT = null; }
    if (openKind || !queue.length) return;
    if (blocked()) { pollT = setTimeout(pump, 300); return; }
    const next = queue.shift();
    render(next.kind, next.detail);
  }

  function showMascot(kind, detail){
    kind = ALIASES[kind] || kind;
    detail = detail || {};
    if (kind === 'league-change') kind = (detail.to != null && detail.from != null && detail.to < detail.from) ? 'league-down' : 'league-up';
    if (!MOODS[kind]) return false;
    // Deux fois le même calque en attente : on garde le plus récent
    const same = queue.findIndex(q => q.kind === kind);
    if (same >= 0) queue[same].detail = detail; else queue.push({ kind, detail });
    // Petit temps de respiration : laisse l'écran d'arrivée (accueil…) s'afficher
    if (!pollT && !openKind) pollT = setTimeout(pump, 280);
    return true;
  }

  function setEyes(img, spr, key){ if (img && spr[key]) img.src = spr[key]; }

  function render(kind, detail){
    const m = MOODS[kind](detail || {});
    const el = ensureRoot();
    const spr = sprites();
    Object.keys(spr).forEach(k => { const i = new Image(); i.src = spr[k]; });   // précharge les yeux
    openKind = kind;
    lastFocus = document.activeElement;

    el.className = 'gm ' + m.cls + ' gm-comp-' + compKey();
    el.setAttribute('data-kind', kind);
    el.innerHTML =
      '<div class="gm-main">' +
        '<div class="gm-stage" aria-hidden="true">' +
          '<div class="gm-fx">' + m.fx + '</div>' +
          '<div class="gm-hero gm-pos-' + m.heroPos + (m.sticker ? ' gm-sticker' : '') + '">' +
            '<div class="gm-move">' +
              (m.heroPos === 'fly' ? '<i class="gm-ghost" style="-webkit-mask-image:url(' + spr.up + ');mask-image:url(' + spr.up + ')"></i>' : '') +
              '<div class="gm-squash"><img class="gm-sprite" alt="" src="' + spr[m.eyes[0][0]] + '">' + (m.heroExtra || '') + '</div>' +
            '</div>' +
            '<div class="gm-shadow"></div>' +
          '</div>' +
        '</div>' +
        '<h2 class="gm-title" id="gm-title">' + m.title + '</h2>' +
        '<p class="gm-sub" id="gm-sub">' + m.sub + '</p>' +
        '<div class="gm-cards">' + m.cards + '</div>' +
      '</div>' +
      '<div class="gm-cta"><button type="button" class="gm-btn">' + m.cta + '</button></div>';

    el.hidden = false;
    el.classList.remove('gm-out');
    void el.offsetWidth;
    el.classList.add('gm-in');

    const btn = el.querySelector('.gm-btn');
    btn.addEventListener('click', closeMascot);
    later(() => { try { el.focus({ preventScroll: true }); } catch(e){ el.focus(); } }, 60);

    const img = el.querySelector('.gm-sprite');
    if (reducedMotion()) {
      setEyes(img, spr, m.rest);
    } else {
      m.eyes.forEach(([key, at]) => later(() => setEyes(img, spr, key), at));
      // Ensuite : clignements et regards au hasard, sans jamais quitter l'humeur
      const loop = () => {
        const r = Math.random();
        if (r < 0.55) { setEyes(img, spr, 'close'); later(() => setEyes(img, spr, m.rest), 140); }
        else if (r < 0.8) { setEyes(img, spr, m.rest === 'downleft' ? 'up' : 'normal'); later(() => setEyes(img, spr, m.rest), 1100); }
        else { setEyes(img, spr, 'close'); later(() => { setEyes(img, spr, m.rest); later(() => { setEyes(img, spr, 'close'); later(() => setEyes(img, spr, m.rest), 120); }, 110); }, 120); }
        later(loop, 2600 + Math.random() * 2400);
      };
      const lastAt = m.eyes[m.eyes.length - 1][1];
      later(() => { setEyes(img, spr, m.rest); later(loop, 1800); }, Math.max(m.loopEyesFrom, lastAt) + 1400);
      if (m.haptic && navigator.vibrate) { try { navigator.vibrate(m.haptic); } catch(e){} }
    }
    try { window.dispatchEvent(new CustomEvent('vision:mascot', { detail: { type: 'open', kind } })); } catch(e){}
  }

  function closeMascot(){
    if (!root || !openKind) return;
    const kind = openKind;
    root.classList.remove('gm-in');
    root.classList.add('gm-out');
    clearTimers();
    setTimeout(() => {
      root.hidden = true;
      root.classList.remove('gm-out');
      root.innerHTML = '';
      openKind = null;
      if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === 'function') { try { lastFocus.focus({ preventScroll: true }); } catch(e){} }
      try { window.dispatchEvent(new CustomEvent('vision:mascot', { detail: { type: 'close', kind } })); } catch(e){}
      if (queue.length) pollT = setTimeout(pump, 350);
    }, reducedMotion() ? 0 : 220);
  }

  window.showMascot = showMascot;
  window.closeMascot = closeMascot;
  window.isMascotOpen = () => !!openKind;

  window.addEventListener('vision:game', e => {
    const d = e.detail || {};
    if (d.type === 'streak-broken' || d.type === 'freeze-used' || d.type === 'league-change') showMascot(d.type, d);
  });
})();
