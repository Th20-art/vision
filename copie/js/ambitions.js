/* ════════════════════════════════════════════════════════════
   AMBITIONS — state utilisateur + helpers
════════════════════════════════════════════════════════════ */
const AMBITION_TYPES = [
  { key: 'voyage',     emoji: '✈️', label: 'Voyager' },
  { key: 'liberte',    emoji: '🏦', label: 'Liberté financière' },
  { key: 'impact',     emoji: '🌱', label: 'Réduire mon impact' },
  { key: 'projet',     emoji: '🚀', label: 'Lancer un projet' },
  { key: 'formation',  emoji: '📚', label: 'Me former' },
  { key: 'sante',      emoji: '💪', label: 'Prendre soin de moi' },
  { key: 'logement',   emoji: '🏠', label: 'Premier logement' },
  { key: 'societal',   emoji: '💡', label: 'Avoir de l\'impact' }
];
// Ambitions par défaut (avant onboarding) — garde Home/Compagnon cohérents et dynamiques
let userAmbitions = [
  { ...AMBITION_TYPES.find(t => t.key === 'voyage'), smartLabel: 'Je veux pouvoir voyager le mois prochain.' },
  { ...AMBITION_TYPES.find(t => t.key === 'impact') }
];   // [{key, emoji, label, smartLabel?, amount?}]

/* ── Persistance des objectifs (localStorage) ── */
function saveAmbitions(){
  try { localStorage.setItem('visioncopie_ambitions', JSON.stringify(userAmbitions)); } catch(e){}
}
function loadAmbitions(){
  try {
    const s = JSON.parse(localStorage.getItem('visioncopie_ambitions') || 'null');
    if (Array.isArray(s) && s.length) userAmbitions = s;
  } catch(e){}
}

/* Score d'alignement du produit courant avec les objectifs (0–10).
   Défini par l'analyse IA ; 4/10 par défaut (un achat d'impulsion est rarement aligné). */
let _alignScore = 4;

/* ── Contexte utilisateur injecté dans CHAQUE analyse IA ──
   Objectifs (+ formulations perso) et règles ajoutées par l'utilisateur. */
function _userContext(){
  const objs = (userAmbitions || []).map(a => {
    let s = a.label;
    if (a.smartLabel) s += ' (« ' + a.smartLabel + ' »)';
    if (a.amount) s += ' [cible ' + a.amount + ' €]';
    return s;
  });
  let ctx = 'Objectifs de l\'utilisateur : ' + (objs.join(' ; ') || 'non définis') + '.';
  // Règles personnelles : « Mes règles personnelles » (liste) + consigne Esprit critique
  const rules = [];
  if (typeof personalRules !== 'undefined') personalRules.forEach(r => { if (r) rules.push(r); });
  const consigne = (typeof getUserRule === 'function') ? getUserRule() : '';
  if (consigne && !rules.some(r => r.toLowerCase() === consigne.toLowerCase())) rules.push(consigne);
  if (rules.length)
    ctx += ' RÈGLES PERSONNELLES PRIORITAIRES de l\'utilisateur (à respecter ABSOLUMENT ; si l\'achat ou le contenu va à leur encontre, baisse fortement le score et préviens-le) : ' + rules.map(r => '« ' + r + ' »').join(', ') + '.';
  if (typeof excludedSites !== 'undefined' && excludedSites.length)
    ctx += ' Sites/app que l\'utilisateur a explicitement exclus de l\'analyse (à ne PAS analyser ni recommander) : ' + excludedSites.join(', ') + '.';
  if (typeof espritCritiqueOn !== 'undefined')
    ctx += ' Esprit critique : ' + (espritCritiqueOn ? 'activé' : 'désactivé') + '.';
  return ctx;
}

/* Impact CO₂ évité, dérivé du total des achats résistés (≈0,5 kg CO₂e / €). */
function computeImpactKg(){
  let totalAvoided = 0;
  (userAmbitions || []).forEach(a => {
    totalAvoided += parseFloat(localStorage.getItem('visioncopie_saved_' + a.label) || '0');
  });
  return Math.round(totalAvoided * 0.5);
}

/* ── Consigne personnelle (règle libre de l'utilisateur) ── */
function getUserRule(){ return (localStorage.getItem('visioncopie_rule') || '').trim(); }
function setUserRule(v){
  try { localStorage.setItem('visioncopie_rule', (v || '').trim()); } catch(e){}
  if (typeof _invalidateAnalyses === 'function') _invalidateAnalyses();
}

/* ── Journal persistant (résistances, analyses, craquages) ── */
function loadJournal(){
  try { const s = JSON.parse(localStorage.getItem('visioncopie_journal') || 'null'); if (Array.isArray(s)) return s; } catch(e){}
  const now = Date.now();
  return [   // graine par défaut (persistée au 1er rendu)
    { type:'resist', text:'Résisté à Shein — +34 €',        ts: now - 3600e3 },
    { type:'craq',   text:'Commandé Uber Eats. Fatigue.',   ts: now - 20*3600e3 },
    { type:'resist', text:'Résisté à Amazon — +22 €',       ts: now - 3*24*3600e3 }
  ];
}
let journalLog = loadJournal();
function saveJournal(){ try { localStorage.setItem('visioncopie_journal', JSON.stringify(journalLog.slice(0,40))); } catch(e){} }
function addJournalLine(type, text, meta){
  if(!text) return;
  journalLog.unshift({ type: type || 'note', text: text, ts: Date.now() });
  saveJournal();
  renderHomeJournal();
  // XP, série et historique des tentations (js/progression.js)
  if (typeof onProgressEvent === 'function') onProgressEvent(type, meta);
}
function _journalTime(ts){
  const d = new Date(ts);
  const hm = d.getHours() + ':' + String(d.getMinutes()).padStart(2,'0');
  const day0 = new Date(); day0.setHours(0,0,0,0);
  const days = Math.floor((day0.getTime() - new Date(ts).setHours(0,0,0,0)) / (24*3600e3));
  if (days <= 0) return "Aujourd'hui · " + hm;
  if (days === 1) return "Hier · " + hm;
  return ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'][new Date(ts).getDay()] + ' · ' + hm;
}
function renderHomeJournal(){
  const list = document.getElementById('home-journal-list');
  if (!list) return;
  list.innerHTML = '';
  journalLog.slice(0, 4).forEach(e => {
    const barColor = e.type === 'resist' ? '#7bb45e' : (e.type === 'analyse' ? '#3705ff' : '#888');
    const txtStyle = e.type === 'resist' ? 'color:#4f9a3a;font-weight:600;'
                   : e.type === 'analyse' ? 'color:#3705ff;font-weight:600;'
                   : 'color:#888;';
    const item = document.createElement('div');
    item.className = 'jfi';
    item.innerHTML =
      '<div class="jfi-bar" style="background:' + barColor + ';"></div>' +
      '<div class="jfi-content">' +
        '<div class="jfi-time">' + _journalTime(e.ts) + '</div>' +
        '<div class="jfi-text" style="' + txtStyle + '">' + escHTML(e.text) + '</div>' +
      '</div>';
    list.appendChild(item);
  });
}

/* Parse "✈️ Voyager" → match AMBITION_TYPES */
function parseVisionLabel(text) {
  const t = text.trim().replace(/^[^\p{L}]+/u, '').trim(); // retire emoji éventuel en tête
  return AMBITION_TYPES.find(a => t === a.label);
}

/* Rend dynamiquement les cards d'ambitions dans Mes Ambitions (sync onboarding) */
function renderMyAmbitions() {
  const list = document.getElementById('ambitions-list');
  if (!list) return;
  list.innerHTML = '';
  if (!userAmbitions.length) {
    list.innerHTML = '<div style="margin:14px 20px;padding:18px;text-align:center;background:#fafafa;border-radius:14px;color:var(--muted);font-size:13px;">Aucune ambition pour le moment.</div>';
  } else {
    userAmbitions.forEach((amb, idx) => {
      const isPrincipal = idx === 0;
      const refined = !!amb.smartLabel;
      const card = document.createElement('div');
      card.style.cssText = `margin:${idx===0?'14px':'10px'} 20px 0;background:white;border-radius:14px;overflow:hidden;cursor:pointer;${isPrincipal?'border:2px solid var(--og);':'border:1px solid #e8e8e8;'}`;
      const headerBg = isPrincipal ? 'background:linear-gradient(90deg,var(--og),var(--og2));color:#fff;' : 'background:#f5f5f3;color:var(--muted);';
      const lbl = isPrincipal ? 'OBJECTIF PRINCIPAL' : ('OBJECTIF ' + (idx + 1));
      const ctaText = refined ? 'Appuie pour modifier →' : 'Appuie pour affiner →';
      const descLine = refined
        ? `<div style="font-size:13px;color:var(--dark);margin-bottom:6px;line-height:1.45;">${escHTML(amb.smartLabel)}</div>`
        : `<div style="font-size:12px;color:var(--muted);margin-bottom:6px;">Pas encore précisé.</div>`;
      card.innerHTML = `
        <div style="${headerBg}padding:8px 14px;display:flex;align-items:center;justify-content:space-between;">
          <span style="font-family:'Work Sans',sans-serif;font-weight:600;font-size:10px;letter-spacing:0.08em;">${lbl}</span>
        </div>
        <div style="padding:14px 16px;">
          <div style="font-family:'Work Sans',sans-serif;font-weight:700;font-size:18px;color:var(--dark);margin-bottom:6px;">${escHTML(amb.label)}</div>
          ${descLine}
          <div style="font-size:12px;color:var(--og);font-weight:500;">${ctaText}</div>
        </div>`;
      card.onclick = function() {
        // Si déjà affiné → ouvre SMART direct au résultat ; sinon → étape 1
        openSmart(amb.key, amb.label, amb.emoji, refined ? amb.smartLabel : null);
      };
      list.appendChild(card);
    });
  }
  // Carte "+ Ajouter un objectif" — seulement si moins de 3 ambitions (max 3)
  if (userAmbitions.length < 3) {
    const addCard = document.createElement('div');
    addCard.style.cssText = 'margin:10px 20px 0;background:white;border-radius:14px;border:1.5px dashed #d0d0d0;padding:18px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:var(--muted);font-size:13px;';
    addCard.textContent = '+ Ajouter un objectif';
    addCard.onclick = openAmbitionPicker;
    list.appendChild(addCard);
  } else {
    const note = document.createElement('div');
    note.style.cssText = 'margin:10px 20px 0;text-align:center;font-size:12px;color:var(--muted);';
    note.textContent = 'Maximum atteint (3 objectifs).';
    list.appendChild(note);
  }
  renderRules();
}

/* ── Règles personnelles (ce que l'utilisateur refuse) — persistées ── */
let personalRules = (function(){
  try { const s = JSON.parse(localStorage.getItem('visioncopie_rules') || 'null'); if (Array.isArray(s)) return s; } catch(e){}
  return [];
})();
function savePersonalRules(){ try { localStorage.setItem('visioncopie_rules', JSON.stringify(personalRules)); } catch(e){} }
// Une règle a changé → invalide le score et les analyses en cache (recalcul au prochain scan)
function _invalidateAnalyses(){
  _alignScore = 4;
  window._amazonAnalyzed = false;   // forcera une nouvelle analyse produit selon les nouvelles règles
  const a = document.getElementById('ci-article'); if (a) a._analyzed = false;
  const y = document.getElementById('ci-youtube'); if (y) y._analyzed = false;
}
function renderRules() {
  const box = document.getElementById('rules-list');
  if (!box) return;
  box.innerHTML = '';
  personalRules.forEach((rule, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;background:#fff;border:1px solid #ececec;border-radius:12px;padding:10px 12px;';
    row.innerHTML = `
      <span style="color:var(--og);font-size:14px;">⚠</span>
      <span style="flex:1;font-size:13px;color:var(--dark);">${escHTML(rule)}</span>
      <button onclick="removeRule(${i})" aria-label="Retirer" style="background:none;border:none;cursor:pointer;font-size:16px;line-height:1;color:var(--muted);padding:2px 4px;font-family:inherit;">✕</button>`;
    box.appendChild(row);
  });
}
function addRule() {
  const inp = document.getElementById('rule-input');
  const val = (inp ? inp.value : '').trim();
  if (!val) { if (inp) inp.focus(); return; }
  if (!personalRules.some(r => r.toLowerCase() === val.toLowerCase())) {
    personalRules.push(val);
  }
  if (inp) inp.value = '';
  savePersonalRules();
  _invalidateAnalyses();
  renderRules();
}
function removeRule(i) {
  personalRules.splice(i, 1);
  savePersonalRules();
  _invalidateAnalyses();
  renderRules();
}

/* ── Mes passions (édition) ── */
function addPassionChip() {
  const name = prompt('Ajoute une passion :');
  if (!name || !name.trim()) return;
  const area = document.getElementById('passionsChips');
  if (!area) return;
  const add = area.querySelector('.chip-add');
  const c = document.createElement('div');
  c.className = 'chip on';
  c.textContent = name.trim();
  c.onclick = function () { this.classList.toggle('on'); };
  area.insertBefore(c, add);
}
function savePassions() {
  const n = document.querySelectorAll('#passionsChips .chip.on').length;
  const sum = document.getElementById('passions-summary');
  if (sum) sum.textContent = n + ' passion' + (n > 1 ? 's' : '');
  go('s-profil');
}

/* Met à jour le banner objectif + les cards métriques sur la home selon userAmbitions */
function renderHomeMetrics() {
  // Banner — première ambition, synchronisé sur TOUS les écrans
  const objText = userAmbitions.length > 0
    ? (userAmbitions[0].smartLabel || ('Mon objectif : ' + userAmbitions[0].label + '.'))
    : 'Je veux pouvoir voyager le mois prochain.';
  // Met à jour tous les bandeaux "TON OBJECTIF" (home, profil, capsule, ambitions, etc.)
  document.querySelectorAll('.obj-text').forEach(el => { el.textContent = objText; });
  // Bandeau de la capsule Amazon (classe dédiée)
  document.querySelectorAll('.cap-bn-t').forEach(el => { el.textContent = objText; });
  // Objectifs list — UN bloc par ambition utilisateur (Figma 510:1136)
  const list = document.getElementById('home-objectives-list');
  if (list) {
    list.innerHTML = '';
    if (!userAmbitions.length) {
      list.innerHTML = '<div style="text-align:center;color:var(--muted);font-size:13px;">Tes objectifs apparaîtront ici.</div>';
    } else {
      userAmbitions.forEach((amb, idx) => {
        const block = document.createElement('div');
        block.className = 'home-obj';
        const isEC = /esprit critique/i.test(amb.label);

        // Cas spécial impact écologique → CO₂ évité, calculé depuis les achats résistés
        if (amb.key === 'impact') {
          const kg = computeImpactKg();
          const km = Math.round(kg / 0.12);   // ~0,12 kg CO₂ / km en voiture
          block.innerHTML = `
            <div class="ho-label">${escHTML((amb.label || '').toUpperCase())}</div>
            <div class="ho-value">${kg} KG</div>
            <div class="ho-sub">CO₂ évités grâce à tes résistances</div>
            <div class="ho-sub2">${kg > 0 ? ('Soit ' + km.toLocaleString('fr-FR') + ' km en voiture non parcourus.') : 'Résiste à un achat pour commencer à réduire ton impact.'}</div>`;
        } else {
          const saved  = parseFloat(localStorage.getItem('visioncopie_saved_' + amb.label) || '0');
          const target = parseFloat(amb.amount || 0);
          const pct    = target > 0 ? Math.min(100, Math.round(saved / target * 100)) : 0;
          const savedStr = Math.round(saved).toLocaleString('fr-FR');
          const sub    = amb.smartLabel || 'Résiste à un achat pour avancer vers cet objectif.';
          const subTxt = target > 0
            ? savedStr + ' € économisés · ' + pct + ' % de ' + target.toLocaleString('fr-FR') + ' €'
            : (saved > 0 ? savedStr + ' € économisés' : sub);
          block.innerHTML = `
            <div class="ho-label">${escHTML((amb.label || '').toUpperCase())}</div>
            <div class="ho-value">${savedStr} €</div>
            <div class="ho-bar"><div class="ho-fill" style="width:${pct}%"></div></div>
            <div class="ho-sub2">${escHTML(subTxt)}</div>`;
        }
        list.appendChild(block);
      });
    }
  }

  renderHomeChips();
}

/* État Esprit critique (toggle params + splash onboarding) — on par défaut */
var espritCritiqueOn = true;
function toggleEC(el) {
  el.classList.toggle('on');
  espritCritiqueOn = el.classList.contains('on');
  // Synchronise tous les autres toggles esprit critique
  document.querySelectorAll('.ec-toggle').forEach(t => {
    if (t === el) return;
    t.classList.toggle('on', espritCritiqueOn);
  });
  renderHomeChips();
}

/* Chips dynamiques home — varient selon les ambitions choisies */
function renderHomeChips() {
  const wrap = document.getElementById('home-chips');
  if (!wrap) return;
  wrap.innerHTML = '';
  const ambitions = userAmbitions.length ? userAmbitions
    : [{emoji:'💰', label:'épargne'}, {emoji:'🌱', label:'écologie'}];
  ambitions.forEach(amb => {
    const chip = document.createElement('span');
    const isEC = /esprit critique/i.test(amb.label);
    chip.className = 'hchip' + (isEC ? ' hchip-ec' : '');
    chip.textContent = amb.label;
    wrap.appendChild(chip);
  });
  // Chip Esprit critique (violet) si activé — toujours en plus des ambitions
  if (espritCritiqueOn && !ambitions.some(a => /esprit critique/i.test(a.label))) {
    const ec = document.createElement('span');
    ec.className = 'hchip hchip-ec';
    ec.textContent = 'esprit critique';
    wrap.appendChild(ec);
  }
}

/* Met à jour TOUS les .obj-tags (home, compagnon, etc.) */
function renderHomeAmbitions() {
  document.querySelectorAll('.obj-tags').forEach(container => {
    container.innerHTML = '';
    const ambitions = userAmbitions.length ? userAmbitions
      : [{label:'Voyager'},{label:'Réduire mon impact'}];
    ambitions.forEach(amb => {
      const span = document.createElement('span');
      const isEC = /esprit critique/i.test(amb.label);
      span.className = 'obj-tag' + (isEC ? ' obj-tag-ec' : '');
      span.textContent = amb.label;
      container.appendChild(span);
    });
    // Tag Esprit critique (violet) si activé — toujours en plus
    if (espritCritiqueOn && !ambitions.some(a => /esprit critique/i.test(a.label))) {
      const ec = document.createElement('span');
      ec.className = 'obj-tag obj-tag-ec';
      ec.textContent = 'esprit critique';
      container.appendChild(ec);
    }
  });
}

/* ── Vision cards : multi-select MAX 2 ── */
const MAX_VISIONS = 2;
document.querySelectorAll('.vision-card').forEach(card => {
  card.addEventListener('click', function() {
    const isActive = this.classList.contains('active');
    const activeCount = document.querySelectorAll('.vision-card.active').length;
    if (isActive) {
      this.classList.remove('active');
    } else if (activeCount < MAX_VISIONS) {
      this.classList.add('active');
    } else {
      // Déjà 2 sélectionnés — remplace le premier
      const first = document.querySelector('.vision-card.active');
      if (first) first.classList.remove('active');
      this.classList.add('active');
    }
    // Réveil du compagnon quand 2 objectifs sélectionnés, sleep sinon
    _updateVisionThumbs();
  });
});

/* Valide les visions choisies + auto-écologie si 1 seule + go suite */
function validateVisions() {
  const cards = document.querySelectorAll('.vision-card.active');
  const selected = [];
  cards.forEach(card => {
    const labelEl = card.querySelector('.vision-label');
    if (labelEl) {
      const parsed = parseVisionLabel(labelEl.textContent);
      if (parsed) selected.push({...parsed});
    }
  });
  if (selected.length === 0) {
    alert('Sélectionne au moins 1 objectif (max 2).');
    return;
  }
  if (selected.length === 1) {
    // Auto-ajoute écologie comme 2ème
    const impact = AMBITION_TYPES.find(t => t.key === 'impact');
    if (impact && selected[0].key !== 'impact') {
      selected.push({...impact});
    }
  }
  userAmbitions = selected;
  saveAmbitions();
  // Initialise les compteurs d'épargne à 0 pour les nouveaux objectifs
  selected.forEach(s => {
    localStorage.setItem('visioncopie_saved_' + s.label, '0');
  });
  renderHomeAmbitions();
  if (typeof renderHomeMetrics === 'function') renderHomeMetrics();
  updateDynIsland();
  go('s-intro-analyse');
}

/* ── Image d'objectif (état 3) : photo libre réelle selon l'objectif ──
   Mappe l'objectif (texte FR) vers une requête photo pertinente puis
   pioche une image gratuite Creative Commons via Openverse (Flickr & co.).
   Sans clé API. Repli sur l'image embarquée si indisponible. */
function _objImageQuery(label) {
  const l = (label || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Mot-clé UNIQUE = bien meilleure pertinence sur Openverse
  const map = [
    [/voyag|vacance|tour du monde|partir|decouvr/, 'beach'],
    [/maison|appart|immobili|logement|chez moi/,   'house'],
    [/voiture|auto|vehicule|conduire/,             'car'],
    [/moto/,                                       'motorcycle'],
    [/maria|noce/,                                 'wedding'],
    [/bebe|enfant|naissance|famille/,              'baby'],
    [/etude|formation|diplome|ecole|universit|apprendre/, 'library'],
    [/retraite/,                                   'mountains'],
    [/velo|bicyclette/,                            'bicycle'],
    [/sport|fitness|muscu|salle|courir|marathon/,  'running'],
    [/business|entreprise|startup|projet|creer/,   'office'],
    [/epargne|argent|economi|budget|fond/,         'money'],
    [/ordinateur|\bpc\b|informatique|tech|materiel/, 'laptop'],
    [/guitare|musique|piano|instrument/,           'guitar'],
    [/jardin|nature|potager/,                      'garden'],
  ];
  for (const [re, q] of map) { if (re.test(l)) return q; }
  // Défaut : premier mot de l'objectif (repli sur image embarquée si flou)
  return l.replace(/[^a-z0-9 ]/g, ' ').trim().split(/\s+/)[0] || 'landscape';
}

let _lastObjImgQuery = null;
async function setObjectiveImage(label) {
  const imgEl = document.getElementById('dx3-img-el');
  if (!imgEl) return;
  const q = _objImageQuery(label);
  if (q === _lastObjImgQuery) return;   // évite de re-piocher pour le même objectif
  _lastObjImgQuery = q;
  try {
    const r = await fetch('https://api.openverse.org/v1/images/?q=' + encodeURIComponent(q) +
      '&page_size=10&category=photograph&mature=false');
    if (r.ok) {
      const j = await r.json();
      const list = (j.results || []).filter(x => x.url || x.thumbnail);
      // Priorité aux photos dont le titre/les tags contiennent le mot-clé
      const kw = q.toLowerCase();
      const relevant = list.find(x => {
        const t = (x.title || '').toLowerCase();
        const tags = (x.tags || []).map(g => (g.name || '').toLowerCase()).join(' ');
        return t.includes(kw) || tags.includes(kw);
      });
      const hit = relevant || list[0];
      if (hit) {
        const src = hit.url || hit.thumbnail;
        imgEl.onerror = function () { imgEl.onerror = null; imgEl.src = 'assets/dyn-beach.jpg'; };
        imgEl.src = src;
        return;
      }
    }
  } catch (e) { /* réseau coupé → repli */ }
  imgEl.src = 'assets/dyn-beach.jpg';
}

/* ── Dynamic Island : mise à jour depuis les objectifs ── */
function updateDynIsland() {
  if (!userAmbitions.length) return;
  const main = userAmbitions[0];
  const label = main.label || 'objectif';
  // Score d'ALIGNEMENT du produit avec l'objectif (défini par l'analyse IA, 4/10 par défaut)
  const score = Math.max(0, Math.min(10, Math.round(_alignScore)));
  const fill = document.getElementById('dyn-score-fill');
  if (fill) fill.style.width = (score * 10) + '%';
  const sc = document.getElementById('dyn-score');
  if (sc) sc.innerHTML = score + '/<span>10</span>';
  // State 1 rappel objectif
  const objTxt = document.getElementById('dyn-obj-txt');
  if (objTxt) objTxt.textContent = 'Je veux ' + label.toLowerCase() + ' !';
  // State 3 compact sous-titre
  const st3sub = document.getElementById('dyn-st3-sub');
  if (st3sub) st3sub.textContent = 'pour ' + label.toLowerCase();
  // State 3 dyn-extra
  const vlLbl = document.getElementById('dyn-vl-lbl');
  if (vlLbl) vlLbl.textContent = label.toUpperCase();
  const target = main.amount || 0;
  const saved  = parseFloat(localStorage.getItem('visioncopie_saved_' + label) || '0');
  const pct    = target > 0 ? Math.round(Math.min(100, saved / target * 100)) : 0;
  const missing = target > 0 ? Math.max(0, target - saved) : 0;
  const vlPct = document.getElementById('dyn-vl-pct');
  if (vlPct) vlPct.textContent = pct + '%';
  const vlFill = document.getElementById('dyn-vl-fill');
  if (vlFill) vlFill.style.width = pct + '%';
  const vlSub = document.getElementById('dyn-vl-sub');
  if (vlSub) vlSub.innerHTML = target > 0
    ? 'Il manque ' + missing.toLocaleString('fr-FR') + ' €. Continue !'
    : 'Définis un montant cible pour suivre ta progression.';
  // Image d'objectif réelle (photo libre selon l'objectif)
  setObjectiveImage(label);
  // Sites analysés pilotés par les objectifs
  if (typeof applyObjectiveSites === 'function') applyObjectiveSites();
}

/* ── Toggles sites ── */
function styleToggle(checkbox) {
  const track = checkbox.nextElementSibling;
  track.classList.toggle('on-track', checkbox.checked);
}

/* ── Transport highlight ── */
document.addEventListener('change', function(e) {
  if (e.target.name === 'transport') {
    document.querySelectorAll('#transportList label').forEach(l => {
      l.style.borderColor = l.querySelector('input').checked ? 'var(--og)' : 'transparent';
    });
  }
});

/* ── Journal modal (FAB +) ── */
let selectedJournalType = 'resistance';
function openJournal() {
  document.getElementById('journal-modal').style.display = 'block';
  document.getElementById('journal-desc').value = '';
  document.getElementById('journal-unit').value = '';
  selectedJournalType = 'resistance';
}
function closeJournal() {
  document.getElementById('journal-modal').style.display = 'none';
}
/* ── Popup "Comment monter de niveau" (? barre XP compagnon) ── */
function openXpHelp() { document.getElementById('xp-help-modal').style.display = 'block'; }
function closeXpHelp() { document.getElementById('xp-help-modal').style.display = 'none'; }

/* ── Notifications liées aux objectifs ── */
function buildNotifs() {
  const og = (getComputedStyle(document.documentElement).getPropertyValue('--og') || '#ff7e00').trim();
  const list = [];
  // Compagnon
  const pn = (typeof progressNotifs === 'function') ? progressNotifs() : null;
  list.push({ bar:'#63993d', ti:'Ton compagnon progresse', tx: pn ? pn.comp : "Ton compagnon gagne de l'XP à chaque résistance.", tm:'Il y a 1 h' });
  // Série / streak
  list.push({ bar:og, ti:'Série en cours 🔥', tx: pn ? pn.serie : 'Chaque jour sans craquage prolonge ta série.', tm:"Aujourd'hui · 09:12" });
  // Une notif par objectif choisi
  const tpl = {
    voyage:    { ti:'Objectif Voyage',        tx:"Il te manque 1 376 € pour ton voyage. En résistant à 2 achats/semaine, tu y es dans 3 mois." },
    liberte:   { ti:'Liberté financière',     tx:"Tu as résisté à 3 achats cette semaine — +96 € mis de côté pour ton objectif." },
    impact:    { ti:'Impact écologique',      tx:"36 kg de CO₂ évités cette semaine, soit 288 km en voiture non parcourus." },
    sante:     { ti:'Prendre soin de toi',    tx:"3 jours d'affilée sans commande de livraison. Ton corps te dit merci." },
    projet:    { ti:'Lancer un projet',       tx:"Tu as mis de côté l'équivalent de 2 mois d'abonnement pour financer ton projet." },
    formation: { ti:'Me former',              tx:"L'argent économisé cette semaine couvre une session de ta formation." },
    logement:  { ti:'Premier logement',       tx:"+120 € vers ton apport ce mois-ci. Chaque résistance te rapproche des clés." },
    societal:  { ti:"Avoir de l'impact",      tx:"Tes choix de la semaine ont évité 4 achats à fort impact." }
  };
  userAmbitions.forEach((a, i) => {
    const t = tpl[a.key];
    if (t) list.push({ bar:og, ti:t.ti, tx:t.tx, tm: i === 0 ? 'Il y a 3 h' : 'Hier · 19:30' });
  });
  // Esprit critique (si activé)
  if (typeof espritCritiqueOn !== 'undefined' && espritCritiqueOn) {
    list.push({ bar:'#7c5cdb', ti:'Esprit critique', tx:"Un article que tu consultes semble généré par IA. Croise tes sources avant de le partager.", tm:'Hier · 21:40' });
  }
  // Règle personnelle (si définie)
  if (typeof personalRules !== 'undefined' && personalRules.length) {
    list.push({ bar:'#e8563a', ti:'Rappel de ta règle', tx:'« ' + personalRules[0] + ' » — on t\'alertera si un achat va à son encontre.', tm:'Hier · 18:05' });
  }
  return list;
}
/* La notification "qui vient d'arriver" — comparaison sociale liée à l'objectif principal */
function buildNewNotif() {
  const first = userAmbitions[0];
  const k = first ? first.key : 'liberte';
  const label = first ? first.label : 'Liberté financière';
  const data = {
    voyage:    { amount:'240', obj:'vêtements jamais portés' },
    liberte:   { amount:'180', obj:"appareils qu'ils n'utilisaient plus" },
    impact:    { amount:'150', obj:'objets en double' },
    sante:     { amount:'90',  obj:'équipements de sport oubliés' },
    projet:    { amount:'320', obj:'affaires qui dormaient dans un placard' },
    formation: { amount:'200', obj:'vieux livres et matériel' },
    logement:  { amount:'410', obj:'meubles inutilisés' },
    societal:  { amount:'130', obj:'objets du quotidien en trop' }
  };
  const d = data[k] || data.liberte;
  return {
    lbl: 'LA COMMUNAUTÉ',
    tx: `Plusieurs personnes ont économisé ${d.amount} € en revendant leurs ${d.obj}. Pourquoi pas toi ? Aide ton objectif ${label}.`
  };
}

function renderNotifs() {
  const box = document.getElementById('notif-list');
  if (!box) return;
  box.innerHTML = '';
  // 1) Nouvelle notification — rectangle orange, typo blanche
  const nn = buildNewNotif();
  const card = document.createElement('div');
  card.className = 'notif-new';
  card.innerHTML = `<div class="nn-lbl">${escHTML(nn.lbl)} · NOUVEAU</div><div class="nn-tx">${escHTML(nn.tx)}</div>`;
  box.appendChild(card);
  // 2) Séparateur
  const sec = document.createElement('div');
  sec.className = 'notif-sec';
  sec.textContent = 'PLUS TÔT';
  box.appendChild(sec);
  // 3) Notifications déjà lues
  buildNotifs().forEach(n => {
    const row = document.createElement('div');
    row.className = 'notif-row read';
    row.innerHTML = `<div class="notif-bar" style="background:${n.bar}"></div>
      <div class="notif-bd"><div class="notif-ti">${escHTML(n.ti)}</div><div class="notif-tx">${escHTML(n.tx)}</div><div class="notif-tm">${escHTML(n.tm)}</div></div>`;
    box.appendChild(row);
  });
}
function openNotifs() {
  renderNotifs();
  document.getElementById('notif-modal').style.display = 'block';
}
function closeNotifs() {
  document.getElementById('notif-modal').style.display = 'none';
  document.querySelectorAll('.bell-btn').forEach(b => b.classList.remove('has-notif')); // marque comme lu
}

/* ── Sites à ne pas analyser (liste d'exclusion) — persistée ── */
let excludedSites = (function(){
  try { const s = JSON.parse(localStorage.getItem('visioncopie_excl') || 'null'); if (Array.isArray(s)) return s; } catch(e){}
  return ['Société générale', 'Netflix'];
})();
function saveExcludedSites(){ try { localStorage.setItem('visioncopie_excl', JSON.stringify(excludedSites)); } catch(e){} }
function renderExclList() {
  const list = document.getElementById('excl-list');
  if (!list) return;
  list.innerHTML = '';
  if (!excludedSites.length) {
    list.innerHTML = '<div style="font-size:12px;color:var(--muted);padding:8px 10px;">Aucun site exclu.</div>';
    return;
  }
  excludedSites.forEach((name, i) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:10px;';
    row.innerHTML = `
      <span style="color:var(--og);">▪</span>
      <span style="flex:1;font-size:13px;color:var(--dark);">${escHTML(name)}</span>
      <button onclick="removeExclSite(${i})" aria-label="Retirer" style="background:none;border:none;cursor:pointer;font-size:18px;line-height:1;color:var(--muted);padding:2px 6px;font-family:inherit;">✕</button>`;
    list.appendChild(row);
  });
}
function openExcl() {
  const inp = document.getElementById('excl-input');
  if (inp) inp.value = '';
  document.getElementById('excl-modal').style.display = 'block';
  setTimeout(() => { if (inp) inp.focus(); }, 50);
}
function closeExcl() { document.getElementById('excl-modal').style.display = 'none'; }
function addExclSite() {
  const inp = document.getElementById('excl-input');
  const name = (inp ? inp.value : '').trim();
  if (!name) { if (inp) inp.focus(); return; }
  if (!excludedSites.some(s => s.toLowerCase() === name.toLowerCase())) {
    excludedSites.push(name);
  }
  saveExcludedSites();
  renderExclList();
  closeExcl();
}
function removeExclSite(i) {
  excludedSites.splice(i, 1);
  saveExcludedSites();
  renderExclList();
}
async function saveJournalEntry() {
  const desc = document.getElementById('journal-desc').value.trim();
  const unit = document.getElementById('journal-unit').value.trim();
  if (!desc) { document.getElementById('journal-desc').focus(); return; }
  const isResist = selectedJournalType === 'resistance';
  const amountStr = unit ? ` — ${isResist ? '+' : '-'}${unit}` : '';
  // Journal persistant (résistance = vert, craquage = gris)
  addJournalLine(isResist ? 'resist' : 'craq', desc + amountStr);
  closeJournal();
  go('s-home');
  // L'IA rattache l'entrée à un objectif et ajuste l'épargne (+ ou −)
  try { await _journalApplyToObjective(desc, unit, isResist); } catch(e){}
}

/* Applique une entrée de journal à un objectif (via IA, repli heuristique). */
async function _journalApplyToObjective(desc, unit, isResist){
  if (!userAmbitions.length) return;
  const numFromUnit = parseFloat(String(unit || '').replace(',', '.').replace(/[^\d.]/g, '')) || 0;
  let label = null, delta = 0, reason = '';

  if (typeof getClaudeKey === 'function' && getClaudeKey()) {
    const reply = await _claudeOneShot(
      `Tu rattaches une entrée de journal à UN objectif d'épargne de l'utilisateur. Réponds en JSON uniquement, sans texte autour :
{"objectif":"libellé EXACT d'un objectif de la liste, ou null si aucun ne correspond","delta":<nombre signé en € à AJOUTER à l'épargne de cet objectif : POSITIF si l'entrée rapproche de l'objectif (résistance, économie réalisée), NÉGATIF si elle en éloigne (achat impulsif, dépense)>,"raison":"courte phrase"}`,
      `${_userContext()}\nObjectifs : ${userAmbitions.map(a => a.label).join(' | ')}.\nEntrée de journal (${isResist ? 'résistance' : 'craquage'}) : « ${desc} ». Valeur saisie : « ${unit || '—'} ».`,
      160
    );
    let d; try { d = JSON.parse(reply.match(/\{[\s\S]*\}/)?.[0]); } catch(e){}
    if (d) {
      if (d.objectif && String(d.objectif).toLowerCase() !== 'null') {
        const m = userAmbitions.find(a => a.label.toLowerCase() === String(d.objectif).toLowerCase());
        if (m) label = m.label;
      }
      if (!isNaN(parseFloat(d.delta))) delta = parseFloat(d.delta);
      reason = d.raison || '';
    }
  }
  // Repli heuristique : valeur saisie → objectif principal (+ si résistance, − sinon)
  if (!label) { label = userAmbitions[0].label; if (!delta) delta = (isResist ? 1 : -1) * numFromUnit; }
  if (label && delta) {
    const key = 'visioncopie_saved_' + label;
    const cur = parseFloat(localStorage.getItem(key) || '0');
    localStorage.setItem(key, String(Math.max(0, +(cur + delta).toFixed(2))));
    if (typeof renderHomeMetrics === 'function') renderHomeMetrics();
    if (typeof renderHomeAmbitions === 'function') renderHomeAmbitions();
    updateDynIsland();
    if (typeof checkMilestones === 'function') checkMilestones();
  }
}
