/* ════════════════════════════════════════════════════════════
   DYNAMIC ISLAND — state machine
   · 5 états (Veille / Exclude / Back Market / Place ton argent / Application)
   · Auto-rotation 3s
   · Swipe gauche/droite (touch + mouse)
   · Tap pour étendre l'état courant (rotation se met en pause)
   · Tap backdrop pour collapse (rotation reprend)
════════════════════════════════════════════════════════════ */
const DYN = {
  state: 0,
  total: 5,
  timer: null,
  rotMs: 3000,
  pauseUntil: 0,
  dragStartX: null,
  dragMoved: false
};

function setDynState(i){
  DYN.state = ((i % DYN.total) + DYN.total) % DYN.total;
  const isl = document.getElementById('dyn-isl');
  if(isl) isl.dataset.cur = DYN.state;
  // Un seul .dyn-state par état (contient compact + expanded)
  document.querySelectorAll('#dyn-isl .dyn-state').forEach(el => {
    el.classList.toggle('on', parseInt(el.dataset.st, 10) === DYN.state);
  });
  document.querySelectorAll('#dyn-isl .dyn-dot').forEach(el => {
    el.classList.toggle('on', parseInt(el.dataset.st, 10) === DYN.state);
  });
}

function nextDyn(){ setDynState(DYN.state + 1); }
function prevDyn(){ setDynState(DYN.state - 1); }

function startDynRotation(){
  if(DYN.timer) clearInterval(DYN.timer);
  DYN.timer = setInterval(() => {
    // Ne pas tourner si pause active ou expanded
    const now = Date.now();
    const isl = document.getElementById('dyn-isl');
    if(now < DYN.pauseUntil) return;
    if(isl && isl.classList.contains('exp')) return;
    nextDyn();
  }, DYN.rotMs);
}

function pauseDynRotation(ms){
  DYN.pauseUntil = Date.now() + (ms || 5000);
}

/* Tap pill → expand · Tap backdrop → collapse */
function toggleDynIsl(force){
  const isl = document.getElementById('dyn-isl');
  const bk  = document.getElementById('dyn-bk');
  if(!isl) return;
  const isExp = isl.classList.contains('exp');
  let willExpand;
  if(typeof force === 'boolean'){
    willExpand = force;
  } else {
    if(isExp) return;
    willExpand = true;
  }
  isl.classList.toggle('exp', willExpand);
  if(bk) bk.classList.toggle('on', willExpand);
  if(willExpand) pauseDynRotation(60000); // pause longue tant qu'étendu
}

/* Swipe handlers (touch + mouse) — discriminer tap vs swipe */
function bindDynSwipe(){
  const isl = document.getElementById('dyn-isl');
  if(!isl) return;
  const onStart = (x) => { DYN.dragStartX = x; DYN.dragMoved = false; };
  const onMove  = (x) => {
    if(DYN.dragStartX === null) return;
    if(Math.abs(x - DYN.dragStartX) > 8) DYN.dragMoved = true;
  };
  const onEnd = (x) => {
    if(DYN.dragStartX === null) return;
    const dx = x - DYN.dragStartX;
    DYN.dragStartX = null;
    if(Math.abs(dx) > 40){
      if(dx < 0) nextDyn(); else prevDyn();
      pauseDynRotation(5000);
    } else if(!DYN.dragMoved){
      // Tap — déclencher l'expansion
      toggleDynIsl();
    }
  };
  // Touch
  isl.addEventListener('touchstart', e => onStart(e.touches[0].clientX), {passive:true});
  isl.addEventListener('touchmove',  e => onMove(e.touches[0].clientX),  {passive:true});
  isl.addEventListener('touchend',   e => onEnd(e.changedTouches[0].clientX));
  // Mouse (pour desktop)
  isl.addEventListener('mousedown', e => { onStart(e.clientX); e.preventDefault(); });
  window.addEventListener('mousemove', e => onMove(e.clientX));
  window.addEventListener('mouseup',   e => { if(DYN.dragStartX !== null) onEnd(e.clientX); });
}

/* Init dès le chargement */
document.addEventListener('DOMContentLoaded', () => {
  bindDynSwipe();
  startDynRotation();
  // Render initial des ambitions (chips home/compagnon) — fallback générique tant que vide
  if (typeof renderHomeAmbitions === 'function') renderHomeAmbitions();
});
const tabMap = { home: 's-home', hist: 's-hist', comp: 's-comp', profil: 's-profil' };
function tab(key) { go(tabMap[key]); }
