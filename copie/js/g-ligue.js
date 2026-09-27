/* ════════════════════════════════════════════════════════════
   Morceau gantelet « ligue » — écran #s-ligue
   · Rangée des 7 ligues (écussons pixel : de la graine à la forêt)
   · Classement de la semaine : 9 joueurs fictifs + toi (js/game.js)
   · Médailles top 3, zones de montée / descente, ta ligne en surbrillance
   · Bulle du compagnon : combien d'XP (de tentations résistées) il manque
   · Rendu à l'entrée (go) et à chaque événement 'vision:game'
════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Pixel art 16×16 des 7 ligues (croissance du compagnon) ── */
  const PX = {
    G:'#2e8b3a', g:'#4cb944', l:'#8edb5a',
    B:'#6e4220', b:'#a0632c', t:'#d9a066', s:'#8a5a33',
    P:'#d9477e', p:'#ff78a8', q:'#ffc2d8',
    y:'#ffd23f', Y:'#f5a623', w:'#ffffff',
    T:'#8b5a2b', F:'#1f7a4a', f:'#35a868', r:'#e8455a'
  };
  const ICONS = [
    [ // Graine
      '................','................','................','................','.......tt.......',
      '......ttwt......','.....ttwwtb.....','.....ttwttb.....','....tttttttb....','....ttttttbb....',
      '....bttttbbB....','.....bbbbBB.....','..ssss.BBB.sss..','.ssssssssssssss.','..BBBBBBBBBBBB..','................'],
    [ // Pousse
      '................','................','................','................','..lll......lll..',
      '.lgggl....lgggl.','.lggggl..lggggl.','..lgggGggGgggl..','...gggGggGggg...','......gGGg......',
      '.......gG.......','.......gG.......','..ssss.gG.ssss..','.ssssssssssssss.','..BBBBBBBBBBBB..','................'],
    [ // Bourgeon
      '................','................','.......pp.......','......pqpp......','......pqpP......',
      '......ppPP......','......gpPg......','.......gG.......','..lll..gG..lll..','.lgggl.gG.lgggl.',
      '..lgggggGgggGl..','....ggggGGgg....','..ssss.gG.ssss..','.ssssssssssssss.','..BBBBBBBBBBBB..','................'],
    [ // Fleur
      '................','.....pp..pp.....','....pqpppqpp....','....ppppppPp....','..pppppyyppppp..',
      '.pqpppyYYyppPPp.','.ppppyYYYYyPPpp.','..pppyYYYYyppp..','...PpPyyyyPpP...','....PPPgGPPP....',
      '..lll..gG..lll..','.lgggl.gG.lgggl.','..sssggGGggsss..','.ssssssssssssss.','..BBBBBBBBBBBB..','................'],
    [ // Arbuste
      '................','................','................','.....llll.......','...llgggglll....',
      '..lggrgggggll...','.lggggggglgggl..','.lgggggrggggggl.','.ggGggggggGrggg.','.gGGgrgGggGGggg.',
      '..GGGGGGGGGGGG..','...GGG.TT.GGG...','..ssss.TT.ssss..','.ssssssssssssss.','..BBBBBBBBBBBB..','................'],
    [ // Arbre
      '.....llll.......','...llggggll.....','..lggggggggll...','.lggglggggggl...','.lgggggggggGgl..',
      'lggggggglgggggl.','lgggGgggggggGgg.','.ggGGgggggGGGgg.','.gGGGGgggGGGGg..','..GGGGGGGGGGG...',
      '....GG.TT.GG....','.......TT.......','..ssss.TT.ssss..','.ssssssssssssss.','..BBBBBBBBBBBB..','................'],
    [ // Forêt
      '..........f.....','.........fff....','....f....fff....','...fff..fffff...','...fff..ffFff...',
      '..fffff.fffff...','..ffFff.fffff...','.fffffffffFfff..','.ffFffffffffff..','fffffffffffFfff.',
      'fffffFf.ffffff..','....T.....T.....','..ssTs....Tsss..','.ssssssssssssss.','..BBBBBBBBBBBB..','................']
  ];
  /* Couleurs d'écusson par ligue : [bord, profondeur, fond] */
  const TIER_COLORS = [
    ['#e0a266', '#b8773f', '#fdf1e4'],
    ['#94d455', '#68aa2f', '#f1fae6'],
    ['#ffca3d', '#dca000', '#fff8e0'],
    ['#ff93b9', '#de6590', '#fff0f5'],
    ['#62c9ee', '#2f9fc8', '#e9f8fd'],
    ['#3dbf83', '#239260', '#e6f7ee'],
    ['#a98ef6', '#7e62e0', '#f3effe']
  ];
  const LOCKED = ['#e5e5e5', '#cdcdcd', '#f5f5f5'];

  const SHIELD = 'M16 4H80Q92 4 92 16V52C92 78 72 96 48 104C24 96 4 78 4 52V16Q4 4 16 4Z';
  const FIELD  = 'M21 13H75Q83 13 83 21V52C83 72 67 86 48 94C29 86 13 72 13 52V21Q13 13 21 13Z';

  function iconRects(rows, mono){
    let out = '';
    rows.forEach((row, y) => {
      let x = 0;
      while (x < 16) {
        const c = row[x];
        if (c === '.') { x++; continue; }
        let w = 1;
        while (x + w < 16 && row[x + w] === c) w++;
        out += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1" fill="' + (mono || PX[c]) + '"/>';
        x += w;
      }
    });
    return out;
  }

  function badgeSVG(i, state){
    const locked = state === 'locked';
    const c = locked ? LOCKED : TIER_COLORS[i];
    const icon = iconRects(ICONS[i], locked ? '#dedede' : null);
    const lock = locked
      ? '<g transform="translate(37 64) scale(1.4)"><path d="M4 7V4.6a4 4 0 0 1 8 0V7" fill="none" stroke="#adadad" stroke-width="2.6"/><rect x="0" y="6" width="16" height="12" rx="3.5" fill="#b4b4b4"/><rect x="7" y="9.5" width="2" height="5" rx="1" fill="#f5f5f5"/></g>'
      : '';
    return '<svg class="lg-badge" viewBox="0 0 96 112" aria-hidden="true" focusable="false">'
      + '<path d="' + SHIELD + '" transform="translate(0 7)" fill="' + c[1] + '"/>'
      + '<path d="' + SHIELD + '" fill="' + c[0] + '"/>'
      /* biseau : reflet clair en haut à gauche, ombre propre en bas à droite (aplats, pas d'ombre portée) */
      + (locked ? '' : '<path d="M16 4H50L44 13H21Q13 13 13 21V46L4 52V16Q4 4 16 4Z" fill="#fff" opacity=".42"/>')
      + '<path d="M92 50V52C92 78 72 96 48 104V94C67 86 83 72 83 52V44Z" fill="' + c[1] + '" opacity="' + (locked ? '.35' : '.5') + '"/>'
      + '<path d="' + FIELD + '" fill="' + c[2] + '"/>'
      + '<g transform="translate(20 16) scale(3.5)" shape-rendering="crispEdges">' + icon + '</g>'
      + lock
      + '</svg>';
  }
  /* Petites étincelles pixel autour de l'écusson courant */
  function sparkSVG(color, cls){
    return '<svg class="lg-spark ' + cls + '" viewBox="0 0 5 5" aria-hidden="true" focusable="false" shape-rendering="crispEdges">'
      + '<rect x="2" y="0" width="1" height="5" fill="' + color + '"/><rect x="0" y="2" width="5" height="1" fill="' + color + '"/></svg>';
  }

  /* ── Médailles top 3 ── */
  const MEDALS = [
    { main:'#ffc83a', ring:'#f0a800', inner:'#ffdf7a', ink:'#7a4d00', rib:'#ff6b6b', rib2:'#e04848' },
    { main:'#d3dde8', ring:'#a9b8c9', inner:'#e9eff5', ink:'#3f4d5c', rib:'#5aa9e6', rib2:'#3d8bc9' },
    { main:'#eaa06a', ring:'#c97a41', inner:'#f6c197', ink:'#6a3510', rib:'#7fc97a', rib2:'#5aa856' }
  ];
  function medalSVG(rank){
    const m = MEDALS[rank - 1];
    return '<svg viewBox="0 0 32 36" width="34" height="38" aria-hidden="true" focusable="false">'
      + '<path d="M9 18L4.5 32.5l5.2-1.6L12.6 35 16.5 22z" fill="' + m.rib2 + '"/>'
      + '<path d="M23 18l4.5 14.5-5.2-1.6L19.4 35 15.5 22z" fill="' + m.rib + '"/>'
      + '<circle cx="16" cy="14" r="12.5" fill="' + m.ring + '"/>'
      + '<circle cx="16" cy="13" r="11" fill="' + m.main + '"/>'
      + '<circle cx="16" cy="13" r="8" fill="' + m.inner + '"/>'
      + '<text x="16" y="17.4" text-anchor="middle" font-family="Work Sans, Inter, sans-serif" font-size="12.5" font-weight="800" fill="' + m.ink + '">' + rank + '</text>'
      + '</svg>';
  }

  /* ── Avatars à initiale pour les joueurs fictifs (blanc sur couleur ≥ 3:1) ── */
  const AV_COLORS = ['#e0457b', '#1f8fd6', '#0f9a78', '#7a5af8', '#c2570f', '#2e8f9c', '#d64545', '#8e44ad', '#5b8c1a', '#4a6cf7', '#b5418f', '#9a6a2e'];
  function hash(str){ let h = 0; for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0; return h; }
  function avColor(name){
    const i = (typeof LEAGUE_NAMES !== 'undefined') ? LEAGUE_NAMES.indexOf(name) : -1;
    return AV_COLORS[(i >= 0 ? i : hash(name)) % AV_COLORS.length];
  }
  /* Avatar pastel : fond clair (16 % de la couleur) + lettre foncée (78 %) → contraste ≥ 3:1 (texte large) */
  function avTone(hex, k, toWhite){
    const v = parseInt(hex.slice(1), 16);
    return 'rgb(' + [v >> 16 & 255, v >> 8 & 255, v & 255].map(x => Math.round(toWhite ? x * k + 255 * (1 - k) : x * k)).join(',') + ')';
  }
  function initial(name){ const ch = Array.from(String(name).replace(/[^\p{L}\p{N}]/gu, ''))[0] || '?'; return ch.toUpperCase(); }

  const ARROW_UP = '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M7 1.5L1.8 7.4h3.4v5.1h3.6V7.4h3.4z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  const ARROW_DN = '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M7 12.5L1.8 6.6h3.4V1.5h3.6v5.1h3.4z" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>';
  const STAR = '<svg viewBox="0 0 14 14" width="14" height="14" aria-hidden="true"><path d="M7 1.2l1.8 3.7 4 .6-2.9 2.8.7 4L7 10.4l-3.6 1.9.7-4L1.2 5.5l4-.6z" fill="currentColor" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"/></svg>';
  const INFO = '<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="7.1" y="7" width="1.8" height="4.6" rx=".9" fill="currentColor"/><circle cx="8" cy="4.8" r="1.1" fill="currentColor"/></svg>';

  /* ── Utilitaires ── */
  function fmtXp(n){ return Number(n || 0).toLocaleString('fr-FR') + ' XP'; }
  function ordinal(n){ return n === 1 ? '1er' : n + 'e'; }
  function timeLeft(ms){
    ms = Math.max(0, ms || 0);
    const d = Math.floor(ms / 86400000), h = Math.floor(ms / 3600000), m = Math.max(1, Math.floor(ms / 60000));
    if (d >= 2) return d + ' jours restants';
    if (d === 1) return '1 jour restant';
    if (h >= 1) return h + ' h restantes';
    return m + ' min restantes';
  }
  /* Couleurs dérivées du compagnon, en rgb() (lisibles par tous les navigateurs et outils) :
     encre ≥ 4.5:1 sur blanc, teinte de fond, bordures */
  function themeColors(){
    let hex = '';
    try { hex = getComputedStyle(document.documentElement).getPropertyValue('--og').trim(); } catch(e){}
    const m = /^#?([0-9a-f]{6})$/i.exec(hex) || ['', 'ff7e00'];
    const v = parseInt(m[1], 16), c = [v >> 16 & 255, v >> 8 & 255, v & 255];
    const mix = k => 'rgb(' + c.map(x => Math.round(x * k + 255 * (1 - k))).join(',') + ')';
    return {
      ink: 'rgb(' + c.map(x => Math.round(x * 0.6)).join(',') + ')',
      tint: mix(0.11), line: mix(0.42), ring: mix(0.55)
    };
  }
  function compSprite(pose){
    const key = (typeof currentTheme !== 'undefined') ? currentTheme : 'foxy';
    const t = (typeof themes !== 'undefined' && themes[key]) ? themes[key] : null;
    if (pose === 'up' && typeof COMP_BLINK_SPRITES !== 'undefined' && COMP_BLINK_SPRITES[key] && COMP_BLINK_SPRITES[key].dirs) return COMP_BLINK_SPRITES[key].dirs[0];
    return t ? t.img : 'assets/comp-foxy.png';
  }
  function compName(){
    const key = (typeof currentTheme !== 'undefined') ? currentTheme : 'foxy';
    return (typeof themes !== 'undefined' && themes[key]) ? themes[key].name : 'Ton compagnon';
  }
  function resistXp(){ return (typeof XP_RULES !== 'undefined' && XP_RULES.resist) ? XP_RULES.resist : 150; }
  function myName(){ return (typeof userName !== 'undefined' && String(userName).trim()) ? String(userName).trim() : ''; }

  /* ── Rendu ── */
  function renderTiers(tier){
    const box = document.getElementById('lg-tiers'); if (!box) return;
    box.innerHTML = LEAGUE_TIERS.map((name, i) => {
      const state = i < tier ? 'past' : (i === tier ? 'cur' : 'locked');
      const label = 'Ligue ' + name + (state === 'cur' ? ' (ta ligue actuelle)' : state === 'past' ? ' (déjà franchie)' : ' (verrouillée)');
      const sparks = state === 'cur' ? sparkSVG(TIER_COLORS[i][1], 's1') + sparkSVG(TIER_COLORS[i][0], 's2') + sparkSVG(TIER_COLORS[i][1], 's3') : '';
      return '<div class="lg-tier is-' + state + '" role="listitem" aria-label="' + label + '"' + (state === 'cur' ? ' aria-current="true"' : '') + '>' + badgeSVG(i, state) + sparks + '</div>';
    }).join('');
    // Centre l'écusson courant (seulement si l'écran est visible)
    requestAnimationFrame(() => {
      const cur = box.querySelector('.is-cur');
      if (cur && box.clientWidth) box.scrollLeft = cur.offsetLeft + cur.offsetWidth / 2 - box.clientWidth / 2;
    });
  }

  function rowHTML(p){
    const rank = p.rank <= 3 ? medalSVG(p.rank) : '<span class="lg-num">' + p.rank + '</span>';
    let av, name;
    if (p.me) {
      const n = myName();
      av = '<div class="lg-av lg-av-me"><img src="' + escHTML(compSprite()) + '" alt=""></div>';
      name = '<span class="lg-name-txt">' + escHTML(n || 'Toi') + '</span>' + (n ? '<span class="lg-you">toi</span>' : '');
    } else {
      const col = avColor(p.name);
      av = '<div class="lg-av" style="background:' + avTone(col, 0.16, true) + ';color:' + avTone(col, 0.78) + '"><span>' + escHTML(initial(p.name)) + '</span></div>';
      name = '<span class="lg-name-txt">' + escHTML(p.name) + '</span>';
    }
    const who = p.me ? 'toi' : p.name + ' (joueur fictif)';
    return '<div class="lg-row' + (p.me ? ' is-me' : '') + '" role="listitem" aria-label="' + escHTML(ordinal(p.rank) + ', ' + who + ', ' + p.xp + ' XP') + '"' + (p.me ? ' aria-current="true"' : '') + '>'
      + '<div class="lg-rank" aria-hidden="true">' + rank + '</div>'
      + av
      + '<div class="lg-name" aria-hidden="true">' + name + '</div>'
      + '<div class="lg-xp" aria-hidden="true">' + fmtXp(p.xp) + '</div>'
      + '</div>';
  }

  function renderLigue(){
    const screen = document.getElementById('s-ligue');
    if (!screen || typeof leagueStandings !== 'function') return;
    const list = leagueStandings();              // déclenche aussi le changement de semaine
    const tierName = leagueName();
    const tier = Math.max(0, LEAGUE_TIERS.indexOf(tierName));
    const L = GAME.league;
    const up = tier < LEAGUE_TIERS.length - 1, down = tier > 0;

    const tc = themeColors();
    screen.style.setProperty('--lg-ink', tc.ink);
    screen.style.setProperty('--lg-tint', tc.tint);
    screen.style.setProperty('--lg-tint-line', tc.line);
    screen.style.setProperty('--lg-ring', tc.ring);

    document.getElementById('lg-title').textContent = 'Ligue ' + tierName;
    document.getElementById('lg-time').textContent = timeLeft(leagueEndsIn());
    renderTiers(tier);

    // Règle du jeu (texte contrôlé, aucune saisie utilisateur)
    document.getElementById('lg-rule').innerHTML =
      (up ? 'Les <b>' + L.promote + ' premiers</b> montent, ' : '')
      + (down ? (up ? 'les ' : 'Les ') + '<b>' + L.demote + ' derniers</b> descendent' : 'personne ne descend')
      + (up ? '.' : ' : vise le <b>podium</b> !')
      + '<br>Chaque tentation résistée : <b>+' + resistXp() + ' XP</b>.';

    let rows = '';
    list.forEach((p, i) => {
      if (i === L.promote) rows += up
        ? '<div class="lg-zone is-up" role="listitem">' + ARROW_UP + '<span>Zone de montée</span>' + ARROW_UP + '</div>'
        : '<div class="lg-zone is-up" role="listitem">' + STAR + '<span>Podium de la Forêt</span>' + STAR + '</div>';
      if (down && i === L.size - L.demote) rows += '<div class="lg-zone is-down" role="listitem">' + ARROW_DN + '<span>Zone de descente</span>' + ARROW_DN + '</div>';
      rows += rowHTML(p);
    });
    const box = document.getElementById('lg-list');
    box.innerHTML = '<p class="lg-note">' + INFO + '<span>Joueurs fictifs : pseudos inventés, XP simulée.</span></p>'
      + '<div class="lg-rows" role="list" aria-label="Classement de la semaine">' + rows + '</div>';

    renderCoach(list, tier, up, down);

    // Amène ta ligne à l'écran si elle est hors champ
    requestAnimationFrame(() => {
      const me = box.querySelector('.is-me');
      if (!me || !box.clientHeight) return;
      const top = me.offsetTop, bottom = top + me.offsetHeight;   // .lg-list est le parent positionné
      if (bottom > box.scrollTop + box.clientHeight - 8 || top < box.scrollTop) box.scrollTop = Math.max(0, top - box.clientHeight / 2 + me.offsetHeight / 2);
    });
  }

  function renderCoach(list, tier, up, down){
    const el = document.getElementById('lg-coach'); if (!el) return;
    const L = GAME.league, me = list.find(p => p.me); if (!me) { el.innerHTML = ''; return; }
    const per = resistXp();
    const tries = gap => { const n = Math.max(1, Math.ceil(gap / per)); return 'Résiste à ' + n + ' tentation' + (n > 1 ? 's' : '') + ' et tu y es.'; };
    const lw = (typeof progress !== 'undefined' && progress.lastWeek && progress.lastWeek.week !== progress.week) ? progress.lastWeek : null;
    let title, sub;
    if (!me.xp) {
      if (lw && lw.to > lw.from) { title = 'Bienvenue en ' + LEAGUE_TIERS[lw.to] + ' !'; sub = 'Tu as fini ' + ordinal(lw.rank) + ' de ta dernière ligue. Bravo !'; }
      else if (lw && lw.xp > 0) { title = 'Nouvelle semaine, nouveau départ'; sub = 'Une envie d’achat résistée : +' + per + ' XP.'; }
      else { title = 'À toi de jouer !'; sub = 'Une envie d’achat résistée : +' + per + ' XP.'; }
    } else if (me.rank <= L.promote) {
      title = me.rank === 1 ? 'Tu mènes la ligue !' : 'Tu es dans la zone de montée !';
      sub = up ? 'Tiens bon jusqu’à dimanche soir pour passer en ' + LEAGUE_TIERS[tier + 1] + '.' : 'Tu es sur le podium de la Forêt, bravo.';
    } else if (down && me.rank > L.size - L.demote) {
      const gap = Math.max(10, list[L.size - L.demote - 1].xp - me.xp);
      title = 'Plus que ' + fmtXp(gap) + ' pour être à l’abri';
      sub = tries(gap);
    } else {
      const gap = Math.max(10, list[L.promote - 1].xp - me.xp);
      title = 'Plus que ' + fmtXp(gap) + (up ? ' pour monter !' : ' pour le podium !');
      sub = tries(gap);
    }
    el.innerHTML = '<div class="lg-coach-sprite"><img src="' + escHTML(compSprite('up')) + '" alt="' + escHTML(compName()) + '"></div>'
      + '<div class="lg-coach-txt"><div class="lg-coach-title">' + escHTML(title) + '</div><div class="lg-coach-sub">' + escHTML(sub) + '</div></div>';
  }

  window.renderLigue = renderLigue;
  function safeRender(){ try { renderLigue(); } catch(e){ console.error(e); } }

  /* ── Entrée d'écran : on enveloppe go() sans toucher core.js (chaîné avec les autres morceaux) ── */
  if (typeof go === 'function') {
    const prevGo = go;
    go = function(id){
      const r = prevGo.apply(this, arguments);
      if (id === 's-ligue') safeRender();
      return r;
    };
  }

  /* ── Mises à jour en direct (XP gagnée, changement de ligue…) ── */
  window.addEventListener('vision:game', () => {
    const s = document.getElementById('s-ligue');
    if (s && s.classList.contains('active')) safeRender();
  });

  /* Premier rendu (contenu présent même avant la première visite) */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', safeRender); else setTimeout(safeRender, 0);
})();
