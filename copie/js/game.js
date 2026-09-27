/* ════════════════════════════════════════════════════════════
   GAME — socle commun de la gamification (inspiré de Duolingo)
   · Graines 🌱 (monnaie), boucliers de série, quêtes du jour,
     ligue de la semaine, jours actifs (calendrier de série)
   · Chaque gain émet un événement 'vision:game' sur window :
       window.addEventListener('vision:game', e => e.detail)
     detail = { type: 'xp' | 'gems' | 'quest-done' | 'quests-all-done'
                      | 'freeze-used' | 'freeze-bought' | 'streak-broken'
                      | 'league-change', ... }
     Les écrans (célébration, série, quêtes, ligue…) s'y abonnent
     sans modifier ce fichier.
   · État stocké dans visioncopie_progress (voir progression.js)
════════════════════════════════════════════════════════════ */

const GAME = {
  gems: { resist: 10, milestone: 50, quest: 15, allQuests: 30 },
  freeze: { price: 200, max: 2 },
  quests: { perDay: 3 },
  league: { size: 10, promote: 3, demote: 3 }
};

/* Niveaux de ligue (du plus bas au plus haut) — thème « croissance » du compagnon */
const LEAGUE_TIERS = ['Graine', 'Pousse', 'Bourgeon', 'Fleur', 'Arbuste', 'Arbre', 'Forêt'];

/* ── Dates ── */
function dayKey(ts){
  const d = new Date(ts == null ? Date.now() : ts);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function weekKey(ts){
  const d = new Date(ts == null ? Date.now() : ts);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
  return dayKey(monday.getTime());
}

/* ── Événements ── */
function emitGame(type, detail){
  try { window.dispatchEvent(new CustomEvent('vision:game', { detail: Object.assign({ type }, detail || {}) })); } catch(e){}
}

/* ── État (dans l'objet `progress` de progression.js) ── */
function _gameState(){
  if (typeof progress === 'undefined') return null;
  if (typeof progress.gems !== 'number') progress.gems = 0;
  if (typeof progress.freezes !== 'number') progress.freezes = 0;
  if (!Array.isArray(progress.activeDays)) progress.activeDays = [];
  if (typeof progress.weekXp !== 'number') progress.weekXp = 0;
  if (typeof progress.week !== 'string') progress.week = weekKey();
  if (typeof progress.league !== 'number') progress.league = 0;
  if (!progress.quests || typeof progress.quests !== 'object') progress.quests = { day: '', list: [], bonus: false };
  _rollWeek();
  return progress;
}

/* Changement de semaine : classement final → montée / descente de ligue */
let _rolling = false;
function _rollWeek(){
  const wk = weekKey();
  if (_rolling || progress.week === wk) return;
  _rolling = true;
  const prevWeek = progress.week;
  const standings = leagueStandings(prevWeek, progress.weekXp, true);
  const rank = standings.findIndex(p => p.me) + 1;
  const before = progress.league;
  if (progress.weekXp > 0 && rank > 0 && rank <= GAME.league.promote) progress.league = Math.min(LEAGUE_TIERS.length - 1, progress.league + 1);
  else if (rank > GAME.league.size - GAME.league.demote) progress.league = Math.max(0, progress.league - 1);
  progress.lastWeek = { week: prevWeek, rank, xp: progress.weekXp, from: before, to: progress.league };
  progress.week = wk;
  progress.weekXp = 0;
  _rolling = false;
  if (before !== progress.league) emitGame('league-change', { from: before, to: progress.league, rank });
}

/* ── Jours actifs (au moins une action : résistance, humeur, journal, analyse…) ── */
function markActiveDay(){
  const s = _gameState(); if (!s) return;
  const k = dayKey();
  if (!s.activeDays.includes(k)) { s.activeDays.push(k); s.activeDays = s.activeDays.slice(-120); }
}
function isActiveDay(key){ const s = _gameState(); return !!(s && s.activeDays.includes(key)); }

/* ── XP et graines ── */
function addXp(n, reason, opts){
  const s = _gameState(); if (!s || !n) return;
  s.xp += n;
  s.weekXp += n;
  if (!(opts && opts.passive)) markActiveDay();
  _saveProgress();
  if (!(opts && opts.quiet)) emitGame('xp', { amount: n, reason: reason || '', total: s.xp });
  if (reason !== 'quete') questEvent('xp', n);
}
function addGems(n, reason){
  const s = _gameState(); if (!s || !n) return;
  s.gems += n;
  _saveProgress();
  emitGame('gems', { amount: n, reason: reason || '', total: s.gems });
}
function spendGems(n){
  const s = _gameState(); if (!s || s.gems < n) return false;
  s.gems -= n; _saveProgress();
  return true;
}

/* ── Boucliers de série : absorbent un achat sans casser la série ── */
function buyFreeze(){
  const s = _gameState(); if (!s) return { ok: false, why: 'etat' };
  if (s.freezes >= GAME.freeze.max) return { ok: false, why: 'max' };
  if (!spendGems(GAME.freeze.price)) return { ok: false, why: 'graines' };
  s.freezes += 1; _saveProgress();
  emitGame('freeze-bought', { freezes: s.freezes });
  return { ok: true };
}
/* Appelé par progression.js au moment d'un craquage : true = série protégée */
function useFreezeIfAny(){
  const s = _gameState(); if (!s || s.freezes <= 0) return false;
  s.freezes -= 1; _saveProgress();
  emitGame('freeze-used', { freezes: s.freezes, streak: typeof streakDays === 'function' ? streakDays() : 0 });
  return true;
}

/* ── Quêtes du jour ── */
const QUEST_TEMPLATES = [
  { id: 'resist',  type: 'resist',  target: 1,   label: 'Résiste à 1 tentation',               xp: 40 },
  { id: 'checkin', type: 'checkin', target: 1,   label: 'Dis comment tu te sens',              xp: 20 },
  { id: 'journal', type: 'journal', target: 1,   label: 'Écris 1 entrée dans ton journal',     xp: 20 },
  { id: 'capsule', type: 'capsule', target: 1,   label: 'Revois ta capsule',                   xp: 20 },
  { id: 'analyse', type: 'analyse', target: 1,   label: 'Analyse 1 contenu avec esprit critique', xp: 30 },
  { id: 'xp',      type: 'xp',      target: 200, label: 'Gagne 200 XP',                        xp: 30 }
];
function _seeded(str){ let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return ((h >>> 0) % 10000) / 10000; }; }
function dailyQuests(){
  const s = _gameState(); if (!s) return [];
  const today = dayKey();
  if (s.quests.day !== today) {
    const rnd = _seeded('quetes-' + today);
    const pool = QUEST_TEMPLATES.slice().sort(() => rnd() - 0.5);
    // Toujours une quête « résister » : c'est le cœur de Vision
    const picked = [QUEST_TEMPLATES[0]].concat(pool.filter(q => q.id !== 'resist').slice(0, GAME.quests.perDay - 1));
    s.quests = { day: today, bonus: false, list: picked.map(q => Object.assign({}, q, { progress: 0, done: false })) };
    _saveProgress();
  }
  return s.quests.list;
}
function questEvent(type, n){
  const s = _gameState(); if (!s) return;
  const list = dailyQuests();
  let changed = false;
  list.forEach(q => {
    if (q.done || q.type !== type) return;
    q.progress = Math.min(q.target, q.progress + (n || 1));
    changed = true;
    if (q.progress >= q.target) {
      q.done = true;
      _saveProgress();
      addXp(q.xp, 'quete');
      addGems(GAME.gems.quest, 'quete');
      emitGame('quest-done', { quest: Object.assign({}, q) });
    }
  });
  if (list.length && list.every(q => q.done) && !s.quests.bonus) {
    s.quests.bonus = true;
    addGems(GAME.gems.allQuests, 'toutes-quetes');
    emitGame('quests-all-done', {});
  }
  if (changed) { markActiveDay(); _saveProgress(); }
}
/* Temps restant avant les nouvelles quêtes (minuit) */
function questsResetIn(){
  const now = new Date(); const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
}

/* ── Ligue de la semaine : 9 participants fictifs + toi ──
   Pseudonymes inventés, XP simulée de façon déterministe (même semaine = mêmes scores). */
const LEAGUE_NAMES = ['Camille_R', 'Noah.B', 'Inès', 'Lucas 🌿', 'Jade_M', 'Hugo', 'Léna.K', 'Sacha', 'Maël', 'Zoé_V', 'Nina', 'Tom.D'];
function leagueStandings(week, myXp, final){
  const s = _gameState();
  const wk = week || (s ? s.week : weekKey());
  const xpMe = (myXp != null) ? myXp : (s ? s.weekXp : 0);
  const rnd = _seeded('ligue-' + wk + '-' + (s ? s.league : 0));
  const names = LEAGUE_NAMES.slice().sort(() => rnd() - 0.5).slice(0, GAME.league.size - 1);
  // Avancement de la semaine (0 → 1) : les scores montent au fil des jours
  const monday = new Date(wk + 'T00:00:00').getTime();
  const elapsed = final ? 1 : Math.min(1, Math.max(0.05, (Date.now() - monday) / (7 * DAY_MS)));
  const level = 1 + (s ? s.league : 0) * 0.35;   // ligues hautes = adversaires plus actifs
  const others = names.map((name, i) => ({ name, xp: Math.round((120 + rnd() * 900) * level * elapsed / 10) * 10, me: false }));
  const all = others.concat([{ name: 'Toi', xp: xpMe, me: true }]);
  all.sort((a, b) => b.xp - a.xp || (a.me ? -1 : 1));
  return all.map((p, i) => Object.assign(p, { rank: i + 1,
    zone: i < GAME.league.promote ? 'montee' : (i >= GAME.league.size - GAME.league.demote ? 'descente' : 'maintien') }));
}
function leagueName(i){ const s = _gameState(); return LEAGUE_TIERS[i == null ? (s ? s.league : 0) : i]; }
function leagueEndsIn(){
  const s = _gameState(); const monday = new Date((s ? s.week : weekKey()) + 'T00:00:00');
  return monday.getTime() + 7 * DAY_MS - Date.now();
}

/* Résumé pratique pour les écrans */
function gameSnapshot(){
  const s = _gameState(); if (!s) return null;
  return {
    xp: s.xp, weekXp: s.weekXp, gems: s.gems, freezes: s.freezes,
    streak: typeof streakDays === 'function' ? streakDays() : 0, best: s.best,
    league: s.league, leagueName: LEAGUE_TIERS[s.league], quests: dailyQuests(),
    activeToday: isActiveDay(dayKey())
  };
}
