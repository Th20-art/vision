/* ════════════════════════════════════════════════════════════
   Morceau gantelet « celebration »
   Calque plein écran de fin de résistance (l'équivalent Vision du
   « leçon terminée ») + célébration des quêtes du jour.
   · Écoute window 'vision:game' (js/game.js) : 'xp', 'gems',
     'quest-done', 'quests-all-done'. Les rafales d'une même action
     (résistance → XP + graines + quête…) sont regroupées.
   · File d'attente : jamais deux calques à la fois, jamais pendant
     un parcours d'achat (fiche, capsule, pause émotion…).
   · API : showCelebration(detail) — detail = détail d'un événement
     'vision:game' ou { kind:'resist'|'quest'|'palier', … }.
════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Réglages ── */
  const SHOW_ON = /^(s-home|s-hist|s-comp|s-profil|s-chat|s-widget|s-param-.+)$/;
  const BURST_MS = 60;           // fenêtre de regroupement d'une rafale d'événements
  const CARD = {                 // une couleur saturée par signification
    xp:     { icon: 'bolt'   },
    money:  { icon: 'coin'   },
    streak: { icon: 'flame'  },
    gems:   { icon: 'sprout' },
    quest:  { icon: 'target' },
    goal:   { icon: 'flag'   }
  };
  const FX_COLORS = ['#FFC800', '#58CC02', '#FF9600', '#CE82FF', '#1CB0F6'];

  let pending = null, flushT = null, pollT = null;
  const queue = [];
  let root = null, cur = null, claiming = false, lastFocus = null, fx = null;

  const reduced = () => { try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch(e){ return false; } };
  const fmt = n => Math.round(n).toLocaleString('fr-FR');
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const nb = s => s.replace(/ ([!?:;»])/g, '\u202f$1').replace(/« /g, '«\u202f');   // espaces fines françaises

  /* ══ 1. Collecte des événements → éléments de file ══ */
  function onGame(e){
    const d = (e && e.detail) || {};
    if (!/^(xp|gems|quest-done|quests-all-done)$/.test(d.type)) return;
    if (!pending) pending = { xp: {}, gems: {}, quests: [], allDone: false };
    if (d.type === 'xp')   { const r = d.reason || ''; pending.xp[r] = (pending.xp[r] || 0) + (+d.amount || 0); }
    if (d.type === 'gems') { const r = d.reason || ''; pending.gems[r] = (pending.gems[r] || 0) + (+d.amount || 0); }
    if (d.type === 'quest-done' && d.quest) pending.quests.push(d.quest);
    if (d.type === 'quests-all-done') pending.allDone = true;
    clearTimeout(flushT); flushT = setTimeout(flush, BURST_MS);
  }
  window.addEventListener('vision:game', onGame);

  function flush(){
    const p = pending; pending = null; flushT = null;
    if (!p) return;
    if (p.xp.resist) enqueue(buildResist(p));
    else if (p.xp.palier) enqueue(buildPalier(p));
    if (p.quests.length || p.allDone) enqueue({ kind: 'quest', raw: p });
    pump();
  }

  /* Résistance / palier passent avant les quêtes ; les quêtes en attente fusionnent en un seul calque */
  function enqueue(entry){
    if (entry.raw) {
      const q = queue.find(e => e.raw);
      if (!q) { queue.push(entry); return; }
      const a = q.raw, b = entry.raw;
      a.quests = a.quests.concat(b.quests.filter(x => !a.quests.some(y => y.id === x.id)));
      Object.keys(b.xp).forEach(k => { a.xp[k] = (a.xp[k] || 0) + b.xp[k]; });
      Object.keys(b.gems).forEach(k => { a.gems[k] = (a.gems[k] || 0) + b.gems[k]; });
      a.allDone = a.allDone || b.allDone;
      return;
    }
    const i = queue.findIndex(e => e.raw);
    if (i >= 0) queue.splice(i, 0, entry); else queue.push(entry);
  }
  /* Totaux au moment de l'affichage : on retire ce qui reste à célébrer après ce calque */
  function totalsNow(){
    const later = queue.filter(e => e.raw).map(e => e.raw);
    const xpLater = later.reduce((s, r) => s + (r.xp.quete || 0), 0);
    const gemsLater = later.reduce((s, r) => s + (r.gems.quete || 0) + (r.gems['toutes-quetes'] || 0), 0);
    const hasP = typeof progress !== 'undefined' && progress;
    return { xp: (hasP ? progress.xp || 0 : 0) - xpLater, gems: (hasP ? progress.gems || 0 : 0) - gemsLater };
  }

  function savedFor(label){
    try { return parseFloat(localStorage.getItem('visioncopie_saved_' + label) || '0') || 0; } catch(e){ return 0; }
  }
  function mainAmbition(){
    const list = (typeof userAmbitions !== 'undefined' && Array.isArray(userAmbitions)) ? userAmbitions : [];
    return list[0] || null;
  }
  function palierPct(a){
    if (!a || typeof progress === 'undefined' || !progress.milestones) return 0;
    return progress.milestones[a.label] || 0;
  }
  function streakCard(){
    const d = (typeof streakDays === 'function') ? streakDays() : 0;
    if (d >= 1) return { k: 'streak', label: d >= 3 ? 'En feu' : 'Série', value: d, unit: 'j', shiny: d >= 7,
      aria: d + (d > 1 ? ' jours' : ' jour') + ' de série' };
    return null;
  }
  function questsCard(p, allDone){
    const list = (typeof dailyQuests === 'function') ? dailyQuests() : [];
    const done = list.filter(q => q.done).length, total = list.length || 3;
    const perfect = total > 0 && done >= total;
    return { k: 'quest', label: perfect ? 'Parfait' : 'Quêtes', value: done, suffix: '/' + total, shiny: perfect,
      aria: done + ' quêtes sur ' + total };
  }

  function buildResist(p){
    let ev = null;
    try { const e0 = (typeof loadEvents === 'function') ? loadEvents()[0] : null; if (e0 && e0.type === 'resist' && Date.now() - e0.ts < 15000) ev = e0; } catch(e){}
    const meta = ev || {};
    const price = parseFloat(meta.price);
    const hasPrice = isFinite(price) && price > 0;
    const amb = mainAmbition();
    const palier = p.xp.palier ? palierPct(amb) : 0;
    let count = 1;
    try { count = loadEvents().filter(e => e.type === 'resist').length || 1; } catch(e){}
    const xp = (p.xp.resist || 0) + (p.xp.palier || 0);
    const gems = (p.gems.resist || 0) + (p.gems.palier || 0);

    const cards = [{ k: 'xp', label: 'XP gagnée', value: xp, shiny: !!palier,
      claim: { label: 'Total XP', xp: true }, aria: xp + ' XP gagnée' }];
    if (hasPrice) {
      const after = amb ? savedFor(amb.label) : 0;
      cards.push({ k: 'money', label: 'Mis de côté', value: Math.max(1, Math.round(price)), unit: '€',
        claim: amb && after >= price ? { label: 'Cagnotte', from: Math.round(after - price), to: Math.round(after) } : null,
        aria: Math.round(price) + ' euros mis de côté' });
    } else if (gems) {
      cards.push({ k: 'gems', label: 'Graines', value: gems, claim: { label: 'Tes graines', gems: true }, aria: gems + ' graines' });
    }
    cards.push(streakCard() || questsCard(p, p.allDone));

    const titles = ['Bien résisté !', 'Esquive parfaite !', 'Toi 1, tentation 0', 'Quelle maîtrise !', 'Ton futur toi applaudit', 'Imbattable !'];
    const title = palier ? 'Palier atteint !' : (count === 1 ? 'Première victoire !' : titles[(count - 2) % titles.length]);
    let product = String(meta.product || '').trim();
    if (product === 'cet achat') product = '';
    if (product.length > 34) product = product.slice(0, 32).trim() + '…';
    let sub;
    if (hasPrice) {
      const euros = '<b>' + price.toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + '\u00a0€</b>';
      const said = product ? 'Tu as dit non à <b>' + esc(product) + '</b>' + (/…$/.test(product) ? ' ' : '. ') : 'Tu as dit non. ';
      sub = said + (amb ? 'Ces ' + euros + ' filent vers « ' + esc(amb.label) + ' ».' : 'Ces ' + euros + ' restent dans ta poche.');
      if (palier && amb) sub = said + '« ' + esc(amb.label) + ' » passe la barre des <b>' + palier + '\u00a0%</b>.';
    } else {
      sub = amb ? 'Chaque « non » te rapproche de « ' + esc(amb.label) + ' ».' : 'Chaque « non » compte. Ton compagnon est fier de toi.';
    }
    return { kind: 'resist', title, sub, cards, mood: palier ? 'big' : 'happy' };
  }

  function buildPalier(p){
    const amb = mainAmbition();
    const pct = palierPct(amb);
    const xp = p.xp.palier || 0, gems = (p.gems.palier || 0);
    const cards = [
      { k: 'xp', label: 'XP gagnée', value: xp, shiny: true, claim: { label: 'Total XP', xp: true }, aria: xp + ' XP gagnée' },
      { k: 'gems', label: 'Graines', value: gems, claim: { label: 'Tes graines', gems: true }, aria: gems + ' graines' },
      { k: 'goal', label: 'Objectif', value: pct, unit: '%', shiny: pct >= 100, aria: 'objectif à ' + pct + ' %' }
    ];
    return { kind: 'palier', title: pct >= 100 ? 'Objectif atteint !' : 'Palier atteint !',
      sub: amb ? '« ' + esc(amb.label) + ' » passe la barre des <b>' + pct + '\u00a0%</b>. Continue comme ça.' : 'Un nouveau palier franchi.',
      cards, mood: 'big' };
  }

  function buildQuest(p){
    const qs = p.quests;
    const xp = p.xp.quete || qs.reduce((s, q) => s + (+q.xp || 0), 0);
    const gems = (p.gems.quete || 0) + (p.gems['toutes-quetes'] || 0);
    const name = (typeof themes !== 'undefined' && typeof currentTheme !== 'undefined' && themes[currentTheme]) ? themes[currentTheme].name : 'Ton compagnon';
    const cards = [
      { k: 'xp', label: 'XP gagnée', value: xp, claim: { label: 'Total XP', xp: true }, aria: xp + ' XP gagnée' },
      { k: 'gems', label: 'Graines', value: gems, shiny: p.allDone,
        claim: { label: 'Tes graines', gems: true }, aria: gems + ' graines' },
      questsCard(p, p.allDone)
    ];
    let title, sub;
    if (p.allDone) {
      title = 'Journée parfaite !';
      sub = 'Toutes tes quêtes du jour sont bouclées. ' + esc(name) + ' t\'offre <b>' + (p.gems['toutes-quetes'] || 0) + ' graines</b> bonus.';
    } else if (qs.length > 1) {
      title = qs.length + ' quêtes d\'un coup !';
      sub = qs.map(q => '« ' + esc(q.label) + ' »').join(' et ') + ' : c\'est fait.';
    } else {
      title = 'Quête accomplie !';
      sub = '« ' + esc(qs[0] ? qs[0].label : 'Quête du jour') + ' » : c\'est fait. ' + esc(name) + ' danse de joie.';
    }
    return { kind: 'quest', title, sub, cards, mood: p.allDone ? 'big' : 'happy' };
  }

  /* ══ 2. File d'attente ══ */
  function canShow(){
    if (cur) return false;
    if (typeof tourActive !== 'undefined' && tourActive) return false;
    const act = document.querySelector('.screen.active');
    if (!act || !SHOW_ON.test(act.id)) return false;
    for (const id of ['cap-overlay', 'imp-overlay']) { const el = document.getElementById(id); if (el && el.classList.contains('on')) return false; }
    // Un autre calque modal visible (autre morceau) : on attend son tour
    const others = [...document.querySelectorAll('[aria-modal="true"]')].filter(el => el !== root && el.offsetParent !== null);
    return others.length === 0;
  }
  function pump(){
    clearTimeout(pollT); pollT = null;
    if (!queue.length) return;
    if (!canShow()) { pollT = setTimeout(pump, 700); return; }
    open(queue.shift());
  }

  /* ══ 3. Compagnon heureux : yeux en arc ^^ (dessinés à partir des sprites) ══ */
  const happyCache = {};
  function loadImg(src){ return new Promise((ok, ko) => { const i = new Image(); i.onload = () => ok(i); i.onerror = ko; i.src = src; }); }
  function happySprite(key){
    if (happyCache[key]) return happyCache[key];
    const th = (typeof themes !== 'undefined') ? themes[key] : null;
    const bl = (typeof COMP_BLINK_SPRITES !== 'undefined') ? COMP_BLINK_SPRITES[key] : null;
    const fallback = th ? th.img : 'assets/comp-foxy.png';
    happyCache[key] = (!th || !bl || !bl.close) ? Promise.resolve(fallback)
      : Promise.all([loadImg(th.img), loadImg(bl.close)]).then(([open, closed]) => drawHappy(open, closed)).catch(() => fallback);
    return happyCache[key];
  }
  function drawHappy(open, closed){
    const w = open.naturalWidth, h = open.naturalHeight;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const cx = cv.getContext('2d');
    cx.drawImage(open, 0, 0); const A = cx.getImageData(0, 0, w, h).data;
    cx.clearRect(0, 0, w, h); cx.drawImage(closed, 0, 0);
    const img = cx.getImageData(0, 0, w, h), B = img.data;
    const diff = (x, y) => { const i = (y * w + x) * 4; return Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i+1] - B[i+1]), Math.abs(A[i+2] - B[i+2]), Math.abs(A[i+3] - B[i+3])) > 30; };
    const dark = (x, y) => { const i = (y * w + x) * 4; return B[i+3] > 200 && B[i] + B[i+1] + B[i+2] < 330; };
    // Colonnes où les yeux ouverts/fermés diffèrent → une zone par œil
    const runs = []; let s = -1, prev = -2;
    for (let x = 0; x < w; x++) {
      let has = false; for (let y = 0; y < h - 20 && !has; y++) if (diff(x, y)) has = true;
      if (!has) continue;
      if (s < 0) s = x; else if (x !== prev + 1) { runs.push([s, prev]); s = x; }
      prev = x;
    }
    if (s >= 0) runs.push([s, prev]);
    const merged = [];
    runs.forEach(r => { const m = merged[merged.length - 1]; if (m && r[0] - m[1] < 14) m[1] = r[1]; else merged.push(r.slice()); });
    const eyes = merged.filter(r => r[1] - r[0] >= 15);
    if (!eyes.length || eyes.length > 3) throw new Error('yeux');
    const arcs = [];
    eyes.forEach(([x0, x1]) => {
      const ww = x1 - x0;
      const rows = [];
      for (let y = 0; y < h - 20; y++) { let n = 0; for (let x = x0; x <= x1; x++) if (diff(x, y)) n++; if (n > ww * 0.25) rows.push(y); }
      if (!rows.length) return;
      const y0 = rows[0], y1 = rows[rows.length - 1], dh = y1 - y0 + 1;
      let by1 = y1;
      for (let y = y1 + 1; y < Math.min(h, y1 + 1 + dh); y++) { let n = 0; for (let x = x0; x <= x1; x++) if (dark(x, y)) n++; if (n > ww * 0.5) by1 = y; else break; }
      // Couleur du visage = teinte dominante de la paupière fermée
      const tally = {}; let face = null, best = 0;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const i = (y * w + x) * 4; if (B[i+3] < 250) continue;
        const k = B[i] + ',' + B[i+1] + ',' + B[i+2]; tally[k] = (tally[k] || 0) + 1;
        if (tally[k] > best) { best = tally[k]; face = k; }
      }
      if (!face) return;
      arcs.push({ x0, x1, y0, by1, face });
    });
    cx.putImageData(img, 0, 0);
    arcs.forEach(({ x0, x1, y0, by1, face }) => {
      cx.fillStyle = 'rgb(' + face + ')';
      cx.fillRect(x0, y0, x1 - x0 + 1, by1 - y0 + 1);
      const W = x1 - x0 + 1, H = by1 - y0 + 1, u = W / 4, t = Math.round(H * 0.3);
      const top = y0 + Math.round((H - 2 * t) / 2) - 2;
      cx.fillStyle = '#18100c';
      [[0, 1], [1, 0], [2, 0], [3, 1]].forEach(([c, r]) => {
        cx.fillRect(Math.round(x0 + c * u), top + r * t, Math.round(x0 + (c + 1) * u) - Math.round(x0 + c * u), t);
      });
      // Joues roses
      cx.fillStyle = 'rgba(255, 92, 122, 0.55)';
      const bw = Math.round(u * 1.6), bh = Math.max(4, Math.round(t * 0.75));
      cx.fillRect(Math.round(x0 + (W - bw) / 2), by1 + Math.round(t * 0.7), bw, bh);
    });
    return cv.toDataURL('image/png');
  }

  /* ══ 4. Construction du calque ══ */
  const ICONS = {
    bolt:   '<path d="M13.2 2.2 4.6 13.1c-.5.6 0 1.4.7 1.4h5.1l-1.6 7.2c-.2.9.9 1.4 1.5.7l8.6-10.9c.5-.6 0-1.4-.7-1.4h-5.1l1.6-7.2c.2-.9-.9-1.4-1.5-.7Z" fill="#FFC800" stroke="#E6A800" stroke-width="1.2" stroke-linejoin="round"/>',
    coin:   '<circle cx="12" cy="12" r="10" fill="#58CC02"/><circle cx="12" cy="12" r="7.2" fill="none" stroke="#89E219" stroke-width="1.6"/><path d="M14.6 8.6a4 4 0 1 0 0 6.8M7.6 11h5.2M7.6 13.2h5.2" fill="none" stroke="#fff" stroke-width="1.9" stroke-linecap="round"/>',
    flame:  '<path d="M12 2.5c.6 3.2 5.8 5.6 5.8 11.2A5.8 5.8 0 0 1 12 21.5a5.8 5.8 0 0 1-5.8-5.8c0-2.9 1.6-4.4 2.6-5.5.3 1.4 1 2.3 1.9 2.6-.3-3.6.7-7 1.3-10.3Z" fill="#FF9600"/><path d="M12 12.2c1.6 1.5 3 2.9 3 4.9a3 3 0 0 1-6 0c0-1.5 1-2.5 1.7-3.2.1.7.5 1.1 1 1.3.1-1 .1-2 .3-3Z" fill="#FFC800"/>',
    sprout: '<path d="M12 21v-7.5" stroke="#58A700" stroke-width="2.2" stroke-linecap="round"/><path d="M12 14C12 9.5 8.6 7 4.2 7.3 4 11.6 7.4 14.2 12 14Z" fill="#58CC02"/><path d="M12 12.4c0-4.6 3.2-7.6 7.8-7.4.2 4.4-3 7.6-7.8 7.4Z" fill="#89E219"/>',
    target: '<circle cx="12" cy="12" r="10" fill="#CE82FF"/><circle cx="12" cy="12" r="6.4" fill="#fff"/><circle cx="12" cy="12" r="3.4" fill="#CE82FF"/><path d="m9.9 12 1.5 1.5 3-3.1" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    flag:   '<path d="M6 21V3.5" stroke="#1487C4" stroke-width="2.2" stroke-linecap="round"/><path d="M6.6 4h11.2l-2.6 4 2.6 4H6.6Z" fill="#1CB0F6"/>'
  };
  const SPARKS = [
    { x: 8,  y: 22, s: 40, c: 'gold',  d: 0 },
    { x: 88, y: 12, s: 44, c: 'theme', d: .5 },
    { x: 97, y: 60, s: 24, c: 'gold',  d: .95 },
    { x: 2,  y: 66, s: 22, c: 'theme', d: 1.35 },
    { x: 86, y: 90, s: 30, c: 'green', d: .7 },
    { x: 32, y: 3,  s: 20, c: 'green', d: 1.15 },
    { x: 14, y: 93, s: 16, c: 'gold',  d: .3 },
    { x: 64, y: 0,  s: 16, c: 'gold',  d: .85 }
  ];
  // Étincelle pixel 11×11 : 4 branches effilées, cœur blanc
  const sparkSvg = '<svg viewBox="0 0 11 11" shape-rendering="crispEdges"><path d="M5 0h1v2h1v2h2v1h2v1H9v1H7v2H6v2H5V9H4V7H2V6H0V5h2V4h2V2h1Z" fill="currentColor"/><path d="M5 4h1v1h1v1H6v1H5V6H4V5h1Z" fill="#fff" opacity=".9"/></svg>';

  function build(){
    if (root) return root;
    const host = document.querySelector('.phone') || document.body;
    root = document.createElement('div');
    root.id = 'celebration';
    root.className = 'cb';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'cb-title');
    root.setAttribute('aria-describedby', 'cb-sub');
    root.hidden = true;
    root.tabIndex = -1;
    root.innerHTML =
      '<canvas class="cb-fx" aria-hidden="true"></canvas>' +
      '<div class="cb-main">' +
        '<div class="cb-hero" aria-hidden="true">' +
          SPARKS.map((p, i) => '<span class="cb-spark cb-spark-' + p.c + '" style="left:' + p.x + '%;top:' + p.y + '%;width:' + p.s + 'px;height:' + p.s + 'px;animation-delay:' + p.d + 's">' + sparkSvg + '</span>').join('') +
          '<svg class="cb-rays" viewBox="-50 -50 100 100">' + Array.from({ length: 10 }, (_, i) => '<path d="M0 0 L' + (50 * Math.cos((i * 36 - 7) * Math.PI / 180)).toFixed(2) + ' ' + (50 * Math.sin((i * 36 - 7) * Math.PI / 180)).toFixed(2) + ' L' + (50 * Math.cos((i * 36 + 7) * Math.PI / 180)).toFixed(2) + ' ' + (50 * Math.sin((i * 36 + 7) * Math.PI / 180)).toFixed(2) + 'Z"/>').join('') + '</svg>' +
          '<div class="cb-shadow"></div>' +
          '<div class="cb-comp"><img class="cb-sprite" alt="" draggable="false"></div>' +
        '</div>' +
        '<h2 class="cb-title" id="cb-title"></h2>' +
        '<p class="cb-sub" id="cb-sub"></p>' +
        '<div class="cb-stats" role="list"></div>' +
      '</div>' +
      '<div class="cb-foot"><button type="button" class="cb-cta">Récupérer</button></div>';
    host.appendChild(root);
    root.querySelector('.cb-cta').addEventListener('click', claim);
    root.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); claim(); }
      if (e.key === 'Tab') { e.preventDefault(); root.querySelector('.cb-cta').focus(); }   // un seul élément focusable
      if (e.key === 'Enter' && e.target === root) { e.preventDefault(); claim(); }
    });
    return root;
  }

  function mixHex(hex, t){   // t = part de la couleur, le reste en noir
    const m = String(hex || '').match(/^#?([0-9a-f]{6})$/i); if (!m) return null;
    const n = parseInt(m[1], 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * t));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  function lum(hex){
    const n = parseInt(hex.slice(1), 16);
    return [n >> 16, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
      .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  }
  /* Teinte du thème la plus vive possible avec un contraste AA (texte large, 3:1) face au blanc */
  function deepShade(hex){
    for (let t = 1; t > 0.4; t -= 0.02) { const c = mixHex(hex, t); if (c && 1.05 / (lum(c) + 0.05) >= 3.25) return c; }
    return mixHex(hex, 0.6) || '#c76300';
  }

  function cardHtml(c, i){
    const unit = c.unit ? '<span class="cb-unit">' + (c.unit === '€' ? '\u00a0€' : c.unit === '%' ? '\u00a0%' : '\u00a0' + c.unit) + '</span>' : '';
    const suffix = c.suffix ? '<span class="cb-suffix">' + c.suffix + '</span>' : '';
    return '<div class="cb-card k-' + c.k + (c.shiny ? ' is-shiny' : '') + '" role="listitem" aria-label="' + esc(c.aria || '') + '" style="--i:' + i + '">' +
      '<div class="cb-card-h" aria-hidden="true">' + esc(c.label) + '</div>' +
      '<div class="cb-card-b" aria-hidden="true"><svg class="cb-ico" viewBox="0 0 24 24">' + ICONS[CARD[c.k].icon] + '</svg>' +
      '<span class="cb-num"><span class="cb-val">' + fmt(c.value) + '</span>' + suffix + unit + '</span></div>' +
    '</div>';
  }

  function open(entry){
    build();
    const item = entry.raw ? buildQuest(entry.raw) : entry;
    const tot = totalsNow();
    item.cards.forEach(c => {
      if (!c.claim) return;
      if (c.claim.xp)   { c.claim.to = tot.xp;   c.claim.from = tot.xp - c.value; }
      if (c.claim.gems) { c.claim.to = tot.gems; c.claim.from = tot.gems - c.value; }
    });
    cur = item; claiming = false;
    const th = (typeof themes !== 'undefined' && typeof currentTheme !== 'undefined') ? themes[currentTheme] : null;
    const og = th ? th.og : '#ff7e00';
    const deep = deepShade(og);
    root.style.setProperty('--cb-deep', deep);
    root.style.setProperty('--cb-edge', mixHex(deep, 0.66) || '#803f00');
    root.style.setProperty('--cb-light', og);
    root.dataset.kind = item.kind;
    root.dataset.mood = item.mood || 'happy';
    root.querySelector('.cb-title').textContent = nb(item.title);
    root.querySelector('.cb-sub').innerHTML = nb(item.sub);
    const stats = root.querySelector('.cb-stats');
    stats.innerHTML = item.cards.map(cardHtml).join('');
    const cta = root.querySelector('.cb-cta');
    cta.textContent = 'Récupérer'; cta.removeAttribute('aria-disabled');

    const img = root.querySelector('.cb-sprite');
    img.src = th ? th.img : 'assets/comp-foxy.png';
    happySprite(typeof currentTheme !== 'undefined' ? currentTheme : 'foxy').then(src => { if (cur === item) img.src = src; });

    lastFocus = document.activeElement;
    root.hidden = false;
    root.classList.remove('is-out', 'is-claim');
    void root.offsetWidth;
    root.classList.add('on');

    const rm = reduced();
    // Compteurs : de 0 à la valeur, carte par carte
    stats.querySelectorAll('.cb-card').forEach((el, i) => {
      const c = item.cards[i], val = el.querySelector('.cb-val');
      if (rm) { val.textContent = fmt(c.value); return; }
      val.textContent = '0';
      setTimeout(() => countTo(val, 0, c.value, 650), 520 + i * 130);
    });
    if (!rm) setTimeout(() => { if (cur === item) confetti('hero'); }, 160);
    try { root.focus({ preventScroll: true }); } catch(e){ root.focus(); }
  }

  function countTo(el, from, to, ms){
    const t0 = performance.now();
    const ease = t => 1 - Math.pow(1 - t, 3);
    (function step(now){
      const t = Math.min(1, (now - t0) / ms);
      el.textContent = fmt(from + (to - from) * ease(t));
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  function claim(){
    if (!cur || claiming) return;
    claiming = true;
    const item = cur, rm = reduced();
    const cta = root.querySelector('.cb-cta');
    cta.setAttribute('aria-disabled', 'true');
    cta.textContent = 'Récupéré\u202f!';
    root.classList.add('is-claim');
    root.querySelectorAll('.cb-card').forEach((el, i) => {
      const c = item.cards[i];
      const go = () => {
        el.classList.add('is-got');
        if (c.claim && isFinite(c.claim.to)) {
          el.querySelector('.cb-card-h').textContent = c.claim.label;
          el.setAttribute('aria-label', c.claim.label + ' : ' + fmt(c.claim.to));
          const val = el.querySelector('.cb-val');
          if (rm) val.textContent = fmt(c.claim.to);
          else countTo(val, Math.max(0, c.claim.from), c.claim.to, 700);
        }
      };
      if (rm) go(); else setTimeout(go, i * 110);
    });
    if (!rm) confetti('cta');
    setTimeout(close, rm ? 900 : 1650);
  }

  function close(){
    if (!root || !cur) return;
    root.classList.add('is-out');
    setTimeout(() => {
      root.classList.remove('on', 'is-out', 'is-claim');
      root.hidden = true;
      cur = null; claiming = false;
      stopFx();
      if (lastFocus && document.contains(lastFocus) && typeof lastFocus.focus === 'function') { try { lastFocus.focus({ preventScroll: true }); } catch(e){} }
      lastFocus = null;
      setTimeout(pump, 380);
    }, reduced() ? 10 : 260);
  }

  /* ══ 5. Confettis pixel (canvas) ══ */
  function stopFx(){ if (fx) { cancelAnimationFrame(fx.raf); fx = null; } const c = root && root.querySelector('.cb-fx'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); }
  function confetti(from){
    if (!root || reduced()) return;
    const cv = root.querySelector('.cb-fx');
    const r = root.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
    let ox, oy, n, spread, speed;
    if (from === 'cta') {
      const b = root.querySelector('.cb-cta').getBoundingClientRect();
      ox = b.left - r.left + b.width / 2; oy = b.top - r.top; n = 46; spread = [-150, -30]; speed = [7, 13];
    } else {
      const h = root.querySelector('.cb-comp').getBoundingClientRect();
      ox = h.left - r.left + h.width / 2; oy = h.top - r.top + h.height * 0.5; n = 80; spread = [-180, 0]; speed = [7, 15];
    }
    const theme = getComputedStyle(root).getPropertyValue('--cb-light').trim() || '#ff7e00';
    const cols = FX_COLORS.concat([theme, theme]);
    const parts = fx ? fx.parts : [];
    for (let i = 0; i < n; i++) {
      const a = (spread[0] + Math.random() * (spread[1] - spread[0])) * Math.PI / 180;
      const v = speed[0] + Math.random() * (speed[1] - speed[0]);
      const big = Math.random() < 0.3;
      parts.push({ x: ox + (Math.random() - .5) * 30, y: oy + (Math.random() - .5) * 20, vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: big ? 9 : 6 + Math.random() * 2, h: big ? 5 : 6 + Math.random() * 2, c: cols[i % cols.length],
        ph: Math.random() * 6.28, sp: .12 + Math.random() * .16, life: (from === 'cta' ? 900 : 800) + Math.random() * 650, t: 0 });
    }
    if (fx) return;
    fx = { parts, last: performance.now(), raf: 0 };
    const ctx = cv.getContext('2d');
    const tick = now => {
      if (!fx) return;
      const dt = Math.min(40, now - fx.last) / 16.67; fx.last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      fx.parts = fx.parts.filter(p => p.t < p.life);
      fx.parts.forEach(p => {
        p.t += dt * 16.67;
        p.vx *= Math.pow(0.94, dt); p.vy = p.vy * Math.pow(0.94, dt) + 0.32 * dt;
        if (p.vy > 2.4) p.vy = 2.4;                           // chute de papier : vitesse limite
        p.ph += p.sp * dt;
        p.x += (p.vx + Math.sin(p.ph) * 0.9) * dt; p.y += p.vy * dt;
        const flip = Math.abs(Math.cos(p.ph));                // effet de rotation
        ctx.globalAlpha = Math.max(0, Math.min(1, (p.life - p.t) / 380));
        ctx.fillStyle = p.c;
        ctx.fillRect(Math.round(p.x - p.w / 2), Math.round(p.y - p.h * flip / 2), Math.round(p.w), Math.max(1, Math.round(p.h * flip)));
      });
      ctx.globalAlpha = 1;
      if (fx.parts.length) fx.raf = requestAnimationFrame(tick);
      else { ctx.clearRect(0, 0, cv.width, cv.height); fx = null; }
    };
    fx.raf = requestAnimationFrame(tick);
  }

  /* ══ 6. API publique ══ */
  window.showCelebration = function(detail){
    const d = detail || {};
    if (d.kind && Array.isArray(d.cards)) { enqueue(d); pump(); return; }
    const G = typeof GAME !== 'undefined' ? GAME.gems : { resist: 10, quest: 15, allQuests: 30 };
    if (d.kind === 'resist' || (d.type === 'xp' && d.reason === 'resist')) {
      enqueue(buildResist({ xp: { resist: +d.amount || (typeof XP_RULES !== 'undefined' ? XP_RULES.resist : 150) }, gems: { resist: G.resist }, quests: [], allDone: false }));
      pump(); return;
    }
    if (d.type === 'quest-done' || d.type === 'quests-all-done' || d.kind === 'quest') {
      const q = d.quest ? [d.quest] : [];
      const all = d.type === 'quests-all-done' || !!d.allDone;
      enqueue({ kind: 'quest', raw: { xp: { quete: q.reduce((s, x) => s + (+x.xp || 0), 0) },
        gems: { quete: q.length * G.quest, 'toutes-quetes': all ? G.allQuests : 0 }, quests: q, allDone: all } });
      pump(); return;
    }
    if (d.type) onGame({ detail: d });
  };

  // Préchauffe le sprite heureux du compagnon courant (affichage instantané)
  const warm = () => { try { happySprite(typeof currentTheme !== 'undefined' ? currentTheme : 'foxy'); } catch(e){} };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', warm); else setTimeout(warm, 0);
})();
