/* ════════════════════════════════════════════════════════════
   Morceau gantelet « serie » — écran #s-serie
   · Gros compteur de jours sans achat impulsif + flamme pixel
   · Semaine en cours, calendrier du mois (bande de série),
     boucliers (état protégé / non protégé), achat d'un bouclier
   · Données : gameSnapshot(), progress.activeDays, progress.since
   · Rendu à l'entrée : go() est enveloppé (on rappelle toujours
     la version précédente, d'autres morceaux peuvent l'envelopper aussi)
════════════════════════════════════════════════════════════ */
(function(){
  const SHIELD_LOG = 'visioncopie_serie_boucliers';   // jours où un bouclier a sauvé la série
  const MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
  const WEEK_LBL = ['L','M','M','J','V','S','D'];
  const WEEK_FULL = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
  let monthOffset = 0;          // 0 = mois en cours, -1 = mois précédent…
  let toastTimer = null;

  /* ── Pixel art (flamme, bouclier) ── */
  const FLAME = [
    '..................', '..........a.......', '.........aa.......', '.........aa.......',
    '........abba......', '........acba......', '.......abccba.....', '......abcccba.....',
    '......abcdccba....', '..a..abccdccba....', '..a.abccdddccba...', '.ababbccdedccba...',
    '.abbbccdeeddccba..', 'abbbccddeeedccbba.', 'abbccddeefeddccba.', 'abcccdeeffeeddccba',
    '.accddeffffeedccba', '.abcddeffffeddcca.', '..accdeeffeedccba.', '..aaccddeeddccaa..',
    '....aaccccccaa....', '......aaaaaa......'
  ];
  const SHIELD = [
    '.aaaaaaaaaa.', 'aiwwiiddddda', 'aiwiiiddddda', 'aiiiiiddddda', 'aiiiiiddddda',
    'aiiiiiddddda', '.aiiiidddda.', '.aiiiidddda.', '..aiiiddda..', '...aiidda...',
    '....aida....', '.....aa.....'
  ];
  function pixelSvg(map, cls){
    const h = map.length, w = map[0].length;
    let rects = '';
    map.forEach((row, y) => {
      // regroupe les pixels identiques consécutifs d'une ligne en un seul rectangle
      let x = 0;
      while (x < w) {
        const ch = row[x];
        if (ch === '.') { x++; continue; }
        let n = 1; while (x + n < w && row[x + n] === ch) n++;
        rects += '<rect class="px-' + ch + '" x="' + x + '" y="' + y + '" width="' + n + '" height="1"/>';
        x += n;
      }
    });
    return '<svg class="' + cls + '" viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + rects + '</svg>';
  }
  const shieldSvg = (cls) => pixelSvg(SHIELD, cls || 'sr-px-shield');
  const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 12.5l4 4 8-9" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ── Données ── */
  const $ = id => document.getElementById(id);
  function localDay(y, m, d){ return dayKey(new Date(y, m, d).getTime()); }
  function shieldDays(){
    try { const a = JSON.parse(localStorage.getItem(SHIELD_LOG) || '[]'); return Array.isArray(a) ? a : []; } catch(e){ return []; }
  }
  function logShieldDay(){
    const a = shieldDays(); const k = dayKey();
    if (!a.includes(k)) { a.push(k); try { localStorage.setItem(SHIELD_LOG, JSON.stringify(a.slice(-90))); } catch(e){} }
  }
  function data(){
    const snap = (typeof gameSnapshot === 'function') ? gameSnapshot() : null;
    const streak = snap ? snap.streak : (typeof streakDays === 'function' ? streakDays() : 0);
    const best = Math.max(snap ? (snap.best || 0) : 0, streak);
    const now = new Date();
    // Jours de la série : les `streak` derniers jours, aujourd'hui compris
    const span = new Set();
    for (let i = 0; i < streak; i++) span.add(localDay(now.getFullYear(), now.getMonth(), now.getDate() - i));
    const active = new Set((typeof progress !== 'undefined' && Array.isArray(progress.activeDays)) ? progress.activeDays : []);
    const shields = new Set(shieldDays());
    return {
      streak, best,
      freezes: snap ? snap.freezes : 0,
      gems: snap ? snap.gems : 0,
      max: (typeof GAME !== 'undefined') ? GAME.freeze.max : 2,
      price: (typeof GAME !== 'undefined') ? GAME.freeze.price : 200,
      span, active, shields, today: dayKey(),
      shieldedToday: shields.has(dayKey())
    };
  }
  const plural = (n, one, many) => n + ' ' + (n > 1 ? many : one);
  const fmt = n => Math.round(n).toLocaleString('fr-FR');

  /* Compteur qui monte jusqu'à la valeur de la série à l'entrée de l'écran */
  function countUp(el, to){
    cancelAnimationFrame(countUp.raf);
    const still = (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) || to <= 1;
    if (still) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = Math.min(900, 420 + to * 12);
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(to * e));
      if (p < 1) countUp.raf = requestAnimationFrame(step);
    };
    el.textContent = '0';
    countUp.raf = requestAnimationFrame(step);
  }

  /* ── Rendu ── */
  function renderHero(d, entry){
    const root = document.querySelector('#s-serie .sr');
    root.dataset.state = d.shieldedToday ? 'ice' : 'fire';
    root.dataset.protected = d.freezes > 0 ? '1' : '0';
    // La flamme grandit avec la série : petite braise au début, grand feu dès une semaine
    root.dataset.level = d.streak >= 7 ? '3' : d.streak >= 1 ? '2' : '1';

    const num = $('sr-num');
    if (entry) countUp(num, d.streak); else { cancelAnimationFrame(countUp.raf); num.textContent = fmt(d.streak); }
    num.dataset.len = String(fmt(d.streak).length);
    $('sr-unit').textContent = d.streak > 1 ? 'jours sans achat impulsif' : 'jour sans achat impulsif';
    $('sr-say').textContent = plural(d.streak, 'jour', 'jours') + ' sans achat impulsif';
    $('sr-gems-n').textContent = fmt(d.gems);

    const flame = $('sr-flame');
    if (!flame.firstChild) flame.innerHTML = pixelSvg(FLAME, 'sr-px-flame');
    const comp = $('sr-comp');
    const theme = (typeof themes !== 'undefined' && typeof currentTheme !== 'undefined') ? themes[currentTheme] : null;
    if (theme && comp.getAttribute('src') !== theme.img) comp.src = theme.img;

    const artShield = $('sr-art-shield');
    artShield.innerHTML = d.freezes > 0 ? shieldSvg() + (d.freezes > 1 ? '<b>×' + d.freezes + '</b>' : '') : '';

    // Record : ce qu'il reste pour le battre (jamais culpabilisant)
    const rec = $('sr-record');
    const TROPHY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 3h10v2h3v3a4 4 0 0 1-4 4h-.3A5 5 0 0 1 13 14.9V17h3v4H8v-4h3v-2.1A5 5 0 0 1 8.3 12H8a4 4 0 0 1-4-4V5h3V3zm0 4H6v1a2 2 0 0 0 1 1.7V7zm10 0v2.7A2 2 0 0 0 18 8V7h-1z" fill="currentColor"/></svg>';
    if (d.shieldedToday) {
      rec.innerHTML = '<span class="sr-rec is-ice">' + shieldSvg('sr-px-mini') + '<span>Série sauvée</span></span>'
        + '<span class="sr-rec-left">Ton bouclier a absorbé l’achat d’aujourd’hui.</span>';
    } else if (d.streak > 0 && d.streak >= d.best) {
      rec.innerHTML = '<span class="sr-rec is-new">' + TROPHY + '<span>Nouveau record&nbsp;!</span></span>';
    } else if (d.best > 0) {
      rec.innerHTML = '<span class="sr-rec" title="Plus que ' + (d.best - d.streak) + ' jours pour battre ton record">' + TROPHY
        + '<span>Record <b>' + fmt(d.best) + '&nbsp;j</b><span class="sr-vh">, plus que ' + (d.best - d.streak) + ' jours pour le battre</span></span></span>';
    } else {
      rec.innerHTML = '<span class="sr-rec-left">Ta série commence aujourd’hui.</span>';
    }
  }

  function renderWeek(d){
    const now = new Date();
    const mondayIdx = (now.getDay() + 6) % 7;
    let html = '';
    for (let i = 0; i < 7; i++) {
      const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() - mondayIdx + i);
      const k = dayKey(dt.getTime());
      const isToday = i === mondayIdx, future = i > mondayIdx;
      let cls = 'sr-wd', label = WEEK_FULL[i] + ' ' + dt.getDate() + ' : ';
      if (d.shields.has(k)) { cls += ' is-ice'; label += 'bouclier utilisé'; }
      else if (d.span.has(k)) { cls += ' is-on'; label += 'sans achat impulsif'; }
      else if (future) { cls += ' is-future'; label += 'à venir'; }
      else { cls += ' is-off'; label += isToday ? 'aujourd’hui' : 'hors série'; }
      if (isToday) cls += ' is-today';
      // Un seul glyphe par jour : la pastille-lettre, sa couleur seule porte l'état
      html += '<div class="' + cls + '" role="listitem" aria-label="' + label + '">' + WEEK_LBL[i] + '</div>';
    }
    $('sr-week').innerHTML = html;
  }

  function renderShield(d){
    const box = $('sr-shield');
    const slots = Array.from({ length: d.max }, (_, i) => shieldSvg(i < d.freezes ? 'sr-px-shield' : 'sr-px-shield is-empty')).join('');
    let title, sub, text, btn = '';
    if (d.freezes > 0) {
      title = 'Série protégée';
      sub = plural(d.freezes, 'bouclier actif', 'boucliers actifs') + ' sur ' + d.max;
      text = d.freezes > 1
        ? 'Chaque bouclier absorbe un achat impulsif. Ta série continue, sans repartir à zéro.'
        : 'Un achat impulsif&nbsp;? Ton bouclier l’absorbe et ta série continue, sans repartir à zéro.';
    } else {
      title = 'Protège ta série';
      sub = 'Aucun bouclier actif';
      text = 'Un bouclier absorbe un achat impulsif&nbsp;: ta série continue au lieu de repartir à zéro.';
    }
    if (d.freezes < d.max) {
      const label = d.freezes > 0 ? 'Ajouter un bouclier' : 'Obtenir un bouclier';
      btn = '<button type="button" class="sr-btn sr-btn-ice" onclick="serieGetShield()" aria-label="' + label + ' pour ' + d.price + ' graines">'
        + '<span>' + label + '</span><span class="sr-btn-price"><span aria-hidden="true">🌱</span>' + d.price + '</span></button>';
    } else {
      text = 'Tu as le maximum de boucliers. Ta série est bien gardée.';
    }
    box.innerHTML = '<div class="sr-sh-top"><div class="sr-sh-slots">' + slots + '</div>'
      + '<div class="sr-sh-head"><h2 class="sr-sh-title" id="sr-shield-title">' + title + '</h2><div class="sr-sh-sub">' + sub + '</div></div></div>'
      + '<p class="sr-sh-text">' + text + '</p>' + btn;
  }

  function renderMonth(d){
    const now = new Date();
    const ref = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const y = ref.getFullYear(), m = ref.getMonth();
    const days = new Date(y, m + 1, 0).getDate();
    const lead = (ref.getDay() + 6) % 7;
    const isCurrent = monthOffset === 0;
    const title = MONTHS[m].charAt(0).toUpperCase() + MONTHS[m].slice(1) + (y !== now.getFullYear() ? ' ' + y : ' ' + y);
    $('sr-month-title').textContent = title;
    $('sr-next').disabled = isCurrent;
    $('sr-prev').disabled = monthOffset <= -11;

    // Stats du mois
    let activeN = 0, shieldN = 0, elapsed = 0;
    for (let i = 1; i <= days; i++) {
      const k = localDay(y, m, i);
      if (k > d.today) break;
      elapsed++;
      if (d.active.has(k)) activeN++;
      if (d.shields.has(k)) shieldN++;
    }
    const ratio = elapsed ? activeN / elapsed : 0;
    const badge = ratio >= 1 && activeN > 0 ? 'Parfait' : ratio >= 0.6 ? 'Bravo' : ratio >= 0.3 ? 'Bien' : '';
    $('sr-tiles').innerHTML =
      '<div class="sr-tile">' + (badge ? '<span class="sr-pill sr-pill-fire sr-tile-badge">' + badge + '</span>' : '')
        + '<span class="sr-tile-ic sr-tile-ic-fire">' + CHECK + '</span>'
        + '<div><div class="sr-tile-n">' + activeN + '</div><div class="sr-tile-l">' + (activeN > 1 ? 'jours actifs' : 'jour actif') + '</div></div></div>'
      + '<div class="sr-tile"><span class="sr-tile-ic sr-tile-ic-ice">' + shieldSvg('sr-px-mini') + '</span>'
        + '<div><div class="sr-tile-n">' + shieldN + '</div><div class="sr-tile-l">' + (shieldN > 1 ? 'boucliers utilisés' : 'bouclier utilisé') + '</div></div></div>';

    // Grille : une ligne par semaine, bande continue sur les jours de série
    let html = '<div class="sr-cal-head">' + WEEK_LBL.map(l => '<span>' + l + '</span>').join('') + '</div>';
    const cells = [];
    for (let i = 0; i < lead; i++) cells.push(null);
    for (let i = 1; i <= days; i++) cells.push(i);
    while (cells.length % 7) cells.push(null);
    const dayCell = n => {
      if (n == null) return '<span class="sr-day is-empty"></span>';
      const k = localDay(y, m, n);
      let cls = 'sr-day', said = [];
      if (d.span.has(k)) { cls += ' is-on'; said.push('sans achat impulsif'); }
      else if (k > d.today) cls += ' is-future';
      else cls += ' is-past';
      if (k === d.today) { cls += ' is-today'; said.unshift('aujourd’hui'); }
      if (d.shields.has(k)) { cls += ' is-ice'; said.push('bouclier utilisé'); }
      // « jour actif » reste annoncé aux lecteurs d'écran mais n'ajoute plus de pastille visuelle
      // (un seul glyphe par jour : la couleur/le remplissage du cercle porte l'état)
      if (d.active.has(k)) said.push('jour actif');
      return '<span class="' + cls + '"><b>' + n + '</b>' + (said.length ? '<span class="sr-vh">, ' + said.join(', ') + '</span>' : '') + '</span>';
    };
    for (let r = 0; r < cells.length / 7; r++) {
      const row = cells.slice(r * 7, r * 7 + 7);
      const inSpan = c => row[c] != null && d.span.has(localDay(y, m, row[c]));
      // Les jours consécutifs de la série sont regroupés dans une même bande (enfants de la bande)
      let out = '', c = 0;
      while (c < 7) {
        if (inSpan(c)) {
          let e = c; while (e + 1 < 7 && inSpan(e + 1)) e++;
          const n = e - c + 1;
          out += '<span class="sr-band" style="grid-column:' + (c + 1) + ' / ' + (e + 2) + ';grid-template-columns:repeat(' + n + ',1fr)">';
          for (let i = c; i <= e; i++) out += dayCell(row[i]);
          out += '</span>';
          c = e + 1;
        } else { out += dayCell(row[c]); c++; }
      }
      html += '<div class="sr-cal-row">' + out + '</div>';
    }
    $('sr-cal').innerHTML = html;
    $('sr-cal').setAttribute('aria-label', 'Calendrier de ' + title + ' : ' + plural(activeN, 'jour actif', 'jours actifs'));
  }

  function renderSerie(entry){
    if (!$('s-serie')) return;
    const d = data();
    renderHero(d, entry === true);
    renderWeek(d);
    renderShield(d);
    renderMonth(d);
  }

  /* ── Actions ── */
  function toast(msg, kind){
    const t = $('sr-toast'); if (!t) return;
    t.innerHTML = msg;
    t.className = 'sr-toast is-on' + (kind ? ' is-' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { t.className = 'sr-toast'; }, 3600);
  }
  function serieGetShield(){
    if (document.getElementById('s-boutique')) { go('s-boutique'); return; }
    if (typeof buyFreeze !== 'function') return;
    const r = buyFreeze();
    const d = data();
    if (r && r.ok) {
      renderSerie();
      const art = $('sr-art-shield'); if (art) { art.classList.remove('is-pop'); void art.offsetWidth; art.classList.add('is-pop'); }
      toast('<b>Bouclier activé&nbsp;!</b> Ta série est protégée.', 'ice');
    } else if (r && r.why === 'max') {
      toast('Tu as déjà ' + d.max + ' boucliers, c’est le maximum.', 'ice');
    } else if (r && r.why === 'graines') {
      const miss = d.price - d.gems;
      toast('<b>Encore ' + miss + ' graines.</b> Résiste à une tentation (+' + GAME.gems.resist + ') ou termine une quête (+' + GAME.gems.quest + ').', 'fire');
    }
  }
  function serieMonth(step){
    monthOffset = Math.max(-11, Math.min(0, monthOffset + step));
    renderMonth(data());
  }

  window.renderSerie = renderSerie;
  window.serieGetShield = serieGetShield;
  window.serieMonth = serieMonth;

  /* Un bouclier vient d'absorber un achat : on note le jour (calendrier) */
  window.addEventListener('vision:game', e => {
    const t = e && e.detail && e.detail.type;
    if (t === 'freeze-used') logShieldDay();
    const s = $('s-serie');
    if (s && s.classList.contains('active')) { try { renderSerie(); } catch(err){} }
  });

  /* Rendu à l'entrée de l'écran (on enveloppe go sans casser les autres enveloppes) */
  if (typeof go === 'function') {
    const _prevGo = go;
    go = function(id){
      const r = _prevGo.apply(this, arguments);
      if (id === 's-serie') {
        monthOffset = 0;
        try { renderSerie(true); } catch(err){ console.error(err); }
        const sc = $('sr-scroll'); if (sc) sc.scrollTop = 0;
      }
      return r;
    };
  }

  /* Entrée depuis l'accueil : la ligne « 🔥 n jours sans craquage » ouvre la série */
  const homeStreak = $('home-streak');
  if (homeStreak && !homeStreak.dataset.serieLink) {
    homeStreak.dataset.serieLink = '1';
    homeStreak.setAttribute('role', 'button');
    homeStreak.setAttribute('tabindex', '0');
    homeStreak.title = 'Voir ma série';
    homeStreak.style.cursor = 'pointer';
    homeStreak.addEventListener('click', () => go('s-serie'));
    homeStreak.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('s-serie'); } });
  }

  try { renderSerie(); } catch(err){}
})();
