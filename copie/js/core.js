/* ── Échappe un texte avant de l'insérer en HTML (saisies utilisateur, réponses IA) ── */
function escHTML(v){
  return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ── Navigation ── */
function go(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  // Notifier le tour si actif
  if (tourActive) onTourNavigate(id);
  // Auto-start countdown when entering emotion screen
  if (id === 's-emo') startEmoCountdown();
  // Refresh Mes Ambitions list à l'entrée
  if (id === 's-param-ambitions') {
    if (typeof renderMyAmbitions === 'function') renderMyAmbitions();
    if (typeof renderRules === 'function') renderRules();
  }
  // DynIsland réactif à chaque arrivée home
  if (id === 's-home') { updateDynIsland(); if (typeof renderHomeJournal === 'function') renderHomeJournal(); }
  // Restaure la consigne perso dans le champ (écran Esprit critique)
  if (id === 's-param-ec') { const r = document.getElementById('user-rule-input'); if (r) r.value = getUserRule(); }
  // Chat : reset historique + message initial à chaque entrée
  if (id === 's-chat') {
    chatHistory = [];
    const initMsg = `Salut ! Je suis là pour t'aider à définir ta vision. Qu'est-ce que tu veux vraiment construire dans ta vie ? 🌟`;
    chatHistory.push({ role:'assistant', content: initMsg });
  }
  // Profil : restaure la clé API dans le champ
  if (id === 's-profil') {
    const kInput = document.getElementById('claude-key-input');
    if (kInput) kInput.value = getClaudeKey();
  }
  // Réveil du compagnon : une seule fois par session (fin tuto ou ouverture app)
  if (id === 's-home' && typeof _wakeUpFox === 'function') {
    if (!_wakePlayedThisSession) {
      _wakePlayedThisSession = true;
      _wakeUpFox();
    } else if (typeof _startBlink === 'function') {
      _startBlink(currentTheme);
    }
  }
  // Re-render home chips à l'entrée du dashboard
  if ((id === 's-home' || id === 's-comp') && typeof renderHomeAmbitions === 'function') {
    renderHomeAmbitions();
  }
  // Re-render home metrics (banner + cards) à l'entrée de la home
  if (id === 's-home' && typeof renderHomeMetrics === 'function') {
    renderHomeMetrics();
  }
  // Charge la vidéo enregistrée à l'entrée de "Ta capsule"
  if (id === 's-param-video' && typeof loadCapsuleVideo === 'function') {
    loadCapsuleVideo();
  }
  // Îlot produit : contrôle LOCAL instantané (règles perso) + analyse IA si clé
  if (id === 's-amazon') {
    if (typeof _localProductRuleCheck === 'function') _localProductRuleCheck();
    if (!window._amazonAnalyzed && typeof _updateDIFromScan === 'function') {
      window._amazonAnalyzed = true;
      _updateDIFromScan();
    }
  }
  // Rend la liste des sites exclus + applique les objectifs à l'entrée de "Sites analysés"
  if (id === 's-param-sites') {
    if (typeof renderExclList === 'function') renderExclList();
    if (typeof applyObjectiveSites === 'function') applyObjectiveSites();
  }
  // Démos Esprit critique : reset + île critique repliée
  if (id === 's-youtube' || id === 's-article') {
    if (id === 's-youtube' && typeof resetYouTube === 'function') resetYouTube();
    if (id === 's-article' && typeof resetArticle === 'function') resetArticle();
    const islId = (id === 's-youtube') ? 'ci-youtube' : 'ci-article';
    if (typeof ciToggle === 'function') ciToggle(islId, false);
  }
  // Simule l'arrivée d'une notification sur le bureau Android
  if (id === 's-widget' && typeof showAndroidNotif === 'function') {
    showAndroidNotif();
  }
}
