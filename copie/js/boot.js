/* ─── Plein écran immersif (cache la barre d'état/navigation) ─── */
function enterImmersive(){
  const el = document.documentElement;
  const req = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (req) { try { req.call(el, { navigationUI: 'hide' }); } catch(e) { try { req.call(el); } catch(_){} } }
}
// Déclenche au tout premier geste de l'utilisateur (requis par les navigateurs)
function bindImmersiveOnce(){
  const fire = () => { enterImmersive(); cleanup(); };
  const cleanup = () => {
    document.removeEventListener('click', fire);
    document.removeEventListener('touchend', fire);
  };
  document.addEventListener('click', fire, { once: true });
  document.addEventListener('touchend', fire, { once: true });
}
// Uniquement sur mobile tactile (pas sur ordinateur)
const isMobileImmersive =
  window.matchMedia('(pointer: coarse)').matches &&
  window.matchMedia('(max-width: 600px)').matches;
if (isMobileImmersive) {
  bindImmersiveOnce();
  // Re-tente le plein écran si l'utilisateur en sort (sauf action volontaire)
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) { bindImmersiveOnce(); }
  });
}

/* ─── PWA : enregistrement du service worker (offline + installable) ─── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err =>
      console.info('[PWA] service worker non enregistré (normal en file://)', err && err.message)
    );
  });
}

/* Au chargement : restaure le compagnon + DynIsland + clé Claude */
(function restoreComp(){
  try {
    const saved = localStorage.getItem('visioncopieComp');
    if (saved && typeof themes !== 'undefined' && themes[saved]) applyTheme(saved);
  } catch(e) {}
  updateDynIsland();
  // Ajoute listener Enter sur le chat input
  const ci = document.getElementById('chatInput');
  if (ci) ci.addEventListener('keydown', e => { if(e.key==='Enter') sendChatMessage(); });
})();

/* Au chargement : si le bureau Android est l'écran actif → notification simulée */
/* Charge l'état persistant (objectifs) et rafraîchit toute l'UI au démarrage */
(function bootVisionState(){
  if (typeof loadAmbitions === 'function') loadAmbitions();
  if (typeof restoreCapsule === 'function') restoreCapsule();
  if (typeof renderProgress === 'function') renderProgress();
  if (typeof renderHomeAmbitions === 'function') renderHomeAmbitions();
  if (typeof renderHomeMetrics === 'function') renderHomeMetrics();
  if (typeof renderHomeJournal === 'function') renderHomeJournal();
  if (typeof updateDynIsland === 'function') updateDynIsland();
  if (typeof applyObjectiveSites === 'function') applyObjectiveSites();
})();

(function initAndroidNotif(){
  const w = document.getElementById('s-widget');
  if (w && w.classList.contains('active') && typeof showAndroidNotif === 'function') {
    showAndroidNotif();
  }
})();
