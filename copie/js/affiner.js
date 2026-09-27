/* ════════════════════════════════════════════════════════════
   AFFINER — pause respiration réglable, bilan des déclencheurs,
   réponses suggérées dans le chat, accessibilité clavier
════════════════════════════════════════════════════════════ */

/* ── F10 · Durée de la pause avant « J'y vais tout de même » (3 à 30 s) ── */
const PAUSE_KEY = 'visioncopie_pause';
function getPauseSecs(){
  let v = 30;
  try { v = parseInt(localStorage.getItem(PAUSE_KEY) || '30', 10); } catch(e){}
  return Math.min(30, Math.max(3, isNaN(v) ? 30 : v));
}
function setPauseSecs(v){
  const n = Math.min(30, Math.max(3, parseInt(v, 10) || 30));
  try { localStorage.setItem(PAUSE_KEY, String(n)); } catch(e){}
  renderPauseSetting();
}
function renderPauseSetting(){
  const n = getPauseSecs();
  const r = document.getElementById('pause-range'); if (r) r.value = n;
  const l = document.getElementById('pause-val'); if (l) l.textContent = n + ' s';
}

/* Respiration guidée pendant la pause : 4 s inspire, 4 s expire */
let _breathT = null;
function startBreathing(){
  stopBreathing();
  const el = document.getElementById('emo-breath');
  const ring = document.querySelector('#s-emo .dk-ring');
  if (!el) return;
  let inhale = true;
  const step = () => {
    el.textContent = inhale ? 'Inspire…' : 'Expire…';
    if (ring) ring.classList.toggle('breathe-in', inhale);
    inhale = !inhale;
  };
  step();
  _breathT = setInterval(step, 4000);
}
function stopBreathing(){
  if (_breathT) { clearInterval(_breathT); _breathT = null; }
  const ring = document.querySelector('#s-emo .dk-ring'); if (ring) ring.classList.remove('breathe-in');
  const el = document.getElementById('emo-breath'); if (el) el.textContent = 'Tu peux choisir.';
}

/* ── F11 · Bilan des déclencheurs (écran Historique) ── */
const MOOD_LABELS = ['', 'Très mal', 'Mal', 'Bof', 'Bien', 'Très bien'];
const TIME_SLOTS = [
  { key: 'matin',  when: 'le matin',      label: 'Matin (6 h–12 h)',       test: h => h >= 6 && h < 12 },
  { key: 'aprem',  when: "l'après-midi", label: 'Après-midi (12 h–18 h)', test: h => h >= 12 && h < 18 },
  { key: 'soir',   when: 'le soir',       label: 'Soir (18 h–23 h)',       test: h => h >= 18 && h < 23 },
  { key: 'nuit',   when: 'la nuit',       label: 'Nuit (23 h–6 h)',        test: h => h >= 23 || h < 6 }
];

function triggerStats(events){
  const total = events.length;
  const craqs = events.filter(e => e.type === 'craq');
  const resists = total - craqs.length;
  const emo = {};
  events.forEach(e => (e.emotions || []).forEach(n => {
    emo[n] = emo[n] || { name: n, count: 0, craq: 0 };
    emo[n].count++; if (e.type === 'craq') emo[n].craq++;
  }));
  const slots = TIME_SLOTS.map(s => {
    const inSlot = events.filter(e => s.test(new Date(e.ts).getHours()));
    return { label: s.label, when: s.when, count: inSlot.length, craq: inSlot.filter(e => e.type === 'craq').length };
  });
  const avg = list => { const m = list.map(e => e.mood).filter(v => v >= 1 && v <= 5); return m.length ? m.reduce((a, b) => a + b, 0) / m.length : null; };
  const reasons = {};
  craqs.forEach(e => { if (e.reason) reasons[e.reason] = (reasons[e.reason] || 0) + 1; });
  return {
    total, resists, craqs: craqs.length,
    emotions: Object.values(emo).sort((a, b) => b.count - a.count).slice(0, 3),
    slots,
    moodCraq: avg(craqs), moodResist: avg(events.filter(e => e.type === 'resist')),
    reasons: Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 3)
  };
}

function renderTriggers(){
  const box = document.getElementById('triggers-body');
  if (!box) return;
  const events = (typeof loadEvents === 'function') ? loadEvents() : [];
  if (!events.length) {
    box.innerHTML = '<div class="trg-empty">Pas encore de données. Chaque tentation passée par l\'écran « Comment tu te sens là ? » viendra nourrir ce bilan.</div>';
    return;
  }
  const s = triggerStats(events);
  const pct = n => Math.round(n / s.total * 100);
  const bar = (n, max, hot) => '<div class="trg-bar"><div class="trg-fill' + (hot ? ' hot' : '') + '" style="width:' + (max ? Math.round(n / max * 100) : 0) + '%"></div></div>';
  const moodTxt = v => v == null ? '—' : MOOD_LABELS[Math.round(v)];
  const maxSlot = Math.max(...s.slots.map(x => x.count));
  const worstSlot = s.slots.reduce((a, b) => (b.craq > a.craq ? b : a), s.slots[0]);

  let html = '<div class="trg-sum"><strong>' + s.total + '</strong> tentation' + (s.total > 1 ? 's' : '') +
    ' · <strong>' + s.resists + '</strong> résistée' + (s.resists > 1 ? 's' : '') + ' (' + pct(s.resists) + ' %)</div>';

  if (s.emotions.length) {
    html += '<div class="trg-h">Émotions les plus fréquentes</div>';
    const maxE = s.emotions[0].count;
    s.emotions.forEach(e => {
      html += '<div class="trg-row"><span class="trg-l">' + escHTML(e.name) + '</span><span class="trg-n">' + e.count + ' fois' +
        (e.craq ? ' · ' + e.craq + ' achat' + (e.craq > 1 ? 's' : '') : '') + '</span></div>' + bar(e.count, maxE, e.craq > 0);
    });
  }

  html += '<div class="trg-h">Moments des tentations</div>';
  s.slots.forEach(x => {
    html += '<div class="trg-row"><span class="trg-l">' + x.label + '</span><span class="trg-n">' + x.count +
      (x.craq ? ' · ' + x.craq + ' achat' + (x.craq > 1 ? 's' : '') : '') + '</span></div>' + bar(x.count, maxSlot, x.craq > 0 && x === worstSlot);
  });

  html += '<div class="trg-h">Humeur moyenne</div>' +
    '<div class="trg-row"><span class="trg-l">Quand tu résistes</span><span class="trg-n">' + moodTxt(s.moodResist) + '</span></div>' +
    '<div class="trg-row"><span class="trg-l">Quand tu achètes</span><span class="trg-n">' + moodTxt(s.moodCraq) + '</span></div>';

  if (s.reasons.length) {
    html += '<div class="trg-h">Raisons données après un achat</div>';
    s.reasons.forEach(([r, n]) => { html += '<div class="trg-row"><span class="trg-l">' + escHTML(r) + '</span><span class="trg-n">' + n + ' fois</span></div>'; });
  }

  if (worstSlot.craq > 0) {
    html += '<div class="trg-tip">Tu craques surtout ' + worstSlot.when +
      '. Prévois une alternative pour ce moment-là.</div>';
  }
  box.innerHTML = html;
}

/* ── F9 · Réponses suggérées sous chaque message du compagnon ── */
const CHAT_SUGGEST_RULE = "\nTermine TOUJOURS par une dernière ligne au format exact « SUGGESTIONS: réponse 1 | réponse 2 | réponse 3 » : trois réponses courtes (5 mots max) que l'utilisateur pourrait te donner.";

/* Sépare la réponse de l'IA de sa ligne de suggestions */
function splitSuggestions(reply){
  const m = String(reply || '').match(/\n?\s*SUGGESTIONS\s*:\s*(.+)\s*$/i);
  if (!m) return { text: String(reply || '').trim(), chips: null };
  const chips = m[1].split('|').map(s => s.trim()).filter(Boolean).slice(0, 3);
  return { text: String(reply).slice(0, m.index).trim(), chips: chips.length ? chips : null };
}

function defaultChatChips(){
  const obj = (typeof userAmbitions !== 'undefined' && userAmbitions[0]) ? userAmbitions[0].label : 'mon objectif';
  return ['Une idée concrète pour ' + obj, 'Combien je dois épargner ?', "J'ai envie d'acheter un truc"];
}

function appendChatChips(chips){
  const msgs = document.getElementById('chatMessages');
  if (!msgs || !chips || !chips.length) return;
  msgs.querySelectorAll('.chat-chips').forEach(c => c.remove());   // une seule rangée active
  const row = document.createElement('div');
  row.className = 'chat-chips';
  chips.forEach(t => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'chat-chip'; b.textContent = t;
    b.onclick = () => addChatMessage(b);
    row.appendChild(b);
  });
  msgs.appendChild(row);
  msgs.scrollTop = msgs.scrollHeight;
}

/* ── Accessibilité clavier : les éléments role="button" réagissent à Entrée / Espace ── */
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('[role="button"]')) {
    e.preventDefault();
    e.target.click();
  }
});
