// popup.js — Miroir extension v7.1
// Onglets : Profil · Journal · Réglages

var P = {
  ambitions: ["epargne","ecologie"],
  customAmbitions: [],
  domains:   ["fashion","shopping","delivery","food","electronics","beauty","travel","housing","subscription","social"],
  lifePhrase:"Je veux construire une vie qui me ressemble.",
  enabled:   true,
  apiKey:    ""
};

var J = { interceptions:[], weeklyCommitments:[], mirrorQuestionStats:{}, settings:{hourlyRate:0,strictModeEnabled:false} };

// ── Éléments communs ──
var toggleBtn = document.getElementById("toggle-btn");
var apiInput  = document.getElementById("api-input");
var apiSave   = document.getElementById("api-save");
var apiStatus = document.getElementById("api-status");
var phraseEl  = document.getElementById("phrase");
var btnSave   = document.getElementById("btn-save");
var btnMiroir = document.getElementById("btn-miroir");
var toast     = document.getElementById("toast");
var debug     = document.getElementById("debug");
var statusDot = document.getElementById("status-dot");
var statusTxt = document.getElementById("status-txt");
var ambChips  = document.getElementById("amb-chips");
var domChips  = document.getElementById("dom-chips");
var customAmbChips = document.getElementById("custom-amb-chips");
var customAmbInput = document.getElementById("custom-amb-input");
var customAmbAdd   = document.getElementById("custom-amb-add");

// ── Éléments journal ──
var mSaved = document.getElementById("m-saved");
var mSavedSub = document.getElementById("m-saved-sub");
var mRate  = document.getElementById("m-rate");
var mRateSub = document.getElementById("m-rate-sub");
var mTotal = document.getElementById("m-total");
var mTotalSub = document.getElementById("m-total-sub");
var mAmb   = document.getElementById("m-amb");
var mAmbSub= document.getElementById("m-amb-sub");
var interceptList = document.getElementById("intercept-list");
var qStatsList    = document.getElementById("q-stats-list");
var commitList    = document.getElementById("commit-list");
var commitForm    = document.getElementById("commit-form");
var commitDomain  = document.getElementById("commit-domain");
var addCommitBtn  = document.getElementById("add-commit-btn");
var commitSaveBtn = document.getElementById("commit-save");
var commitCancelBtn = document.getElementById("commit-cancel");
var btnExport     = document.getElementById("btn-export");
var btnExportCsv  = document.getElementById("btn-export-csv");
var btnResetJournal = document.getElementById("btn-reset-journal");

// ── Éléments réglages ──
var hourlyRateInput = document.getElementById("hourly-rate");
var rateSaveBtn     = document.getElementById("rate-save");
var strictToggle    = document.getElementById("strict-toggle");

function log(msg) {
  debug.textContent = msg;
  debug.classList.add("V");
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("V");
  setTimeout(function() { toast.classList.remove("V"); }, 2500);
}

// ─────────────────────────────────────────
// ONGLETS
// ─────────────────────────────────────────
document.querySelectorAll(".tab").forEach(function(t) {
  t.addEventListener("click", function() {
    var target = t.dataset.tab;
    document.querySelectorAll(".tab").forEach(function(x) { x.classList.remove("active"); });
    document.querySelectorAll(".tab-panel").forEach(function(x) { x.classList.remove("active"); });
    t.classList.add("active");
    var panel = document.getElementById("panel-" + target);
    if (panel) panel.classList.add("active");
    // Recharger journal si onglet Journal
    if (target === "journal") loadJournal();
    if (target === "settings") loadSettings();
  });
});

// ─────────────────────────────────────────
// PROFIL — rendu et événements (existant)
// ─────────────────────────────────────────
function render() {
  toggleBtn.classList.toggle("on", !!P.enabled);

  ambChips.querySelectorAll(".chip").forEach(function(c) {
    c.classList.toggle("on", P.ambitions.indexOf(c.dataset.v) !== -1);
  });
  domChips.querySelectorAll(".chip").forEach(function(c) {
    c.classList.toggle("on", P.domains.indexOf(c.dataset.v) !== -1);
  });

  phraseEl.value = P.lifePhrase || "";

  if (P.apiKey) {
    apiStatus.textContent = "✓ OK";
    apiStatus.className   = "ok";
    apiInput.placeholder  = "••••" + P.apiKey.slice(-4);
  } else {
    apiStatus.textContent = "Non configurée";
    apiStatus.className   = "";
    apiInput.placeholder  = "sk-ant-api03-…";
  }

  renderCustomAmbitions();
}

function saveAll(msg) {
  chrome.storage.local.set({ miroir_profile: P }, function() {
    if (chrome.runtime.lastError) {
      log("Erreur storage: " + chrome.runtime.lastError.message);
      return;
    }
    showToast(msg || "✓ Sauvegardé");
    render();
    chrome.tabs.query({}, function(tabs) {
      tabs.forEach(function(tab) {
        if (tab.id && tab.url && tab.url.slice(0,9) !== "chrome://") {
          chrome.tabs.sendMessage(tab.id, { type:"PROFILE_UPDATED", profile:P }, function() {
            void chrome.runtime.lastError;
          });
        }
      });
    });
  });
}

toggleBtn.addEventListener("click", function() {
  P.enabled = !P.enabled;
  toggleBtn.classList.toggle("on", P.enabled);
  saveAll(P.enabled ? "✓ Miroir activé" : "⏸ Miroir désactivé");
});

apiSave.addEventListener("click", function() {
  var val = apiInput.value.trim();
  if (!val) { log("Entre ta clé API d'abord."); return; }
  if (val.slice(0, 7) !== "sk-ant-") {
    apiInput.classList.add("err");
    setTimeout(function() { apiInput.classList.remove("err"); }, 1500);
    log("Format invalide. La clé doit commencer par sk-ant-");
    return;
  }
  debug.classList.remove("V");
  P.apiKey = val;
  apiInput.value = "";
  saveAll("✓ Clé API enregistrée");
});

apiInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") { e.preventDefault(); apiSave.click(); }
});

ambChips.addEventListener("click", function(e) {
  var chip = e.target.closest(".chip");
  if (!chip) return;
  chip.classList.toggle("on");
  P.ambitions = Array.from(ambChips.querySelectorAll(".chip.on")).map(function(c) { return c.dataset.v; });
});

function renderCustomAmbitions() {
  customAmbChips.innerHTML = "";
  (P.customAmbitions || []).forEach(function(ca, idx) {
    var chip = document.createElement("div");
    chip.className = "chip on";
    chip.style.cssText = "border-color:rgba(167,139,250,.6);color:#A78BFA;background:rgba(167,139,250,.1);position:relative;padding-right:22px;";
    chip.textContent = "✦ " + ca.label;
    chip.dataset.idx = idx;

    var closeBtn = document.createElement("span");
    closeBtn.textContent = "×";
    closeBtn.style.cssText = "position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:13px;cursor:pointer;color:rgba(167,139,250,.5);line-height:1;";
    closeBtn.addEventListener("click", function(e) {
      e.stopPropagation();
      P.customAmbitions.splice(idx, 1);
      renderCustomAmbitions();
      saveAll("✓ Objectif supprimé");
    });

    chip.appendChild(closeBtn);
    customAmbChips.appendChild(chip);
  });
}

customAmbAdd.addEventListener("click", function() {
  var val = customAmbInput.value.trim();
  if (!val) return;
  if (val.length > 60) { log("60 caractères max."); return; }

  var id = "custom_" + val.toLowerCase().replace(/[^a-z0-9àâéèêëïîôùûüç]/g, "_").replace(/_+/g, "_").slice(0, 30);

  var exists = (P.customAmbitions || []).some(function(c) { return c.id === id; });
  if (exists) { log("Cet objectif existe déjà."); return; }

  if (!P.customAmbitions) P.customAmbitions = [];
  P.customAmbitions.push({ id: id, label: val });
  customAmbInput.value = "";
  renderCustomAmbitions();
  saveAll("✓ Objectif « " + val + " » ajouté");
});

customAmbInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") { e.preventDefault(); customAmbAdd.click(); }
});

domChips.addEventListener("click", function(e) {
  var chip = e.target.closest(".chip");
  if (!chip) return;
  chip.classList.toggle("on");
  P.domains = Array.from(domChips.querySelectorAll(".chip.on")).map(function(c) { return c.dataset.v; });
});

btnSave.addEventListener("click", function() {
  P.lifePhrase = phraseEl.value.trim() || P.lifePhrase;
  saveAll("✓ Sauvegardé");
});

btnMiroir.addEventListener("click", function() {
  chrome.tabs.create({ url: "https://th20-art.github.io/mirror-page/?intercept" });
});

// ─────────────────────────────────────────
// JOURNAL — helpers + rendu
// ─────────────────────────────────────────
var AMB_LABELS = {
  epargne:"💰 Épargne", voyage:"🗺️ Voyage", ecologie:"🌱 Écologie",
  projet:"🚀 Projet", formation:"📚 Formation", sante:"💪 Santé",
  logement:"🏠 Logement", impact:"🤝 Impact", esprit_critique:"🧠 Esprit critique"
};
var DOM_LABELS = {
  fashion:"👗 Mode", delivery:"🛵 Livraison", shopping:"📦 E-commerce",
  food:"🍔 Fast food", electronics:"💻 Électronique", beauty:"💄 Beauté",
  travel:"✈️ Voyage", housing:"🏠 Logement", subscription:"🔄 Abonnements", social:"📱 Réseaux"
};

function fmtDate(ts) {
  var d = new Date(ts);
  var now = Date.now();
  var diff = now - ts;
  if (diff < 60000) return "à l'instant";
  if (diff < 3600000) return Math.floor(diff / 60000) + " min";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " h";
  if (diff < 604800000) return Math.floor(diff / 86400000) + " j";
  return d.getDate() + "/" + (d.getMonth() + 1);
}

function fmtEur(n) {
  if (!n || isNaN(n)) return "0 €";
  if (n >= 1000) return (n/1000).toFixed(1).replace(/\.0$/, "") + "k €";
  return Math.round(n) + " €";
}

function loadJournal() {
  chrome.storage.local.get("miroir_journal", function(data) {
    J = (data && data.miroir_journal) || { interceptions:[], weeklyCommitments:[], mirrorQuestionStats:{}, settings:{hourlyRate:0,strictModeEnabled:false} };
    if (!J.interceptions)       J.interceptions = [];
    if (!J.weeklyCommitments)   J.weeklyCommitments = [];
    if (!J.mirrorQuestionStats) J.mirrorQuestionStats = {};
    if (!J.settings)            J.settings = { hourlyRate:0, strictModeEnabled:false };
    renderMetrics();
    renderInterceptions();
    renderCommitments();
    renderQStats();
  });
}

function renderMetrics() {
  var now = Date.now();
  var cutoff = now - 30 * 86400000; // 30j
  var recent = J.interceptions.filter(function(it) { return it.timestamp >= cutoff; });

  var saved = 0;
  var abandoned = 0;
  var continued = 0;
  var alternative = 0;
  var ambCount = {}; // { epargne: 3, ecologie: 5 }

  recent.forEach(function(it) {
    if (it.decision === "abandoned") {
      abandoned++;
      saved += (it.priceNum || 0);
    } else if (it.decision === "continued") {
      continued++;
    } else if (it.decision === "alternative") {
      alternative++;
      // considère l'alternative comme une mini-victoire — on compte aussi l'épargne potentielle
      saved += (it.priceNum || 0) * 0.5; // moitié créditée
    }
    (it.ambitions || []).forEach(function(a) { ambCount[a] = (ambCount[a] || 0) + 1; });
  });

  var decided = abandoned + continued + alternative;
  var rate = decided > 0 ? Math.round(((abandoned + alternative) / decided) * 100) : null;

  mSaved.textContent = fmtEur(saved);
  mSavedSub.textContent = abandoned + " abandonné" + (abandoned > 1 ? "s" : "") + (alternative ? " · " + alternative + " alt." : "");

  if (rate === null) {
    mRate.textContent = "—";
    mRateSub.textContent = "Pas encore de décision";
  } else {
    mRate.textContent = rate + "%";
    mRateSub.textContent = "Sur " + decided + " décision" + (decided > 1 ? "s" : "");
  }

  mTotal.textContent = recent.length;
  mTotalSub.textContent = recent.length === 0 ? "Aucune sur 30j" : "30 derniers jours";

  // Ambition la plus protégée
  var topAmb = null, topCount = 0;
  Object.keys(ambCount).forEach(function(a) {
    if (ambCount[a] > topCount) { topCount = ambCount[a]; topAmb = a; }
  });
  if (topAmb) {
    mAmb.textContent = AMB_LABELS[topAmb] || topAmb;
    mAmbSub.textContent = topCount + " interception" + (topCount > 1 ? "s" : "");
  } else {
    mAmb.textContent = "—";
    mAmbSub.textContent = "—";
  }
}

function renderInterceptions() {
  interceptList.innerHTML = "";
  var items = J.interceptions.slice().reverse().slice(0, 30); // 30 dernières
  if (items.length === 0) {
    var e = document.createElement("div");
    e.className = "empty-state";
    e.innerHTML = '<span class="empty-state-ico">🪞</span>Aucune interception pour le moment.<br>Continue à naviguer — Miroir enregistrera tes décisions.';
    interceptList.appendChild(e);
    return;
  }
  var frag = document.createDocumentFragment();
  items.forEach(function(it) {
    var row = document.createElement("div");
    row.className = "intercept-item";
    var ico = document.createElement("div");
    ico.className = "intercept-ico";
    ico.textContent = it.verdict === "danger" ? "⚠️" : it.verdict === "attention" ? "🤔" : "✓";
    var body = document.createElement("div");
    body.className = "intercept-body";
    var name = document.createElement("div");
    name.className = "intercept-name";
    name.textContent = it.productName || it.site || "Produit";
    var meta = document.createElement("div");
    meta.className = "intercept-meta";
    var tagCls = "tag-" + (it.decision || "unknown");
    var tagLbl = it.decision === "abandoned" ? "Abandonné" :
                 it.decision === "continued" ? "Continué" :
                 it.decision === "alternative" ? "Alternative" : "Ouvert";
    meta.innerHTML = fmtDate(it.timestamp) + " · " + (it.price || "") + " · " + (it.site || "") + '<span class="intercept-tag ' + tagCls + '">' + tagLbl + '</span>';
    body.appendChild(name);
    body.appendChild(meta);
    row.appendChild(ico);
    row.appendChild(body);
    frag.appendChild(row);
  });
  interceptList.appendChild(frag);
}

function renderQStats() {
  qStatsList.innerHTML = "";
  var stats = J.mirrorQuestionStats || {};
  var arr = Object.keys(stats).map(function(k) {
    var s = stats[k];
    var decided = (s.abandoned || 0) + (s.continued || 0);
    var eff = decided > 0 ? (s.abandoned / decided) : 0;
    return { text: s.text, shown: s.shown, abandoned: s.abandoned || 0, continued: s.continued || 0, eff: eff, decided: decided };
  }).filter(function(s) { return s.decided >= 2; }); // au moins 2 décisions pour être significatif

  arr.sort(function(a, b) { return b.eff - a.eff; });
  arr = arr.slice(0, 5);

  if (arr.length === 0) {
    var e = document.createElement("div");
    e.className = "empty-state";
    e.style.padding = "12px 10px";
    e.innerHTML = '<span class="empty-state-ico" style="font-size:20px;">💭</span>Trop tôt pour avoir des statistiques.<br><span style="font-size:10px;">Il faut au moins 2 décisions par question.</span>';
    qStatsList.appendChild(e);
    return;
  }

  var frag = document.createDocumentFragment();
  arr.forEach(function(s) {
    var row = document.createElement("div");
    row.className = "q-stat";
    var txt = document.createElement("div");
    txt.className = "q-stat-text";
    txt.textContent = "« " + (s.text || "").slice(0, 110) + "»";
    var bar = document.createElement("div");
    bar.className = "q-stat-bar";
    var aFill = document.createElement("div");
    aFill.className = "q-stat-bar-fill q-stat-bar-a";
    aFill.style.width = (s.abandoned / s.decided * 100) + "%";
    var cFill = document.createElement("div");
    cFill.className = "q-stat-bar-fill q-stat-bar-c";
    cFill.style.width = (s.continued / s.decided * 100) + "%";
    bar.appendChild(aFill);
    bar.appendChild(cFill);
    var meta = document.createElement("div");
    meta.className = "q-stat-meta";
    meta.innerHTML = '<span style="color:var(--green)">✓ ' + s.abandoned + ' abandon' + (s.abandoned > 1 ? 's' : '') + '</span><span>vue ' + s.shown + 'x · ' + Math.round(s.eff * 100) + '% efficace</span>';
    row.appendChild(txt);
    row.appendChild(bar);
    row.appendChild(meta);
    frag.appendChild(row);
  });
  qStatsList.appendChild(frag);
}

// ─────────────────────────────────────────
// ENGAGEMENTS HEBDO
// ─────────────────────────────────────────
function getWeekStart() {
  var d = new Date();
  var day = d.getDay();
  var diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function renderCommitments() {
  commitList.innerHTML = "";
  var weekStart = getWeekStart();
  var active = (J.weeklyCommitments || []).filter(function(c) { return c.weekStart === weekStart; });

  if (active.length === 0) {
    var e = document.createElement("div");
    e.className = "empty-state";
    e.style.padding = "10px 5px";
    e.innerHTML = '<span class="empty-state-ico" style="font-size:20px;">🤝</span>Aucun engagement cette semaine.<br><span style="font-size:10px;">Ajoute un défi pour cette semaine.</span>';
    commitList.appendChild(e);
    return;
  }

  active.forEach(function(c) {
    var card = document.createElement("div");
    card.className = "commit-card";
    var head = document.createElement("div");
    head.className = "commit-active";
    head.innerHTML = '● Actif cette semaine';
    var lbl = document.createElement("div");
    lbl.className = "commit-label";
    lbl.textContent = c.label || DOM_LABELS[c.domain] || c.domain;
    var del = document.createElement("button");
    del.className = "commit-del";
    del.textContent = "×";
    del.title = "Retirer l'engagement";
    del.addEventListener("click", function() {
      J.weeklyCommitments = J.weeklyCommitments.filter(function(x) {
        return !(x.weekStart === c.weekStart && x.domain === c.domain);
      });
      chrome.storage.local.set({ miroir_journal: J }, function() {
        renderCommitments();
        showToast("✓ Engagement retiré");
      });
    });
    card.appendChild(head);
    card.appendChild(lbl);
    card.appendChild(del);
    commitList.appendChild(card);
  });
}

addCommitBtn.addEventListener("click", function() {
  commitForm.style.display = commitForm.style.display === "none" ? "block" : "none";
});

commitCancelBtn.addEventListener("click", function() {
  commitForm.style.display = "none";
});

commitSaveBtn.addEventListener("click", function() {
  var domain = commitDomain.value;
  if (!domain) return;
  var weekStart = getWeekStart();
  // Vérifier doublon
  var exists = (J.weeklyCommitments || []).some(function(c) {
    return c.weekStart === weekStart && c.domain === domain;
  });
  if (exists) {
    log("Déjà engagé sur ce domaine cette semaine.");
    return;
  }
  if (!J.weeklyCommitments) J.weeklyCommitments = [];
  J.weeklyCommitments.push({
    weekStart: weekStart,
    domain: domain,
    label: DOM_LABELS[domain] || domain,
    createdAt: Date.now()
  });
  chrome.storage.local.set({ miroir_journal: J }, function() {
    commitForm.style.display = "none";
    renderCommitments();
    showToast("✓ Engagement de la semaine pris");
  });
});

// ─────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────
function downloadBlob(content, filename, mime) {
  var blob = new Blob([content], { type: mime });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

function dateStamp() {
  var d = new Date();
  var pad = function(n) { return n < 10 ? "0" + n : n; };
  return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + "-" + pad(d.getHours()) + pad(d.getMinutes());
}

btnExport.addEventListener("click", function() {
  var payload = {
    exportedAt: new Date().toISOString(),
    version: "miroir-v7.1",
    profile: { ambitions: P.ambitions, customAmbitions: P.customAmbitions, domains: P.domains, lifePhrase: P.lifePhrase },
    journal: J
  };
  downloadBlob(JSON.stringify(payload, null, 2), "miroir-data-" + dateStamp() + ".json", "application/json");
  showToast("✓ Données exportées");
});

btnExportCsv.addEventListener("click", function() {
  var rows = [
    ["id","date","site","product","price_eur","verdict","score","decision","ambitions","mirror_question"]
  ];
  J.interceptions.forEach(function(it) {
    rows.push([
      it.id || "",
      new Date(it.timestamp).toISOString(),
      it.site || "",
      (it.productName || "").replace(/"/g, "'"),
      it.priceNum || 0,
      it.verdict || "",
      it.score || 0,
      it.decision || "unknown",
      (it.ambitions || []).join("|"),
      (it.mirrorQuestion || "").replace(/"/g, "'").replace(/[\r\n]+/g, " ")
    ]);
  });
  var csv = rows.map(function(r) {
    return r.map(function(c) {
      var s = String(c);
      if (s.indexOf(",") !== -1 || s.indexOf('"') !== -1 || s.indexOf("\n") !== -1) {
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }).join(",");
  }).join("\n");
  downloadBlob(csv, "miroir-interceptions-" + dateStamp() + ".csv", "text/csv");
  showToast("✓ CSV exporté");
});

btnResetJournal.addEventListener("click", function() {
  if (!confirm("Effacer toutes les interceptions et engagements ? Cette action est définitive.")) return;
  J = { interceptions:[], weeklyCommitments:[], mirrorQuestionStats:{}, settings: J.settings || {hourlyRate:0,strictModeEnabled:false} };
  chrome.storage.local.set({ miroir_journal: J }, function() {
    showToast("✓ Journal effacé");
    renderMetrics();
    renderInterceptions();
    renderCommitments();
    renderQStats();
  });
});

// ─────────────────────────────────────────
// RÉGLAGES
// ─────────────────────────────────────────
function loadSettings() {
  chrome.storage.local.get("miroir_journal", function(data) {
    J = (data && data.miroir_journal) || J;
    if (!J.settings) J.settings = { hourlyRate:0, strictModeEnabled:false };
    hourlyRateInput.value = J.settings.hourlyRate || "";
    strictToggle.textContent = J.settings.strictModeEnabled ? "ON" : "OFF";
    strictToggle.classList.toggle("on", !!J.settings.strictModeEnabled);
  });
}

rateSaveBtn.addEventListener("click", function() {
  var v = parseFloat(hourlyRateInput.value);
  if (isNaN(v) || v < 0) v = 0;
  if (!J.settings) J.settings = { hourlyRate:0, strictModeEnabled:false };
  J.settings.hourlyRate = v;
  chrome.storage.local.set({ miroir_journal: J }, function() {
    showToast(v > 0 ? "✓ Taux horaire : " + v + " €/h" : "✓ Taux horaire désactivé");
  });
});

hourlyRateInput.addEventListener("keydown", function(e) {
  if (e.key === "Enter") { e.preventDefault(); rateSaveBtn.click(); }
});

strictToggle.addEventListener("click", function() {
  if (!J.settings) J.settings = { hourlyRate:0, strictModeEnabled:false };
  J.settings.strictModeEnabled = !J.settings.strictModeEnabled;
  strictToggle.textContent = J.settings.strictModeEnabled ? "ON" : "OFF";
  strictToggle.classList.toggle("on", !!J.settings.strictModeEnabled);
  chrome.storage.local.set({ miroir_journal: J }, function() {
    showToast(J.settings.strictModeEnabled ? "✓ Mode strict activé" : "✓ Mode strict désactivé");
  });
});

// ── Démo média (v7.4) ──
var demoMediaBtn = document.getElementById("demo-media-btn");
if (demoMediaBtn) {
  demoMediaBtn.addEventListener("click", function() {
    var now = Date.now();
    var fakeSession = {
      id: "media_demo_" + now,
      platform: "tiktok",
      startedAt: now - 1800000,
      endedAt: now,
      videosSeen: [
        { title: "Recette ramen tonkotsu traditionnel", creator: "@chef_osaka", category: "learning", alignment: 9, passionMatch: "Cuisine japonaise", ts: now - 1700000 },
        { title: "Comment j'ai perdu 10kg en 2 semaines", creator: "@lifecoach", category: "manipulation", alignment: 2, ts: now - 1400000 },
        { title: "Les 5 iPhone à acheter AVANT Noël", creator: "@techdeals", category: "ads", alignment: 1, ts: now - 1100000 },
        { title: "TOP 10 des voitures de luxe 2026", creator: "@luxdaily", category: "entertainment", alignment: 2, ts: now - 900000 },
        { title: "Tokyo street food tour", creator: "@japantravel", category: "learning", alignment: 8, passionMatch: "Cuisine japonaise", ts: now - 700000 },
        { title: "Documentaire Forêt primaire", creator: "@arte", category: "learning", alignment: 7, passionMatch: "Randonnée", ts: now - 400000 },
        { title: "Shein Haul 50€ 30 pièces", creator: "@hauls_cheap", category: "ads", alignment: 1, ts: now - 100000 }
      ],
      adsDetected: 3,
      categoryBreakdown: { learning: 540, entertainment: 300, ads: 240, manipulation: 120 },
      topCreators: { "@chef_osaka": 1, "@japantravel": 1, "@arte": 1, "@hauls_cheap": 1, "@lifecoach": 1, "@techdeals": 1, "@luxdaily": 1 },
      topTopics: { "Cuisine japonaise": 2, "Randonnée": 1 },
      isDemo: true
    };
    if (!J.mediaSessions) J.mediaSessions = [];
    J.mediaSessions.push(fakeSession);
    chrome.storage.local.set({ miroir_journal: J }, function() {
      showToast("✓ Session démo ajoutée");
    });
  });
}

// ─────────────────────────────────────────
// SUGGESTIONS IA & COACH
// ─────────────────────────────────────────
var btnSuggest   = document.getElementById("btn-suggest");
var btnCoach     = document.getElementById("btn-coach");
var suggestArea  = document.getElementById("suggest-area");

var AMB_LABELS_FR = {
  epargne:"Épargne", voyage:"Voyage", ecologie:"Écologie",
  projet:"Projet perso/pro", formation:"Formation", sante:"Santé",
  logement:"Logement", impact:"Impact social", esprit_critique:"Esprit critique"
};

// ── Appel Claude API direct depuis le popup ──
function callClaude(system, userMsg, maxTokens, cb) {
  fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": P.apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5",
      max_tokens: maxTokens || 400,
      system: system,
      messages: [{ role: "user", content: userMsg }]
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    if (data.error) { cb(null, data.error.message || "Erreur API"); return; }
    var text = (data.content && data.content[0] && data.content[0].text) || "";
    cb(text, null);
  })
  .catch(function(err) { cb(null, err.message); });
}

// ── Bouton Suggestions IA ──
btnSuggest.addEventListener("click", function() {
  if (!P.apiKey) {
    suggestArea.style.display = "block";
    suggestArea.innerHTML = '<div class="suggest-card" style="color:var(--muted);">🔑 Configure ta clé API dans la section ci-dessus pour activer les suggestions.</div>';
    return;
  }

  var allAmb = P.ambitions.slice();
  var customLabels = (P.customAmbitions || []).map(function(c) { return c.label; });
  allAmb = allAmb.concat(customLabels);

  if (allAmb.length === 0) {
    suggestArea.style.display = "block";
    suggestArea.innerHTML = '<div class="suggest-card">Sélectionne au moins un objectif ci-dessus, ou clique <strong style="color:var(--fox);">💬 M\'aider à fixer</strong> pour que l\'IA t\'aide à les découvrir.</div>';
    return;
  }

  // Afficher loader
  suggestArea.style.display = "block";
  suggestArea.innerHTML = '<div class="suggest-spin">✦ Génération en cours…</div>';
  btnSuggest.disabled = true;
  btnSuggest.textContent = "⟳ …";

  var ambStr = allAmb.map(function(a) { return AMB_LABELS_FR[a] || a; }).join(", ");
  var phrase = (P.lifePhrase || "").trim();

  var system = "Tu es un conseiller de vie concis et direct. Tu donnes exactement 3 suggestions concrètes, jamais plus. Chaque suggestion commence par un emoji et tient en 1-2 lignes max. Tu inclus toujours des chiffres (montants, délais, fréquences). Réponds en français, sans markdown, sans titres, sans liste formelle.";

  var prompt = "L'utilisateur de Miroir (extension de consommation consciente) a sélectionné ces objectifs de vie : " + ambStr + "." +
    (phrase ? " Sa phrase de vie : \"" + phrase + "\"." : "") +
    "\n\nDonne-lui 3 suggestions CONCRÈTES et ACTIONNABLES pour ancrer ces objectifs dans son quotidien réel." +
    " Si ses objectifs semblent vagues ou flous, oriente-le vers des objectifs à long terme précis (1-3 ans, avec des jalons chiffrés)." +
    " Termine par UNE vision inspirante de ce que sa vie pourrait ressembler dans 2-3 ans s'il tient ces objectifs. Format : commence la vision par \"→ \"";

  callClaude(system, prompt, 450, function(text, err) {
    btnSuggest.disabled = false;
    btnSuggest.textContent = "✦ Suggestions IA";
    if (err) { log("Erreur : " + err); suggestArea.style.display = "none"; return; }
    if (!text) { suggestArea.style.display = "none"; return; }

    // Parser les lignes : vision = commence par "→"
    var lines = text.split("\n").map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 0; });
    var items = [];
    var vision = "";
    lines.forEach(function(l) {
      if (l.startsWith("→") || l.startsWith("->")) { vision = l.replace(/^[-→>]+\s*/, ""); }
      else { items.push(l); }
    });

    var html = '<div class="suggest-card">';
    items.slice(0, 3).forEach(function(line) {
      // Séparer l'emoji du texte
      var match = line.match(/^(\p{Emoji}\s*)/u);
      var ico = match ? match[1].trim() : "✦";
      var txt = match ? line.slice(match[0].length).trim() : line;
      html += '<div class="suggest-item"><span class="suggest-item-ico">' + ico + '</span><span class="suggest-item-txt">' + txt + '</span></div>';
    });
    if (vision) {
      html += '<div class="suggest-lt">→ ' + vision + '</div>';
    }
    html += '</div>';
    suggestArea.innerHTML = html;
  });
});

// ── Bouton M'aider à fixer mes objectifs ──
btnCoach.addEventListener("click", function() {
  chrome.tabs.create({ url: chrome.runtime.getURL("coach.html") });
});

// ─────────────────────────────────────────
// CHECKTAB (existant)
// ─────────────────────────────────────────
var KNOWN = [
  { label:"Mode 👗",         domains:["shein.com","zara.com","hm.com","asos.com","temu.com","zalando.com","mango.com","nike.com","adidas.fr"] },
  { label:"Livraison 🛵",    domains:["ubereats.com","deliveroo.fr","justeat.fr"] },
  { label:"E-commerce 📦",   domains:["amazon.fr","amazon.com","fnac.com","cdiscount.com","aliexpress.com","ebay.fr","ebay.com"] },
  { label:"Fast food 🍔",    domains:["mcdonalds.fr","kfc.fr","burgerking.fr","dominos.fr"] },
  { label:"Électronique 💻", domains:["apple.com","samsung.com","darty.com","boulanger.com","ldlc.com"] },
  { label:"Beauté 💄",       domains:["sephora.fr","nocibe.fr","marionnaud.fr"] },
  { label:"Voyage ✈️",      domains:["booking.com","airbnb.fr","airbnb.com","trainline.fr","sncf-connect.com","oui.sncf","skyscanner.fr","kayak.fr","easyjet.com","ryanair.com","airfrance.fr","blablacar.fr","flixbus.fr"] },
  { label:"Logement 🏠",    domains:["seloger.com","leboncoin.fr","pap.fr","bienici.com","logic-immo.com","orpi.com","century21.fr","laforet.com","foncia.com","nexity.fr"] },
  { label:"Abonnement 🔄",  domains:["netflix.com","spotify.com","disneyplus.com","deezer.com","adobe.com","canva.com","notion.so","figma.com","basicfit.fr"] },
  { label:"Réseaux 📱",      domains:["instagram.com","tiktok.com","facebook.com","twitter.com","x.com","youtube.com"] },
  { label:"Info & Presse 🧠", domains:["lemonde.fr","lefigaro.fr","liberation.fr","bfmtv.com","20minutes.fr","leparisien.fr","franceinfo.fr","huffingtonpost.fr","valeurs-actuelles.com","mondialisation.ca"] }
];

function checkTab() {
  chrome.tabs.query({ active:true, currentWindow:true }, function(tabs) {
    if (!tabs || !tabs[0]) { statusTxt.textContent = "Aucun onglet actif"; return; }
    var url = tabs[0].url || "";
    if (!url || url.slice(0,9) === "chrome://") { statusTxt.textContent = "Page Chrome — non surveillée"; return; }
    var host = url.replace(/^https?:\/\/(www\.)?/,"").split("/")[0];
    var found = KNOWN.find(function(s) {
      return s.domains.some(function(d) { return host.indexOf(d) !== -1; });
    }) || null;
    if (found) {
      statusDot.classList.add("on");
      statusTxt.style.color = "var(--fox)";
      statusTxt.textContent = found.label + " · analyse IA active";
    } else {
      statusTxt.textContent = "Site non surveillé (" + host + ")";
    }
  });
}

// ─────────────────────────────────────────
// INIT
// ─────────────────────────────────────────
chrome.storage.local.get("miroir_profile", function(data) {
  if (chrome.runtime.lastError) {
    log("Erreur lecture storage: " + chrome.runtime.lastError.message);
    render();
    checkTab();
    return;
  }
  if (data && data.miroir_profile) {
    var s = data.miroir_profile;
    if (Array.isArray(s.ambitions))  P.ambitions  = s.ambitions;
    if (Array.isArray(s.customAmbitions)) P.customAmbitions = s.customAmbitions;
    if (Array.isArray(s.domains))    P.domains    = s.domains;
    if (typeof s.lifePhrase==="string" && s.lifePhrase) P.lifePhrase = s.lifePhrase;
    if (typeof s.enabled==="boolean") P.enabled   = s.enabled;
    if (typeof s.apiKey==="string")   P.apiKey    = s.apiKey;
  }
  render();
  checkTab();
  // Précharger le journal en fond (léger)
  loadJournal();
});
