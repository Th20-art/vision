/* ════════════════════════════════════════════════════════════
   Morceau gantelet « rappels » — un petit signe par jour, jamais de pression
   · showReminderPrimer() : amorce plein écran en 2 temps
       1) demande unique : compagnon + bulle (le bénéfice), aperçu du
          rappel, UN bouton principal + UN lien discret « Plus tard »
       2) choix du moment (matin/midi/soir, soir pré-coché) affiché
          seulement après acceptation, confirmé par « C'est parti »
          (c'est là qu'on demande la permission de notification)
   · Coup de pouce doux sur l'accueil quand la journée n'est pas encore
     active (au plus une fois par jour) → pointe la prochaine quête
   · Rappel réel : notification système si autorisée (app en arrière-plan),
     sinon rappel dans l'app à l'ouverture de l'accueil
   · Stockage : visioncopie_rappel = { moment, mode, since, offered }
       moment : 'matin' | 'midi' | 'soir' | null
       mode   : 'notif' | 'app' | 'plus-tard' | 'off'
   API commune : js/game.js (dailyQuests, isActiveDay, dayKey, questsResetIn)
════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var KEY       = 'visioncopie_rappel';
  var NUDGE_KEY = 'visioncopie_rappel_coup';    // jour du dernier coup de pouce
  var FIRED_KEY = 'visioncopie_rappel_envoi';   // jour du dernier rappel envoyé

  var MOMENTS = {
    matin: { lbl: 'Matin', h: 8,  m: 30, tm: '8 h 30',  each: 'chaque matin', when: 'ce matin', tmr: 'demain matin' },
    midi:  { lbl: 'Midi',  h: 12, m: 30, tm: '12 h 30', each: 'chaque midi',  when: 'ce midi',  tmr: 'demain midi' },
    soir:  { lbl: 'Soir',  h: 20, m: 0,  tm: '20 h',    each: 'chaque soir',  when: 'ce soir',  tmr: 'demain soir' }
  };

  /* Couleur d'action par compagnon : même famille que --og, mais foncée
     pour que le texte blanc passe l'AA (≥ 4,5:1), + teinte du rebord 3D */
  var DEEP = {
    foxy: ['#c2410c', '#9a3412'],
    malo: ['#c0267e', '#8f1c5e'],
    elio: ['#b45309', '#92400e'],
    ryo:  ['#1b6ac8', '#154f96']
  };

  /* Quête → action concrète + petite phrase d'encouragement */
  var QUEST_ACTIONS = {
    resist:  { hint: 'Une envie repoussée ? Note-la',  run: function(){ if (typeof openJournal === 'function') openJournal(); } },
    journal: { hint: 'Deux lignes suffisent',              run: function(){ if (typeof openJournal === 'function') openJournal(); } },
    checkin: { hint: '30 secondes pour souffler',          run: function(){ go('s-emo'); } },
    capsule: { hint: 'Ton message à toi-même',             run: function(){ go('s-param-video'); } },
    analyse: { hint: 'Un article, un regard neuf',         run: function(){ go('s-article'); } },
    xp:      { hint: 'Chaque petit pas compte',            run: function(){ if (typeof openJournal === 'function') openJournal(); } }
  };

  /* ── Petits utilitaires ── */
  function $(id){ return document.getElementById(id); }
  function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
  function lsGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
  function lsSet(k, v){ try { localStorage.setItem(k, v); } catch(e){} }
  function today(){ return (typeof dayKey === 'function') ? dayKey() : new Date().toDateString(); }

  function load(){
    try { var s = JSON.parse(lsGet(KEY) || 'null'); return (s && typeof s === 'object') ? s : null; } catch(e){ return null; }
  }
  function save(s){ lsSet(KEY, JSON.stringify(s)); }
  function isOn(s){
    s = s || load();
    return !!(s && s.moment && MOMENTS[s.moment] && (s.mode === 'notif' || s.mode === 'app'));
  }

  function themeKey(){ return (typeof currentTheme !== 'undefined' && currentTheme) ? currentTheme : 'foxy'; }
  function compName(){ try { return themes[themeKey()].name; } catch(e){ return 'Ton compagnon'; } }
  function compImg(){ try { return themes[themeKey()].img; } catch(e){ return 'assets/comp-foxy.png'; } }
  function compBlink(){ try { return COMP_BLINK_SPRITES[themeKey()].close || null; } catch(e){ return null; } }
  function goal(){
    var a = (typeof userAmbitions !== 'undefined' && userAmbitions && userAmbitions[0]) || null;
    return a && a.label ? a.label : 'ton objectif';
  }
  function streak(){ try { return streakDays(); } catch(e){ return 0; } }
  function activeToday(){ try { return isActiveDay(dayKey()); } catch(e){ return false; } }
  function nextQuest(){
    try { var l = dailyQuests(); for (var i = 0; i < l.length; i++) if (!l[i].done) return l[i]; } catch(e){}
    return null;
  }

  function fmtDur(ms){
    var mins = Math.max(1, Math.round(ms / 60000));
    var h = Math.floor(mins / 60), m = mins % 60;
    return h ? (h + ' h ' + String(m).padStart(2, '0')) : (m + ' min');
  }
  function nextAt(moment){
    var M = MOMENTS[moment], d = new Date();
    var t = new Date(d.getFullYear(), d.getMonth(), d.getDate(), M.h, M.m, 0, 0);
    var tomorrow = false;
    if (t.getTime() <= Date.now()) { t.setDate(t.getDate() + 1); tomorrow = true; }
    return { date: t, tomorrow: tomorrow };
  }
  function hhmm(M){ return String(M.h).padStart(2, '0') + ':' + String(M.m).padStart(2, '0'); }

  /* Contraste (pour un thème inconnu : on fonce --og jusqu'à l'AA) */
  function _rgb(hex){
    hex = String(hex || '').trim().replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(function(c){ return c + c; }).join('');
    var n = parseInt(hex, 16); if (isNaN(n)) return [194, 65, 12];
    return [n >> 16 & 255, n >> 8 & 255, n & 255];
  }
  function _lum(c){
    var f = function(v){ v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  }
  function _hex(c){ return '#' + c.map(function(v){ return ('0' + Math.round(v).toString(16)).slice(-2); }).join(''); }
  function deepPair(){
    var k = themeKey();
    if (DEEP[k]) return DEEP[k];
    var c = _rgb(getComputedStyle(document.documentElement).getPropertyValue('--og') || '#ff7e00'), n = 0;
    while ((1.05 / (_lum(c) + 0.05)) < 5 && n++ < 60) c = c.map(function(v){ return v * 0.96; });
    return [_hex(c), _hex(c.map(function(v){ return v * 0.78; }))];
  }
  function paint(el){
    var p = deepPair();
    el.style.setProperty('--rp-deep', p[0]);
    el.style.setProperty('--rp-lip', p[1]);
  }

  /* ── Pixel art (même langage que les compagnons) ── */
  function pix(n, px, fill){
    var r = '';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) {
      var c = fill(x, y);
      if (c) r += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>';
    }
    return '<svg viewBox="0 0 ' + n + ' ' + n + '" width="' + (n * px) + '" height="' + (n * px) + '" shape-rendering="crispEdges" aria-hidden="true" focusable="false">' + r + '</svg>';
  }
  function has(list, x, y){ return list.indexOf(x + ',' + y) !== -1; }
  var SUN = '#ffc93c', SUN_EDGE = '#ff9f1c', RAY = '#ffb627', HILITE = '#fff3b8';
  var ICONS = {
    matin: function(){
      var rays = ['7,2', '7,3', '2,5', '3,6', '12,5', '11,6', '0,9', '1,9', '13,9', '14,9'];
      return pix(15, 3, function(x, y){
        if (y === 11) return '#ff8a4c';
        if (y === 13 && x >= 4 && x <= 10) return '#ffc4a3';
        if (y < 11) {
          var d = Math.hypot(x + .5 - 7.5, y + .5 - 11);
          if (d <= 4.3) return (x === 5 && y === 8) || (x === 6 && y === 7) ? HILITE : SUN;
          if (d <= 5.3) return SUN_EDGE;
          if (has(rays, x, y)) return RAY;
        }
        return null;
      });
    },
    midi: function(){
      var rays = ['7,0', '7,1', '7,13', '7,14', '0,7', '1,7', '13,7', '14,7', '2,2', '3,3', '12,12', '11,11', '2,12', '3,11', '12,2', '11,3'];
      return pix(15, 3, function(x, y){
        var d = Math.hypot(x + .5 - 7.5, y + .5 - 7.5);
        if (d <= 3.4) return (x === 6 && y === 5) || (x === 5 && y === 6) ? HILITE : SUN;
        if (d <= 4.4) return SUN_EDGE;
        return has(rays, x, y) ? RAY : null;
      });
    },
    soir: function(){
      var star = ['12,2', '11,3', '12,3', '13,3', '12,4'], dots = ['8,1', '14,8'];
      return pix(15, 3, function(x, y){
        var d1 = Math.hypot(x + .5 - 6.5, y + .5 - 8), d2 = Math.hypot(x + .5 - 9.5, y + .5 - 5.5);
        if (d1 <= 5.4 && d2 > 4.6) return d1 > 4.5 ? '#f5a300' : ((x === 3 && y === 7) || (x === 3 && y === 8) ? HILITE : SUN);
        if (has(star, x, y)) return '#8b7cf6';
        if (has(dots, x, y)) return '#b9aefc';
        return null;
      });
    }
  };
  /* Cloche pixel tenue par le compagnon */
  var BELL_ROWS = [
    '.......D.......',
    '......YYY......',
    '.R...YHYYS...R.',
    'R...YHYYYYS...R',
    '....YHYYYYS....',
    '....YYYYYYS....',
    'R..YYYYYYYYS..R',
    '.R.YYYYYYYYS.R.',
    '..YYYYYYYYYYS..',
    '..SSSSSSSSSSS..',
    '......DDD......',
    '...............',
    '...............',
    '...............',
    '...............'
  ];
  function bellSvg(){
    var pal = { Y: '#ffc93c', S: '#f0a000', H: '#fff3b8', D: '#c96f00', R: '#ffb627' };
    return pix(15, 3, function(x, y){ var ch = (BELL_ROWS[y] || '')[x]; return pal[ch] || null; });
  }
  var CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CHECK_BIG = '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false"><path d="M5 12.5l4.2 4.2L19 7" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CLOCK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  /* ── Textes (chaleureux, sans culpabilité) ── */
  function streakLine(){
    var d = streak();
    if (d >= 2) return d + ' jours sans achat impulsif, bravo !';
    if (d === 1) return '1 jour sans achat impulsif, bravo !';
    return 'Chaque jour compte.';
  }
  function reminderCopy(moment){
    var name = compName(), g = '« ' + goal() + ' »';
    if (moment === 'matin') return { ti: 'Bonjour ! ' + name + ' est là', tx: 'Un coup d\'œil à ' + g + ' avant de te lancer ? ' + streakLine() };
    if (moment === 'midi')  return { ti: 'Petite pause avec ' + name, tx: '10 secondes pour revoir ' + g + '. ' + streakLine() };
    return { ti: name + ' passe te voir', tx: 'On regarde ' + g + ' ensemble ? ' + streakLine() };
  }

  /* ════════════════ Amorce ════════════════ */
  var sel = 'soir', phase = 'ask', why = null, lastFocus = null, cdTimer = null, blinkTimer = null, bound = false;

  function bind(){
    if (bound) return; bound = true;
    var layer = $('rp-primer'); if (!layer) return;
    layer.querySelectorAll('.rp-mo').forEach(function(b){
      var ic = b.querySelector('.rp-mo-ic'), ck = b.querySelector('.rp-mo-ck');
      if (ic && ICONS[ic.dataset.ic]) ic.innerHTML = ICONS[ic.dataset.ic]();
      if (ck) ck.innerHTML = CHECK;
      b.addEventListener('click', function(){ pick(b.dataset.m); });
    });
    // Flèches ← → dans le groupe radio
    var group = layer.querySelector('.rp-moments');
    if (group) group.addEventListener('keydown', function(e){
      var keys = Object.keys(MOMENTS), i = keys.indexOf(sel);
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') i = (i + 1) % keys.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') i = (i + keys.length - 1) % keys.length;
      else return;
      e.preventDefault(); pick(keys[i]);
      var b = layer.querySelector('.rp-mo[data-m="' + keys[i] + '"]'); if (b) b.focus();
    });
    var bell = $('rp-bell'); if (bell) bell.innerHTML = bellSvg();
    var di = layer.querySelector('.rp-done-ic'); if (di) di.innerHTML = CHECK_BIG;
    // Un seul choix de sortie discret (« Plus tard ») : plus de X dupliqué en haut à gauche.
    // Échap reste le raccourci clavier pour fermer (géré plus bas).
    var x = $('rp-x'); if (x && x.parentNode) x.parentNode.removeChild(x);
    $('rp-cta').addEventListener('click', onCta);
    $('rp-later').addEventListener('click', onLater);
    layer.addEventListener('keydown', function(e){
      if (e.key === 'Escape') { e.preventDefault(); closeReminderPrimer('fermer'); return; }
      if (e.key !== 'Tab') return;   // garde le focus dans la fenêtre
      var f = [].slice.call(layer.querySelectorAll('button:not([hidden]):not([disabled])')).filter(function(x){ return x.offsetParent; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  function pick(m){
    if (!MOMENTS[m]) return;
    sel = m;
    var layer = $('rp-primer');
    layer.querySelectorAll('.rp-mo').forEach(function(b){
      var on = b.dataset.m === m;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
    renderPreview();
  }

  function renderPreview(){
    var M = MOMENTS[sel], c = reminderCopy(sel), n = nextAt(sel);
    $('rp-notif-ti').textContent = c.ti;
    $('rp-notif-tx').textContent = c.tx;
    $('rp-notif-tm').textContent = (n.tomorrow ? 'demain ' : '') + hhmm(M);
    $('rp-cd').innerHTML = CLOCK + '<span>Premier rappel dans ' + fmtDur(n.date.getTime() - Date.now()) + '</span>';
  }

  /* Titre / sous-titre / choix du moment : uniquement à l'étape 2 (le choix).
     À l'étape 1 (la demande), le dialogue garde un nom accessible via
     aria-label puisque rp-title, qui le fournissait, est alors masqué. */
  function setStepChrome(choose){
    var layer = $('rp-primer');
    var sub = layer.querySelector('.rp-ask > .rp-sub');
    var moments = layer.querySelector('.rp-moments');
    $('rp-title').hidden = !choose;
    if (sub) sub.hidden = !choose;
    if (moments) moments.hidden = !choose;
    if (choose) { layer.removeAttribute('aria-label'); layer.setAttribute('aria-labelledby', 'rp-title'); }
    else { layer.removeAttribute('aria-labelledby'); layer.setAttribute('aria-label', 'Rappel quotidien'); }
  }

  /* Étape 1 — une seule demande, comme Duolingo : compagnon + bulle (le
     bénéfice), l'aperçu du rappel, un unique CTA principal et un lien
     discret pour décliner. Pas de choix concurrent. */
  function renderAsk(){
    var s = load();
    if (isOn(s)) { pick(s.moment); renderChoose(true); return; }  // déjà réglé : direct sur le choix du moment
    phase = 'ask'; why = null;
    $('rp-ask').hidden = false;
    $('rp-done').hidden = true;
    setStepChrome(false);
    $('rp-bubble-tx').textContent = 'Un petit signe chaque jour, et penser à « ' + goal() + ' » devient une habitude !';
    $('rp-cta').textContent = 'Rappelle-moi mon objectif';
    $('rp-later').hidden = false;
    $('rp-later').textContent = 'Plus tard';
    pick(sel && MOMENTS[sel] ? sel : 'soir');
  }

  /* Étape 2 — affichée seulement après acceptation : choix matin / midi /
     soir (soir pré-coché), confirmé par « C'est parti ». C'est ici,
     à la confirmation, que la permission de notification est demandée. */
  function renderChoose(silent){
    phase = 'choose'; why = null;
    var s = load();
    $('rp-ask').hidden = false;
    $('rp-done').hidden = true;
    setStepChrome(true);
    $('rp-bubble-tx').textContent = 'Un petit signe chaque jour, et penser à « ' + goal() + ' » devient une habitude !';
    if (isOn(s)) {
      $('rp-cta').textContent = 'Garder ce moment';
      $('rp-later').hidden = false;
      $('rp-later').textContent = 'Désactiver le rappel';
    } else {
      $('rp-cta').textContent = 'C\'est parti';
      $('rp-later').hidden = true;   // la sortie discrète a déjà été proposée à l'étape 1
    }
    pick(isOn(s) ? s.moment : (sel && MOMENTS[sel] ? sel : 'soir'));
    if (!silent) {
      try { var b = $('rp-primer').querySelector('.rp-mo[aria-checked="true"]'); if (b) b.focus(); } catch(e){}
    }
  }

  function renderDone(mode, reason){
    phase = 'done'; why = reason || null;
    var M = MOMENTS[sel];
    $('rp-ask').hidden = true;
    $('rp-done').hidden = false;
    $('rp-bubble-tx').textContent = mode === 'notif'
      ? 'C\'est noté ! Je passerai ' + M.each + ' vers ' + M.tm + '. À tout à l\'heure !'
      : 'C\'est noté ! ' + cap(M.each) + ' vers ' + M.tm + ', je te ferai signe ici, dans Vision.';
    $('rp-done-ti').textContent = 'Rappel activé';
    $('rp-done-tx').textContent = cap(M.each) + ' vers ' + M.tm + (mode === 'notif' ? ' · notification' : ' · dans l\'app');
    $('rp-done-note').textContent =
      reason === 'unsupported' ? 'Ce navigateur ne gère pas les notifications : le rappel s\'affichera à l\'ouverture de Vision.'
      : reason === 'denied'    ? 'Les notifications sont bloquées ici : je te ferai signe à l\'ouverture de Vision. Tu peux les autoriser dans les réglages du navigateur.'
      : reason === 'dismissed' ? 'Pas de notification pour l\'instant : je te ferai signe à l\'ouverture de Vision.'
      : 'Déjà fait un pas dans la journée ? Alors je ne te dérange pas. Tu peux changer le moment dans ton profil.';
    $('rp-cta').textContent = 'C\'est parti';
    $('rp-later').hidden = false;
    $('rp-later').textContent = 'Changer le moment';
    var layer = $('rp-primer');
    layer.removeAttribute('aria-labelledby'); layer.setAttribute('aria-label', 'Rappel activé');
    layer.classList.remove('rp-yay'); void layer.offsetWidth; layer.classList.add('rp-yay');
    try { $('rp-cta').focus(); } catch(e){}
    refreshProfil();
  }

  function onCta(){
    if (phase === 'done') { closeReminderPrimer('ok'); return; }
    if (phase === 'ask')  { renderChoose(); return; }   // étape 1 acceptée → étape 2 (choix du moment)
    var moment = sel, done = false;
    var finish = function(mode, reason){
      if (done) return; done = true;
      save({ moment: moment, mode: mode, since: Date.now(), offered: true });
      renderDone(mode, reason);
    };
    if (!('Notification' in window)) { finish('app', 'unsupported'); return; }
    if (Notification.permission === 'granted') { finish('notif'); return; }
    if (Notification.permission === 'denied')  { finish('app', 'denied'); return; }
    var handle = function(r){ finish(r === 'granted' ? 'notif' : 'app', r === 'granted' ? null : (r === 'denied' ? 'denied' : 'dismissed')); };
    try {
      var p = Notification.requestPermission(handle);   // ancienne signature (callback) + promesse
      if (p && typeof p.then === 'function') p.then(handle, function(){ handle('default'); });
    } catch(e){ finish('app', 'unsupported'); }
  }

  function onLater(){
    if (phase === 'done')   { renderChoose(); return; }               // « Changer le moment »
    if (phase === 'choose') { closeReminderPrimer('off'); return; }   // « Désactiver le rappel » (rappel déjà actif)
    closeReminderPrimer('plus-tard');                                  // étape 1 : le seul déclin, discret
  }

  function startLife(){
    stopLife();
    var img = $('rp-comp-img'), base = compImg(), closed = compBlink();
    cdTimer = setInterval(function(){ if (phase === 'ask') renderPreview(); }, 30000);
    if (closed) blinkTimer = setInterval(function(){
      img.src = closed;
      setTimeout(function(){ img.src = base; }, 160);
    }, 3400);
  }
  function stopLife(){
    if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
    if (blinkTimer) { clearInterval(blinkTimer); blinkTimer = null; }
  }

  function showReminderPrimer(){
    var layer = $('rp-primer'); if (!layer) return;
    bind();
    hideReminderNudge(true);
    paint(layer);
    $('rp-comp-img').src = compImg();
    renderAsk();
    lastFocus = document.activeElement;
    layer.hidden = false;
    layer.classList.remove('rp-in', 'rp-out', 'rp-yay'); void layer.offsetWidth; layer.classList.add('rp-in');
    startLife();
    setTimeout(function(){ try { layer.focus({ preventScroll: true }); } catch(e){} }, 60);
  }

  function closeReminderPrimer(reason){
    var layer = $('rp-primer'); if (!layer || layer.hidden) return;
    var s = load();
    if (reason === 'off') save({ moment: null, mode: 'off', since: Date.now(), offered: true });
    else if ((reason === 'plus-tard' || reason === 'fermer') && !s) save({ moment: null, mode: 'plus-tard', since: Date.now(), offered: true });
    stopLife();
    layer.classList.remove('rp-in'); layer.classList.add('rp-out');
    setTimeout(function(){ layer.hidden = true; layer.classList.remove('rp-out'); }, 200);
    refreshProfil();
    try { if (lastFocus && lastFocus.focus) lastFocus.focus(); } catch(e){}
  }

  /* ════════════════ Coup de pouce (accueil) ════════════════ */
  var nudgeTimer = null, nudgeQuest = null;

  function showReminderNudge(q){
    var el = $('rp-nudge'); if (!el) return;
    q = q || nextQuest();
    nudgeQuest = q;
    var act = q ? (QUEST_ACTIONS[q.type] || QUEST_ACTIONS.xp) : null;
    paint(el);
    $('rp-nudge-img').src = compImg();
    $('rp-nudge-hi').textContent = 'Coucou, c\'est ' + compName() + ' !';
    $('rp-nudge-ti').textContent = q ? q.label : 'Un coup d\'œil à « ' + goal() + ' » ?';
    $('rp-nudge-tx').textContent = q ? act.hint + ' · +' + q.xp + ' XP' : streakLine();
    $('rp-nudge-go').setAttribute('aria-label', q ? 'Voir la quête : ' + q.label : 'Voir mon objectif');
    el.hidden = false;
    el.classList.remove('rp-out'); void el.offsetWidth; el.classList.add('rp-in');
    armNudgeTimer();
  }
  function armNudgeTimer(){
    if (nudgeTimer) clearTimeout(nudgeTimer);
    nudgeTimer = setTimeout(function(){ hideReminderNudge(); }, 9000);
  }
  function hideReminderNudge(instant){
    var el = $('rp-nudge'); if (!el || el.hidden) return;
    if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; }
    if (instant) { el.hidden = true; el.classList.remove('rp-in', 'rp-out'); return; }
    el.classList.remove('rp-in'); el.classList.add('rp-out');
    setTimeout(function(){ el.hidden = true; el.classList.remove('rp-out'); }, 260);
  }
  (function bindNudge(){
    var el = $('rp-nudge'); if (!el) return;
    $('rp-nudge-go').addEventListener('click', function(){
      var q = nudgeQuest; hideReminderNudge(true);
      if (q && QUEST_ACTIONS[q.type]) QUEST_ACTIONS[q.type].run();
    });
    $('rp-nudge-x').addEventListener('click', function(){ hideReminderNudge(); });
    // Pause du minuteur quand on la survole / la parcourt au clavier
    el.addEventListener('mouseenter', function(){ if (nudgeTimer) clearTimeout(nudgeTimer); });
    el.addEventListener('mouseleave', armNudgeTimer);
    el.addEventListener('focusin', function(){ if (nudgeTimer) clearTimeout(nudgeTimer); });
    // Balayer vers le haut pour la ranger
    var sy = null;
    el.addEventListener('touchstart', function(e){ sy = e.touches[0].clientY; }, { passive: true });
    el.addEventListener('touchend', function(e){
      if (sy != null && e.changedTouches[0].clientY - sy < -30) hideReminderNudge();
      sy = null;
    });
  })();

  /* ════════════════ Déclenchement automatique ════════════════ */
  function homeActive(){ var h = $('s-home'); return !!(h && h.classList.contains('active')); }
  function blocked(){
    if (typeof tourActive !== 'undefined' && tourActive) return true;
    var t = $('tour-overlay'); if (t && t.classList.contains('active')) return true;
    var p = $('rp-primer'); if (p && !p.hidden) return true;
    var ids = ['notif-modal', 'journal-modal', 'xp-help-modal', 'excl-modal'];
    for (var i = 0; i < ids.length; i++) { var m = $(ids[i]); if (m && m.style.display && m.style.display !== 'none') return true; }
    var dialogs = document.querySelectorAll('[aria-modal="true"]');
    for (var j = 0; j < dialogs.length; j++) if (dialogs[j].id !== 'rp-primer' && dialogs[j].offsetParent) return true;
    return false;
  }
  function onboarded(){
    return (typeof tourDone !== 'undefined' && tourDone) || !!lsGet('visioncopie_ambitions');
  }
  function auto(){ return !navigator.webdriver; }   // les parcours automatisés ne sont jamais interrompus

  function onHome(){
    if (!auto() || !homeActive() || blocked()) return;
    var s = load();
    if (!(s && s.offered)) { if (onboarded()) showReminderPrimer(); return; }
    if (activeToday() || lsGet(NUDGE_KEY) === today()) return;
    var q = nextQuest(); if (!q) return;
    lsSet(NUDGE_KEY, today());
    showReminderNudge(q);
  }

  /* Rappel à l'heure choisie : notification système si l'app est en arrière-plan,
     sinon coup de pouce dans l'app. Jamais si la journée est déjà active. */
  function tick(){
    if (!auto()) return;
    var s = load(); if (!isOn(s)) return;
    var d = today(); if (lsGet(FIRED_KEY) === d || activeToday()) return;
    var M = MOMENTS[s.moment], now = new Date();
    if (now.getHours() * 60 + now.getMinutes() < M.h * 60 + M.m) return;
    if (s.mode === 'notif' && 'Notification' in window && Notification.permission === 'granted' && document.visibilityState === 'hidden') {
      lsSet(FIRED_KEY, d);
      var c = reminderCopy(s.moment), opts = { body: c.tx, icon: 'assets/icon-192.png', badge: 'assets/icon-192.png', tag: 'vision-rappel' };
      var direct = function(){ try { new Notification(c.ti, opts); } catch(e){} };
      if ('serviceWorker' in navigator && navigator.serviceWorker.getRegistration) {
        navigator.serviceWorker.getRegistration().then(function(reg){ if (reg && reg.showNotification) reg.showNotification(c.ti, opts); else direct(); }, direct);
      } else direct();
      return;
    }
    if (document.visibilityState === 'visible' && homeActive() && !blocked()) {
      lsSet(FIRED_KEY, d); lsSet(NUDGE_KEY, d);
      showReminderNudge(nextQuest());
    }
  }

  function refreshProfil(){
    var el = $('rp-param-sum'); if (!el) return;
    var s = load();
    el.textContent = isOn(s)
      ? cap(MOMENTS[s.moment].each) + ' vers ' + MOMENTS[s.moment].tm + (s.mode === 'notif' ? ' · notification' : ' · dans l\'app')
      : 'Un petit signe par jour pour ton objectif';
  }
  (function bindProfil(){
    var it = $('rp-param'); if (!it) return;
    it.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showReminderPrimer(); }
    });
    refreshProfil();
  })();

  /* ── Branchement sur la navigation, sans toucher core.js ── */
  var _prevGo = window.go;
  if (typeof _prevGo === 'function') {
    window.go = function(id){
      var r = _prevGo.apply(this, arguments);
      try {
        if (id !== 's-home') hideReminderNudge(true);
        if (id === 's-profil') refreshProfil();
        if (id === 's-home') setTimeout(onHome, 1400);
      } catch(e){}
      return r;
    };
  }

  /* La notification Android simulée reprend le titre de buildNewNotif() */
  var _prevAndroid = window.showAndroidNotif;
  if (typeof _prevAndroid === 'function') {
    window.showAndroidNotif = function(){
      var r = _prevAndroid.apply(this, arguments);
      try {
        var nn = (typeof buildNewNotif === 'function') ? buildNewNotif() : null;
        var ti = document.querySelector('#and-notif .and-notif-ti');
        if (ti && nn && nn.ti) ti.textContent = nn.ti;
      } catch(e){}
      return r;
    };
  }

  setInterval(tick, 60000);
  document.addEventListener('visibilitychange', tick);

  /* API publique */
  window.showReminderPrimer = showReminderPrimer;
  window.closeReminderPrimer = closeReminderPrimer;
  window.showReminderNudge = showReminderNudge;
  window.hideReminderNudge = hideReminderNudge;
  window.reminderState = function(){ return load(); };
})();
