/* ── Claude API + Chat IA ── */
const CLAUDE_KEY_LS = 'vision_claude_key';
/* Modèle Claude utilisé PARTOUT (validation, scan produit, analyses, chat).
   Un seul endroit à changer si le nom de modèle évolue. */
const CLAUDE_MODEL = 'claude-haiku-4-5-20251001';
window._lastClaudeError = null;   // dernière erreur API (diagnostic)
function getClaudeKey(){ return (localStorage.getItem(CLAUDE_KEY_LS)||'').trim(); }
let chatHistory = [];

function _chatSystemPrompt(){
  const persoMap = { foxy:'curieux, motivant, enthousiaste', malo:'calme, stratège, posé', elio:'fun, décalé, créatif', ryo:'sérieux, rigoureux, discipliné' };
  const name = themes[currentTheme]?.name || 'Foxy';
  const perso = persoMap[currentTheme] || 'bienveillant';
  const objs = userAmbitions.length ? userAmbitions.map(a=>a.label).join(', ') : 'non encore définis';
  return `Tu es ${name}, compagnon IA de l'app Vision. Personnalité : ${perso}. Objectifs de l'utilisateur : ${objs}.
Mission : aider l'utilisateur à visualiser son futur dans 90 jours, affiner ses objectifs et résister aux dépenses impulsives.
Règles ABSOLUES : max 3 phrases courtes · toujours en français · 1 seule question à la fin · emojis rares · pas de listes.`
    + (typeof CHAT_SUGGEST_RULE !== 'undefined' ? CHAT_SUGGEST_RULE : '');
}

function _chatMockReply(text){
  const objs = userAmbitions.length ? userAmbitions[0].label : 'ton objectif';
  const r = [
    `Pour ${objs}, quelle est la première action concrète que tu pourrais faire cette semaine ? 🎯`,
    `Intéressant ! En 90 jours, tu te vois où concrètement par rapport à ${objs} ?`,
    `J'ai noté ça. Quel montant ou quelle étape te permettrait de savoir que tu avances vers ${objs} ? 📊`,
    `${objs}, c'est important pour toi. Quelle dépense pourrais-tu éviter cette semaine pour t'en rapprocher ? 💰`,
  ];
  return r[Math.floor(Math.random()*r.length)];
}

async function callClaude(userText){
  const key = getClaudeKey();
  if(!key) return null;
  chatHistory.push({ role:'user', content:userText });
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 300,
        system: _chatSystemPrompt(),
        messages: chatHistory
      })
    });
    if(!res.ok) return null;
    const data = await res.json();
    const reply = data.content?.[0]?.text || '';
    if(reply) chatHistory.push({ role:'assistant', content:reply });
    return reply || null;
  } catch(e){ return null; }
}

function _appendCompMsg(text){
  const msgs = document.getElementById('chatMessages');
  const t = themes[currentTheme];
  const el = document.createElement('div');
  el.style.cssText = 'display:flex;gap:8px;align-items:flex-end;';
  el.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;overflow:hidden;position:relative;flex-shrink:0;background:#ffe5cc;"><img src="${t.img}" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;" alt=""></div><div style="background:white;border-radius:16px 16px 16px 4px;padding:12px 14px;max-width:230px;box-shadow:none;"><p style="font-size:13px;color:#1a1a1a;line-height:1.5;margin:0;">${escHTML(text)}</p></div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
}

function _appendTypingDots(){
  const msgs = document.getElementById('chatMessages');
  const t = themes[currentTheme];
  const el = document.createElement('div');
  el.id = 'chat-typing';
  el.style.cssText = 'display:flex;gap:8px;align-items:flex-end;';
  const dot = 'width:7px;height:7px;border-radius:50%;background:#ccc;display:inline-block;';
  el.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;overflow:hidden;position:relative;flex-shrink:0;background:#ffe5cc;"><img src="${t.img}" style="width:100%;height:100%;object-fit:contain;image-rendering:pixelated;" alt=""></div><div style="background:white;border-radius:16px 16px 16px 4px;padding:12px 14px;box-shadow:none;display:flex;gap:5px;align-items:center;"><span style="${dot}animation:dotPulse 1.2s ease-in-out infinite;"></span><span style="${dot}animation:dotPulse 1.2s ease-in-out .2s infinite;"></span><span style="${dot}animation:dotPulse 1.2s ease-in-out .4s infinite;"></span></div>`;
  msgs.appendChild(el);
  msgs.scrollTop = msgs.scrollHeight;
  return el;
}

async function _sendText(text){
  const msgs = document.getElementById('chatMessages');
  const userMsg = document.createElement('div');
  userMsg.style.cssText = 'display:flex;justify-content:flex-end;';
  userMsg.innerHTML = `<div style="background:linear-gradient(90deg,var(--og),var(--og2));color:white;border-radius:16px 16px 4px 16px;padding:10px 14px;max-width:230px;font-size:13px;line-height:1.4;">${escHTML(text)}</div>`;
  msgs.appendChild(userMsg);
  msgs.scrollTop = msgs.scrollHeight;
  const dots = _appendTypingDots();
  const reply = await callClaude(text);
  dots.remove();
  // Réponse IA : on retire sa ligne « SUGGESTIONS: … » et on l'affiche en pastilles
  const parts = (typeof splitSuggestions === 'function') ? splitSuggestions(reply) : { text: reply, chips: null };
  _appendCompMsg(parts.text || _chatMockReply(text));
  if (typeof appendChatChips === 'function') appendChatChips(parts.chips || defaultChatChips());
}

function addChatMessage(el){
  const text = el.textContent;
  el.parentElement?.remove(); // retire les chips de suggestions
  _sendText(text);
}

/* ── SMART Objective Flow ── */
let smartStep = 1;
let smartObj = {};
let smartAnswers = {};

const smartData = {
  liberte: {
    question: 'Liberté financière... c\'est quoi exactement pour toi ?',
    chips: ['Épargner de l\'argent', 'Rembourser mes dettes', 'Fonds d\'urgence', 'Investir', 'Me verser un salaire'],
    units: ['€', '%', 'mois de salaire'],
    amountPh: '1500',
  },
  voyage: {
    question: 'Voyager... tu penses à quoi concrètement ?',
    chips: ['Un week-end en Europe', 'Un voyage d\'1 mois+', 'Partir seul(e)', 'Un tour du monde', 'Vivre à l\'étranger'],
    units: ['€', 'pays', 'jours', '% du budget'],
    amountPh: '500',
  },
  impact: {
    question: 'Réduire ton impact... par où tu commences ?',
    chips: ['Mode & vêtements', 'Alimentation', 'Transport', 'Consommation', 'Déchets'],
    units: ['kg CO₂', '%', 'achats évités'],
    amountPh: '25',
  },
  projet: {
    question: 'Lancer un projet... quel genre ?',
    chips: ['Side-project perso', 'Créer ma boîte', 'Lancer une chaîne', 'Sortir une appli', 'Écrire un livre'],
    units: ['heures/semaine', 'étapes', '%', 'utilisateurs'],
    amountPh: '5',
  },
  formation: {
    question: 'Te former... sur quoi exactement ?',
    chips: ['Apprendre une langue', 'Coder / dev', 'Design / UX', 'Marketing', 'Une compétence métier'],
    units: ['heures/semaine', 'modules', 'niveaux', 'pages/livres'],
    amountPh: '3',
  },
  sante: {
    question: 'Prendre soin de toi... ça veut dire quoi pour toi ?',
    chips: ['Faire du sport régulièrement', 'Mieux dormir', 'Manger plus sain', 'Méditer', 'Stop écrans le soir'],
    // Pas d'argent ici — unités physiques/temporelles concrètes
    units: ['min/jour', 'séances/semaine', 'h de sommeil', 'kg', 'jours d\'affilée'],
    amountPh: '30',
  },
  logement: {
    question: 'Premier logement... quel objectif concret ?',
    chips: ['Apport pour un achat', 'Premier appart en location', 'Quitter chez les parents', 'Coloc → perso', 'Acheter mon studio'],
    units: ['€', 'mois d\'apport', 'm²'],
    amountPh: '10000',
  },
  societal: {
    question: 'Avoir de l\'impact... dans quel domaine ?',
    chips: ['Bénévolat', 'Mentorer quelqu\'un', 'Don régulier', 'Engagement assoc', 'Sensibiliser autour de moi'],
    units: ['heures/mois', 'personnes touchées', '€ de dons', 'actions'],
    amountPh: '4',
  },
};

function openSmart(key, label, emoji, existingLabel) {
  smartObj = { key, label, emoji };
  smartAnswers = { specific: '', amount: '', unit: '€', time: '', generated: existingLabel || '' };
  smartStep = 1;

  document.getElementById('smart-emoji').textContent = '';
  document.getElementById('smart-title').textContent = label;

  const data = smartData[key] || { question: label + '... c\'est quoi concrètement ?', chips: [] };
  document.getElementById('smart-q1').textContent = data.question;

  // Générer les chips
  const chipsCont = document.getElementById('smart-chips-1');
  chipsCont.innerHTML = '';
  data.chips.forEach(chip => {
    const el = document.createElement('div');
    el.className = 'chip';
    el.textContent = chip;
    el.onclick = function() {
      chipsCont.querySelectorAll('.chip').forEach(c => c.classList.remove('on'));
      this.classList.add('on');
      document.getElementById('smart-input-s').value = chip;
    };
    chipsCont.appendChild(el);
  });

  document.getElementById('smart-input-s').value = '';
  document.getElementById('smart-amount').value = '';

  // Peuple le dropdown UNITÉS en fonction du type d'ambition (santé → min/jour, séances/sem...)
  const unitSel = document.getElementById('smart-unit');
  const units = (data.units && data.units.length) ? data.units : ['€', '%', 'autre'];
  if (unitSel) {
    unitSel.innerHTML = '';
    units.forEach(u => {
      const opt = document.createElement('option');
      opt.value = u; opt.textContent = u;
      unitSel.appendChild(opt);
    });
    unitSel.value = units[0];
  }
  // Placeholder du montant adapté à l'ambition
  const amountInput = document.getElementById('smart-amount');
  if (amountInput) amountInput.placeholder = data.amountPh || '500';

  document.querySelectorAll('#smart-time-chips .smart-time-chip').forEach(c => c.classList.remove('on'));

  // Si l'ambition a déjà été affinée → saute au résultat avec le label existant
  if (existingLabel) {
    [1, 2, 3].forEach(i => document.getElementById('smart-step-' + i).style.display = 'none');
    document.getElementById('smart-result').style.display = 'block';
    document.getElementById('smart-generated').textContent = existingLabel;
    const nav = document.getElementById('smart-nav');
    if (nav) nav.style.display = 'none';
  } else {
    showSmartStep(1);
    const nav = document.getElementById('smart-nav');
    if (nav) nav.style.display = 'flex';
  }

  document.getElementById('smart-sheet').style.display = 'block';
  // Cache le bouton Supprimer pendant le tutoriel
  const delBtn = document.getElementById('smart-delete-btn');
  if (delBtn) {
    const inTour = typeof tourActive !== 'undefined' && tourActive;
    delBtn.style.display = inTour ? 'none' : 'block';
  }
}

function closeSmart() {
  document.getElementById('smart-sheet').style.display = 'none';
}

function showSmartStep(step) {
  smartStep = step;
  [1, 2, 3].forEach(i => {
    document.getElementById('smart-step-' + i).style.display = i === step ? 'block' : 'none';
  });
  document.getElementById('smart-result').style.display = 'none';
  document.getElementById('smart-nav').style.display = 'flex';
  // Dots
  document.querySelectorAll('#smart-dots .smart-dot').forEach((d, i) => {
    d.classList.toggle('on', i < step);
  });
  // Bouton label
  const btn = document.getElementById('smart-next-btn');
  btn.textContent = step < 3 ? 'Suivant →' : 'Générer mon objectif ✨';
}

function smartNext() {
  if (smartStep === 1) {
    const val = document.getElementById('smart-input-s').value.trim();
    if (!val) { document.getElementById('smart-input-s').focus(); return; }
    smartAnswers.specific = val;
    showSmartStep(2);
  } else if (smartStep === 2) {
    const amount = document.getElementById('smart-amount').value.trim();
    if (!amount) { document.getElementById('smart-amount').focus(); return; }
    smartAnswers.amount = amount;
    smartAnswers.unit = document.getElementById('smart-unit').value;
    showSmartStep(3);
  } else if (smartStep === 3) {
    if (!smartAnswers.time) {
      document.querySelector('#smart-time-chips .smart-time-chip').style.borderColor = 'var(--og)';
      return;
    }
    showSmartResult();
  }
}

function selectTime(el, time) {
  document.querySelectorAll('#smart-time-chips .smart-time-chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  smartAnswers.time = time;
}

function showSmartResult() {
  [1, 2, 3].forEach(i => document.getElementById('smart-step-' + i).style.display = 'none');
  document.getElementById('smart-nav').style.display = 'none';
  document.getElementById('smart-result').style.display = 'block';
  // Générer le texte de l'objectif
  const generated = `${smartAnswers.specific} — ${smartAnswers.amount} ${smartAnswers.unit} en ${smartAnswers.time}.`;
  document.getElementById('smart-generated').textContent = generated;
  smartAnswers.generated = generated;
}

function saveSmart() {
  const key = smartObj.key;
  const card = document.querySelector(`[data-smart-key="${key}"]`);
  if (card) {
    const desc = card.querySelector('.smart-obj-desc');
    if (desc) desc.textContent = smartAnswers.generated;
    document.querySelectorAll('.smart-obj-card').forEach(c => c.classList.remove('primary'));
    card.classList.add('primary');
  }
  // Ajoute / met à jour l'ambition dans userAmbitions
  const meta = AMBITION_TYPES.find(t => t.key === key);
  if (meta) {
    const existing = userAmbitions.findIndex(a => a.key === key);
    const entry = {...meta, smartLabel: smartAnswers.generated};
    if (existing >= 0) userAmbitions[existing] = entry;
    else userAmbitions.push(entry);
    saveAmbitions();
    renderHomeAmbitions();
    if (typeof renderMyAmbitions === 'function') renderMyAmbitions();
    if (typeof renderHomeMetrics === 'function') renderHomeMetrics();
    updateDynIsland();
  }
  closeSmart();
}

/* Supprime l'ambition courante (depuis SMART popup) */
function deleteCurrentAmbition() {
  if (typeof tourActive !== 'undefined' && tourActive) return; // bloqué pendant tutoriel
  const key = smartObj.key;
  if (!key) return;
  if (!confirm('Supprimer cet objectif ?')) return;
  userAmbitions = userAmbitions.filter(a => a.key !== key);
  saveAmbitions();
  renderHomeAmbitions();
  if (typeof renderHomeMetrics === 'function') renderHomeMetrics();
  updateDynIsland();
  closeSmart();
}

/* Type picker pour "+ Ajouter un objectif" */
function openAmbitionPicker() {
  if (userAmbitions.length >= 3) {
    alert('Tu as déjà 3 objectifs (maximum). Retires-en un pour en ajouter un autre.');
    return;
  }
  const list = document.getElementById('ambition-types-list');
  if (!list) return;
  list.innerHTML = '';
  AMBITION_TYPES.forEach(t => {
    // Ne pas re-proposer ce qui est déjà sélectionné
    if (userAmbitions.some(a => a.key === t.key)) return;
    const btn = document.createElement('button');
    btn.style.cssText = 'display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;background:#fafafa;border:1.5px solid #e8e8e8;border-radius:12px;cursor:pointer;font-family:inherit;font-size:14px;color:#1a1a1a;text-align:left;';
    btn.innerHTML = `<span style="font-weight:600">${t.label}</span>`;
    btn.onclick = function() {
      closeAmbitionPicker();
      openSmart(t.key, t.label, t.emoji);
    };
    list.appendChild(btn);
  });
  document.getElementById('ambition-picker').style.display = 'block';
}
function closeAmbitionPicker() {
  const el = document.getElementById('ambition-picker');
  if (el) el.style.display = 'none';
}

function sendChatMessage(){
  const input = document.getElementById('chatInput');
  const text = input.value.trim();
  if(!text) return;
  input.value = '';
  _sendText(text);
}
