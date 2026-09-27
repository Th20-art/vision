/* ════════════════════════════════════════════════════════════
   AMAZON FLOW — capsule → impact → emo → slip
════════════════════════════════════════════════════════════ */
const AMZN = { emotion:null, emotions:[], mood:null, reason:null, capT:null, cdT:null, cdLeft:30 };
const EMO_CIRC = 2 * Math.PI * 38;  // r=38 → ~238.76
let capSubT = null;  // timer des sous-titres de la capsule

/* ── Analyse complète : scan vision → alternatives IA → mise à jour DI + overlay ── */
async function _updateDIFromScan() {
  const info = await scanAmazonPage();
  if (info) {
    const nameEl = document.querySelector('.imp-pd-n');
    const priceEl = document.querySelector('.imp-pd-p');
    if (nameEl && info.name) nameEl.textContent = info.name + (info.brand ? ' · ' + info.brand : '');
    if (priceEl && info.price) priceEl.textContent = info.price;
    window._scanInfo = info;
    // Les règles perso sont revérifiées sur le produit réellement scanné
    if (typeof _localProductRuleCheck === 'function') _localProductRuleCheck();
    // NB : le scan produit est automatique (arrière-plan) → on NE journalise PAS ici.
    // Seules les ACTIONS de l'utilisateur sont journalisées (résistance, analyse critique déclenchée).
  }
  if (!info || !getClaudeKey()) return;

  const mainAmb = userAmbitions[0]?.label || 'épargne';
  const reply = await _claudeOneShot(
    `Tu es l'assistant d'achat conscient de l'app Vision. Prends en compte TOUT le contexte utilisateur (objectifs ET règles). JSON uniquement, sans texte autour :
{"align":<entier 0-10 : à quel point CET achat sert les objectifs de l'utilisateur, 10=indispensable à l'objectif, 0=contraire à un objectif ou à une règle perso>,"insights":[{"emoji":"emoji pertinent","title":"titre 2-4 mots","body":"1 phrase qui relie le produit aux objectifs/règles de l'utilisateur"},{"emoji":"emoji","title":"titre court","body":"1 phrase"}],"alt_smart":{"name":"nom court","saving":"économie ex: -15 €","price":"prix","detail":"1 phrase","url":"domaine marchand ex: backmarket.fr","brand_domain":"domaine officiel de la marque ex: samsung.com"},"apps":[{"name":"nom app","detail":"1 phrase gratuite","domain":"domaine officiel ex: strava.com"},{"name":"nom app 2","detail":"1 phrase gratuite","domain":"domaine officiel ex: google.com"}]}`,
    `${_userContext()}\nProduit analysé : ${info.name}${info.brand?' de '+info.brand:''}, prix : ${info.price}, catégorie : ${info.category}.\ninsights = 2 remarques PERSONNALISÉES qui confrontent ce produit aux objectifs ET à la règle perso (si une règle perso interdit ce type de produit, dis-le clairement). alt_smart = même produit moins cher (reconditionné/comparateur). apps = 2 applis/services GRATUITS pertinents pour ce produit OU pour les objectifs. brand_domain et domain = vrais domaines officiels (pour les logos). N'ignore aucune règle de l'utilisateur.`
  );
  if (!reply) return;
  let alts;
  try { alts = JSON.parse(reply.match(/\{[\s\S]*\}/)?.[0]); } catch(e) { return; }
  if (!alts) return;

  // Insights personnalisés (état 0) : reflètent objectifs + règle perso
  if (Array.isArray(alts.insights)) {
    const ids = [['dx0-i1-t','dx0-i1-b'], ['dx0-i2-t','dx0-i2-b']];
    alts.insights.slice(0,2).forEach((ins, k) => {
      const t = document.getElementById(ids[k][0]);
      if (t) t.textContent = (ins.emoji ? ins.emoji + ' ' : '') + (ins.title || '');
      const b = document.getElementById(ids[k][1]);
      if (b) b.textContent = ins.body || '';
    });
  }
  // Score d'alignement réel (calculé par l'IA selon les objectifs)
  if (alts.align !== undefined && !isNaN(parseFloat(alts.align))) {
    _alignScore = Math.max(0, Math.min(10, parseFloat(alts.align)));
    updateDynIsland();
  }

  // State 2 — alternative moins chère (IDs dx2-*)
  const st2 = document.querySelector('#dyn-isl .dyn-state[data-st="2"]');
  if (st2 && alts.alt_smart) {
    const n = st2.querySelector('.dyn-alt-n'); if (n) n.textContent = alts.alt_smart.name || n.textContent;
    const b = st2.querySelector('.dyn-badge');  if (b) b.textContent = alts.alt_smart.saving || b.textContent;
    const pn = document.getElementById('dx2-prod-name'); if (pn && info.name) pn.innerHTML = escHTML(info.name) + (info.brand ? '<br>' + escHTML(info.brand) : '');
    const pr = document.getElementById('dx2-price'); if (pr && alts.alt_smart.price) pr.textContent = alts.alt_smart.price;
    const lk = document.getElementById('dx2-link');  if (lk && alts.alt_smart.url) lk.textContent = '↗ ' + alts.alt_smart.url;
    // Image réelle : logo de la marque (repli marchand → démo)
    setDynLogo(document.getElementById('dx2-img-el'), alts.alt_smart.brand_domain || alts.alt_smart.url, 'assets/dyn-watch.jpg');
  }
  // State 3 — objectif épargne
  const st3sub = document.getElementById('dyn-st3-sub');
  if (st3sub) st3sub.textContent = 'pour ' + mainAmb.toLowerCase();
  // State 4 — applis/services gratuits réels (IDs dx4-a1-* / dx4-a2-*)
  const st4 = document.querySelector('#dyn-isl .dyn-state[data-st="4"]');
  const apps = Array.isArray(alts.apps) ? alts.apps : (alts.alt_free ? [alts.alt_free] : []);
  if (st4 && apps[0]) {
    const a1n = document.getElementById('dx4-a1-name'); if (a1n) a1n.textContent = apps[0].name || a1n.textContent;
    const a1d = document.getElementById('dx4-a1-desc'); if (a1d) a1d.textContent = apps[0].detail || a1d.textContent;
    setDynLogo(document.getElementById('dx4-a1-img'), apps[0].domain, 'assets/dyn-strava.png');
  }
  if (st4 && apps[1]) {
    const a2n = document.getElementById('dx4-a2-name'); if (a2n) a2n.textContent = apps[1].name || a2n.textContent;
    const a2d = document.getElementById('dx4-a2-desc'); if (a2d) a2d.textContent = apps[1].detail || a2d.textContent;
    setDynLogo(document.getElementById('dx4-a2-img'), apps[1].domain, 'assets/dyn-gfit.png');
  }
  // State 1 — rappel objectif
  const objTxt = document.getElementById('dyn-obj-txt');
  if (objTxt) objTxt.textContent = 'Je veux ' + mainAmb.toLowerCase() + ' !';
}

/* ── Logo réel d'un domaine : icon.horse → favicon Google → image embarquée ──
   Permet à l'îlot d'afficher la VRAIE marque/app analysée plutôt qu'un
   visuel mis en scène. Aucune clé requise (chargement direct <img src>). */
function setDynLogo(imgEl, domain, fallbackSrc) {
  if (!imgEl) return;
  if (!domain) { if (fallbackSrc) { imgEl.src = fallbackSrc; } return; }
  domain = String(domain).replace(/^https?:\/\//, '').replace(/\/.*$/, '').trim();
  if (!domain) { if (fallbackSrc) { imgEl.src = fallbackSrc; } return; }
  const sources = [
    'https://icon.horse/icon/' + domain,
    'https://www.google.com/s2/favicons?domain=' + domain + '&sz=128'
  ];
  // logo cadré + fond blanc tant qu'on affiche un logo distant
  imgEl.style.objectFit = 'contain';
  imgEl.style.background = '#fff';
  imgEl.style.padding = '6px';
  let stage = 0;
  imgEl.onerror = function () {
    stage++;
    if (stage < sources.length) {            // source suivante
      imgEl.src = sources[stage];
    } else {                                 // tout a échoué → image de démo
      imgEl.onerror = null;
      imgEl.style.objectFit = 'cover';
      imgEl.style.background = '';
      imgEl.style.padding = '0';
      if (fallbackSrc) imgEl.src = fallbackSrc;
    }
  };
  imgEl.src = sources[0];
}

/* ── Scan page Amazon avec Claude Vision ── */
async function _imgToBase64(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const maxW = 1000;
      const scale = Math.min(1, maxW / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.naturalWidth  * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      try { resolve(canvas.toDataURL('image/jpeg', 0.75).split(',')[1]); }
      catch(e) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function scanAmazonPage() {
  const key = getClaudeKey();
  if (!key) return null;
  // Image Amazon visible (écran actif ou dernier écran Amazon)
  const amznImg = document.querySelector('.screen.active .amzn-img')
               || document.querySelector('#s-amazon-cart .amzn-img')
               || document.querySelector('#s-amazon .amzn-img');
  if (!amznImg) return null;
  const base64 = await _imgToBase64(amznImg.src);
  if (!base64) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01',
                 'content-type': 'application/json',
                 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 150,
        messages: [{ role: 'user', content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: base64 } },
          { type: 'text', text: 'Analyse cette page Amazon et renvoie uniquement ce JSON sans texte autour :\n{"name":"<nom produit>","brand":"<marque>","price":"<prix avec devise>","category":"<catégorie courte>"}' }
        ]}]
      })
    });
    if (!res.ok) {
      try { const e = await res.json(); window._lastClaudeError = (e&&e.error&&e.error.message) || ('HTTP ' + res.status); }
      catch(_) { window._lastClaudeError = 'HTTP ' + res.status; }
      console.warn('[Vision] Scan produit — échec API :', window._lastClaudeError);
      return null;
    }
    const d = await res.json();
    const txt = d.content?.[0]?.text?.trim() || '';
    const m = txt.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : null;
  } catch(e) { window._lastClaudeError = 'Réseau/CORS : ' + e; console.warn('[Vision] Scan produit — exception :', e); return null; }
}

/* Validation de la clé API */
async function validateClaudeKey() {
  const btn = document.getElementById('claude-key-btn');
  const status = document.getElementById('claude-key-status');
  const key = getClaudeKey();
  if (!key) {
    if (status) { status.textContent = '⚠ Saisis une clé d\'abord'; status.style.color = '#f59e0b'; }
    return;
  }
  if (btn) btn.textContent = '…';
  if (status) status.textContent = '';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01',
                 'content-type': 'application/json',
                 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 5,
        messages: [{ role: 'user', content: 'Hi' }] })
    });
    if (res.ok) {
      if (status) { status.textContent = '✓ Clé valide — IA activée'; status.style.color = '#42c47e'; }
    } else {
      let msg = 'Clé invalide';
      try { const d = await res.json(); msg = d?.error?.message || msg; } catch(_){}
      if (status) { status.textContent = '✗ ' + msg; status.style.color = '#ef4444'; }
    }
  } catch(e) {
    if (status) { status.textContent = '✗ Connexion impossible (CORS ?)'; status.style.color = '#ef4444'; }
  }
  if (btn) btn.textContent = 'Tester';
}

/* "Passer la commande" yellow button → open capsule overlay (vidéo / audio / placeholder) */
/* Le calque capsule et le panneau d'impact sont déclarés dans l'écran Panier :
   on les rattache à l'écran Amazon affiché (fiche produit OU panier),
   sinon la vidéo se lance dans un écran caché et reste invisible. */
function _mountAmznOverlays(){
  const host = document.querySelector('.screen.active .amzn');
  if (!host) return;
  ['cap-overlay', 'imp-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentElement !== host) host.appendChild(el);
  });
}

function openCapsule(){
  _mountAmznOverlays();
  const ov = document.getElementById('cap-overlay');
  if(!ov) return;
  ov.classList.add('on');
  const v   = document.getElementById('cap-video');
  const a   = document.getElementById('cap-audio');
  const ph  = document.getElementById('cap-vd-ph');
  const aph = document.getElementById('cap-audio-ph');
  const subs = document.getElementById('cap-subs');
  const pbf  = ov.querySelector('.cap-pb-f');
  if(AMZN.capT) clearTimeout(AMZN.capT);
  if(capSubT){ clearInterval(capSubT); capSubT = null; }
  if(pbf) pbf.style.width = '0%';
  // Analyse IA en arrière-plan — met à jour DI + overlay impact
  _updateDIFromScan();
  // Reset visuals
  if(v) v.style.display = 'none';
  if(ph) ph.style.display = 'none';
  if(aph) aph.style.display = 'none';
  // Mots pour les sous-titres :
  // - transcription réelle si dispo
  // - null si vraie capsule sans transcript (micro pris par MediaRecorder)
  // - mock CAPSULE_WORDS seulement si aucune capsule enregistrée
  const hasCapsule = !!(capsuleVideoURL || capsuleAudioURL);
  const words = capsuleTranscript
    ? capsuleTranscript.split(/\s+/).filter(Boolean)
    : hasCapsule ? null : CAPSULE_WORDS;

  if(capsuleMode === 'audio' && capsuleAudioURL && a){
    /* ── Mode AUDIO ── */
    a.src = capsuleAudioURL;
    aph.style.display = 'flex';
    if(subs) subs.textContent = '';
    try { a.currentTime = 0; a.play(); } catch(e){}
    capSubT = setInterval(() => {
      const dur = (isFinite(a.duration) && a.duration > 0) ? a.duration : 12;
      const ratio = Math.min(1, a.currentTime / dur);
      if(pbf) pbf.style.width = (ratio * 100) + '%';
      if(words && subs){ const n = Math.max(1, Math.round(ratio * words.length)); subs.textContent = words.slice(0, n).join(' '); }
    }, 150);
    a.onended = () => closeCapsule();
    AMZN.capT = setTimeout(closeCapsule, 60000); // garde-fou audio

  } else if(capsuleVideoURL && v){
    /* ── Mode VIDÉO ── */
    v.src = capsuleVideoURL;
    v.style.display = 'block';
    if(subs) subs.textContent = '';
    try { v.currentTime = 0; v.play(); } catch(e){}
    capSubT = setInterval(() => {
      const dur = (isFinite(v.duration) && v.duration > 0) ? v.duration : 24;
      const ratio = Math.min(1, v.currentTime / dur);
      if(pbf) pbf.style.width = (ratio * 100) + '%';
      if(words && subs){ const n = Math.max(1, Math.round(ratio * words.length)); subs.textContent = words.slice(0, n).join(' '); }
    }, 150);
    v.onended = () => closeCapsule();
    AMZN.capT = setTimeout(closeCapsule, 14000);

  } else {
    /* ── Aucune capsule ── */
    if(ph) ph.style.display = 'block';
    if(subs) subs.textContent = '« Salut, c\'est moi dans 90 jours. Je prends des engagements pour partir… »';
    const PH_DUR = 3500;
    const start = Date.now();
    capSubT = setInterval(() => {
      const ratio = Math.min(1, (Date.now() - start) / PH_DUR);
      if(pbf) pbf.style.width = (ratio * 100) + '%';
      if(ratio >= 1){ clearInterval(capSubT); capSubT = null; }
    }, 80);
    AMZN.capT = setTimeout(closeCapsule, PH_DUR);
  }
}

/* Close capsule then open impact bottom sheet */
function closeCapsule(){
  if(AMZN.capT){ clearTimeout(AMZN.capT); AMZN.capT = null; }
  if(capSubT){ clearInterval(capSubT); capSubT = null; }
  const v = document.getElementById('cap-video');
  if(v){ try { v.pause(); } catch(e){} }
  const a = document.getElementById('cap-audio');
  if(a){ try { a.pause(); a.src = ''; } catch(e){} }
  const ov = document.getElementById('cap-overlay');
  if(ov) ov.classList.remove('on');
  setTimeout(() => {
    const im = document.getElementById('imp-overlay');
    if(im) im.classList.add('on');
  }, 280);
}

/* "Fermer la page" → resist + go to home, log resistance */
function impactResist(){
  const im = document.getElementById('imp-overlay');
  if(im) im.classList.remove('on');
  go('s-home');
  logAmznResist();
}

/* "Prendre 30s pour réfléchir" → emo screen */
function impactReflect(){
  const im = document.getElementById('imp-overlay');
  if(im) im.classList.remove('on');
  go('s-emo');
}

/* Start the 30s countdown ring + label */
function startEmoCountdown(){
  const total = (typeof getPauseSecs === 'function') ? getPauseSecs() : 30;
  AMZN.cdLeft = total;
  AMZN.emotion = null; AMZN.emotions = []; AMZN.mood = null;
  document.querySelectorAll('.dk-em-c, .dk-md-c').forEach(c => c.classList.remove('on'));
  const arc = document.getElementById('emo-arc');
  const num = document.getElementById('emo-num');
  const skip = document.getElementById('emo-skip');
  if(arc) arc.style.strokeDashoffset = '0';
  if(num) num.textContent = '0:' + String(total).padStart(2, '0');
  if (typeof startBreathing === 'function') startBreathing();
  // "J'y vais tout de même" : caché et non-cliquable au départ
  if(skip){ skip.style.opacity = '0'; skip.style.pointerEvents = 'none'; }
  if(AMZN.cdT) clearInterval(AMZN.cdT);
  AMZN.cdT = setInterval(() => {
    AMZN.cdLeft = Math.max(0, AMZN.cdLeft - 1);
    const elapsed = total - AMZN.cdLeft;
    const off = Math.round((elapsed / total) * EMO_CIRC);
    if(arc) arc.style.strokeDashoffset = String(off);
    if(num) num.textContent = '0:' + String(AMZN.cdLeft).padStart(2, '0');
    // Apparition progressive du bouton skip pendant le chrono
    if(skip) skip.style.opacity = String(Math.min(1, elapsed / total));
    if(AMZN.cdLeft <= 0){
      clearInterval(AMZN.cdT); AMZN.cdT = null;
      // Cliquable uniquement à la fin de la pause
      if (typeof stopBreathing === 'function') stopBreathing();
      if(skip){ skip.style.opacity = '1'; skip.style.pointerEvents = 'auto'; }
    }
  }, 1000);
}

/* "J'y vais tout de même" — actif seulement après le chrono */
function skipFromEmo(){
  if(AMZN.cdLeft > 0) return; // sécurité : pas avant la fin
  if(AMZN.cdT){ clearInterval(AMZN.cdT); AMZN.cdT = null; }
  go('s-slip');
}

/* Humeur (niveau 1) : un seul choix, de 1 (très mal) à 5 (très bien) */
function pickMood(el, level){
  document.querySelectorAll('.dk-md-c').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  AMZN.mood = level;
}

/* Émotions (niveau 2) : sélection multiple */
function pickEmo(el, name){
  const on = el.classList.toggle('on');
  AMZN.emotions = AMZN.emotions.filter(e => e !== name);
  if (on) AMZN.emotions.push(name);
  AMZN.emotion = AMZN.emotions[0] || null;   // compat : première émotion choisie
}

/* Produit et prix affichés dans l'overlay d'impact (repli : 39 €) */
function _amznProduct(){
  const priceEl = document.querySelector('.imp-pd-p');
  const raw = priceEl ? priceEl.textContent.replace(/[^\d,]/g,'').replace(',','.') : '';
  const price = parseFloat(raw) || 39;
  const product = (window._scanInfo && window._scanInfo.name)
    || (document.querySelector('.imp-pd-n') ? document.querySelector('.imp-pd-n').textContent.split('·')[0].trim() : '')
    || 'cet achat';
  return { product, price };
}
function _amznMeta(){
  const p = _amznProduct();
  return { product: p.product, price: p.price, mood: AMZN.mood, emotions: AMZN.emotions.slice(), reason: AMZN.reason, site: 'amazon.fr' };
}

function pickReason(el){
  document.querySelectorAll('.dk-ch').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  AMZN.reason = el.textContent.trim();
}

function resistFromEmo(){
  if(AMZN.cdT){ clearInterval(AMZN.cdT); AMZN.cdT = null; }
  go('s-home');
  logAmznResist();
}

function confirmPay(){
  if(AMZN.cdT){ clearInterval(AMZN.cdT); AMZN.cdT = null; }
  // Craquage : journalisé (remet la série à zéro) avec humeur, émotions et raison
  const meta = _amznMeta();
  addJournalLine('craq', 'Acheté ' + meta.product + ' — ' + Math.round(meta.price) + ' €' + (meta.reason ? ' (' + meta.reason + ')' : ''), meta);
  AMZN.emotion = null; AMZN.emotions = []; AMZN.mood = null; AMZN.reason = null;
  document.querySelectorAll('.dk-ch').forEach(c => c.classList.remove('on'));
  go('s-home');
}

/* Hook: log resistance — ajoute le prix évité à l'épargne de l'objectif principal */
function logAmznResist(){
  const meta = _amznMeta();
  const priceNum = meta.price, prodName = meta.product;

  if (typeof userAmbitions !== 'undefined' && userAmbitions.length > 0) {
    const label = userAmbitions[0].label;
    const key = 'visioncopie_saved_' + label;
    const current = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(+(current + priceNum).toFixed(2)));
  }
  // Journalise + actualise la home (objectifs, impact CO₂, journal)
  addJournalLine('resist', 'Résisté à ' + prodName + ' — +' + Math.round(priceNum) + ' €', meta);
  updateDynIsland();
  if (typeof renderHomeMetrics === 'function') renderHomeMetrics();
  if (typeof renderHomeAmbitions === 'function') renderHomeAmbitions();
}

/* ── Toggle catégorie (s-param-sites) ── */
function toggleCat(el){
  if(!el) return;
  // Toggle verrouillé (cadenas) → non modifiable par l'utilisateur
  if(el.classList.contains('locked')) return;
  el.classList.toggle('on');
}

/* ── Sites analysés pilotés par les objectifs ──
   Chaque objectif active les catégories de sites les plus à risque pour lui. */
const OBJ_SITE_MAP = {
  voyage:   ['voyage'],
  liberte:  ['abo'],
  impact:   ['food'],
  projet:   ['abo'],
  formation:['reseaux', 'abo'],
  sante:    ['food', 'reseaux'],
  logement: ['abo'],
  societal: ['reseaux']
};
const CAT_LABELS = {
  achat: 'Achat', food: 'Food & Livraison', reseaux: 'Réseaux & Streaming',
  voyage: 'Voyage & Divertissement', abo: 'Abonnements & Services'
};
function applyObjectiveSites(){
  const cats = new Set(['achat']);   // Achat : toujours analysé (verrouillé)
  (userAmbitions || []).forEach(a => (OBJ_SITE_MAP[a.key] || []).forEach(c => cats.add(c)));
  // Applique l'état aux toggles (sauf le verrouillé qui reste ON)
  document.querySelectorAll('#s-param-sites .cat-tog').forEach(t => {
    if (t.classList.contains('locked')) return;
    t.classList.toggle('on', cats.has(t.getAttribute('data-cat')));
  });
  // Note explicative dans la page
  const objs = (userAmbitions || []).map(a => a.label).filter(Boolean);
  const note = document.getElementById('sites-obj-note');
  if (note) {
    const catNames = [...cats].map(c => CAT_LABELS[c]).filter(Boolean);
    note.innerHTML = objs.length
      ? '🎯 <b>Sélection adaptée à tes objectifs</b> (' + escHTML(objs.join(', ')) + ') : Vision surveille en priorité ' + catNames.join(', ') + '.'
      : 'Définis un objectif pour personnaliser les catégories surveillées.';
  }
  // Résumé sur la page Profil
  const sum = document.getElementById('sites-count-sum');
  if (sum) {
    const n = cats.size;
    sum.textContent = n + ' catégorie' + (n > 1 ? 's' : '') + ' surveillée' + (n > 1 ? 's' : '') + ' selon tes objectifs';
  }
}

/* ── Sélection radio transport (s-param-transport) ── */
function selectTransport(el){
  if(!el) return;
  const list = el.closest('#transportList');
  if(!list) return;
  list.querySelectorAll('label').forEach(lab => {
    const dot = lab.querySelector('span:first-child');
    const inner = dot ? dot.querySelector('span') : null;
    if(lab === el){
      if(dot){ dot.style.borderColor = 'var(--og)'; }
      if(!inner && dot){
        const k = document.createElement('span');
        k.style.cssText = 'width:8px;height:8px;border-radius:50%;background:var(--og);';
        dot.appendChild(k);
      }
      const inp = lab.querySelector('input[type="radio"]');
      if(inp) inp.checked = true;
    } else {
      if(dot){ dot.style.borderColor = '#c8c8c8'; }
      if(inner){ inner.remove(); }
      const inp = lab.querySelector('input[type="radio"]');
      if(inp) inp.checked = false;
    }
  });
}
