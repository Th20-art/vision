/* ════════════════════════════════════════════════════════════
   DÉMO ESPRIT CRITIQUE — article de presse + vidéo YouTube
   · Dynamic Island critique (Figma 784:1210 / 784:1219)
   · Compact 214×87 "Esprit critique / Appuyer pour analyser"
   · Étendu 213×253 → 5 slides : Sujet · Biais+IA · Approfondir · opinion inverse · sujet connexe
════════════════════════════════════════════════════════════ */
// Vidéo YouTube : play/pause du lecteur
function toggleYouTube(){
  const p = document.getElementById('yt-player');
  if(p) p.classList.toggle('playing');
}
function resetYouTube(){
  const p = document.getElementById('yt-player');
  const fill = document.getElementById('yt-prog-fill');
  if(p) p.classList.remove('playing');
  if(fill){ fill.style.animation='none'; void fill.offsetWidth; fill.style.animation=''; }  // reset barre
}
// Article : surligne en rouge un passage douteux cliqué
function flagClaim(el){ if(el) el.classList.toggle('flagged'); }
function resetArticle(){
  document.querySelectorAll('#s-article .art-claim.flagged').forEach(c=>c.classList.remove('flagged'));
}

/* ── Dynamic Island critique : expand/collapse + navigation + auto-pivot ── */
const _ciRot = {};   // id -> setInterval (rotation auto, active une fois étendu)
function ciToggle(id, force){
  const el = document.getElementById(id);
  if(!el) return;
  const willExp = (force !== undefined) ? force : !el.classList.contains('exp');
  el.classList.toggle('exp', willExp);
  const bk = document.getElementById(id + '-bk');
  if(bk) bk.classList.toggle('on', willExp);
  if(willExp){
    ciGo(id, 0, true);
    ciStartRotation(id);   // auto-pivot APRÈS appui sur "Analyser"
    // Journalise l'analyse (une fois par page chargée)
    if(!el._journaled){
      el._journaled = true;
      const isYt = (id === 'ci-youtube');
      const sc = document.getElementById(isYt ? 's-youtube' : 's-article');
      const t = isYt ? (sc.querySelector('.yt-title')||{}).textContent
                     : (sc.querySelector('.art-h1')||{}).textContent;
      if(t && typeof addJournalLine === 'function')
        addJournalLine('analyse', 'Analyse critique : ' + t.trim().slice(0, 42));
    }
    if(typeof ciAnalyze === 'function') ciAnalyze(id);   // analyse IA réelle (si clé)
  } else {
    ciStopRotation(id);
  }
}

/* ── Analyse IA RÉELLE du contenu (article/vidéo) → remplit les 5 slides ──
   Tient compte du contexte utilisateur (objectifs + règles). Sans clé API,
   on garde le contenu de démonstration statique. */
async function ciAnalyze(id){
  const el = document.getElementById(id);
  if(!el || el._analyzed || el._analyzing) return;
  if(typeof getClaudeKey !== 'function' || !getClaudeKey()) return;  // pas de clé → statique
  el._analyzing = true;
  const isYt = (id === 'ci-youtube');
  const screen = document.getElementById(isYt ? 's-youtube' : 's-article');
  let pageText;
  if(isYt){
    const t  = (screen.querySelector('.yt-title')||{}).textContent||'';
    const ch = (screen.querySelector('.yt-ch-n')||{}).textContent||'';
    const sp = (screen.querySelector('.yt-spons')||{}).textContent||'';
    pageText = `Vidéo YouTube. Titre : "${t}". Chaîne : ${ch}. ${sp}.`;
  } else {
    const h = (screen.querySelector('.art-h1')||{}).textContent||'';
    const body = [...screen.querySelectorAll('.art-p')].map(p=>p.textContent).join(' ');
    pageText = `Article de presse. Titre : "${h}". Contenu : ${body}`;
  }
  const slides = [...el.querySelectorAll('.ci-slide')];
  const t0 = slides[0] && slides[0].querySelector('.ci-title');
  const prev0 = t0 ? t0.textContent : '';
  if(t0) t0.textContent = 'Analyse en cours…';
  const reply = await _claudeOneShot(
    `Tu es l'outil « esprit critique » de l'app Vision. Analyse ce contenu en tenant compte du contexte utilisateur. JSON uniquement, sans texte autour :
{"sujet":"résumé neutre et factuel du propos en 1 phrase","biais_pct":<entier 0-100 : niveau de biais/orientation OU probabilité de contenu généré par IA>,"biais":"1 phrase expliquant pourquoi ce contenu est orienté, partial ou peu fiable","sources":[{"label":"Approfondir","name":"vrai média","detail":"1 phrase","domain":"domaine.com"},{"label":"opinion inverse","name":"vrai média","detail":"1 phrase","domain":"domaine.com"},{"label":"sujet connexe","name":"vrai média","detail":"1 phrase","domain":"domaine.com"}]}`,
    `${_userContext()}\n${pageText}\nLes 3 sources doivent proposer des angles DIFFÉRENTS (approfondissement, opinion contraire, sujet connexe) et être de vrais médias crédibles, en lien avec les objectifs si pertinent.`,
    450
  );
  el._analyzing = false;
  let d; try { d = JSON.parse(reply.match(/\{[\s\S]*\}/)?.[0]); } catch(e){}
  if(!d){ if(t0) t0.textContent = prev0; return; }   // échec → garde le statique
  el._analyzed = true;
  if(t0 && d.sujet) t0.textContent = d.sujet;
  if(slides[1]){
    const body = slides[1].querySelector('.ci-body'); if(body && d.biais) body.textContent = d.biais;
    const pct = Math.max(0, Math.min(100, parseInt(d.biais_pct) || 0));
    const fill = slides[1].querySelector('.ci-bias-fill'); if(fill) fill.style.width = pct + '%';
    const pctEl = slides[1].querySelector('.ci-bias-pct'); if(pctEl) pctEl.textContent = pct + '%';
  }
  const srcs = Array.isArray(d.sources) ? d.sources : [];
  for(let i=0;i<3;i++){
    const s = slides[2+i], src = srcs[i];
    if(!s || !src) continue;
    const lab = s.querySelector('.ci-label'); if(lab && src.label) lab.textContent = src.label;
    const ti  = s.querySelector('.ci-title'); if(ti && src.name) ti.textContent = src.name;
    const bo  = s.querySelector('.ci-body');  if(bo && src.detail) bo.textContent = src.detail;
    const lk  = s.querySelector('.ci-link');
    if(lk){
      const dom = String(src.domain || src.name || '').replace(/^https?:\/\//,'');
      lk.textContent = '↗ ' + dom;
      lk.onclick = function(){ ciOpenSource(src.name || dom); };
    }
  }
}
function ciGo(id, i, auto){
  const el = document.getElementById(id);
  if(!el) return;
  const slides = [...el.querySelectorAll('.ci-slide')];
  const dots   = [...el.querySelectorAll('.ci-dot')];
  if(!slides.length) return;
  i = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, k) => s.classList.toggle('on', k === i));
  dots.forEach((d, k)   => d.classList.toggle('on', k === i));
  el._ci = i;
  // Navigation manuelle (dot/swipe) → relance le minuteur pour laisser lire
  if(!auto && el.classList.contains('exp')) ciStartRotation(id);
}
function ciStartRotation(id){
  ciStopRotation(id);
  _ciRot[id] = setInterval(() => {
    const el = document.getElementById(id);
    if(!el || !el.classList.contains('exp')){ ciStopRotation(id); return; }
    const n = el.querySelectorAll('.ci-slide').length;
    ciGo(id, ((el._ci || 0) + 1) % n, true);   // boucle 0→1→…→4→0
  }, 3500);
}
function ciStopRotation(id){ if(_ciRot[id]){ clearInterval(_ciRot[id]); _ciRot[id] = null; } }
function ciOpenSource(name){
  alert('Vision t\'ouvrirait : ' + name + '\n\nConfronter plusieurs sources fiables = sortir de sa bulle et se forger un avis éclairé.');
}
// Swipe gauche/droite sur les slides
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.ci-slides').forEach(box => {
    const isl = box.closest('.ci-isl'); if(!isl) return;
    let sx = 0, sw = false;
    box.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sw = true; }, {passive:true});
    box.addEventListener('touchend', e => {
      if(!sw) return; sw = false;
      const dx = e.changedTouches[0].clientX - sx;
      if(Math.abs(dx) > 36) ciGo(isl.id, (isl._ci || 0) + (dx < 0 ? 1 : -1));
    }, {passive:true});
  });
});

/* Notification Android simulée : texte (comparaison sociale) + arrivée + auto-disparition + swipe */
let andNotifTimer = null, andNotifBound = false;
function hideAndroidNotif() {
  const el = document.getElementById('and-notif');
  if (el) el.classList.remove('show');
  if (andNotifTimer) { clearTimeout(andNotifTimer); andNotifTimer = null; }
}
function showAndroidNotif() {
  const el = document.getElementById('and-notif');
  if (!el) return;
  const tx = document.getElementById('and-notif-tx');
  if (tx && typeof buildNewNotif === 'function') tx.textContent = buildNewNotif().tx;
  el.style.transform = '';        // reset éventuel décalage de swipe
  el.classList.remove('show');
  void el.offsetWidth;            // reflow → relance l'animation
  setTimeout(() => el.classList.add('show'), 500);
  // Auto-disparition après ~5,5 s
  if (andNotifTimer) clearTimeout(andNotifTimer);
  andNotifTimer = setTimeout(hideAndroidNotif, 5500);

  // Balayage pour retirer (haut ou côté) — une seule fois
  if (!andNotifBound) {
    andNotifBound = true;
    let sx = 0, sy = 0, drag = false;
    const start = e => {
      const p = e.touches ? e.touches[0] : e;
      sx = p.clientX; sy = p.clientY; drag = true;
      el.style.transition = 'none';
    };
    const move = e => {
      if (!drag) return;
      const p = e.touches ? e.touches[0] : e;
      const dx = p.clientX - sx, dy = p.clientY - sy;
      el.style.transform = `translate(${dx}px, ${Math.min(dy, 20)}px)`;
      el.style.opacity = String(Math.max(0, 1 - (Math.abs(dx) + Math.max(0, -dy)) / 160));
    };
    const end = e => {
      if (!drag) return;
      drag = false;
      const p = e.changedTouches ? e.changedTouches[0] : e;
      const dx = p.clientX - sx, dy = p.clientY - sy;
      el.style.transition = '';
      if (Math.abs(dx) > 70 || dy < -50) {   // swipe latéral ou vers le haut → ferme
        hideAndroidNotif();
      }
      el.style.transform = ''; el.style.opacity = '';
    };
    el.addEventListener('touchstart', start, { passive: true });
    el.addEventListener('touchmove', move, { passive: true });
    el.addEventListener('touchend', end);
    el.addEventListener('mousedown', start);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', end);
  }
}

/* ── Insights par défaut de l'îlot (état 0) ── */
const DX0_DEFAULT = {
  i1t: '💰 41€ pour un gadget',
  i1b: "Ce bracelet connecté rejoint souvent le tiroir après quelques mois d'utilisation. L'argent pourrait servir à des expériences plus durables.",
  i2t: '🤔 Vraiment nécessaire ?',
  i2b: "Smartphone déjà capable de suivre activité et santé. Cette technologie répond-elle à un besoin réel ou à une envie créée ?"
};
function _norm(s){ return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,''); }

/* Contrôle LOCAL (sans IA) : confronte les règles perso au produit de la démo.
   Donne un retour instantané même sans clé API ; l'IA affine ensuite si dispo. */
function _localProductRuleCheck(){
  // Descripteurs du produit de la page Amazon (Samsung Galaxy Fit 3 — montre connectée)
  const product = 'montre connectee bracelet connecte samsung galaxy fit 3 gadget objet connecte technologie tech sante sport fitness electronique';
  const stop = new Set(['je','ne','veux','pas','plus','de','des','du','la','le','les','un','une','aucun','aucune','sans','que','qui','quel','mon','ma','mes','ce','cette','ces','sur','pour','avec','dans','avoir','vouloir','et','ou','au','aux']);
  const rules = [];
  if (typeof personalRules !== 'undefined') personalRules.forEach(r => rules.push(r));
  const consigne = (typeof getUserRule === 'function') ? getUserRule() : '';
  if (consigne) rules.push(consigne);

  let matchedRule = null;
  for (const r of rules){
    const words = _norm(r).replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(w => w.length > 2 && !stop.has(w));
    if (words.some(w => product.includes(w))) { matchedRule = r; break; }
  }

  const i1t=document.getElementById('dx0-i1-t'), i1b=document.getElementById('dx0-i1-b'),
        i2t=document.getElementById('dx0-i2-t'), i2b=document.getElementById('dx0-i2-b');
  if (matchedRule){
    _alignScore = 1;
    if(i1t) i1t.textContent = '🚫 Va contre ta règle';
    if(i1b) i1b.textContent = '« ' + matchedRule + ' » — ce produit (Samsung Galaxy Fit, montre connectée) entre en conflit direct avec une de tes règles personnelles.';
    if(i2t) i2t.textContent = '🤔 Vraiment nécessaire ?';
    if(i2b) i2b.textContent = DX0_DEFAULT.i2b;
  } else {
    if(_alignScore < 2) _alignScore = 4;   // ne réinitialise pas un score IA déjà calculé
    if(i1t) i1t.textContent = DX0_DEFAULT.i1t;
    if(i1b) i1b.textContent = DX0_DEFAULT.i1b;
    if(i2t) i2t.textContent = DX0_DEFAULT.i2t;
    if(i2b) i2b.textContent = DX0_DEFAULT.i2b;
  }
  updateDynIsland();
}
