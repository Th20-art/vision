/* ════════════════════════════════════════════════════════════
   CAPSULE — Recording (video/audio) + Transcription stream
              + Playback with synced transcription
════════════════════════════════════════════════════════════ */

/* Mock transcription : ~25 mots, 6 phrases courtes. Original. */
const CAPSULE_WORDS = [
  'Salut.', 'C\'est', 'moi,', 'il', 'y', 'a', 'quelques', 'semaines.',
  'Tu', 'te', 'souviens', 'pourquoi', 'tu', 'as', 'commencé', '?',
  'N\'oublie', 'pas', 'ton', 'objectif.',
  'Continue,', 'je', 'crois', 'en', 'toi.'
];

let recState = { timer: null, transcriptIdx: 0, secs: 0, mode: 'video', active: false, stream: null, audioCtx: null, analyser: null };
// Capture réelle de la capsule (MediaRecorder) — pour réafficher la vidéo/audio dans "Ta capsule"
let capsuleRecorder = null, capsuleChunks = [], capsuleVideoURL = null;
let capsuleAudioURL = null, capsuleMode = null;  // 'video' | 'audio'
let capsuleTranscript = '';          // texte retranscrit (Web Speech + Claude)

/* ── Persistance de la capsule (IndexedDB) : elle survit au rechargement ── */
const CAPSULE_DB = 'visioncopie_capsule';
function _capsuleStore(fn, mode){
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IndexedDB indisponible'));
    const open = indexedDB.open(CAPSULE_DB, 1);
    open.onupgradeneeded = () => open.result.createObjectStore('capsule');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const db = open.result;
      const tx = db.transaction('capsule', mode);
      const req = fn(tx.objectStore('capsule'));
      tx.oncomplete = () => { db.close(); resolve(req && req.result); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    };
  });
}
function saveCapsule(blob){
  return _capsuleStore(st => st.put({ mode: capsuleMode, blob, transcript: capsuleTranscript, ts: Date.now() }, 'current'), 'readwrite')
    .catch(e => console.warn('[Capsule] sauvegarde impossible', e));
}
function saveCapsuleTranscript(){
  return _capsuleStore(st => st.get('current'), 'readonly')
    .then(c => c ? _capsuleStore(st => st.put(Object.assign(c, { transcript: capsuleTranscript }), 'current'), 'readwrite') : null)
    .catch(() => {});
}
function restoreCapsule(){
  return _capsuleStore(st => st.get('current'), 'readonly').then(c => {
    if (!c || !c.blob) return;
    capsuleMode = c.mode === 'audio' ? 'audio' : 'video';
    capsuleTranscript = c.transcript || '';
    const url = URL.createObjectURL(c.blob);
    if (capsuleMode === 'audio') capsuleAudioURL = url; else capsuleVideoURL = url;
  }).catch(() => {});
}
function clearCapsule(){
  return _capsuleStore(st => st.delete('current'), 'readwrite').catch(() => {});
}

/* Efface toutes les données de cette version (clés visioncopie*), puis recharge */
async function resetAllData(){
  if (!confirm('Effacer tes objectifs, ton journal, tes règles et ta capsule ? Cette action est définitive.')) return;
  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith('visioncopie'))
      .forEach(k => localStorage.removeItem(k));
  } catch(e) {}
  await clearCapsule();
  location.reload();
}
let _capsuleSpeechRec = null;

/* Appel Claude one-shot (sans historique chat) — pour enhancement transcript */
async function _claudeOneShot(systemPrompt, userText, maxTokens) {
  const key = getClaudeKey();
  if (!key) return null;
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01',
                 'content-type': 'application/json',
                 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: maxTokens || 150,
        system: systemPrompt, messages: [{ role: 'user', content: userText }] })
    });
    if (!res.ok) {
      try { const e = await res.json(); window._lastClaudeError = (e&&e.error&&e.error.message) || ('HTTP ' + res.status); }
      catch(_) { window._lastClaudeError = 'HTTP ' + res.status; }
      console.warn('[Vision] Analyse IA — échec API :', window._lastClaudeError);
      return null;
    }
    const d = await res.json();
    return d.content?.[0]?.text?.trim() || null;
  } catch(e) { window._lastClaudeError = 'Réseau/CORS : ' + e; console.warn('[Vision] Analyse IA — exception :', e); return null; }
}

function _startCapsuleTranscription() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return;
  capsuleTranscript = '';
  _capsuleSpeechRec = new SR();
  _capsuleSpeechRec.lang = 'fr-FR';
  _capsuleSpeechRec.continuous = true;
  _capsuleSpeechRec.interimResults = true;
  let finalText = '';
  _capsuleSpeechRec.onresult = e => {
    let interim = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      if (e.results[i].isFinal) finalText += e.results[i][0].transcript + ' ';
      else interim += e.results[i][0].transcript;
    }
    capsuleTranscript = (finalText + interim).trim();
    // Affiche la vraie transcription dans la box d'enregistrement
    const box = document.getElementById('rec-transcript-text');
    if (box) {
      box.innerHTML = escHTML(capsuleTranscript) + '<span class="rec-cursor"></span>';
      if (box.parentElement) box.parentElement.scrollTop = box.parentElement.scrollHeight;
    }
  };
  try { _capsuleSpeechRec.start(); } catch(e) {}
}

async function _stopCapsuleTranscription() {
  if (_capsuleSpeechRec) {
    try { _capsuleSpeechRec.stop(); } catch(e) {}
    _capsuleSpeechRec = null;
  }
  if (!capsuleTranscript) return;
  // Améliore le texte brut via Claude (fire & forget)
  const enhanced = await _claudeOneShot(
    `Tu améliores des messages vocaux motivants. Réécris le texte fourni en 1-2 phrases naturelles et percutantes à la 1ère personne du singulier. Renvoie uniquement le texte amélioré, sans guillemets ni commentaire.`,
    capsuleTranscript
  );
  if (enhanced) { capsuleTranscript = enhanced; saveCapsuleTranscript(); }
}

/* Click sur le bouton record principal : démarre (idle) ou arrête (recording) */
function handleRecordClick() {
  if (recState.active) {
    stopRecordingInline();
  } else {
    startRecordingInline('video');
  }
}

/* Démarre l'enregistrement INLINE — tente getUserMedia, sinon fallback mockup */
function startRecordingInline(mode) {
  recState.mode = mode || 'video';
  capsuleMode = recState.mode;   // mémorise le type de capsule (video/audio)
  recState.secs = 0;
  recState.transcriptIdx = 0;
  recState.active = true;
  _startCapsuleTranscription(); // transcription temps réel (Web Speech API)

  // Toggle états cam-area
  document.getElementById('cam-state-idle').style.display = 'none';
  document.getElementById('cam-state-preview').style.display = 'none';
  document.getElementById('cam-state-rec').style.display = 'flex';

  // Label mode
  document.getElementById('rec-mode-lbl').textContent =
    'REC · ' + (mode === 'audio' ? 'VOCAL' : 'VIDÉO');

  // Visual setup : essaie la vraie caméra/micro, fallback sur mockup
  const fallback = document.getElementById('rec-visual-fallback');
  const video = document.getElementById('rec-video');

  if (mode === 'audio') {
    // Mode audio : fallback = barres animées
    video.style.display = 'none';
    fallback.style.display = 'flex';
    fallback.style.gap = '3px';
    fallback.innerHTML = '';
    for (let i = 0; i < 28; i++) {
      const bar = document.createElement('div');
      bar.className = 'rec-wave-bar';
      bar.style.animationDelay = (Math.random() * 0.8) + 's';
      bar.style.animationDuration = (0.7 + Math.random() * 0.6) + 's';
      fallback.appendChild(bar);
    }
    // Essaie d'obtenir vraiment le micro pour animer en temps réel
    tryGetMedia({ audio: true, video: false });
  } else {
    // Mode video : fallback = emoji 👤
    video.style.display = 'none';
    fallback.style.display = 'flex';
    fallback.style.gap = '0';
    fallback.innerHTML = '👤';
    fallback.style.fontSize = '54px';
    fallback.style.color = 'rgba(255,255,255,0.25)';
    // Essaie d'obtenir vraiment la caméra
    tryGetMedia({ video: true, audio: true });
  }

  // Reset timer + transcript
  document.getElementById('rec-timer').textContent = '0:00';
  document.getElementById('rec-transcript-text').innerHTML = '<span class="rec-cursor"></span>';

  // Transforme le bouton record en STOP (carré rouge)
  const icon = document.getElementById('record-btn-icon');
  if (icon) {
    icon.style.background = '#ef4444';
    icon.style.borderRadius = '4px';
    icon.style.width = '20px';
    icon.style.height = '20px';
  }
  const altText = document.getElementById('record-alt-text');
  if (altText) altText.textContent = 'Appuie pour arrêter';

  // Timer tick (1s)
  if (recState.timer) clearInterval(recState.timer);
  recState.timer = setInterval(() => {
    recState.secs++;
    const m = Math.floor(recState.secs / 60);
    const s = recState.secs % 60;
    const timerEl = document.getElementById('rec-timer');
    if (timerEl) timerEl.textContent = m + ':' + String(s).padStart(2,'0');

    // Mock uniquement si la transcription réelle (Web Speech API) n'a rien capturé encore
    if (!capsuleTranscript) {
      const wordsThisTick = Math.min(2, CAPSULE_WORDS.length - recState.transcriptIdx);
      for (let i = 0; i < wordsThisTick; i++) {
        if (recState.transcriptIdx < CAPSULE_WORDS.length) {
          addTranscriptWord(CAPSULE_WORDS[recState.transcriptIdx]);
          recState.transcriptIdx++;
        }
      }
    }
  }, 1000);
}

/* Tente d'accéder à la caméra/micro via getUserMedia.
   Si succès : remplace le fallback par le vrai stream.
   Si échec (file://, permission refusée, etc.) : garde le mockup en silence. */
function tryGetMedia(constraints) {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.info('[Capsule] getUserMedia indispo (probablement file:// → utilise mockup)');
    return;
  }
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    recState.stream = stream;
    // Mode video : injecte le stream dans <video>
    if (constraints.video) {
      const video = document.getElementById('rec-video');
      const fb = document.getElementById('rec-visual-fallback');
      video.srcObject = stream;
      video.style.display = 'block';
      fb.style.display = 'none';
      // Enregistre réellement la vidéo pour la rejouer dans "Ta capsule"
      try {
        capsuleChunks = [];
        capsuleRecorder = new MediaRecorder(stream);
        capsuleRecorder.ondataavailable = e => { if (e.data && e.data.size) capsuleChunks.push(e.data); };
        capsuleRecorder.onstop = () => {
          if (capsuleChunks.length) {
            if (capsuleVideoURL) URL.revokeObjectURL(capsuleVideoURL);
            const blob = new Blob(capsuleChunks, { type: 'video/webm' });
            capsuleVideoURL = URL.createObjectURL(blob);
            saveCapsule(blob);
          }
        };
        capsuleRecorder.start();
      } catch (e) { console.warn('[Capsule] MediaRecorder indispo', e); }
    }
    // Mode audio : analyse temps réel (waveform) + enregistrement réel
    if (constraints.audio && !constraints.video) {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        recState.audioCtx = new AC();
        const source = recState.audioCtx.createMediaStreamSource(stream);
        recState.analyser = recState.audioCtx.createAnalyser();
        recState.analyser.fftSize = 64;
        source.connect(recState.analyser);
        animateWaveformFromMic();
      } catch (e) {
        console.warn('[Capsule] audio analysis non dispo', e);
      }
      // Enregistre réellement l'audio pour le réécouter dans "Ta capsule"
      try {
        capsuleChunks = [];
        capsuleRecorder = new MediaRecorder(stream);
        capsuleRecorder.ondataavailable = e => { if (e.data && e.data.size) capsuleChunks.push(e.data); };
        capsuleRecorder.onstop = () => {
          if (capsuleChunks.length) {
            if (capsuleAudioURL) URL.revokeObjectURL(capsuleAudioURL);
            const blob = new Blob(capsuleChunks, { type: 'audio/webm' });
            capsuleAudioURL = URL.createObjectURL(blob);
            saveCapsule(blob);
          }
        };
        capsuleRecorder.start();
      } catch (e) { console.warn('[Capsule] MediaRecorder audio indispo', e); }
    }
  }).catch(err => {
    console.info('[Capsule] permission refusée ou indispo → mockup actif', err && err.name);
  });
}

/* Anime les barres en fonction du volume réel du micro */
function animateWaveformFromMic() {
  const fb = document.getElementById('rec-visual-fallback');
  if (!fb || !recState.analyser || !recState.active) return;
  const bars = fb.querySelectorAll('.rec-wave-bar');
  if (!bars.length) return;
  const data = new Uint8Array(recState.analyser.frequencyBinCount);
  recState.analyser.getByteFrequencyData(data);
  bars.forEach((bar, i) => {
    const v = data[i % data.length] || 0;
    const h = Math.max(8, Math.min(80, (v / 255) * 80));
    bar.style.animation = 'none';      // override l'animation CSS fake
    bar.style.height = h + 'px';
  });
  requestAnimationFrame(animateWaveformFromMic);
}

/* Compat avec ancien nom de fonction */
function startRecording(mode) { startRecordingInline(mode); }

/* Arrête l'enregistrement, montre le preview "✓ Capsule enregistrée" */
function stopRecordingInline() {
  if (recState.timer) { clearInterval(recState.timer); recState.timer = null; }
  recState.active = false;
  _stopCapsuleTranscription(); // stoppe SR + améliore via Claude (async, non bloquant)

  // Stoppe l'enregistrement de la capsule (flush du blob avant de couper le stream)
  if (capsuleRecorder && capsuleRecorder.state !== 'inactive') {
    try { capsuleRecorder.stop(); } catch (e) {}
  }
  capsuleRecorder = null;

  // Coupe le vrai stream caméra/micro s'il était actif
  if (recState.stream) {
    recState.stream.getTracks().forEach(t => t.stop());
    recState.stream = null;
  }
  if (recState.audioCtx) {
    try { recState.audioCtx.close(); } catch(e) {}
    recState.audioCtx = null;
    recState.analyser = null;
  }
  const video = document.getElementById('rec-video');
  if (video) { video.srcObject = null; video.style.display = 'none'; }

  document.getElementById('cam-state-rec').style.display = 'none';
  document.getElementById('cam-state-idle').style.display = 'none';
  document.getElementById('cam-state-preview').style.display = 'flex';

  const meta = document.getElementById('cam-preview-meta');
  if (meta) {
    const m = Math.floor(recState.secs / 60);
    const s = recState.secs % 60;
    meta.textContent = (recState.mode === 'audio' ? 'VOCAL' : 'VIDÉO') + ' · ' + m + ':' + String(s).padStart(2,'0');
  }

  // Restaure le bouton record (rond orange)
  const icon = document.getElementById('record-btn-icon');
  if (icon) {
    icon.style.background = 'linear-gradient(135deg, var(--og), var(--og2))';
    icon.style.borderRadius = '50%';
    icon.style.width = '20px';
    icon.style.height = '20px';
  }
  const altText = document.getElementById('record-alt-text');
  if (altText) altText.textContent = 'Sinon enregistrer un vocal';
}
function stopRecording() {
  stopRecordingInline();
  // Depuis l'ancien écran plein cadre (s-record) → retour à l'étape capsule
  const rec = document.getElementById('s-record');
  if (rec && rec.classList.contains('active')) go('s-step4');
}

/* Reset → retour à l'idle pour réenregistrer */
function resetRecording() {
  document.getElementById('cam-state-preview').style.display = 'none';
  document.getElementById('cam-state-rec').style.display = 'none';
  document.getElementById('cam-state-idle').style.display = 'flex';
}

function addTranscriptWord(word) {
  const box = document.getElementById('rec-transcript-text');
  if (!box) return;
  // Retire l'ancien curseur
  const oldCursor = box.querySelector('.rec-cursor');
  if (oldCursor) oldCursor.remove();
  // Ajoute le mot
  const span = document.createElement('span');
  span.className = 'rec-word';
  span.textContent = word + ' ';
  box.appendChild(span);
  // Re-ajoute le curseur
  const cursor = document.createElement('span');
  cursor.className = 'rec-cursor';
  box.appendChild(cursor);
  // Scroll bas
  box.parentElement.scrollTop = box.parentElement.scrollHeight;
}


/* ─── PLAYBACK in s-param-video ─── */
let playState = { timer: null, playing: false, secs: 0, total: 24 };

/* Charge la capsule (vidéo OU audio) dans "Ta capsule", sinon placeholder */
function loadCapsuleVideo() {
  const v = document.getElementById('capsule-video');
  const a = document.getElementById('capsule-audio');
  const ph = document.getElementById('capsule-video-ph');
  const aph = document.getElementById('capsule-audio-ph');
  if (!v) return;
  // Reset état de lecture
  playState.secs = 0; playState.playing = false;
  if (playState.timer) { clearInterval(playState.timer); playState.timer = null; }
  const btn = document.getElementById('play-btn');
  if (btn) btn.textContent = '▶';
  // Tout masquer par défaut
  v.style.display = 'none'; v.removeAttribute('src');
  if (a) { a.pause(); a.removeAttribute('src'); }
  if (ph) ph.style.display = 'none';
  if (aph) aph.style.display = 'none';

  const onEnded = () => {
    playState.playing = false;
    if (playState.timer) { clearInterval(playState.timer); playState.timer = null; }
    if (btn) btn.textContent = '↻';
  };

  if (capsuleMode === 'audio' && capsuleAudioURL && a) {
    // Capsule AUDIO → vue "Écouter mon audio"
    a.src = capsuleAudioURL;
    if (aph) aph.style.display = 'flex';
    a.onloadedmetadata = () => { if (isFinite(a.duration) && a.duration > 0) playState.total = a.duration; renderPlaybackUI(); };
    a.onended = onEnded;
  } else if (capsuleVideoURL) {
    // Capsule VIDÉO
    v.src = capsuleVideoURL;
    v.style.display = 'block';
    v.onloadedmetadata = () => { if (isFinite(v.duration) && v.duration > 0) playState.total = v.duration; renderPlaybackUI(); };
    v.onended = onEnded;
  } else {
    // Rien d'enregistré
    if (ph) ph.style.display = 'block';
    playState.total = 24;
  }
  renderPlaybackUI();
}

/* Renvoie l'élément média actif (vidéo OU audio) */
function getCapsuleVideoEl() {
  const v = document.getElementById('capsule-video');
  if (v && v.getAttribute('src')) return v;
  const a = document.getElementById('capsule-audio');
  if (a && a.getAttribute('src')) return a;
  return null;
}

function togglePlayback() {
  const v = getCapsuleVideoEl();
  // Si lecture terminée → on relance depuis le début
  if (!playState.playing && playState.secs >= playState.total) {
    playState.secs = 0;
    if (v) v.currentTime = 0;
  }
  playState.playing = !playState.playing;
  document.getElementById('play-btn').textContent = playState.playing ? '⏸' : '▶';
  if (playState.playing && typeof questEvent === 'function') questEvent('capsule');
  if (playState.playing) {
    // Init transcript words si vide
    const box = document.getElementById('play-transcript-text');
    if (box && !box.children.length) {
      box.innerHTML = CAPSULE_WORDS.map((w, i) =>
        `<span class="play-word" data-i="${i}">${w}</span>`
      ).join(' ');
    }
    if (v) { try { v.play(); } catch(e){} }
    if (playState.timer) clearInterval(playState.timer);
    playState.timer = setInterval(updatePlayback, 100);
  } else {
    if (v) v.pause();
    if (playState.timer) { clearInterval(playState.timer); playState.timer = null; }
  }
}

function updatePlayback() {
  const v = getCapsuleVideoEl();
  if (v) {
    playState.secs = v.currentTime;
    if (isFinite(v.duration) && v.duration > 0) playState.total = v.duration;
  } else {
    playState.secs += 0.1;
  }
  if (playState.secs >= playState.total) {
    // Fin
    playState.secs = playState.total;
    playState.playing = false;
    clearInterval(playState.timer); playState.timer = null;
    document.getElementById('play-btn').textContent = '↻';
  }
  renderPlaybackUI();
}

function renderPlaybackUI() {
  const t = playState.secs;
  const total = playState.total;
  const m = Math.floor(t / 60), s = Math.floor(t % 60);
  const tm = Math.floor(total / 60), ts = Math.floor(total % 60);
  document.getElementById('play-time').textContent =
    m + ':' + String(s).padStart(2,'0') + ' / ' + tm + ':' + String(ts).padStart(2,'0');
  document.getElementById('play-progress-fill').style.width = (t / total * 100) + '%';
  // Highlight word courant
  const wordsCount = CAPSULE_WORDS.length;
  const currentIdx = Math.floor((t / total) * wordsCount);
  document.querySelectorAll('#play-transcript-text .play-word').forEach((el, i) => {
    el.classList.remove('current', 'spoken');
    if (i < currentIdx) el.classList.add('spoken');
    else if (i === currentIdx) el.classList.add('current');
  });
}

function seekPlayback(event) {
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = (event.clientX - rect.left) / rect.width;
  playState.secs = Math.max(0, Math.min(playState.total, ratio * playState.total));
  const v = getCapsuleVideoEl();
  if (v) v.currentTime = playState.secs;
  renderPlaybackUI();
}
