"use strict";
// ── MIROIR content.js v7 ──
// Architecture : createElement + addEventListener direct (MV3 CSP-safe)

// ─────────────────────────────────────────
// SITE RULES
// ─────────────────────────────────────────
var SITE_RULES = [
  {
    id:"fashion", category:"Mode / Vêtements",
    domains:["shein.com","zara.com","hm.com","primark.com","boohoo.com","asos.com","zalando.com","uniqlo.com","kiabi.com","jennyfer.com","temu.com","mango.com","nike.com","adidas.fr","lacoste.com"],
    cartUrls:["/cart","/panier","/basket","/checkout","/commande","/order"],
    cartBtns:["passer commande","commander","valider","checkout","place order","buy now","acheter","payer","valider mon panier","confirmer","order now","add to bag","ajouter au panier"],
    titleSel:["h1","[data-testid='product-title']","[class*='product-name']","[class*='product-title']"],
    priceSel:["[class*='price']","[data-price]","[class*='Price']","[itemprop='price']"],
    icon:"👗", label:"Fast Fashion"
  },
  {
    id:"delivery", category:"Livraison alimentaire",
    domains:["ubereats.com","deliveroo.fr","justeat.fr","doordash.com","glovo.com"],
    cartUrls:["/cart","/checkout","/basket","/panier","/order"],
    cartBtns:["commander","valider","checkout","place order","passer commande","order now","go to checkout","passer à la caisse"],
    titleSel:["h1","[class*='restaurant-name']","[class*='item-name']"],
    priceSel:["[class*='price']","[class*='Price']"],
    icon:"🛵", label:"Livraison"
  },
  {
    id:"shopping", category:"E-commerce",
    domains:["amazon.fr","amazon.com","fnac.com","cdiscount.com","darty.com","boulanger.com","aliexpress.com","wish.com","ebay.fr","ebay.com","rakuten.fr","ldlc.com"],
    cartUrls:["/cart","/panier","/checkout","/gp/cart","/order","/buy"],
    cartBtns:["acheter","commander","passer commande","buy now","place order","checkout","valider","payer","proceed to checkout","go to checkout","ajouter au panier","add to cart"],
    titleSel:["h1","#productTitle","[data-testid='product-title']","[class*='product-title']"],
    priceSel:["#priceblock_ourprice","#price_inside_buybox","[class*='price']","[data-price]","[itemprop='price']"],
    icon:"📦", label:"E-commerce"
  },
  {
    id:"food", category:"Fast food",
    domains:["mcdonalds.fr","kfc.fr","burgerking.fr","subway.fr","dominos.fr","pizzahut.fr"],
    cartUrls:["/order","/checkout","/cart","/panier"],
    cartBtns:["commander","valider","checkout","order now","place order","ajouter"],
    titleSel:["h1","[class*='product-name']"],
    priceSel:["[class*='price']"],
    icon:"🍔", label:"Fast food"
  },
  {
    id:"electronics", category:"Électronique",
    domains:["apple.com","samsung.com","sony.fr","darty.com","boulanger.com","ldlc.com","materiel.net","topachat.com"],
    cartUrls:["/cart","/panier","/checkout"],
    cartBtns:["acheter","ajouter au panier","buy","commander","checkout","go to checkout","valider"],
    titleSel:["h1","[class*='product-title']","[itemprop='name']"],
    priceSel:["[class*='price']","[data-price]","[itemprop='price']"],
    icon:"💻", label:"Électronique"
  },
  {
    id:"beauty", category:"Beauté / Cosmétiques",
    domains:["sephora.fr","nocibe.fr","marionnaud.fr","yves-rocher.fr","lush.com","nuxe.com"],
    cartUrls:["/cart","/panier","/checkout"],
    cartBtns:["ajouter au panier","acheter","commander","checkout","valider"],
    titleSel:["h1","[class*='product-name']"],
    priceSel:["[class*='price']","[itemprop='price']"],
    icon:"💄", label:"Beauté"
  },
  {
    id:"travel", category:"Voyage / Transport",
    domains:["booking.com","airbnb.fr","airbnb.com","hotels.com","expedia.fr","expedia.com","kayak.fr","skyscanner.fr","skyscanner.com","trainline.fr","trainline.com","oui.sncf","sncf-connect.com","easyjet.com","ryanair.com","airfrance.fr","vueling.com","transavia.com","blablacar.fr","flixbus.fr","lastminute.com","opodo.fr","edreams.fr","tripadvisor.fr","hostelworld.com","trivago.fr"],
    cartUrls:["/checkout","/book","/reservation","/payment","/paiement","/confirm","/purchase"],
    cartBtns:["réserver","book","reserve","confirmer","payer","proceed","finaliser","valider la réservation","complete booking","buy","acheter"],
    titleSel:["h1","[data-testid='title']","[class*='listing-title']","[class*='hotel-name']","[class*='property-name']"],
    priceSel:["[class*='price']","[data-price]","[class*='Price']","[class*='total']","[class*='fare']"],
    icon:"✈️", label:"Voyage"
  },
  {
    id:"housing", category:"Logement / Immobilier",
    domains:["seloger.com","leboncoin.fr","pap.fr","bienici.com","logic-immo.com","superimmo.com","orpi.com","century21.fr","laforet.com","guy-hoquet.com","stephane-plaza.com","foncia.com","nexity.fr","avendrealouer.fr","meilleursagents.com","bien-ici.fr"],
    cartUrls:["/contact","/rdv","/visite","/demande","/candidature"],
    cartBtns:["contacter","demander une visite","prendre rdv","envoyer ma candidature","postuler","candidater","demander"],
    titleSel:["h1","[class*='title']","[class*='listing-title']","[class*='annonce']"],
    priceSel:["[class*='price']","[class*='prix']","[class*='loyer']","[class*='Price']"],
    icon:"🏠", label:"Logement"
  },
  {
    id:"subscription", category:"Abonnements / Services",
    domains:["netflix.com","spotify.com","disney.plus.com","disneyplus.com","primevideo.com","apple.com/tv","deezer.com","youtube.com/premium","canva.com","adobe.com","notion.so","figma.com","chatgpt.com","openai.com","midjourney.com","gym","basicfit.fr","neoness.fr","keepcool.fr"],
    cartUrls:["/checkout","/subscribe","/payment","/upgrade","/premium","/plan","/pricing"],
    cartBtns:["s'abonner","subscribe","upgrade","passer à premium","start free trial","essai gratuit","commencer","go premium","choose plan","choisir"],
    titleSel:["h1","[class*='plan-name']","[class*='title']"],
    priceSel:["[class*='price']","[class*='Price']","[class*='amount']","[class*='cost']"],
    icon:"🔄", label:"Abonnement"
  }
  // Réseaux sociaux gérés séparément via isSocialSite() + initSocialMode()
];

// ─────────────────────────────────────────
// ÉTAT
// ─────────────────────────────────────────
var PROFILE = {
  ambitions:["epargne","ecologie"],
  customAmbitions:[],
  domains:["fashion","shopping","delivery","food","electronics","beauty","travel","housing","subscription","social"],
  lifePhrase:"Je veux construire une vie qui me ressemble.",
  enabled:true, apiKey:"",
  passions:[] // v7.3
};

var currentRule   = null;
var cartWatching  = false;
var overlayBuilt  = false;
var analysisShown = false;
var analysisRunning = false;
var lastAnalyzedUrl = "";
var bubbleTimer   = null;
var bubbleVisible = false;

// Références DOM directes (plus d'getElementById après création)
var EL = {};
var urlWatchInterval = null;

// ─────────────────────────────────────────
// JOURNAL D'INTERCEPTIONS — v7.1
// Stocke toutes les interceptions + décisions utilisateur
// Permet calcul épargne totale, taux d'abandon, métriques pour soutenance
// ─────────────────────────────────────────
var currentInterception = null; // { id, ... } en cours de tracking

function mrrJournalDefault() {
  return {
    interceptions: [],
    weeklyCommitments: [],
    mirrorQuestionStats: {},
    settings: { hourlyRate: 0, strictModeEnabled: false }
  };
}

function mrrJournalGet(cb) {
  chrome.storage.local.get("miroir_journal", function(data) {
    var j = (data && data.miroir_journal) || mrrJournalDefault();
    // Migration : ajout des champs manquants
    if (!j.interceptions)        j.interceptions = [];
    if (!j.weeklyCommitments)    j.weeklyCommitments = [];
    if (!j.mirrorQuestionStats)  j.mirrorQuestionStats = {};
    if (!j.settings)             j.settings = { hourlyRate: 0, strictModeEnabled: false };
    cb(j);
  });
}

function mrrJournalSet(j, cb) {
  chrome.storage.local.set({ miroir_journal: j }, function() {
    // Si on est sur la PWA, repousser immédiatement la nouvelle version
    if (typeof pushToPwa === "function" && typeof isPwaPage === "function" && isPwaPage()) {
      pushToPwa();
    }
    if (cb) cb();
  });
}

// Extraire un prix numérique depuis une chaîne ("42,90 €", "$39.99", etc.)
function parsePrice(str) {
  if (!str) return 0;
  var s = String(str).replace(/\s/g, "").replace(",", ".");
  var m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? parseFloat(m[1]) : 0;
}

// Hash court pour identifier une question miroir (pour stats)
function hashQuestion(q) {
  if (!q) return "";
  var s = String(q).toLowerCase().replace(/[^\w\sàâéèêëïîôùûüç]/gi, "").slice(0, 80);
  var h = 0;
  for (var i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
  return "q_" + Math.abs(h).toString(36);
}

// Appelé quand une analyse produit est rendue → crée une interception "pending"
function trackInterception(analysis, productInfo) {
  if (!analysis || !productInfo) return;
  var now = Date.now();
  var priceStr = productInfo.price || "";
  var priceNum = parsePrice(priceStr);

  currentInterception = {
    id: "int_" + now + "_" + Math.random().toString(36).slice(2, 7),
    timestamp: now,
    url: window.location.href,
    site: window.location.hostname.replace(/^www\./, ""),
    productName: analysis.productName || productInfo.title || "",
    price: priceStr,
    priceNum: priceNum,
    verdict: analysis.verdict || "attention",
    score: analysis.score || 0,
    ambitions: (PROFILE.ambitions || []).slice(),
    mirrorQuestion: analysis.mirrorQuestion || "",
    questionHash: hashQuestion(analysis.mirrorQuestion),
    decision: "unknown",
    decisionAt: null
  };

  mrrJournalGet(function(j) {
    // Éviter les doublons si on recharge la page rapidement
    var existing = j.interceptions.find(function(it) {
      return it.url === currentInterception.url && (now - it.timestamp < 60000);
    });
    if (existing) {
      currentInterception.id = existing.id;
      return;
    }
    j.interceptions.push(currentInterception);
    // Cap à 500 interceptions pour éviter explosion storage
    if (j.interceptions.length > 500) j.interceptions = j.interceptions.slice(-500);
    // Stats question miroir
    var qh = currentInterception.questionHash;
    if (qh) {
      if (!j.mirrorQuestionStats[qh]) {
        j.mirrorQuestionStats[qh] = { text: currentInterception.mirrorQuestion, shown: 0, abandoned: 0, continued: 0 };
      }
      j.mirrorQuestionStats[qh].shown++;
    }
    mrrJournalSet(j);
  });
}

// Enregistre la décision finale (abandoned / continued / alternative)
function recordDecision(decision) {
  if (!currentInterception) return;
  var id = currentInterception.id;
  var qh = currentInterception.questionHash;
  currentInterception.decision = decision;
  currentInterception.decisionAt = Date.now();

  mrrJournalGet(function(j) {
    var idx = j.interceptions.findIndex(function(it) { return it.id === id; });
    if (idx !== -1) {
      j.interceptions[idx].decision = decision;
      j.interceptions[idx].decisionAt = Date.now();
    }
    // Stats question miroir
    if (qh && j.mirrorQuestionStats[qh]) {
      if (decision === "abandoned")      j.mirrorQuestionStats[qh].abandoned++;
      else if (decision === "continued") j.mirrorQuestionStats[qh].continued++;
    }
    mrrJournalSet(j);
  });
}

// ─────────────────────────────────────────
// ENGAGEMENT HEBDO — feature 4
// ─────────────────────────────────────────
function getWeekStart() {
  var d = new Date();
  var day = d.getDay(); // 0=dim, 1=lun
  var diff = (day === 0 ? -6 : 1 - day); // lundi comme début de semaine
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getCurrentCommitment(j, domainId) {
  var weekStart = getWeekStart();
  return (j.weeklyCommitments || []).find(function(c) {
    return c.weekStart === weekStart && c.domain === domainId;
  });
}

// ─────────────────────────────────────────
// TIRELIRE + QR SEPA (v7.2)
// Proposer de mettre de côté l'argent abandonné
// ─────────────────────────────────────────
var BANK_PROVIDERS = [
  {id:"livret_a",   lbl:"🏦 Livret A",        url:"https://www.boursobank.com/epargne/livret-a/", desc:"Livret classique réglementé"},
  {id:"revolut",    lbl:"💳 Revolut Vault",    url:"https://app.revolut.com/home/vaults",           desc:"Coffre-fort in-app Revolut"},
  {id:"lydia",      lbl:"📲 Lydia cagnotte",   url:"https://lydia-app.com/",                         desc:"Cagnotte + arrondis automatiques"},
  {id:"helios",     lbl:"🌱 Helios",           url:"https://helios.do",                              desc:"Banque verte française"},
  {id:"greengot",   lbl:"🌿 Green-Got",        url:"https://www.green-got.com",                      desc:"Banque à impact"},
  {id:"yomoni",     lbl:"💎 Yomoni",           url:"https://www.yomoni.fr",                          desc:"Épargne gérée par projet"}
];

// Validation IBAN (vérif checksum mod 97, norme ISO 13616)
function ibanIsValid(iban) {
  if (!iban) return false;
  var s = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  // Déplacer 4 premiers chars à la fin
  var rearranged = s.slice(4) + s.slice(0, 4);
  // Remplacer lettres par nombres (A=10, B=11, ..., Z=35)
  var numeric = "";
  for (var i = 0; i < rearranged.length; i++) {
    var c = rearranged.charCodeAt(i);
    if (c >= 65 && c <= 90) numeric += (c - 55); // A-Z
    else numeric += rearranged.charAt(i);
  }
  // Modulo 97 par chunks (car BigInt pas dispo partout)
  var remainder = 0;
  for (var k = 0; k < numeric.length; k++) {
    remainder = (remainder * 10 + parseInt(numeric.charAt(k), 10)) % 97;
  }
  return remainder === 1;
}

function ibanFormat(iban) {
  if (!iban) return "";
  var s = iban.replace(/\s+/g, "").toUpperCase();
  return s.replace(/(.{4})/g, "$1 ").trim();
}

function ibanMasked(iban) {
  if (!iban) return "";
  var s = iban.replace(/\s+/g, "").toUpperCase();
  if (s.length < 8) return ibanFormat(s);
  return s.slice(0, 4) + " •••• •••• •••• " + s.slice(-4);
}

// Construit le payload EPC069-12 v2 (Girocode SEPA)
// Spécification : https://en.wikipedia.org/wiki/EPC_QR_code
function buildEpcPayload(iban, name, amount, label) {
  var cleanIban = (iban || "").replace(/\s+/g, "").toUpperCase();
  var cleanName = (name || "Miroir").substring(0, 70);
  var amt = Number(amount).toFixed(2);
  var lbl = (label || "Miroir — resistance").substring(0, 140);
  var parts = [
    "BCD",          // Service tag
    "002",          // Version
    "1",            // Encoding : UTF-8
    "SCT",          // SEPA Credit Transfer
    "",             // BIC (optionnel en v2)
    cleanName,      // Nom bénéficiaire
    cleanIban,      // IBAN bénéficiaire
    "EUR" + amt,    // Devise + montant (ex: EUR42.00)
    "",             // Purpose (optionnel)
    "",             // Reference (optionnel)
    lbl             // Remittance info
  ];
  return parts.join("\n");
}

// URL d'un QR code via API publique (quickchart.io, gratuit)
function qrUrlFromText(text) {
  var encoded = encodeURIComponent(text);
  return "https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=4&data=" + encoded;
}

// ── Enregistre un montant dans la tirelire virtuelle ──
function addToPiggybank(ambition, amount, sourceInterceptionId) {
  if (!amount || amount <= 0) return;
  mrrJournalGet(function(j) {
    if (!j.piggybank) j.piggybank = {};
    if (!j.piggybank[ambition]) j.piggybank[ambition] = { amount: 0, transferred: 0 };
    j.piggybank[ambition].amount += amount;
    if (!j.piggybankHistory) j.piggybankHistory = [];
    j.piggybankHistory.push({
      ts: Date.now(),
      ambition: ambition,
      amount: amount,
      action: "added",
      interceptionId: sourceInterceptionId || null
    });
    // Cap historique à 200 entrées
    if (j.piggybankHistory.length > 200) j.piggybankHistory = j.piggybankHistory.slice(-200);
    mrrJournalSet(j);
  });
}

// ── Marque un transfert comme effectué → vide la tirelire de l'ambition ──
function recordPiggybankTransfer(ambition, amount, provider) {
  mrrJournalGet(function(j) {
    if (!j.piggybank || !j.piggybank[ambition]) return;
    var toTransfer = Math.min(amount, j.piggybank[ambition].amount);
    j.piggybank[ambition].amount -= toTransfer;
    j.piggybank[ambition].transferred = (j.piggybank[ambition].transferred || 0) + toTransfer;
    if (!j.piggybankHistory) j.piggybankHistory = [];
    j.piggybankHistory.push({
      ts: Date.now(),
      ambition: ambition,
      amount: toTransfer,
      action: "transferred",
      provider: provider || "manual"
    });
    if (!j.transfers) j.transfers = [];
    j.transfers.push({ ts: Date.now(), ambition: ambition, amount: toTransfer, provider: provider || "manual" });
    if (j.transfers.length > 100) j.transfers = j.transfers.slice(-100);
    mrrJournalSet(j);
  });
}

// ── Stocker / lire l'IBAN utilisateur (dans miroir_profile pour réutilisation) ──
function saveIban(iban, name, callback) {
  chrome.storage.local.get("miroir_profile", function(data) {
    var p = data.miroir_profile || {};
    p.userIban = (iban || "").replace(/\s+/g, "").toUpperCase();
    p.userIbanName = (name || "").substring(0, 70);
    chrome.storage.local.set({ miroir_profile: p }, function() {
      PROFILE.userIban = p.userIban;
      PROFILE.userIbanName = p.userIbanName;
      if (callback) callback();
    });
  });
}


function isCommittedAgainstCurrentSite(cb) {
  if (!currentRule) { cb(null); return; }
  mrrJournalGet(function(j) {
    var c = getCurrentCommitment(j, currentRule.id);
    cb(c || null);
  });
}

// ─────────────────────────────────────────
// MODULE RÉSEAUX SOCIAUX
// ─────────────────────────────────────────
var socialTimer      = null;   // setInterval du chrono
var socialSeconds    = 0;      // temps passé en secondes
var socialAlerted    = {};     // paliers déjà alertés {120:true, 300:true...}
var socialColabObs   = null;   // MutationObserver collab
var socialActive     = false;

var SOCIAL_DOMAINS = ["tiktok.com","instagram.com","youtube.com","twitch.tv",
  "facebook.com","twitter.com","x.com","snapchat.com","pinterest.com","reddit.com"];

// Paliers d'alerte en secondes
var SOCIAL_THRESHOLDS = [
  { sec:120,  msg:"2 min de scroll. Ton objectif attend toujours." },
  { sec:300,  msg:"5 min. Equivalent à 5 min de lecture ou de projet." },
  { sec:600,  msg:"10 min. Tu as résisté à des achats — résiste aussi au scroll." },
  { sec:1200, msg:"20 min de scroll. C'est le moment de poser le téléphone." },
  { sec:1800, msg:"30 min. Une demi-heure de ta vie. Ça valait le coup ?" }
];

// Patterns de détection de collab/pub
var COLLAB_PATTERNS = [
  /\bsponsori[sé]/i, /\bpartenariat\b/i, /\b#ad\b/i, /\b#sponsored\b/i,
  /\bcollab(oration)?\b/i, /\bcode promo\b/i, /\bcode\s+[A-Z]{3,10}\b/,
  /\baffili[eé]\b/i, /\blien en bio\b/i, /\bpublicit[eé]\b/i,
  /\[pub\]/i, /\bpartenaire\b/i, /paid partnership/i,
  /\bcode\b.{0,20}\b-?\d{0,2}%/i
];

function isSocialSite() {
  var host = window.location.hostname.replace(/^www\./,"");
  return SOCIAL_DOMAINS.some(function(d){ return host.indexOf(d) !== -1; });
}

function fmtTime(sec) {
  var m = Math.floor(sec / 60);
  var s = sec % 60;
  return m + ":" + (s < 10 ? "0" : "") + s;
}

// ── CSS supplémentaire pour le widget social ──
function injectSocialCSS() {
  if (document.getElementById("mrr-social-styles")) return;
  var s = document.createElement("style");
  s.id = "mrr-social-styles";
  s.textContent = [
    "#mrr-social{all:initial;font-family:'DM Sans',system-ui,sans-serif;position:fixed;bottom:82px;right:20px;z-index:2147483647;pointer-events:none;}",
    "#mrr-timer-pill{pointer-events:auto;display:flex;align-items:center;gap:8px;background:rgba(8,6,15,.95);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:7px 13px;cursor:pointer;opacity:0;transform:translateY(6px);transition:opacity .25s,transform .25s;}",
    "#mrr-timer-pill.show{opacity:1;transform:translateY(0);}",
    "#mrr-timer-dot{width:6px;height:6px;border-radius:50%;background:#E8563A;animation:mrr-blink 1.2s ease-in-out infinite;}",
    "@keyframes mrr-blink{0%,100%{opacity:1;}50%{opacity:.3;}}",
    "#mrr-timer-time{font-size:13px;font-weight:600;color:#EDE9E0;font-variant-numeric:tabular-nums;min-width:36px;}",
    "#mrr-timer-label{font-size:10px;color:#6B6475;letter-spacing:.5px;}",
    "#mrr-collab-badge{pointer-events:auto;display:none;align-items:center;gap:7px;background:rgba(245,200,66,.12);border:1px solid rgba(245,200,66,.35);border-radius:12px;padding:7px 12px;margin-bottom:6px;cursor:pointer;}",
    "#mrr-collab-badge.show{display:flex;}",
    "#mrr-collab-ico{font-size:14px;}",
    "#mrr-collab-txt{font-size:11px;font-weight:600;color:#F5C842;line-height:1.35;}",
    "#mrr-collab-sub{font-size:10px;color:rgba(245,200,66,.65);margin-top:1px;}",
    ".mrr-cross-section{margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,.07);}",
    ".mrr-cross-lbl{font-size:8px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6B6475;margin-bottom:8px;display:flex;align-items:center;gap:6px;}",
    ".mrr-cross-lbl::after{content:\'\';flex:1;height:1px;background:rgba(255,255,255,.06);}",
    ".mrr-cw{background:rgba(8,6,15,.7);border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,.07);margin-bottom:6px;}",
    ".mrr-cw-head{padding:8px 10px;display:flex;align-items:center;gap:7px;}",
    ".mrr-cw-ico{font-size:16px;flex-shrink:0;line-height:1;}",
    ".mrr-cw-meta{flex:1;min-width:0;}",
    ".mrr-cw-pair{display:flex;align-items:center;gap:3px;flex-wrap:wrap;margin-bottom:2px;}",
    ".mrr-ctag{font-size:9px;font-weight:700;padding:1px 6px;border-radius:6px;}",
    ".mrr-cw-title{font-size:11px;font-weight:600;color:#EDE9E0;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
    ".mrr-xp-pill{font-size:8px;font-weight:700;padding:2px 6px;border-radius:5px;background:rgba(245,200,66,.15);color:#F5C842;flex-shrink:0;}",
    ".mrr-cw-xpbar{height:2px;background:rgba(255,255,255,.08);margin:0 10px 6px;}",
    ".mrr-cw-xpfill{height:2px;border-radius:1px;}",
    ".mrr-cw-alert{padding:6px 10px;display:flex;align-items:flex-start;gap:6px;font-size:10px;line-height:1.4;font-weight:500;}",
    ".mrr-cw-alert-ico{flex-shrink:0;font-size:11px;margin-top:1px;}",
    ".mrr-alts-grid{display:grid;grid-template-columns:1fr 1fr;gap:4px;padding:6px 8px 8px;}",
    ".mrr-alt{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:6px 8px;cursor:pointer;text-decoration:none;display:block;transition:border-color .15s;}",
    ".mrr-alt:hover{border-color:rgba(255,255,255,.16);}",
    ".mrr-alt-top{display:flex;align-items:center;gap:5px;margin-bottom:2px;}",
    ".mrr-alt-ico{font-size:12px;flex-shrink:0;}",
    ".mrr-alt-name{font-size:10px;font-weight:600;color:#EDE9E0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}",
    ".mrr-alt-desc{font-size:9px;color:#6B6475;line-height:1.3;margin-bottom:3px;}",
    ".mrr-alt-save{font-size:9px;font-weight:700;margin-bottom:2px;}",
    ".mrr-alt-footer{display:flex;align-items:center;gap:3px;}",
    ".mrr-alt-badge{font-size:7px;font-weight:700;padding:1px 4px;border-radius:3px;}",
    ".mrr-alt-url{font-size:7px;color:#4A4456;margin-left:auto;}",
    ".mrr-cw-resist{display:block;width:100%;box-sizing:border-box;padding:8px;background:#E8563A;border:none;border-radius:0 0 10px 10px;color:#fff;font-size:11px;font-weight:700;cursor:pointer;text-align:center;font-family:\'DM Sans\',system-ui,sans-serif;transition:opacity .15s;}",
    ".mrr-cw-resist:hover{opacity:.88;}",
    ".mrr-cw-resist.done{background:#42C47E;cursor:default;}"
  ].join("\n");
  document.head.appendChild(s);
}

// ── Construire le widget social ──
var socialWidgetBuilt = false;
var EL_S = {};

function buildSocialWidget() {
  if (socialWidgetBuilt) return;
  socialWidgetBuilt = true;
  injectSocialCSS();

  var wrap = document.createElement("div");
  wrap.id = "mrr-social";
  EL_S.wrap = wrap;

  // Badge collab
  var collab = document.createElement("div");
  collab.id = "mrr-collab-badge"; EL_S.collab = collab;
  var collabIco = document.createElement("div"); collabIco.id = "mrr-collab-ico"; collabIco.textContent = "⚠️";
  var collabInfo = document.createElement("div");
  var collabTxt = document.createElement("div"); collabTxt.id = "mrr-collab-txt"; collabTxt.textContent = "Contenu sponsorisé détecté"; EL_S.collabTxt = collabTxt;
  var collabSub = document.createElement("div"); collabSub.id = "mrr-collab-sub"; collabSub.textContent = "Ce créateur est payé pour promouvoir ce produit"; EL_S.collabSub = collabSub;
  collabInfo.appendChild(collabTxt); collabInfo.appendChild(collabSub);
  collab.appendChild(collabIco); collab.appendChild(collabInfo);
  collab.addEventListener("click", function() { collab.classList.remove("show"); });

  // Timer pill
  var pill = document.createElement("div");
  pill.id = "mrr-timer-pill"; EL_S.pill = pill;
  var dot  = document.createElement("div"); dot.id = "mrr-timer-dot";
  var time = document.createElement("div"); time.id = "mrr-timer-time"; time.textContent = "0:00"; EL_S.timerTime = time;
  var lbl  = document.createElement("div"); lbl.id = "mrr-timer-label"; lbl.textContent = "SCROLL"; EL_S.timerLbl = lbl;
  pill.appendChild(dot); pill.appendChild(time); pill.appendChild(lbl);

  // Clic pill → afficher bilan ou ouvrir Miroir
  pill.addEventListener("click", function() {
    window.open("https://th20-art.github.io/mirror-page/?intercept","_blank");
  });

  wrap.appendChild(collab);
  wrap.appendChild(pill);
  document.body.appendChild(wrap);
}

// ── Démarrer le chrono ──
function startSocialTimer() {
  if (socialTimer) return;
  socialSeconds = 0;
  socialAlerted = {};
  buildSocialWidget();

  // Afficher la pill après 5s (pas immédiatement, c'est intrusif)
  setTimeout(function() {
    if (EL_S.pill) EL_S.pill.classList.add("show");
  }, 5000);

  socialTimer = setInterval(function() {
    if (!document.hidden) {
      socialSeconds++;
      if (EL_S.timerTime) EL_S.timerTime.textContent = fmtTime(socialSeconds);

      // ── Seuil intercept vidéo : 15s normal, 5s en heures noires (22h-6h) ──
      var currentHour = new Date().getHours();
      var isDarkHours = (currentHour >= 22 || currentHour < 6);
      var interceptThreshold = isDarkHours ? 5 : 15;

      if (socialSeconds === interceptThreshold && !socialAlerted[interceptThreshold]) {
        socialAlerted[interceptThreshold] = true;
        if (isDarkHours) {
          showBubble("🌙 HEURES NOIRES", "Après 22h, Miroir intervient plus vite.", 3000);
        }
        openIntercept(); // videoMode = iframe, pas le sheet
      }

      // Alertes aux paliers texte
      SOCIAL_THRESHOLDS.forEach(function(t) {
        if (socialSeconds === t.sec && !socialAlerted[t.sec]) {
          socialAlerted[t.sec] = true;
          if (EL.avatar) {
            EL.avatar.style.borderColor = "rgba(232,86,58,.8)";
            setTimeout(function(){ if(EL.avatar) EL.avatar.style.borderColor = ""; }, 3000);
          }
          if (EL_S.timerLbl) {
            EL_S.timerLbl.textContent = "⚠️ " + fmtTime(t.sec);
            setTimeout(function(){ if(EL_S.timerLbl) EL_S.timerLbl.textContent = "SCROLL"; }, 4000);
          }
          showBubble("TEMPS", t.msg, 6000);
        }
      });
    }
  }, 1000);
}

// ── Arrêter le chrono ──
function stopSocialTimer() {
  clearInterval(socialTimer);
  socialTimer = null;
  if (EL_S.pill) EL_S.pill.classList.remove("show");
  if (EL_S.collab) EL_S.collab.classList.remove("show");
}

// ── Désactiver complètement le mode social (profil mis à jour en live) ──
function stopSocialMode() {
  stopSocialTimer();
  socialActive = false;
  if (EL_S.wrap) EL_S.wrap.style.display = "none";
  if (socialColabObs) { socialColabObs.disconnect(); socialColabObs = null; }
  hideBubble();
}

// ── Détecter collabs dans le contenu visible ──
// Stratégie : scan brut du texte visible + détection badges natifs
// Sans dépendre de sélecteurs CSS fragiles (TikTok change ses classes en permanence)

var lastCollabCheck = "";  // éviter de remonter le même contenu deux fois

// Sélecteurs de badges natifs sponsorisés (en scope module pour éviter recréation à chaque appel)
var NATIVE_SELECTORS = [
  // TikTok — différentes versions
  "[data-e2e='paid-label']",
  "[class*='DivPaidPartnership']",
  "[class*='paid-partnership']",
  "[class*='PaidPartnership']",
  "[class*='sponsoredLabel']",
  "[class*='SponsoredLabel']",
  // Instagram
  "[class*='paid_partnership']",
  "div[role='presentation'] span[class*='sponsor']",
  // YouTube
  "#movie_player .ytp-paid-content-overlay",
  ".ytp-paid-content-overlay",
  // Generic
  "[aria-label*='paid partnership']",
  "[aria-label*='Partenariat rémunéré']",
  "[aria-label*='Paid partnership']"
];

function detectCollabs() {
  var host = window.location.hostname;
  var found = false;
  var matchedText = "";
  var matchedLabel = "Contenu sponsorisé détecté";

  // ── 1. Badges natifs des plateformes (plus fiables que le texte) ──
  // TikTok : badge "Partenariat rémunéré" en overlay sur la vidéo

  for (var ni = 0; ni < NATIVE_SELECTORS.length; ni++) {
    try {
      var nb = document.querySelectorAll(NATIVE_SELECTORS[ni]);
      if (nb.length > 0) {
        found = true;
        matchedLabel = "Partenariat rémunéré";
        matchedText = "Badge officiel détecté — ce créateur est payé pour ce contenu";
        break;
      }
    } catch(e) {}
  }

  // ── 2. Scan texte brut — récupérer les nœuds texte visibles ──
  // TikTok charge les descriptions dans des spans imbriqués dynamiques
  // On scanne directement les nœuds texte plutôt que des sélecteurs CSS
  if (!found) {
    var walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function(node) {
          // Ignorer les scripts, styles, notre propre UI
          var p = node.parentElement;
          if (!p) return NodeFilter.FILTER_REJECT;
          var tag = p.tagName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
          if (p.id && p.id.indexOf("mrr-") === 0) return NodeFilter.FILTER_REJECT;
          // Ignorer si non visible
          var style = window.getComputedStyle(p);
          if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    var textChunks = [];
    var node;
    var totalChars = 0;
    while ((node = walker.nextNode()) && totalChars < 8000) {
      var t = node.textContent.trim();
      if (t.length > 2) {
        textChunks.push(t);
        totalChars += t.length;
      }
    }
    var fullText = textChunks.join(" ");

    // Éviter de re-signaler le même contenu
    var fingerprint = fullText.slice(0, 200);
    if (fingerprint === lastCollabCheck) return;

    for (var k = 0; k < COLLAB_PATTERNS.length; k++) {
      var m = fullText.match(COLLAB_PATTERNS[k]);
      if (m) {
        found = true;
        // Extraire le contexte autour du match
        var idx = fullText.indexOf(m[0]);
        var start = Math.max(0, idx - 20);
        var end = Math.min(fullText.length, idx + 60);
        matchedText = fullText.slice(start, end).trim();
        matchedLabel = "Contenu sponsorisé détecté";
        lastCollabCheck = fingerprint;
        break;
      }
    }
  }

  // ── 3. Afficher le badge ──
  if (found && EL_S.collab) {
    var sub = matchedText.length > 55 ? matchedText.slice(0, 55) + "…" : matchedText;
    if (EL_S.collabTxt) EL_S.collabTxt.textContent = matchedLabel;
    if (EL_S.collabSub) EL_S.collabSub.textContent = sub || "Ce créateur est payé pour promouvoir ce contenu";
    EL_S.collab.classList.add("show");
    // Ne pas auto-cacher si badge natif (plus important)
    if (matchedLabel !== "Partenariat rémunéré") {
      setTimeout(function(){ if(EL_S.collab) EL_S.collab.classList.remove("show"); }, 10000);
    }
  }
}

// ── Observer les mutations pour détecter les nouvelles vidéos/posts ──
function watchSocialContent() {
  if (socialColabObs) return;
  var debounce = null;

  socialColabObs = new MutationObserver(function(mutations) {
    // Sur TikTok, le swipe de vidéo génère beaucoup de mutations
    // On debounce pour ne pas spammer
    clearTimeout(debounce);
    // Délai court sur TikTok (vidéos qui s'enchaînent), plus long ailleurs
    var delay = window.location.hostname.indexOf("tiktok") !== -1 ? 800 : 1500;
    debounce = setTimeout(function() {
      lastCollabCheck = ""; // forcer un nouveau scan sur nouvelle vidéo
      detectCollabs();
    }, delay);
  });

  socialColabObs.observe(document.body, { childList: true, subtree: true, characterData: true });

  // Vérification initiale après chargement de la page
  setTimeout(detectCollabs, 3000);

  // Sur TikTok, vérifier aussi sur scroll (swipe = nouvelle vidéo)
  if (window.location.hostname.indexOf("tiktok") !== -1) {
    var scrollDebounce = null;
    window.addEventListener("scroll", function() {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function() {
        lastCollabCheck = "";
        detectCollabs();
      }, 600);
    }, { passive: true });
  }
}

// ── Survie de l'overlay sur les SPAs agressives (YouTube remplace document.body / head) ──
var overlayGuardActive = false;
function guardOverlayOnSPA() {
  if (overlayGuardActive) return;
  overlayGuardActive = true;

  var _guardObs = null;
  var _guardedBody = null;

  function reinjection() {
    if (!overlayBuilt) return;
    var body = document.body;
    if (!body) return;

    // Réinjecter les styles si le <head> a perdu notre feuille CSS
    if (document.head && !document.getElementById("mrr-styles")) {
      var style = mk("style"); style.id = "mrr-styles"; style.textContent = CSS;
      document.head.appendChild(style);
    }
    // Réinjecter l'avatar s'il a été retiré du body
    if (EL.avatarWrap && !body.contains(EL.avatarWrap)) {
      body.appendChild(EL.avatarWrap);
    }
    if (EL.intercept && !body.contains(EL.intercept)) {
      body.appendChild(EL.intercept);
    }
    // Réinjecter le widget social s'il a été retiré
    if (socialWidgetBuilt && EL_S.wrap && !body.contains(EL_S.wrap)) {
      body.appendChild(EL_S.wrap);
    }

    // Si le body a changé, re-observer le nouveau body
    if (body !== _guardedBody && _guardObs) {
      _guardObs.disconnect();
      _guardObs.observe(body, { childList: true });
      if (document.head) _guardObs.observe(document.head, { childList: true });
      _guardedBody = body;
    }
  }

  // Observer les changements de childList sur body ET head
  _guardObs = new MutationObserver(reinjection);
  _guardObs.observe(document.body, { childList: true });
  _guardedBody = document.body;
  if (document.head) _guardObs.observe(document.head, { childList: true });

  // Observer aussi si <body> lui-même est remplacé (cas extrême YouTube SPA)
  var htmlObs = new MutationObserver(reinjection);
  htmlObs.observe(document.documentElement, { childList: true });

  // Événements de navigation SPA YouTube
  document.addEventListener("yt-navigate-finish", reinjection);
  document.addEventListener("yt-page-data-updated", reinjection);
  document.addEventListener("yt-navigate-start", reinjection);
  // Événements génériques SPA (pushState / popState)
  window.addEventListener("popstate", reinjection);

  // ── Fallback timer : vérification toutes les 2s (filet de sécurité)
  setInterval(reinjection, 2000);
}

// ── Init mode social ──
function initSocialMode() {
  if (socialActive) return;
  socialActive = true;
  buildSocialWidget();
  startSocialTimer();
  watchSocialContent();
  // v7.4 : initialiser le module Media (analyse IA qualitative)
  initMediaAnalysis();
}
// ── Pause si page cachée (autre onglet) ──
document.addEventListener("visibilitychange", function() {
  if (!socialActive) return;
  // (rien à faire — le timer ne compte pas si document.hidden)
});

// ═══════════════════════════════════════════
// MODULE MEDIA (v7.4) — Analyse IA qualitative
// Extrait le contenu vu, l'envoie à Claude, agrège en session
// ═══════════════════════════════════════════

var MEDIA = {
  platform: null,           // "youtube" | "tiktok" | "instagram"
  session: null,            // session en cours (stockée à la fin)
  currentContent: null,     // dernière extraction réussie
  lastAnalyzeAt: 0,         // timestamp de la dernière analyse (limite 1/minute)
  lastContentKey: "",       // clé du dernier contenu analysé (évite doublons)
  videoCount: 0,            // compteur vidéos vues (utilisé pour cadence TikTok)
  observerActive: false,
  periodicTimer: null,      // timer du récap périodique (5 min)
  categoryDurations: {},    // { learning: 180, entertainment: 600, ... }
  lastCategoryStart: null,
  lastCategory: null,
  consecutiveAds: 0,        // compteur pour trigger "cascade pub"
  lowAlignmentStart: null,  // timestamp début contenu mal aligné
  passionStreakCount: 0,    // compteur vidéos alignées passion (trigger positif)
  DEMO_MODE: false          // mode démo activable par toggle
};

// ── Détection plateforme ──
function detectMediaPlatform() {
  var h = window.location.hostname.replace(/^www\./, "").toLowerCase();
  if (h.indexOf("youtube.com") !== -1) return "youtube";
  if (h.indexOf("tiktok.com") !== -1) return "tiktok";
  if (h.indexOf("instagram.com") !== -1) return "instagram";
  return null;
}

// ── EXTRACTEURS PAR PLATEFORME ──

function extractYoutube() {
  try {
    var path = window.location.pathname;
    var isVideo  = path.indexOf("/watch")  === 0;
    var isShorts = path.indexOf("/shorts") === 0;
    var isLive   = path.indexOf("/live")   === 0;
    if (!isVideo && !isShorts && !isLive) return null;

    // ── Titre : document.title est la source la plus fiable sur YouTube ──
    // YouTube le met à jour dès la navigation SPA, avant même le rendu DOM.
    var titleText = "";
    var docTitle = (document.title || "").replace(/\s*[-–|]\s*YouTube\s*$/i, "").trim();
    if (docTitle && docTitle !== "YouTube") titleText = docTitle;

    // Fallback DOM si document.title n'est pas encore prêt ("YouTube" seul)
    if (!titleText) {
      var titleEl = document.querySelector([
        'h1.ytd-watch-metadata yt-formatted-string',
        'ytd-watch-metadata h1 yt-formatted-string',
        '#title h1 yt-formatted-string',
        '#title h1',
        'h1.style-scope.ytd-watch-metadata',
        'ytd-shorts h2.title',
        'h1.title.ytd-video-primary-info-renderer',
        'meta[property="og:title"]',
        'meta[name="title"]'
      ].join(','));
      titleText = titleEl
        ? (titleEl.textContent || titleEl.getAttribute("content") || titleEl.getAttribute("aria-label") || "").trim()
        : "";
    }

    if (!titleText) return null; // page pas encore chargée → le retry à 5s prendra le relais

    // ── Créateur ──
    var creatorEl = document.querySelector([
      'ytd-channel-name a',
      '#channel-name a',
      '#owner #channel-name a',
      'ytd-video-owner-renderer .ytd-channel-name a',
      '#above-the-fold #channel-name a',
      'meta[itemprop="author"]',
      'meta[name="author"]'
    ].join(','));
    var creatorText = creatorEl
      ? (creatorEl.textContent || creatorEl.getAttribute("content") || "").trim()
      : "";

    // ── Description (optionnelle — YouTube la charge tard) ──
    var descEl = document.querySelector([
      'ytd-watch-metadata #description-inline-expander',
      '#description ytd-text-inline-expander',
      '#description',
      'ytd-text-inline-expander',
      'meta[property="og:description"]'
    ].join(','));
    var descText = descEl
      ? (descEl.textContent || descEl.getAttribute("content") || "").trim().slice(0, 500)
      : "";

    return {
      platform: "youtube",
      url: window.location.href,
      title: titleText,
      creator: creatorText,
      description: descText,
      extractedAt: Date.now()
    };
  } catch(e) { return null; }
}

function extractTiktok() {
  try {
    // TikTok For You feed : chercher la vidéo active (celle en pleine vue)
    var items = document.querySelectorAll('[data-e2e="recommend-list-item-container"], [data-e2e="user-post-item-list-item"]');
    var activeItem = null;
    var maxVisible = 0;
    items.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      if (visible > maxVisible) { maxVisible = visible; activeItem = el; }
    });
    if (!activeItem) activeItem = document.querySelector('[data-e2e="recommend-list-item-container"]');
    if (!activeItem) return null;

    var descEl = activeItem.querySelector('[data-e2e="video-desc"], [data-e2e="browse-video-desc"]');
    var descText = descEl ? descEl.textContent.trim().slice(0, 500) : "";

    var creatorEl = activeItem.querySelector('[data-e2e="video-author-uniqueid"], a[data-e2e="browse-username"]');
    var creatorText = creatorEl ? creatorEl.textContent.trim() : "";

    if (!descText && !creatorText) return null;

    return {
      platform: "tiktok",
      url: window.location.href,
      title: descText.slice(0, 100), // TikTok a pas de "titre" — on prend le début de la desc
      creator: creatorText,
      description: descText,
      extractedAt: Date.now()
    };
  } catch(e) { return null; }
}

function extractInstagram() {
  try {
    // Insta Reels : /reels/... ou /reel/...
    var isReel = window.location.pathname.indexOf("/reels") !== -1 || window.location.pathname.indexOf("/reel/") !== -1;
    var isPost = window.location.pathname.indexOf("/p/") !== -1;
    if (!isReel && !isPost) return null;

    var captionEl = document.querySelector('article h1, [data-testid="post-caption"], header + div h1');
    var captionText = captionEl ? captionEl.textContent.trim().slice(0, 500) : "";

    var creatorEl = document.querySelector('article header a, header a[role="link"]');
    var creatorText = creatorEl ? creatorEl.textContent.trim().split("\n")[0] : "";

    if (!captionText && !creatorText) return null;

    return {
      platform: "instagram",
      url: window.location.href,
      title: captionText.slice(0, 100),
      creator: creatorText,
      description: captionText,
      extractedAt: Date.now()
    };
  } catch(e) { return null; }
}

function extractCurrentContent() {
  var platform = detectMediaPlatform();
  if (!platform) return null;
  if (platform === "youtube")   return extractYoutube();
  if (platform === "tiktok")    return extractTiktok();
  if (platform === "instagram") return extractInstagram();
  return null;
}

// ── Clé unique d'un contenu (pour éviter les doublons) ──
function contentKey(c) {
  if (!c) return "";
  return c.platform + "|" + (c.title || "").slice(0, 50) + "|" + (c.creator || "");
}

// ── Décider si on envoie à Claude (cadence + limites) ──
function shouldAnalyze(content) {
  if (!content) return false;
  if (!PROFILE.apiKey) return false; // pas d'analyse sans clé
  var now = Date.now();
  var key = contentKey(content);
  if (key === MEDIA.lastContentKey) return false; // même vidéo déjà analysée
  // Limite : 1 analyse toutes les 20s (évite le spam API lors de navigation rapide)
  if (now - MEDIA.lastAnalyzeAt < 20000) return false;
  return true;
}

// ── Analyser un contenu (appel Claude via background) ──
function analyzeCurrentContent() {
  var c = extractCurrentContent();

  // Diagnostic console pour aider au debug
  if (MEDIA.platform === "youtube") {
    var path = window.location.pathname;
    var onVideoPage = path.indexOf("/watch") === 0 || path.indexOf("/shorts") === 0 || path.indexOf("/live") === 0;
    console.log("[Miroir][YT] analyzeCurrentContent — page vidéo:", onVideoPage, "| titre doc:", document.title.slice(0,60), "| contenu extrait:", c ? c.title.slice(0,40) : "null", "| apiKey:", !!PROFILE.apiKey);
  }

  if (!shouldAnalyze(c)) {
    if (c && !PROFILE.apiKey) {
      // Signaler à l'utilisateur qu'il manque la clé API — une seule fois
      if (!MEDIA._noKeyWarned) {
        MEDIA._noKeyWarned = true;
        showBubble("🔑 CLÉ API MANQUANTE", "Configure ta clé Anthropic dans le popup Miroir pour analyser les vidéos YouTube.", 8000);
      }
    }
    return;
  }

  MEDIA.lastContentKey = contentKey(c);
  MEDIA.lastAnalyzeAt = Date.now();

  chrome.runtime.sendMessage({
    type: "ANALYZE_MEDIA",
    content: c,
    ambitions: PROFILE.ambitions,
    passions: PROFILE.passions || [],
    lifePhrase: PROFILE.lifePhrase
  }, function(resp) {
    if (!resp || !resp.ok || !resp.analysis) return;
    handleMediaAnalysis(c, resp.analysis);
  });
}

// ── Traiter le résultat d'analyse ──
function handleMediaAnalysis(content, analysis) {
  // analysis = { category, alignment, manipulationSignals, summary, mirrorQuestion, passionMatch }

  // Enrichir le contenu avec l'analyse
  var videoRecord = {
    ts: Date.now(),
    url: content.url,
    title: content.title,
    creator: content.creator,
    category: analysis.category || "unknown",
    alignment: typeof analysis.alignment === "number" ? analysis.alignment : 5,
    passionMatch: analysis.passionMatch || null,
    manipulationSignals: analysis.manipulationSignals || [],
    summary: analysis.summary || ""
  };

  // Ajouter à la session
  if (!MEDIA.session) startMediaSession();
  MEDIA.session.videosSeen.push(videoRecord);
  if (MEDIA.session.videosSeen.length > 500) MEDIA.session.videosSeen.shift();

  // Mettre à jour les compteurs par catégorie
  trackCategoryDuration(videoRecord.category);

  // Publicité / manipulation détectée
  if (videoRecord.category === "ads" || videoRecord.category === "pub" || videoRecord.category === "manipulation") {
    MEDIA.session.adsDetected++;
    MEDIA.consecutiveAds++;
    // TRIGGER C1 : cascade pub
    if (MEDIA.consecutiveAds >= 3) {
      showBubble("⚠️ ALGO AGRESSIF", MEDIA.consecutiveAds + " pubs à la suite. L'algo pousse fort aujourd'hui.", 5000);
      MEDIA.consecutiveAds = 0; // reset après alerte
    }
  } else {
    MEDIA.consecutiveAds = 0;
  }

  // TRIGGER D : reconnaissance positive (passion nourrie)
  if (videoRecord.passionMatch && videoRecord.alignment >= 7) {
    MEDIA.passionStreakCount++;
    if (MEDIA.passionStreakCount >= 3) {
      showBubble("🎯 TU NOURRIS TA PASSION", "3 vidéos sur " + videoRecord.passionMatch + ". Continue comme ça.", 5000);
      MEDIA.passionStreakCount = 0;
    }
  } else if (videoRecord.alignment < 5) {
    MEDIA.passionStreakCount = 0;
  }

  // TRIGGER C2 : dérive de contenu (alignement < 3/10 pendant 5 min)
  if (videoRecord.alignment < 3) {
    if (!MEDIA.lowAlignmentStart) MEDIA.lowAlignmentStart = Date.now();
    else if (Date.now() - MEDIA.lowAlignmentStart > 5 * 60000) {
      // Déclencher intercept modal de dérive
      triggerDriftIntercept(videoRecord);
      MEDIA.lowAlignmentStart = null;
    }
  } else {
    MEDIA.lowAlignmentStart = null;
  }

  // Mise à jour pill timer avec dot catégorie (si existe)
  updatePillCategoryDot(videoRecord.category);

  // ── Retour visuel immédiat après analyse ──
  var CAT_LABELS = {
    learning: "📚 Apprentissage", info: "📰 Info",
    entertainment: "🎭 Divertissement", ads: "📢 Pub / Sponso",
    manipulation: "⚠️ Manipulation", inspiration: "✨ Inspiration"
  };
  var catLabel = CAT_LABELS[videoRecord.category] || "📺 Vidéo";
  var score = videoRecord.alignment;
  if (videoRecord.passionMatch && score >= 7) {
    showBubble("🎯 " + videoRecord.passionMatch.toUpperCase(), catLabel + " · " + score + "/10 — nourrit ta passion !", 5000);
  } else if (score <= 3 && analysis.mirrorQuestion) {
    showBubble("MIROIR", analysis.mirrorQuestion, 7000);
  } else if (score <= 3) {
    showBubble("ATTENTION", catLabel + " · Alignement faible (" + score + "/10)", 5000);
  } else if (videoRecord.category === "ads" || videoRecord.category === "manipulation") {
    showBubble("⚠️ ALERTE", catLabel + " détecté — l'algo vend quelque chose.", 5000);
  } else {
    showBubble("VIDÉO", catLabel + " · " + score + "/10", 3000);
  }
}

// ── Suivi des durées par catégorie (accumulation) ──
function trackCategoryDuration(category) {
  var now = Date.now();
  if (MEDIA.lastCategory && MEDIA.lastCategoryStart) {
    var delta = Math.floor((now - MEDIA.lastCategoryStart) / 1000);
    if (delta > 0 && delta < 600) { // cap à 10 min pour éviter les aberrations (onglet caché longtemps)
      MEDIA.categoryDurations[MEDIA.lastCategory] = (MEDIA.categoryDurations[MEDIA.lastCategory] || 0) + delta;
    }
  }
  MEDIA.lastCategory = category;
  MEDIA.lastCategoryStart = now;
}

// ── Intercept de dérive (module C) ──
function triggerDriftIntercept(videoRecord) {
  // Utilise le même overlay que les intercepts produit, mais avec contenu adapté
  if (!EL.intercept) return;
  if (EL.intercept.classList.contains("show")) return; // déjà ouvert

  var titlePassion = "tes engagements";
  if (PROFILE.passions && PROFILE.passions.length > 0) {
    titlePassion = PROFILE.passions[0];
  } else if (PROFILE.ambitions && PROFILE.ambitions.length > 0) {
    titlePassion = ambLabel(PROFILE.ambitions[0]);
  }

  // Utilise le DOM de l'intercept existant mais avec un message de dérive
  if (EL.iTitle) EL.iTitle.textContent = "L'algo t'a emmené loin de " + titlePassion + ".";
  if (EL.iSub) EL.iSub.textContent = "5 minutes de contenu sans lien avec ce qui compte pour toi.";
  if (EL.iConflicts) {
    EL.iConflicts.innerHTML = "";
    var def = mk("div"); def.className = "mrr-ic";
    def.innerHTML = '<div class="mrr-ic-ico">📉</div><div><div class="mrr-ic-lbl">Dérive détectée</div><div class="mrr-ic-txt">Contenu : ' + videoRecord.category + ' · Alignement ' + videoRecord.alignment + '/10</div></div>';
    EL.iConflicts.appendChild(def);
  }
  if (EL.iPhrase) EL.iPhrase.textContent = PROFILE.lifePhrase || "Je veux construire une vie qui me ressemble.";
  EL.intercept.classList.add("show");
  if (EL.avatar) EL.avatar.style.opacity = "0";

  // Tracker l'intercept comme une interception média
  currentInterception = {
    id: "drift_" + Date.now(),
    timestamp: Date.now(),
    url: window.location.href,
    site: (window.location.hostname || "").replace(/^www\./, ""),
    productName: "[dérive média] " + (videoRecord.title || "").slice(0, 80),
    price: "",
    priceNum: 0,
    verdict: "danger",
    score: videoRecord.alignment,
    ambitions: (PROFILE.ambitions || []).slice(),
    mirrorQuestion: "L'algorithme t'a-t-il vraiment emmené où tu voulais aller ?",
    questionHash: "",
    decision: "unknown",
    decisionAt: null,
    kind: "media_drift"
  };
  mrrJournalGet(function(j) {
    j.interceptions.push(currentInterception);
    if (j.interceptions.length > 500) j.interceptions = j.interceptions.slice(-500);
    mrrJournalSet(j);
  });
}

// ── Mise à jour pill timer avec un dot catégorie ──
function updatePillCategoryDot(category) {
  // EL_S est défini dans la section pill timer existante
  if (typeof EL_S === "undefined" || !EL_S.timerPill) return;
  var CAT_COLORS = {
    learning: "#42C47E",     apprentissage: "#42C47E",
    info: "#F5C842",         news: "#F5C842",
    entertainment: "#8A8494",divertissement: "#8A8494",
    ads: "#E8563A",          pub: "#E8563A", sponso: "#E8563A",
    manipulation: "#E85070"
  };
  var color = CAT_COLORS[category] || "#6B6475";
  // Crée ou met à jour un petit dot à gauche du timer
  var dot = EL_S.timerPill.querySelector(".mrr-cat-dot");
  if (!dot) {
    dot = mk("span");
    dot.className = "mrr-cat-dot";
    dot.style.cssText = "display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:6px;vertical-align:middle;transition:background .3s;";
    EL_S.timerPill.insertBefore(dot, EL_S.timerPill.firstChild);
  }
  dot.style.background = color;
}

// ── SESSION ──
function startMediaSession() {
  var platform = detectMediaPlatform();
  MEDIA.session = {
    id: "media_" + Date.now(),
    platform: platform,
    startedAt: Date.now(),
    endedAt: null,
    videosSeen: [],
    adsDetected: 0,
    categoryBreakdown: {},
    topCreators: {},
    topTopics: {}
  };
  MEDIA.categoryDurations = {};
  MEDIA.lastCategory = null;
  MEDIA.lastCategoryStart = null;
  MEDIA.consecutiveAds = 0;
  MEDIA.lowAlignmentStart = null;
  MEDIA.passionStreakCount = 0;
}

function finalizeMediaSession() {
  if (!MEDIA.session) return;
  // Flush la catégorie en cours
  trackCategoryDuration(MEDIA.lastCategory);
  MEDIA.session.endedAt = Date.now();
  MEDIA.session.categoryBreakdown = Object.assign({}, MEDIA.categoryDurations);

  // Agrégation top créateurs
  var creators = {}, topics = {};
  MEDIA.session.videosSeen.forEach(function(v) {
    if (v.creator) creators[v.creator] = (creators[v.creator] || 0) + 1;
    if (v.passionMatch) topics[v.passionMatch] = (topics[v.passionMatch] || 0) + 1;
  });
  MEDIA.session.topCreators = creators;
  MEDIA.session.topTopics = topics;

  // Sauver dans le journal
  mrrJournalGet(function(j) {
    if (!j.mediaSessions) j.mediaSessions = [];
    // Ne stocker que les sessions de plus de 30s avec au moins 1 vidéo analysée
    var dur = Math.floor((MEDIA.session.endedAt - MEDIA.session.startedAt) / 1000);
    if (dur >= 30 && MEDIA.session.videosSeen.length > 0) {
      j.mediaSessions.push(MEDIA.session);
      if (j.mediaSessions.length > 90) j.mediaSessions = j.mediaSessions.slice(-90); // 3 mois max
    }
    mrrJournalSet(j);
  });
  MEDIA.session = null;
}

// ── BOUCLE PRINCIPALE ──
function initMediaAnalysis() {
  MEDIA.platform = detectMediaPlatform();
  if (!MEDIA.platform) return;

  startMediaSession();

  // Analyse au chargement — réessaye à 2s puis 5s si le DOM YouTube n'est pas encore prêt
  setTimeout(analyzeCurrentContent, 2000);
  setTimeout(function() {
    if (!MEDIA.lastContentKey) analyzeCurrentContent(); // retry si la 1ère n'a rien extrait
  }, 5000);

  // Re-analyse lors des changements d'URL SPA (YouTube notamment)
  if (!MEDIA.observerActive) {
    var lastUrl = window.location.href;
    setInterval(function() {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;
        MEDIA.videoCount++;
        // Attendre que YouTube charge le titre (lazy rendering), puis réessayer
        setTimeout(analyzeCurrentContent, 2000);
        setTimeout(function() {
          if (contentKey(extractCurrentContent()) !== MEDIA.lastContentKey) {
            analyzeCurrentContent();
          }
        }, 5000);
      }
    }, 1000);
    MEDIA.observerActive = true;
  }

  // Observer pour TikTok/Instagram : détecter les changements de vidéo dans le feed (scroll)
  if (MEDIA.platform === "tiktok" || MEDIA.platform === "instagram") {
    var scrollDebounce = null;
    window.addEventListener("scroll", function() {
      clearTimeout(scrollDebounce);
      scrollDebounce = setTimeout(function() {
        MEDIA.videoCount++;
        // Cadence : 1 analyse toutes les 3 vidéos en moyenne (shouldAnalyze gère le throttle)
        if (MEDIA.videoCount % 3 === 0) {
          analyzeCurrentContent();
        }
      }, 1500); // 1.5s après arrêt du scroll
    }, { passive: true });
  }

  // Récap périodique : toutes les 5 min, finaliser la session en cours et en démarrer une nouvelle
  // (permet de garder des sessions de taille raisonnable)
  MEDIA.periodicTimer = setInterval(function() {
    if (document.hidden) return;
    finalizeMediaSession();
    startMediaSession();
  }, 5 * 60 * 1000);

  // Finaliser la session quand on quitte la page
  window.addEventListener("beforeunload", finalizeMediaSession);
}

// ── MODE DÉMO (pour soutenance) ──
function runMediaDemo() {
  // Génère une session simulée complète pour la démo
  var now = Date.now();
  var demoVideos = [
    { title: "Recette ramen tonkotsu traditionnel", creator: "@chef_osaka", category: "learning", alignment: 9, passionMatch: "cuisine japonaise", ts: now - 1800000 },
    { title: "Comment j'ai perdu 10kg en 2 semaines", creator: "@lifecoach", category: "manipulation", alignment: 2, ts: now - 1500000 },
    { title: "Les 5 iPhone à acheter AVANT Noël", creator: "@techdeals", category: "ads", alignment: 1, ts: now - 1200000 },
    { title: "TOP 10 des voitures de luxe 2026", creator: "@luxdaily", category: "entertainment", alignment: 2, ts: now - 1000000 },
    { title: "Tokyo street food tour night edition", creator: "@japantravel", category: "learning", alignment: 8, passionMatch: "cuisine japonaise", ts: now - 800000 },
    { title: "Documentaire - Forêt primaire de Białowieża", creator: "@arte", category: "learning", alignment: 7, passionMatch: "nature", ts: now - 500000 },
    { title: "Shein Haul 50€ 30 pièces ⚠️", creator: "@hauls_cheap", category: "ads", alignment: 1, ts: now - 200000 }
  ];
  var fakeSession = {
    id: "media_demo_" + now,
    platform: MEDIA.platform || "youtube",
    startedAt: now - 1800000,
    endedAt: now,
    videosSeen: demoVideos,
    adsDetected: 3,
    categoryBreakdown: { learning: 540, entertainment: 300, ads: 240, manipulation: 120 },
    topCreators: { "@chef_osaka": 1, "@japantravel": 1, "@arte": 1, "@hauls_cheap": 1, "@lifecoach": 1, "@techdeals": 1, "@luxdaily": 1 },
    topTopics: { "cuisine japonaise": 2, "nature": 1 },
    isDemo: true
  };
  mrrJournalGet(function(j) {
    if (!j.mediaSessions) j.mediaSessions = [];
    j.mediaSessions.push(fakeSession);
    mrrJournalSet(j);
    showBubble("✓ DÉMO MÉDIA", "Session simulée ajoutée — va voir l'écran Impact.", 4000);
  });
}
// Exposer la démo pour usage console ou bouton caché
window.miroirRunMediaDemo = runMediaDemo;


// ── Détecte si l'URL est une page produit (pas menu/accueil) ──
function isProductPage(rule) {
  var path = window.location.pathname.toLowerCase();
  var url  = window.location.href.toLowerCase();
  var EXCLUDE = [/^\/$/, /^\/menu\/?$/, /^\/home\/?$/, /^\/restaurants?\/?$/, /^\/explore\/?$/, /^\/categories?\/?$/];
  for (var i=0; i<EXCLUDE.length; i++) { if (EXCLUDE[i].test(path)) return false; }
  var slug = path.replace(/^\//, "");
  if (slug.length < 5) return false;
  if (rule && rule.id === "social") return true;
  if (rule && rule.id === "delivery") return /store|restaurant|item|product|menu\/[a-z0-9-]{4}/.test(url);
  return /\/[a-z0-9_-]{4,}/.test(path);
}

// ── Reset analyse quand URL change ──
function resetAnalysis() {
  analysisShown   = false;
  analysisRunning = false;
  lastAnalyzedUrl = "";
  hidePanel();
  hideBubble();
  if (EL.avatar) EL.avatar.classList.remove("scanning");
  if (EL.pTitle) EL.pTitle.textContent = "Analyse du produit";
  if (EL.pScore) EL.pScore.style.display = "none";
  if (EL.pAct)   EL.pAct.style.display   = "none";
  if (EL.pQ)     EL.pQ.style.display     = "none";
  if (EL.pAlt)   EL.pAlt.style.display   = "none";
  if (EL.pBody)    EL.pBody.innerHTML       = "";
  if (EL.pCross)   { EL.pCross.innerHTML = ""; EL.pCross.style.display = "none"; }
  if (EL.pMirrorQ) { EL.pMirrorQ.innerHTML = ""; EL.pMirrorQ.style.display = "none"; }
}

function watchUrlChanges() {
  var lastUrl = window.location.href;
  clearInterval(urlWatchInterval);
  urlWatchInterval = setInterval(function() {
    var cur = window.location.href;
    if (cur !== lastUrl) {
      lastUrl = cur;
      resetAnalysis();
      // Sur réseaux sociaux : reset collab badge, garder le timer, relancer l'analyse
      if (socialActive) {
        if (EL_S.collab) EL_S.collab.classList.remove("show");
        setTimeout(detectCollabs, 2000);
        // Réanalyser la nouvelle vidéo (le contenu-key déduplique si déjà fait)
        setTimeout(analyzeCurrentContent, 2500);
        return;
      }
      // Relancer la patrouille sur nouvelle page
      patrolActive = false;
      patrolDoneElements = new WeakSet();  // reset — nouvelle page = nouveaux éléments
      clearTimeout(patrolTimeout);
      returnHome();
      schedulePatrol();
      setTimeout(function() {
        if (!PROFILE.enabled || !currentRule) return;
        if (isProductPage(currentRule) && PROFILE.apiKey) {
          showBubble("MIROIR", "Nouveau produit — j'analyse…", -1);
          runAnalysis();
        }
      }, 1500);
    }
  }, 800);
}


// ─────────────────────────────────────────
// CSS
// ─────────────────────────────────────────
var CSS = [
"#mrr-root{all:initial;font-family:'DM Sans',system-ui,sans-serif;position:fixed;bottom:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;}",
"#mrr-avatar-wrap{position:fixed;bottom:20px;right:20px;z-index:2147483647;pointer-events:auto;transition:bottom .8s cubic-bezier(.4,0,.2,1),right .8s cubic-bezier(.4,0,.2,1),left .8s cubic-bezier(.4,0,.2,1),top .8s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;align-items:center;gap:4px;}",
"#mrr-patrol-bubble{background:rgba(8,6,15,.97);border:1px solid rgba(245,200,66,.5);border-radius:14px 14px 14px 3px;padding:8px 12px;max-width:220px;font-size:12px;color:#EDE9E0;line-height:1.5;opacity:0;transform:translateY(6px) scale(.95);transition:opacity .25s,transform .25s;pointer-events:none;text-align:center;}",
"#mrr-patrol-bubble.show{opacity:1;transform:translateY(0) scale(1);}",
"#mrr-patrol-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#F5C842;margin-bottom:3px;}",
"#mrr-patrol-txt{font-size:11px;color:#EDE9E0;line-height:1.45;}",

"#mrr-pet{pointer-events:auto;display:flex;flex-direction:column;align-items:flex-end;gap:6px;}",
"#mrr-bubble{background:rgba(8,6,15,.97);border:1px solid rgba(232,86,58,.35);border-radius:14px 14px 3px 14px;padding:9px 13px;max-width:260px;font-size:12px;font-weight:500;color:#EDE9E0;line-height:1.5;backdrop-filter:blur(20px);box-shadow:0 4px 24px rgba(0,0,0,.4);opacity:0;transform:translateY(8px) scale(.95);transition:opacity .25s,transform .25s;pointer-events:none;}",
"#mrr-bubble.show{opacity:1;transform:translateY(0) scale(1);}",
"#mrr-bubble-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#E8563A;margin-bottom:3px;}",
"#mrr-avatar{width:96px;height:96px;background:none;border:none;border-radius:0;display:flex;align-items:center;justify-content:center;transition:transform .2s,opacity .2s;animation:mrr-float 4s ease-in-out infinite;cursor:pointer;filter:drop-shadow(0 4px 8px rgba(0,0,0,.5));}",
"#mrr-intercept.show ~ #mrr-root #mrr-avatar{opacity:0;pointer-events:none;}",
"#mrr-avatar:hover{transform:scale(1.15) !important;}",
"@keyframes mrr-float{0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}}",
"#mrr-avatar.scanning{border-color:rgba(245,200,66,.7);animation:mrr-float 4s ease-in-out infinite,mrr-pulse 1.2s ease-in-out infinite;}",
"@keyframes mrr-pulse{0%,100%{box-shadow:0 4px 16px rgba(0,0,0,.35),0 0 0 0 rgba(245,200,66,.4);}50%{box-shadow:0 4px 16px rgba(0,0,0,.35),0 0 0 7px rgba(245,200,66,0);}}",

/* PANELS — 3 blocs séparés dans #mrr-root */
"#mrr-panel-wrap{pointer-events:auto;display:flex;flex-direction:column;gap:20px;width:min(300px,calc(100vw - 40px));max-height:80vh;overflow-y:auto;opacity:0;transform:translateY(12px) scale(.97);transition:opacity .3s,transform .3s;}",
"#mrr-panel-wrap.show{opacity:1;transform:translateY(0) scale(1);}",
"#mrr-panel-wrap::-webkit-scrollbar{width:3px;}#mrr-panel-wrap::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px;}",

"#mrr-panel1{background:rgba(8,6,15,.97);border:1px solid rgba(255,255,255,.1);border-radius:18px;display:flex;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,.5);overflow:hidden;}",
"#mrr-panel2{background:rgba(8,6,15,.97);border:1px solid rgba(255,255,255,.1);border-radius:18px;display:none;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.4);overflow:hidden;padding:12px 15px;}",
"#mrr-panel3{background:rgba(8,6,15,.97);border:1px solid rgba(167,139,250,.2);border-radius:18px;display:none;padding:12px 15px;box-shadow:0 8px 32px rgba(0,0,0,.4);}",
"#mrr-ph{padding:13px 15px 10px;border-bottom:1px solid rgba(255,255,255,.07);flex-shrink:0;display:flex;align-items:center;gap:9px;}",
"#mrr-pt{font-family:Georgia,serif;font-size:15px;font-weight:700;color:#EDE9E0;flex:1;line-height:1.25;}",
"#mrr-pc{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.07);border:none;color:rgba(255,255,255,.45);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s,color .15s;flex-shrink:0;line-height:1;padding:0;}",
"#mrr-pc:hover{background:rgba(255,255,255,.13);color:#EDE9E0;}",
"#mrr-ps{padding:9px 15px;border-bottom:1px solid rgba(255,255,255,.07);display:flex;align-items:center;gap:9px;flex-shrink:0;}",
".mrr-sbar{flex:1;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden;}",
".mrr-sfill{height:100%;border-radius:3px;transition:width 1s cubic-bezier(.4,0,.2,1);}",
"#mrr-sl{font-size:11px;font-weight:700;flex-shrink:0;}",
"#mrr-pb{flex:1;overflow-y:auto;padding:10px 15px;display:flex;flex-direction:column;gap:8px;}",
"#mrr-pb::-webkit-scrollbar{width:3px;}#mrr-pb::-webkit-scrollbar-thumb{background:rgba(255,255,255,.12);border-radius:2px;}",
".mrr-sig{border-radius:11px;padding:10px 12px;display:flex;align-items:flex-start;gap:9px;}",
".mrr-sig.negatif{background:rgba(232,86,58,.07);border:1px solid rgba(232,86,58,.2);}",
".mrr-sig.positif{background:rgba(66,196,126,.06);border:1px solid rgba(66,196,126,.18);}",
".mrr-sig.neutre{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);}",
".mrr-sico{font-size:18px;flex-shrink:0;line-height:1;margin-top:1px;}",
".mrr-stit{font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;margin-bottom:3px;}",
".mrr-sig.negatif .mrr-stit{color:#E8563A;}.mrr-sig.positif .mrr-stit{color:#42C47E;}.mrr-sig.neutre .mrr-stit{color:#8A8494;}",
".mrr-sdet{font-size:12px;color:#C4C0BB;line-height:1.45;}",
"#mrr-pq{background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.18);border-radius:11px;padding:11px 13px;font-size:12px;font-style:italic;color:rgba(237,233,224,.75);line-height:1.5;margin:0 15px;flex-shrink:0;}",
"#mrr-pa{background:rgba(66,196,126,.06);border:1px solid rgba(66,196,126,.15);border-radius:11px;padding:10px 12px;margin:0 15px;flex-shrink:0;}",
"#mrr-pa-lbl{font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#42C47E;margin-bottom:4px;}",
"#mrr-pa-txt{font-size:12px;color:rgba(237,233,224,.8);line-height:1.5;}",
"#mrr-pgoal{display:none;background:linear-gradient(135deg,#E8563A 0%,#C43D22 100%);padding:12px 15px;align-items:center;gap:11px;flex-shrink:0;}",
"#mrr-pgoal-ico{font-size:22px;flex-shrink:0;line-height:1;}",
"#mrr-pgoal-lbl{font-size:9px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:rgba(255,255,255,.75);margin-bottom:3px;}",
"#mrr-pgoal-txt{font-size:13px;font-weight:600;color:#fff;line-height:1.3;}",
"#mrr-pact{padding:11px 15px;border-top:1px solid rgba(255,255,255,.07);display:flex;gap:7px;flex-shrink:0;}",
".mrr-btn-p{flex:1;padding:10px;border-radius:10px;border:none;background:#E8563A;color:#fff;font-family:'DM Sans',system-ui,sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s,transform .12s;-webkit-appearance:none;outline:none;}",
".mrr-btn-p:hover{opacity:.88;}.mrr-btn-p:active{transform:scale(.97);}",
".mrr-btn-g{padding:10px 13px;border-radius:10px;border:1.5px solid rgba(255,255,255,.09);background:transparent;color:#6B6475;font-family:'DM Sans',system-ui,sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:color .15s,border-color .15s,transform .12s;-webkit-appearance:none;outline:none;}",
".mrr-btn-g:hover{color:#EDE9E0;border-color:rgba(255,255,255,.22);}.mrr-btn-g:active{transform:scale(.97);}",

/* LOADING */
".mrr-load{padding:22px 15px;display:flex;flex-direction:column;align-items:center;gap:12px;}",
".mrr-spin{width:28px;height:28px;border:2px solid rgba(255,255,255,.1);border-top-color:#E8563A;border-radius:50%;animation:mrr-sp .8s linear infinite;}",
"@keyframes mrr-sp{to{transform:rotate(360deg);}}",
".mrr-load-txt{font-size:12px;color:#6B6475;text-align:center;line-height:1.5;}",

"#mrr-ai{pointer-events:auto;position:fixed;bottom:84px;right:20px;z-index:2147483646;background:rgba(8,6,15,.98);border:1px solid rgba(167,139,250,.35);border-radius:18px;width:min(310px,calc(100vw - 40px));max-height:75vh;display:flex;flex-direction:column;box-shadow:0 12px 48px rgba(0,0,0,.6),0 0 0 1px rgba(167,139,250,.1);opacity:0;transform:translateY(12px) scale(.97);transition:opacity .3s,transform .3s;overflow:hidden;}",
"#mrr-ai.show{opacity:1;transform:translateY(0) scale(1);}",
"#mrr-ai-head{padding:13px 15px 10px;border-bottom:1px solid rgba(167,139,250,.15);display:flex;align-items:center;gap:9px;flex-shrink:0;}",
"#mrr-ai-title{font-family:Georgia,serif;font-size:14px;font-weight:700;color:#EDE9E0;flex:1;}",
"#mrr-ai-close{width:26px;height:26px;border-radius:50%;background:rgba(255,255,255,.07);border:none;color:rgba(255,255,255,.45);font-size:13px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s;padding:0;}",
"#mrr-ai-close:hover{background:rgba(255,255,255,.13);color:#EDE9E0;}",
"#mrr-ai-verdict{padding:11px 15px;border-bottom:1px solid rgba(167,139,250,.1);display:flex;align-items:center;gap:10px;flex-shrink:0;}",
"#mrr-ai-vico{font-size:22px;flex-shrink:0;}",
"#mrr-ai-vlbl{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:2px;}",
"#mrr-ai-vtxt{font-size:12px;color:#C4C0BB;line-height:1.4;}",
"#mrr-ai-body{flex:1;overflow-y:auto;padding:10px 15px;display:flex;flex-direction:column;gap:8px;}",
"#mrr-ai-body::-webkit-scrollbar{width:3px;}#mrr-ai-body::-webkit-scrollbar-thumb{background:rgba(167,139,250,.2);border-radius:2px;}",
".mrr-ai-sig{border-radius:10px;padding:9px 11px;display:flex;align-items:flex-start;gap:8px;}",
".mrr-ai-sig.warn{background:rgba(245,200,66,.07);border:1px solid rgba(245,200,66,.2);}",
".mrr-ai-sig.ok{background:rgba(66,196,126,.06);border:1px solid rgba(66,196,126,.15);}",
".mrr-ai-sig.info{background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15);}",
".mrr-ai-ico{font-size:16px;flex-shrink:0;line-height:1;margin-top:1px;}",
".mrr-ai-lbl{font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;margin-bottom:2px;}",
".mrr-ai-sig.warn .mrr-ai-lbl{color:#F5C842;}.mrr-ai-sig.ok .mrr-ai-lbl{color:#42C47E;}.mrr-ai-sig.info .mrr-ai-lbl{color:#A78BFA;}",
".mrr-ai-det{font-size:11px;color:#C4C0BB;line-height:1.45;}",
"#mrr-ai-sources{padding:0 15px 8px;display:flex;flex-direction:column;gap:6px;flex-shrink:0;}",
"#mrr-ai-src-lbl{font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6B6475;margin-bottom:4px;padding-top:4px;border-top:1px solid rgba(255,255,255,.06);}",
".mrr-src{display:flex;align-items:center;gap:8px;padding:8px 10px;background:rgba(167,139,250,.06);border:1px solid rgba(167,139,250,.15);border-radius:9px;cursor:pointer;transition:background .15s,border-color .15s;text-decoration:none;}",
".mrr-src:hover{background:rgba(167,139,250,.12);border-color:rgba(167,139,250,.3);}",
".mrr-src-ico{font-size:15px;flex-shrink:0;}",
".mrr-src-body{flex:1;min-width:0;}",
".mrr-src-name{font-size:11px;font-weight:700;color:#A78BFA;}",
".mrr-src-desc{font-size:10px;color:#6B6475;margin-top:1px;}",
".mrr-src-arr{font-size:11px;color:#6B6475;flex-shrink:0;}",
"#mrr-ai-footer{padding:10px 15px 13px;border-top:1px solid rgba(167,139,250,.1);flex-shrink:0;}",
"#mrr-ai-fb{width:100%;padding:10px;border-radius:9px;border:1px solid rgba(167,139,250,.25);background:transparent;color:#A78BFA;font-family:'DM Sans',system-ui,sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:background .15s;-webkit-appearance:none;}",
"#mrr-ai-fb:hover{background:rgba(167,139,250,.1);}",

"#mrr-intercept{pointer-events:none;position:fixed;inset:0;z-index:2147483646;display:flex;flex-direction:column;align-items:stretch;justify-content:flex-end;background:rgba(8,6,15,.7);backdrop-filter:blur(8px);opacity:0;transition:opacity .28s ease;overflow:visible;}",
"#mrr-intercept.show{opacity:1;pointer-events:auto;}",
"#mrr-intercept.video-mode{align-items:center;justify-content:center;}",
"#mrr-intercept.video-mode #mrr-isheet{display:none!important;transform:translateY(100%)!important;visibility:hidden;}",
"#mrr-video-frame{display:none;width:min(420px,100vw);height:min(860px,100vh);border:none;background:#08060F;}",
"#mrr-intercept.video-mode #mrr-video-frame{display:block;}",

"#mrr-isheet{position:relative;background:#0D0B16;border:1px solid rgba(255,255,255,.08);border-bottom:none;border-radius:22px 22px 0 0;padding:110px 20px 36px 20px;display:flex;flex-direction:column;gap:13px;transform:translateY(100%);transition:transform .38s cubic-bezier(.34,1.56,.64,1);max-height:88vh;overflow-y:auto;overflow-x:hidden;box-sizing:border-box;}",
"#mrr-intercept.show #mrr-isheet{transform:translateY(0);}",
"#mrr-ihandle{width:36px;height:4px;background:rgba(255,255,255,.12);border-radius:2px;margin:0 auto 4px;flex-shrink:0;}",
"#mrr-ihdr{display:flex;align-items:center;gap:12px;flex-shrink:0;}",
"#mrr-ihdr-ico{display:none;}",
"#mrr-ihdr-title{font-family:Georgia,serif;font-size:20px;font-weight:700;color:#EDE9E0;line-height:1.2;}",
"#mrr-ihdr-sub{font-size:11px;color:#6B6475;margin-top:2px;}",
"#mrr-companion{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);z-index:10;pointer-events:none;margin-bottom:-20px;}",
"#mrr-companion img{width:200px;height:200px;image-rendering:pixelated;filter:drop-shadow(0 8px 24px rgba(0,0,0,.9));animation:mrr-float 3s ease-in-out infinite;}",
"#mrr-iconfls{display:flex;flex-direction:column;gap:9px;flex-shrink:0;}",
".mrr-ic{background:rgba(232,86,58,.07);border:1px solid rgba(232,86,58,.22);border-radius:13px;padding:11px 13px;display:flex;align-items:flex-start;gap:9px;}",
".mrr-ic-ico{font-size:17px;flex-shrink:0;line-height:1;}",
".mrr-ic-lbl{font-size:10px;font-weight:700;color:#E8563A;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:3px;}",
".mrr-ic-txt{font-size:13px;color:#EDE9E0;line-height:1.45;}",
"#mrr-iphrase{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-left:3px solid #E8563A;border-radius:0 11px 11px 0;padding:11px 13px;font-size:13px;font-style:italic;color:rgba(237,233,224,.72);line-height:1.5;flex-shrink:0;}",
".mrr-ibtn{display:block;width:100%;box-sizing:border-box;padding:15px;border-radius:13px;border:none;font-family:'DM Sans',system-ui,sans-serif;font-size:15px;font-weight:600;cursor:pointer;text-align:center;letter-spacing:.2px;transition:opacity .15s,transform .12s;-webkit-appearance:none;outline:none;flex-shrink:0;}",
".mrr-ibtn-r{background:#E8563A;color:#fff;border:none;}.mrr-ibtn-r:hover{opacity:.88;}",
".mrr-ibtn-g{background:transparent;color:#6B6475;border:1.5px solid rgba(255,255,255,.09);}.mrr-ibtn-g:hover{color:#EDE9E0;border-color:rgba(255,255,255,.22);}",
".mrr-ibtn:active{transform:scale(.97);}"
].join("\n");

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────
function mk(tag, attrs, text) {
  var el = document.createElement(tag);
  if (attrs) Object.keys(attrs).forEach(function(k) { el.setAttribute(k, attrs[k]); });
  if (text !== undefined) el.textContent = text;
  return el;
}

function esc(s) {
  return String(s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function ambLabel(amb) {
  return ({epargne:"Liberté financière",voyage:"Voyager",ecologie:"Réduire mon impact",
    projet:"Mon projet",formation:"Me former",sante:"Ma santé",
    logement:"Mon logement",impact:"Avoir un impact"})[amb] || amb;
}

function animalSVG() {
  return '<svg width="30" height="30" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">'
    +'<polygon points="25,35 15,10 38,28" fill="#E8763A"/>'
    +'<polygon points="75,35 85,10 62,28" fill="#E8763A"/>'
    +'<polygon points="25,35 20,14 36,28" fill="#F5C8A0"/>'
    +'<polygon points="75,35 80,14 64,28" fill="#F5C8A0"/>'
    +'<ellipse cx="50" cy="65" rx="28" ry="22" fill="#E8763A"/>'
    +'<circle cx="50" cy="42" r="22" fill="#E8763A"/>'
    +'<ellipse cx="50" cy="52" rx="14" ry="10" fill="#F5C8A0"/>'
    +'<ellipse cx="50" cy="56" rx="6" ry="4" fill="#E87090"/>'
    +'<path d="M-4,0 Q0,-3 4,0" transform="translate(38,40)" stroke="#1a0a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    +'<path d="M-4,0 Q0,-3 4,0" transform="translate(62,40)" stroke="#1a0a00" stroke-width="2.5" fill="none" stroke-linecap="round"/>'
    +'</svg>';
}

// ─────────────────────────────────────────
// BULLE
// ─────────────────────────────────────────
function showBubble(label, msg, duration) {
  if (!EL.bubbleLbl || !EL.bubbleTxt || !EL.bubble) return;
  EL.bubbleLbl.textContent = label || "MIROIR";
  EL.bubbleTxt.textContent = msg || "";
  EL.bubble.classList.add("show");
  bubbleVisible = true;
  clearTimeout(bubbleTimer);
  if (duration !== -1) {
    bubbleTimer = setTimeout(function() {
      EL.bubble.classList.remove("show");
      bubbleVisible = false;
    }, duration || 5000);
  }
}
function hideBubble() {
  if (EL.bubble) EL.bubble.classList.remove("show");
  bubbleVisible = false;
  clearTimeout(bubbleTimer);
}

// ─────────────────────────────────────────
// PANEL
// ─────────────────────────────────────────
function showPanel() { if (EL.panel) EL.panel.classList.add("show"); hideBubble(); }
function hidePanel() { if (EL.panel) EL.panel.classList.remove("show"); }

function renderLoading() {
  if (EL.pScore)  EL.pScore.style.display  = "none";
  if (EL.pAct)    EL.pAct.style.display    = "none";
  if (EL.pQ)      EL.pQ.style.display      = "none";
  if (EL.pAlt)    EL.pAlt.style.display    = "none";
  if (EL.pTitle)  EL.pTitle.textContent    = "Analyse en cours…";
  updateGoalBanner();
  if (EL.pBody) {
    EL.pBody.innerHTML = "";
    var wrap = mk("div"); wrap.className = "mrr-load";
    var spin = mk("div"); spin.className = "mrr-spin";
    var txt  = mk("div"); txt.className  = "mrr-load-txt";
    txt.innerHTML = "Claude analyse ce produit…<br><span style='color:#4A4456;font-size:11px'>Impact écologique · Prix · Éthique…</span>";
    wrap.appendChild(spin);
    wrap.appendChild(txt);
    EL.pBody.appendChild(wrap);
  }
}

// ── BANNIÈRE OBJECTIF ──
var GOAL_MAP = {
  epargne:  { ico:"💰", txt:"Liberté financière", sub:function(g){ return g && g.epargne ? "Objectif : "+g.epargne+"€/mois" : "Économiser davantage"; }},
  voyage:   { ico:"🗺️", txt:"Voyager",            sub:function(g){ return g && g.voyage  ? "Budget : "+g.voyage+"€"         : "Financer ton prochain voyage"; }},
  ecologie: { ico:"🌱", txt:"Réduire mon impact", sub:function(g){ return "Consommer de façon cohérente"; }},
  projet:   { ico:"🚀", txt:"Lancer un projet",   sub:function(g){ return g && g.projet_name ? g.projet_name : "Construire quelque chose de concret"; }},
  formation:{ ico:"📚", txt:"Me former",          sub:function(g){ return g && g.formation_name ? g.formation_name : "Investir en toi"; }},
  sante:    { ico:"💪", txt:"Prendre soin de moi",sub:function(g){ return g && g.sante_name ? g.sante_name : "Énergie et bien-être"; }},
  logement: { ico:"🏠", txt:"Mon logement",       sub:function(g){ return g && g.logement_name ? g.logement_name : "Construire ta stabilité"; }},
  impact:   { ico:"🤝", txt:"Avoir un impact",    sub:function(g){ return "Agir pour ce en quoi tu crois"; }}
};

function updateGoalBanner() {
  if (!EL.pGoal || !EL.pGoalTxt) return;
  var phrase = PROFILE.lifePhrase || "";
  var amb = PROFILE.ambitions && PROFILE.ambitions[0];
  if (!phrase && (!amb || !GOAL_MAP[amb])) { EL.pGoal.style.display = "none"; return; }
  EL.pGoal.style.display = "flex";
  // Icône = premier engagement actif
  if (EL.pGoalIco) EL.pGoalIco.textContent = (amb && GOAL_MAP[amb]) ? GOAL_MAP[amb].ico : "🪞";
  // Texte = phrase d'engagement saisie par l'utilisateur, sinon fallback
  EL.pGoalTxt.textContent = phrase || ((amb && GOAL_MAP[amb]) ? GOAL_MAP[amb].sub({}) : "");
}


// ─────────────────────────────────────────
// WIDGETS INTERCROISSEMENT — DATA + BUILDER
// ─────────────────────────────────────────
var PCOLORS = {
  voyage:"#38BDF8",epargne:"#42C47E",ecologie:"#86EFAC",
  sante:"#F5C842",logement:"#F97316",projet:"#E8563A",
  formation:"#A78BFA",impact:"#5DCAA5"
};
var PNAMES = {
  voyage:"Voyage",epargne:"Épargne",ecologie:"Écologie",
  sante:"Santé",logement:"Logement",projet:"Projet",
  formation:"Formation",impact:"Impact"
};

var CROSS_WIDGETS = {
  "epargne-ecologie":{t:"s",xp:25,ico:"⚡",title:"Résister = ×2 XP",alertCol:"#42C47E",
    alert:"Ce refus fait avancer épargne ET écologie en même temps.",
    alts:[
      {ico:"♻️",name:"Vinted",desc:"Même article, occasion",save:"-60% vs neuf",sc:"#42C47E",badge:"Seconde main",bBg:"#EAF3DE",bC:"#27500A",url:"https://vinted.fr",dom:"vinted.fr"},
      {ico:"📱",name:"Back Market",desc:"Électronique reconditionné",save:"-40% garanti",sc:"#38BDF8",badge:"Certifié",bBg:"#E6F1FB",bC:"#0C447C",url:"https://backmarket.fr",dom:"backmarket.fr"},
      {ico:"🔧",name:"Repair Café",desc:"Réparation gratuite",save:"0€ · prod. évitée",sc:"#86EFAC",badge:"Gratuit",bBg:"#E1F5EE",bC:"#085041",url:"https://repaircafe.org/fr",dom:"repaircafe.org"},
      {ico:"🔄",name:"Kiloutou",desc:"Louer vs posséder",save:"vs achat direct",sc:"#F5C842",badge:"Location",bBg:"#FAEEDA",bC:"#633806",url:"https://kiloutou.fr",dom:"kiloutou.fr"}
    ]},
  "sante-epargne":{t:"s",xp:20,ico:"💊",title:"Tu paies 80% de marketing",alertCol:"#F5C842",
    alert:"Ce sérum contient 80% d'eau. L'ingrédient actif coûte 2€.",
    alts:[
      {ico:"🌿",name:"Aroma-Zone",desc:"Huile rosehip bio 100ml",save:"-72% vs sérum",sc:"#42C47E",badge:"DIY naturel",bBg:"#EAF3DE",bC:"#27500A",url:"https://aroma-zone.com",dom:"aroma-zone.com"},
      {ico:"🏷️",name:"INCIDecoder",desc:"Analyse les ingrédients",save:"Décision éclairée",sc:"#38BDF8",badge:"Gratuit",bBg:"#E6F1FB",bC:"#0C447C",url:"https://incidecoder.com",dom:"incidecoder.com"},
      {ico:"🧴",name:"INCI Beauty",desc:"Scan du produit",save:"En 3 secondes",sc:"#A78BFA",badge:"App",bBg:"#EEEDFE",bC:"#3C3489",url:"https://incibeauty.com",dom:"incibeauty.com"},
      {ico:"🧪",name:"CosDNA",desc:"Note les ingrédients",save:"Sans bullshit",sc:"#5DCAA5",badge:"Analyse",bBg:"#E1F5EE",bC:"#085041",url:"https://cosdna.com",dom:"cosdna.com"}
    ]},
  "sante-ecologie":{t:"s",xp:20,ico:"🌿",title:"Naturel = bon pour toi et la planète",alertCol:"#86EFAC",
    alert:"Les ingrédients naturels évitent aussi 70% des emballages.",
    alts:[
      {ico:"🌿",name:"Aroma-Zone",desc:"Cosmétique DIY bio",save:"-70% emballage",sc:"#86EFAC",badge:"Bio & local",bBg:"#EAF3DE",bC:"#27500A",url:"https://aroma-zone.com",dom:"aroma-zone.com"},
      {ico:"🏷️",name:"Open Food Facts",desc:"Scan produits alimentaires",save:"Transparence totale",sc:"#42C47E",badge:"Open source",bBg:"#E1F5EE",bC:"#085041",url:"https://world.openfoodfacts.org",dom:"openfoodfacts.org"},
      {ico:"🛒",name:"La Vie Claire",desc:"Gamme bio certifiée",save:"Ingrédients propres",sc:"#5DCAA5",badge:"Magasin",bBg:"#EAF3DE",bC:"#27500A",url:"https://lavieclaire.com",dom:"lavieclaire.com"},
      {ico:"🧪",name:"INCI Beauty",desc:"Sans perturbateurs endo.",save:"Santé & planète",sc:"#F5C842",badge:"App gratuite",bBg:"#FBEAF0",bC:"#72243E",url:"https://incibeauty.com",dom:"incibeauty.com"}
    ]},
  "sante-logement":{t:"s",xp:20,ico:"🏡",title:"Ton espace agit sur ta santé",alertCol:"#F97316",
    alert:"Lumière naturelle → sommeil +23%. Plantes → stress -10%.",
    alts:[
      {ico:"🌿",name:"Oh My Plant",desc:"Plantes dépolluantes",save:"Stress -10%",sc:"#86EFAC",badge:"Bien-être",bBg:"#EAF3DE",bC:"#27500A",url:"https://ohmyplant.fr",dom:"ohmyplant.fr"},
      {ico:"💡",name:"Velux",desc:"Optimiser lumière naturelle",save:"Sommeil +23%",sc:"#F5C842",badge:"Lumière",bBg:"#FAEEDA",bC:"#633806",url:"https://velux.fr",dom:"velux.fr"},
      {ico:"🏠",name:"Cohabilis",desc:"Colocation inter-génér.",save:"Loyer -40%",sc:"#F97316",badge:"Solidaire",bBg:"#FBEAF0",bC:"#72243E",url:"https://cohabilis.org",dom:"cohabilis.org"},
      {ico:"🔵",name:"Calm",desc:"Méditation 7 jours",save:"Gratuit",sc:"#A78BFA",badge:"Mental",bBg:"#EEEDFE",bC:"#3C3489",url:"https://calm.com",dom:"calm.com"}
    ]},
  "sante-voyage":{t:"s",xp:18,ico:"🌅",title:"3 jours hors routine = cortisol -23%",alertCol:"#38BDF8",
    alert:"La science confirme : le voyage est un soin pour le cerveau.",
    alts:[
      {ico:"🚂",name:"Seat61",desc:"Train lent = moins de stress",save:"-90% CO₂",sc:"#86EFAC",badge:"Train",bBg:"#EAF3DE",bC:"#27500A",url:"https://seat61.com",dom:"seat61.com"},
      {ico:"🌿",name:"Workaway",desc:"Volontariat + voyage slow",save:"Hébergement gratuit",sc:"#42C47E",badge:"Slow travel",bBg:"#EAF3DE",bC:"#27500A",url:"https://workaway.info",dom:"workaway.info"},
      {ico:"🏕️",name:"Heureux Voyageurs",desc:"Voyages ressourçants",save:"Qualité vs quantité",sc:"#5DCAA5",badge:"Bien-être",bBg:"#E1F5EE",bC:"#085041",url:"https://heureux-voyageurs.fr",dom:"heureux-voyageurs.fr"},
      {ico:"🧘",name:"Insight Timer",desc:"Méditation gratuite",save:"10 min/jour · 0€",sc:"#A78BFA",badge:"App gratuite",bBg:"#EEEDFE",bC:"#3C3489",url:"https://insighttimer.com",dom:"insighttimer.com"}
    ]},
  "sante-formation":{t:"s",xp:18,ico:"🧠",title:"8h de sommeil = +40% de rétention",alertCol:"#A78BFA",
    alert:"Avant de payer une formation — dors mieux. Le cerveau consolide la nuit.",
    alts:[
      {ico:"🌙",name:"Sleep Cycle",desc:"Réveil phase légère",save:"Sommeil optimisé",sc:"#A78BFA",badge:"Gratuit",bBg:"#EEEDFE",bC:"#3C3489",url:"https://sleepcycle.com",dom:"sleepcycle.com"},
      {ico:"🏃",name:"Freeletics",desc:"Exercice = concentration",save:"+2h focus nets",sc:"#42C47E",badge:"Énergie",bBg:"#EAF3DE",bC:"#27500A",url:"https://freeletics.com",dom:"freeletics.com"},
      {ico:"🎓",name:"MIT OpenCourseWare",desc:"Formation gratuite",save:"0€ vs 200€/mois",sc:"#38BDF8",badge:"Gratuit",bBg:"#E6F1FB",bC:"#0C447C",url:"https://ocw.mit.edu",dom:"ocw.mit.edu"},
      {ico:"🧘",name:"Insight Timer",desc:"Méditation focus",save:"10 min/jour",sc:"#F5C842",badge:"Mental",bBg:"#FAEEDA",bC:"#633806",url:"https://insighttimer.com",dom:"insighttimer.com"}
    ]},
  "sante-impact":{t:"s",xp:18,ico:"💚",title:"Burn-out = 6 mois. Équilibre = 10 ans.",alertCol:"#5DCAA5",
    alert:"Prendre soin de soi est un prérequis pour s'engager durablement.",
    alts:[
      {ico:"🌿",name:"La Fourche",desc:"Alimentation saine -40%",save:"Corps & planète",sc:"#86EFAC",badge:"Bio",bBg:"#EAF3DE",bC:"#27500A",url:"https://lafourche.fr",dom:"lafourche.fr"},
      {ico:"🧘",name:"Insight Timer",desc:"Méditation gratuite",save:"0€ · 10 min/jour",sc:"#5DCAA5",badge:"Mental",bBg:"#E1F5EE",bC:"#085041",url:"https://insighttimer.com",dom:"insighttimer.com"},
      {ico:"🏃",name:"Freeletics",desc:"Sport sans abonnement",save:"0€ en extérieur",sc:"#42C47E",badge:"Corps",bBg:"#EAF3DE",bC:"#27500A",url:"https://freeletics.com",dom:"freeletics.com"},
      {ico:"💚",name:"Makesense",desc:"Engagement durable",save:"Communauté impact",sc:"#38BDF8",badge:"Réseau",bBg:"#E6F1FB",bC:"#0C447C",url:"https://makesense.org",dom:"makesense.org"}
    ]},
  "voyage-epargne":{t:"t",xp:30,ico:"✈️",title:"Cet achat te recule de 5 jours",alertCol:"#E8563A",
    alert:"34€ = 5 jours de retard vers le Japon. Résistance = +34€ direct.",
    alts:[
      {ico:"🏦",name:"Revolut Vault",desc:"Compte voyage dédié",save:"Auto-épargne",sc:"#42C47E",badge:"Recommandé",bBg:"#EAF3DE",bC:"#27500A",url:"https://revolut.com/fr-FR",dom:"revolut.com"},
      {ico:"🌍",name:"Worldpackers",desc:"Hébergement gratuit",save:"-70% budget voyage",sc:"#38BDF8",badge:"Hébergement",bBg:"#E6F1FB",bC:"#0C447C",url:"https://worldpackers.com",dom:"worldpackers.com"},
      {ico:"✈️",name:"Google Flights",desc:"Alertes prix vols",save:"Dès 180€ A/R",sc:"#F5C842",badge:"Prix bas",bBg:"#FAEEDA",bC:"#633806",url:"https://flights.google.com",dom:"flights.google.com"},
      {ico:"🛏️",name:"Couchsurfing",desc:"Chez l'habitant",save:"0€ hébergement",sc:"#5DCAA5",badge:"Communauté",bBg:"#E1F5EE",bC:"#085041",url:"https://couchsurfing.com",dom:"couchsurfing.com"}
    ]},
  "voyage-ecologie":{t:"t",xp:15,ico:"🌍",title:"61% de ton budget carbone annuel",alertCol:"#F5C842",
    alert:"Vol + cet achat = 1,23t CO₂. Il te reste 0,77t pour l'année.",
    alts:[
      {ico:"🚂",name:"Seat61",desc:"Trains Europe entier",save:"-90% CO₂ vs vol",sc:"#86EFAC",badge:"Train",bBg:"#EAF3DE",bC:"#27500A",url:"https://seat61.com",dom:"seat61.com"},
      {ico:"💨",name:"Atmosfair",desc:"Compensation sérieuse",save:"~15€/tonne CO₂",sc:"#38BDF8",badge:"Dernier recours",bBg:"#E6F1FB",bC:"#0C447C",url:"https://atmosfair.de/fr",dom:"atmosfair.de"},
      {ico:"🏕️",name:"Heureux Voyageurs",desc:"Voyages bas-carbone",save:"CO₂ minimal",sc:"#5DCAA5",badge:"Agence éco",bBg:"#E1F5EE",bC:"#085041",url:"https://heureux-voyageurs.fr",dom:"heureux-voyageurs.fr"},
      {ico:"🚗",name:"BlaBlaCar",desc:"Covoiturage longue dist.",save:"-75% CO₂ solo",sc:"#F5C842",badge:"Covoiturage",bBg:"#FAEEDA",bC:"#633806",url:"https://blablacar.fr",dom:"blablacar.fr"}
    ]},
  "voyage-logement":{t:"t",xp:15,ico:"⚡",title:"Voyage en 8 mois ou apport en 7 ans",alertCol:"#D4537E",
    alert:"Tu ne peux pas tout faire en même temps. Mais tu peux séquencer.",
    alts:[
      {ico:"🌏",name:"PVT Canada",desc:"Travailler en voyageant",save:"Revenu pendant voyage",sc:"#42C47E",badge:"Jusqu'à 35 ans",bBg:"#EAF3DE",bC:"#27500A",url:"https://canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada/pvt.html",dom:"canada.ca"},
      {ico:"💻",name:"Nomadlist",desc:"Villes remote-friendly",save:"Style de vie",sc:"#38BDF8",badge:"Digital nomad",bBg:"#E6F1FB",bC:"#0C447C",url:"https://nomadlist.com",dom:"nomadlist.com"},
      {ico:"🤝",name:"Habitat Participatif",desc:"Co-achat · apport ÷2",save:"Capital libéré",sc:"#F97316",badge:"Solidaire",bBg:"#FAEEDA",bC:"#633806",url:"https://habitatparticipatif-france.fr",dom:"habitatparticipatif-france.fr"},
      {ico:"🌍",name:"Worldpackers",desc:"Voyage sans hébergement",save:"-70% coût total",sc:"#5DCAA5",badge:"Éco",bBg:"#E1F5EE",bC:"#085041",url:"https://worldpackers.com",dom:"worldpackers.com"}
    ]},
  "epargne-logement":{t:"s",xp:35,ico:"🏠",title:"+89€ vers l'apport. 13 jours gagnés.",alertCol:"#F97316",
    alert:"À ce rythme apport dans 14 mois. Cet achat = 13 jours de retard.",
    alts:[
      {ico:"📊",name:"Nalo",desc:"Épargne automatique",save:"Virement auto",sc:"#42C47E",badge:"Recommandé",bBg:"#EAF3DE",bC:"#27500A",url:"https://nalo.fr",dom:"nalo.fr"},
      {ico:"🏠",name:"Habitat Participatif",desc:"Co-achat · apport ÷2",save:"Capital libéré",sc:"#F97316",badge:"Solidaire",bBg:"#FAEEDA",bC:"#633806",url:"https://habitatparticipatif-france.fr",dom:"habitatparticipatif-france.fr"},
      {ico:"📈",name:"Meilleurtaux",desc:"Simule ton prêt",save:"Gratuit & rapide",sc:"#38BDF8",badge:"Simulation",bBg:"#E6F1FB",bC:"#0C447C",url:"https://meilleurtaux.com",dom:"meilleurtaux.com"},
      {ico:"💸",name:"Livret A",desc:"0 frais · garanti état",save:"3% net",sc:"#5DCAA5",badge:"Sécurisé",bBg:"#E1F5EE",bC:"#085041",url:"https://service-public.fr/particuliers/vosdroits/F2367",dom:"service-public.fr"}
    ]},
  "logement-ecologie":{t:"t",xp:20,ico:"🏡",title:"Jusqu'à 90% financé par l'État",alertCol:"#86EFAC",
    alert:"Isolation, PAC, double vitrage : MaPrimeRénov couvre jusqu'à 90%.",
    alts:[
      {ico:"🏛️",name:"MaPrimeRénov",desc:"Aide rénovation état",save:"Jusqu'à 90%",sc:"#86EFAC",badge:"État",bBg:"#EAF3DE",bC:"#27500A",url:"https://maprimerenov.gouv.fr",dom:"maprimerenov.gouv.fr"},
      {ico:"⚡",name:"ADEME",desc:"Conseils + audit gratuit",save:"Public & gratuit",sc:"#5DCAA5",badge:"Conseil",bBg:"#E1F5EE",bC:"#085041",url:"https://agirpourlatransition.ademe.fr",dom:"ademe.fr"},
      {ico:"🔆",name:"Enercoop",desc:"Électricité renouvelable",save:"Éthique",sc:"#42C47E",badge:"Énergie verte",bBg:"#EAF3DE",bC:"#27500A",url:"https://enercoop.fr",dom:"enercoop.fr"},
      {ico:"🏠",name:"Hellio",desc:"Accompagnement rénov.",save:"Devis gratuit",sc:"#38BDF8",badge:"Conseil",bBg:"#E6F1FB",bC:"#0C447C",url:"https://hellio.com",dom:"hellio.com"}
    ]},
  "logement-projet":{t:"t",xp:18,ico:"🏗️",title:"Projet d'abord = revenus → apport",alertCol:"#E8563A",
    alert:"Lancer d'abord génère des revenus. Ces revenus accélèrent l'apport.",
    alts:[
      {ico:"🏦",name:"Nalo",desc:"Épargne projet auto",save:"Objectif dédié",sc:"#42C47E",badge:"Épargne",bBg:"#EAF3DE",bC:"#27500A",url:"https://nalo.fr",dom:"nalo.fr"},
      {ico:"🚀",name:"BPI France",desc:"Aides lancement projet",save:"Prêts & subventions",sc:"#E8563A",badge:"Aide état",bBg:"#FAECE7",bC:"#712B13",url:"https://bpifrance.fr",dom:"bpifrance.fr"},
      {ico:"🤝",name:"Habitat Participatif",desc:"Apport divisé par 2",save:"Co-achat légal",sc:"#F97316",badge:"Solidaire",bBg:"#FAEEDA",bC:"#633806",url:"https://habitatparticipatif-france.fr",dom:"habitatparticipatif-france.fr"},
      {ico:"💡",name:"Makesense",desc:"Réseau entrepreneur",save:"Mentorat gratuit",sc:"#A78BFA",badge:"Réseau",bBg:"#EEEDFE",bC:"#3C3489",url:"https://makesense.org",dom:"makesense.org"}
    ]},
  "logement-formation":{t:"t",xp:15,ico:"📚",title:"Formation gratuite libère l'apport",alertCol:"#A78BFA",
    alert:"Si la formation coûte 0€, tout ton capital va à l'apport.",
    alts:[
      {ico:"🎓",name:"MIT OCW",desc:"Cours MIT 0€",save:"Idem 200€/mois",sc:"#A78BFA",badge:"Gratuit",bBg:"#EEEDFE",bC:"#3C3489",url:"https://ocw.mit.edu",dom:"ocw.mit.edu"},
      {ico:"💼",name:"CPF",desc:"Compte formation financé",save:"500€/an de droits",sc:"#42C47E",badge:"Droits acquis",bBg:"#EAF3DE",bC:"#27500A",url:"https://moncompteformation.gouv.fr",dom:"moncompteformation.gouv.fr"},
      {ico:"📈",name:"Meilleurtaux",desc:"Simule ton prêt",save:"Gratuit",sc:"#F97316",badge:"Outil",bBg:"#FAEEDA",bC:"#633806",url:"https://meilleurtaux.com",dom:"meilleurtaux.com"},
      {ico:"🤝",name:"Habitat Participatif",desc:"Apport ÷ 2",save:"Co-propriété",sc:"#5DCAA5",badge:"Solidaire",bBg:"#E1F5EE",bC:"#085041",url:"https://habitatparticipatif-france.fr",dom:"habitatparticipatif-france.fr"}
    ]},
  "logement-impact":{t:"s",xp:18,ico:"🏡",title:"Logement = acte politique possible",alertCol:"#5DCAA5",
    alert:"Colocation intergénérationnelle, habitat partagé : impact direct.",
    alts:[
      {ico:"🤝",name:"Cohabilis",desc:"Coloc senior/étudiant",save:"Loyer -40%",sc:"#5DCAA5",badge:"Solidaire",bBg:"#E1F5EE",bC:"#085041",url:"https://cohabilis.org",dom:"cohabilis.org"},
      {ico:"🏠",name:"Habitat Participatif",desc:"Gouvernance partagée",save:"-20% coût",sc:"#42C47E",badge:"Collectif",bBg:"#EAF3DE",bC:"#27500A",url:"https://habitatparticipatif-france.fr",dom:"habitatparticipatif-france.fr"},
      {ico:"🔆",name:"Enercoop",desc:"Énergie renouvelable",save:"Engagement collectif",sc:"#86EFAC",badge:"Énergie",bBg:"#EAF3DE",bC:"#27500A",url:"https://enercoop.fr",dom:"enercoop.fr"},
      {ico:"🌱",name:"ADEME",desc:"Rénov + subvention",save:"Jusqu'à 90%",sc:"#38BDF8",badge:"Aide état",bBg:"#E6F1FB",bC:"#0C447C",url:"https://agirpourlatransition.ademe.fr",dom:"ademe.fr"}
    ]},
  "projet-formation":{t:"s",xp:20,ico:"🎯",title:"Formation gratuite = 2 400€/an",alertCol:"#A78BFA",
    alert:"MIT, Coursera, YouTube : même compétence. La diff va au projet.",
    alts:[
      {ico:"🎓",name:"MIT OpenCourseWare",desc:"Cours MIT gratuits",save:"0€ vs 200€/mois",sc:"#A78BFA",badge:"Top niveau",bBg:"#EEEDFE",bC:"#3C3489",url:"https://ocw.mit.edu",dom:"ocw.mit.edu"},
      {ico:"📖",name:"Coursera (audit)",desc:"Accès certif gratuit",save:"0€",sc:"#38BDF8",badge:"Certifié",bBg:"#E6F1FB",bC:"#0C447C",url:"https://coursera.org",dom:"coursera.org"},
      {ico:"🚀",name:"Le Wagon",desc:"Bootcamp projet-based",save:"Portfolio réel",sc:"#E8563A",badge:"Intensif",bBg:"#FAECE7",bC:"#712B13",url:"https://lewagon.com/fr",dom:"lewagon.com"},
      {ico:"🎥",name:"YouTube",desc:"Tutos experts gratuits",save:"Infini & 0€",sc:"#F5C842",badge:"Pratique",bBg:"#FAEEDA",bC:"#633806",url:"https://youtube.com",dom:"youtube.com"}
    ]},
  "projet-impact":{t:"s",xp:22,ico:"🚀",title:"Projet à mission = moteur durable",alertCol:"#E8563A",
    alert:"Inscrire l'impact dans les statuts augmente la motivation et la crédibilité.",
    alts:[
      {ico:"⚖️",name:"Entreprise à mission",desc:"Statut loi PACTE",save:"Impact dans statuts",sc:"#E8563A",badge:"Recommandé",bBg:"#FAECE7",bC:"#712B13",url:"https://economie.gouv.fr/entreprises/societe-mission",dom:"economie.gouv.fr"},
      {ico:"🌱",name:"BPI France",desc:"Financement projets verts",save:"Subventions & prêts",sc:"#42C47E",badge:"Aide état",bBg:"#EAF3DE",bC:"#27500A",url:"https://bpifrance.fr",dom:"bpifrance.fr"},
      {ico:"💚",name:"Makesense",desc:"Réseau & mentorat",save:"Communauté impact",sc:"#5DCAA5",badge:"Réseau",bBg:"#E1F5EE",bC:"#085041",url:"https://makesense.org",dom:"makesense.org"},
      {ico:"📊",name:"Lita.co",desc:"Financement participatif",save:"Investisseurs alignés",sc:"#38BDF8",badge:"Crowdfunding",bBg:"#E6F1FB",bC:"#0C447C",url:"https://lita.co",dom:"lita.co"}
    ]},
  "projet-ecologie":{t:"s",xp:20,ico:"🌱",title:"B Corp = crédibilité + différenciation",alertCol:"#86EFAC",
    alert:"Les entreprises à impact attirent mieux les talents et les clients.",
    alts:[
      {ico:"🏷️",name:"B Corp France",desc:"Certification impact",save:"Différenciation marché",sc:"#86EFAC",badge:"Recommandé",bBg:"#EAF3DE",bC:"#27500A",url:"https://bcorporation.net/fr-fr",dom:"bcorporation.net"},
      {ico:"🌱",name:"ADEME BPI",desc:"Aides projets éco",save:"Financement dédié",sc:"#42C47E",badge:"Aide état",bBg:"#EAF3DE",bC:"#27500A",url:"https://agirpourlatransition.ademe.fr",dom:"ademe.fr"},
      {ico:"🔄",name:"Spareka",desc:"Pièces détachées",save:"Réparabilité produit",sc:"#38BDF8",badge:"Circularité",bBg:"#E6F1FB",bC:"#0C447C",url:"https://spareka.fr",dom:"spareka.fr"},
      {ico:"💚",name:"Makesense",desc:"Accompagnement éco",save:"Réseau dédié",sc:"#5DCAA5",badge:"Réseau",bBg:"#E1F5EE",bC:"#085041",url:"https://makesense.org",dom:"makesense.org"}
    ]},
  "sante-projet":{t:"t",xp:15,ico:"⏱️",title:"5,8h de sommeil = -40% créativité",alertCol:"#A78BFA",
    alert:"Sous 6h, ton cerveau ne consolide pas. Tu travailles plus pour moins.",
    alts:[
      {ico:"⏱️",name:"Toggl",desc:"Timer deep work 90min",save:"+40% productivité",sc:"#38BDF8",badge:"Focus",bBg:"#E6F1FB",bC:"#0C447C",url:"https://toggl.com",dom:"toggl.com"},
      {ico:"🏃",name:"Freeletics",desc:"HIIT 30 min = +2h focus",save:"Énergie x2",sc:"#42C47E",badge:"Énergie",bBg:"#EAF3DE",bC:"#27500A",url:"https://freeletics.com",dom:"freeletics.com"},
      {ico:"📚",name:"Cal Newport",desc:"Deep Work — méthode",save:"Livre & blog",sc:"#F5C842",badge:"Lecture",bBg:"#FAEEDA",bC:"#633806",url:"https://calnewport.com/books/deep-work",dom:"calnewport.com"},
      {ico:"🌙",name:"Sleep Cycle",desc:"Réveil phase légère",save:"Dès 0€",sc:"#A78BFA",badge:"Sommeil",bBg:"#EEEDFE",bC:"#3C3489",url:"https://sleepcycle.com",dom:"sleepcycle.com"}
    ]},
  "formation-epargne":{t:"s",xp:20,ico:"📚",title:"2 400€ épargnés avec MIT + Coursera",alertCol:"#A78BFA",
    alert:"Même compétence. La différence va à ton épargne ou ton projet.",
    alts:[
      {ico:"🎓",name:"MIT OCW",desc:"Cours MIT 0€",save:"Idem 200€/mois",sc:"#A78BFA",badge:"Gratuit",bBg:"#EEEDFE",bC:"#3C3489",url:"https://ocw.mit.edu",dom:"ocw.mit.edu"},
      {ico:"🇪🇺",name:"Erasmus+",desc:"Bourse EU formation",save:"Financé par l'UE",sc:"#38BDF8",badge:"Bourse",bBg:"#E6F1FB",bC:"#0C447C",url:"https://erasmus-plus.ec.europa.eu/fr",dom:"erasmus-plus.ec.europa.eu"},
      {ico:"💼",name:"CPF",desc:"Compte formation financé",save:"500€/an offerts",sc:"#42C47E",badge:"Droits acquis",bBg:"#EAF3DE",bC:"#27500A",url:"https://moncompteformation.gouv.fr",dom:"moncompteformation.gouv.fr"},
      {ico:"📖",name:"Coursera audit",desc:"Accès gratuit cours",save:"Certifiable · 0€",sc:"#F5C842",badge:"Accès libre",bBg:"#FAEEDA",bC:"#633806",url:"https://coursera.org",dom:"coursera.org"}
    ]},
  "formation-impact":{t:"s",xp:20,ico:"🎓",title:"Compétences × impact = levier",alertCol:"#5DCAA5",
    alert:"Se former pour mieux agir. La formation est un multiplicateur d'impact.",
    alts:[
      {ico:"🌱",name:"Makesense",desc:"Formation entre. social",save:"Communauté impact",sc:"#5DCAA5",badge:"Recommandé",bBg:"#E1F5EE",bC:"#085041",url:"https://makesense.org",dom:"makesense.org"},
      {ico:"🎓",name:"MIT OCW",desc:"Compétences gratuites",save:"0€",sc:"#A78BFA",badge:"Gratuit",bBg:"#EEEDFE",bC:"#3C3489",url:"https://ocw.mit.edu",dom:"ocw.mit.edu"},
      {ico:"🇪🇺",name:"Erasmus+",desc:"Bourse EU impact",save:"Financé",sc:"#38BDF8",badge:"Bourse",bBg:"#E6F1FB",bC:"#0C447C",url:"https://erasmus-plus.ec.europa.eu/fr",dom:"erasmus-plus.ec.europa.eu"},
      {ico:"💚",name:"Ashoka",desc:"Réseau changemakers",save:"Mentorat",sc:"#42C47E",badge:"Réseau",bBg:"#EAF3DE",bC:"#27500A",url:"https://ashoka.org/fr-fr",dom:"ashoka.org"}
    ]},
  "formation-voyage":{t:"s",xp:18,ico:"🌍",title:"Immersion = langue ×3 plus vite",alertCol:"#38BDF8",
    alert:"3 mois en immersion = 2 ans de cours. Et ça coûte souvent moins cher.",
    alts:[
      {ico:"🇪🇺",name:"Erasmus+",desc:"Bourse EU étude/voyage",save:"Financé par l'UE",sc:"#38BDF8",badge:"Recommandé",bBg:"#E6F1FB",bC:"#0C447C",url:"https://erasmus-plus.ec.europa.eu/fr",dom:"erasmus-plus.ec.europa.eu"},
      {ico:"🌍",name:"Workaway",desc:"Voyage + apprentissage",save:"Hébergement gratuit",sc:"#42C47E",badge:"Slow travel",bBg:"#EAF3DE",bC:"#27500A",url:"https://workaway.info",dom:"workaway.info"},
      {ico:"🌏",name:"Worldpackers",desc:"Voyage éducatif",save:"-70% budget",sc:"#5DCAA5",badge:"Éco",bBg:"#E1F5EE",bC:"#085041",url:"https://worldpackers.com",dom:"worldpackers.com"},
      {ico:"🚂",name:"Seat61",desc:"Train = tempo apprentissage",save:"-90% CO₂",sc:"#86EFAC",badge:"Train",bBg:"#EAF3DE",bC:"#27500A",url:"https://seat61.com",dom:"seat61.com"}
    ]},
  "impact-epargne":{t:"s",xp:25,ico:"💚",title:"Ton épargne peut financer le bien",alertCol:"#5DCAA5",
    alert:"Résister ici = capital qui peut aller à des projets utiles.",
    alts:[
      {ico:"🏦",name:"Nef",desc:"Banque éthique française",save:"Projets durables",sc:"#5DCAA5",badge:"Recommandé",bBg:"#E1F5EE",bC:"#085041",url:"https://lanef.com",dom:"lanef.com"},
      {ico:"🌱",name:"Lita.co",desc:"Investissement à impact",save:"Dès 50€",sc:"#42C47E",badge:"Impact",bBg:"#EAF3DE",bC:"#27500A",url:"https://lita.co",dom:"lita.co"},
      {ico:"🤝",name:"Helios",desc:"Banque verte + carte",save:"Carbone tracké",sc:"#86EFAC",badge:"Vert",bBg:"#EAF3DE",bC:"#27500A",url:"https://helios.do",dom:"helios.do"},
      {ico:"📊",name:"Goodvest",desc:"PEA / AV à impact",save:"Épargne alignée",sc:"#38BDF8",badge:"Investissement",bBg:"#E6F1FB",bC:"#0C447C",url:"https://goodvest.fr",dom:"goodvest.fr"}
    ]},
  "ecologie-impact":{t:"s",xp:20,ico:"🌱",title:"Ce refus = production non commandée",alertCol:"#5DCAA5",
    alert:"Chaque achat évité réduit l'extraction, la production et le transport.",
    alts:[
      {ico:"🛒",name:"La Fourche",desc:"Supermarché bio -40%",save:"-40% vs bio classique",sc:"#86EFAC",badge:"Recommandé",bBg:"#EAF3DE",bC:"#27500A",url:"https://lafourche.fr",dom:"lafourche.fr"},
      {ico:"🌱",name:"Too Good To Go",desc:"Anti-gaspi aliment.",save:"Panier 3-5€",sc:"#5DCAA5",badge:"Anti-gaspi",bBg:"#E1F5EE",bC:"#085041",url:"https://toogoodtogo.com/fr",dom:"toogoodtogo.com"},
      {ico:"💚",name:"Ethiquable",desc:"Commerce équitable dir.",save:"Prix juste producteur",sc:"#42C47E",badge:"Équitable",bBg:"#EAF3DE",bC:"#27500A",url:"https://ethiquable.coop",dom:"ethiquable.coop"},
      {ico:"🏦",name:"Nef",desc:"Épargne finance le bien",save:"Ton argent agit",sc:"#38BDF8",badge:"Éthique",bBg:"#E6F1FB",bC:"#0C447C",url:"https://lanef.com",dom:"lanef.com"}
    ]},
  "voyage-epargne-ecologie":{t:"t",xp:40,ico:"🎯",title:"Score triple 6/10 — résoudre les 3",alertCol:"#F5C842",
    alert:"Voyage slow : 300-500€, -80% CO₂, épargne préservée. Les 3 ensemble.",
    alts:[
      {ico:"🚂",name:"Interrail",desc:"Europe train illimité",save:"-80% CO₂ vs vol",sc:"#86EFAC",badge:"Train",bBg:"#EAF3DE",bC:"#27500A",url:"https://interrail.eu/fr",dom:"interrail.eu"},
      {ico:"🌍",name:"Worldpackers",desc:"Hébergement gratuit",save:"-70% budget",sc:"#42C47E",badge:"Éco",bBg:"#EAF3DE",bC:"#27500A",url:"https://worldpackers.com",dom:"worldpackers.com"},
      {ico:"🏦",name:"Revolut Vault",desc:"Compte voyage dédié",save:"Auto-épargne",sc:"#38BDF8",badge:"Épargne",bBg:"#E6F1FB",bC:"#0C447C",url:"https://revolut.com/fr-FR",dom:"revolut.com"},
      {ico:"💨",name:"Atmosfair",desc:"Compensation si vol",save:"~15€/t CO₂",sc:"#F5C842",badge:"Dernier recours",bBg:"#FAEEDA",bC:"#633806",url:"https://atmosfair.de/fr",dom:"atmosfair.de"}
    ]}
};

// Sélectionne le widget le plus pertinent selon les ambitions actives et le produit
function getCrossWidgets(ambitions) {
  if (!ambitions || !ambitions.length) return [];
  var results = [];
  var seen = {};
  // Priorité : triple d'abord
  if (ambitions.indexOf("voyage") !== -1 && ambitions.indexOf("epargne") !== -1 && ambitions.indexOf("ecologie") !== -1) {
    results.push({ key:"voyage-epargne-ecologie", data: CROSS_WIDGETS["voyage-epargne-ecologie"] });
    seen["voyage-epargne-ecologie"] = true;
  }
  var keys = Object.keys(CROSS_WIDGETS);
  keys.forEach(function(key) {
    if (seen[key]) return;
    var parts = key.split("-");
    var match = parts.every(function(p) { return ambitions.indexOf(p) !== -1; });
    if (match) { results.push({ key: key, data: CROSS_WIDGETS[key] }); seen[key] = true; }
  });
  return results.slice(0, 1); // UN seul widget — le plus pertinent
}

// Patterns de catégorisation produit — en scope module pour éviter la recompilation à chaque appel
var RE_SUPERMARKET  = /madeleines?|biscuits?|gateau|gâteau|st.michel|saint.michel|lu[^c]|prince[^s]|oreo|nutella|yaourt|coca|pepsi|evian|lait|chocolat|farine|sucre|cafe|café|pâtes|riz[^e]|chips|cereales|céréales|compote|confiture|beurre|fromage|jambon|saucisson|bonne.maman|bjorg|herta|danone|nestle|ferrero|haribo|kinder|boisson|viennoiserie|croissant|brioche|conserve|surgelé|surgele|alimentaire/;
var RE_BEAUTY       = /creme|crème|serum|sérum|shampooing|shampoo|masque|lotion|baume|fond.de.teint|mascara|parfum|deodorant|déodorant|dentifrice|sephora|nocibe|marionnaud|yves.rocher|nuxe|vichy|nivea|garnier|loreal|avene|bioderma|cosmetique|cosmétique/;
var RE_ELECTRONICS  = /smartphone|iphone|samsung|tablette|ordinateur|laptop|ecouteurs|écouteurs|casque.audio|telephone|téléphone|montre.connectee|airpods|galaxy.buds|electronics|informatique|high.tech/;
var RE_TOY          = /lego|playmobil|jouet|figurine|puzzle|peluche|poupée|jeu.de.société|jeu.de.societe|jeu.de.construction|nerf|barbie|hot.wheels|kapla|duplo/;
var RE_FASHION      = /chaussure|basket|sneaker|pantalon|jean|robe|chemise|veste|manteau|pull|t.?shirt|tee.?shirt|sweat|short|jupe|sous.vêtement|lingerie|ceinture|sac.à.main|accessoire|shein|zara|hm\.com|primark|asos|zalando|kiabi|jennyfer|mango|nike|adidas|lacoste|uniqlo/;
var RE_BOOK         = /livre|roman|bande.dessinée|manga|bd|album|poche|broché|relié|littérature|fnac.*livre|amazon.*livre/;

// Génère des alternatives contextuelles intelligentes selon le produit
function getSmartAlts(baseAlts, productInfo) {
  if (!productInfo) return baseAlts;
  var fullText = ([
    productInfo.title, productInfo.description,
    productInfo.brand, productInfo.site, window.location.href
  ]).join(" ").toLowerCase();

  var locWork = (PROFILE.locWork || "").trim();

  // ── Catégorisation du produit ──
  var isSupermarketProduct = RE_SUPERMARKET.test(fullText);
  var isBeautyProduct      = RE_BEAUTY.test(fullText);
  var isElectronics        = RE_ELECTRONICS.test(fullText);
  var isToyProduct         = RE_TOY.test(fullText);
  var isFashionProduct     = RE_FASHION.test(fullText);
  var isBookProduct        = RE_BOOK.test(fullText);

  // ── Produit trouvable en magasin local ? ──
  var isBuyableLocally = isSupermarketProduct || isBeautyProduct || isToyProduct || isFashionProduct || isBookProduct;

  // ── Construire la liste enrichie ──
  var smartAlts = baseAlts.slice();

  // Électronique : prioriser le reconditionné (meilleur que Maps pour cette catégorie)
  if (isElectronics && !isSupermarketProduct) {
    smartAlts.unshift({
      ico: "♻️",
      name: "Reconditionné Back Market",
      desc: "Même appareil certifié, -30 à 50% et garanti 12 mois",
      save: "-30 à 50% vs neuf",
      sc: "#38BDF8",
      badge: "Garanti",
      bBg: "#E6F1FB",
      bC: "#0C447C",
      url: "https://www.backmarket.fr",
      dom: "backmarket.fr"
    });
  }

  // ── Maps seulement si le produit est trouvable en local ──
  // ET seulement en 2ème position (l'alternative cross-widget reste prioritaire)
  if (isBuyableLocally) {
    var mapAlt = null;

    if (isSupermarketProduct) {
      mapAlt = {
        ico: "🛒",
        name: "Sur le chemin du retour",
        desc: locWork
          ? "Passe au supermarché en rentrant de " + locWork + " — même produit, sans livraison"
          : "Achète-le en chemin plutôt que de le faire livrer",
        save: "0€ livraison · 0 emballage",
        sc: "#42C47E",
        badge: "En chemin",
        bBg: "#EAF3DE",
        bC: "#27500A",
        url: locWork
          ? "https://www.google.com/maps/search/supermarché/@" + encodeURIComponent(locWork)
          : "https://www.google.com/maps/search/supermarché+proche",
        dom: "maps.google.com",
        mapQuery: "supermarché drive",
        actionLabel: "Click & Collect →"
      };

      // Si ambition écologie → proposer épicerie bio EN PRIORITÉ sur Maps
      if (PROFILE.ambitions && PROFILE.ambitions.indexOf("ecologie") !== -1) {
        mapAlt = {
          ico: "🌿",
          name: "Épicerie bio locale",
          desc: "Équivalent artisanal, sans conservateurs ni emballage plastique individuel",
          save: "Moins de déchets",
          sc: "#86EFAC",
          badge: "Éco",
          bBg: "#E1F5EE",
          bC: "#085041",
          url: locWork
            ? "https://www.google.com/maps/search/épicerie+bio+proche+de+" + encodeURIComponent(locWork)
            : "https://www.google.com/maps/search/épicerie+bio",
          dom: "maps.google.com",
          mapQuery: "épicerie bio magasin",
          actionLabel: "Click & Collect →"
        };
      }
    } else if (isBeautyProduct) {
      mapAlt = {
        ico: "💊",
        name: "Parapharmacie locale",
        desc: locWork
          ? "Même gamme en parapharmacie sur ton trajet depuis " + locWork
          : "Disponible en parapharmacie, souvent moins cher",
        save: "0€ livraison",
        sc: "#F5C842",
        badge: "En chemin",
        bBg: "#FAEEDA",
        bC: "#633806",
        url: locWork
          ? "https://www.google.com/maps/search/pharmacie+proche+de+" + encodeURIComponent(locWork)
          : "https://www.google.com/maps/search/pharmacie",
        dom: "maps.google.com",
        mapQuery: "pharmacie parapharmacie",
        actionLabel: "Click & Collect →"
      };
    } else if (isToyProduct) {
      mapAlt = {
        ico: "🧸",
        name: "Magasin de jouets",
        desc: locWork
          ? "Disponible en magasin sur ton trajet depuis " + locWork
          : "Trouve-le en magasin, touche-le avant d'acheter",
        save: "0€ livraison · pas d'emballage",
        sc: "#F5C842",
        badge: "En magasin",
        bBg: "#FAEEDA",
        bC: "#633806",
        url: locWork
          ? "https://www.google.com/maps/search/magasin+jouets+proche+de+" + encodeURIComponent(locWork)
          : "https://www.google.com/maps/search/magasin+jouets",
        dom: "maps.google.com",
        mapQuery: "magasin jouets Fnac",
        actionLabel: "Click & Collect →"
      };
    } else if (isFashionProduct) {
      mapAlt = {
        ico: "👗",
        name: "Essayer en boutique",
        desc: locWork
          ? "Essaye avant d'acheter — en rentrant de " + locWork
          : "Essaye en boutique, évite les retours et le gaspillage",
        save: "0 retour · 0 emballage",
        sc: "#42C47E",
        badge: "En boutique",
        bBg: "#EAF3DE",
        bC: "#27500A",
        url: locWork
          ? "https://www.google.com/maps/search/friperie+boutique+vêtements+proche+de+" + encodeURIComponent(locWork)
          : "https://www.google.com/maps/search/friperie+boutique+vêtements",
        dom: "maps.google.com",
        mapQuery: "friperie boutique vêtements",
        actionLabel: "Click & Collect →"
      };
    } else if (isBookProduct) {
      mapAlt = {
        ico: "📖",
        name: "Librairie de quartier",
        desc: locWork
          ? "Soutiens ta librairie locale en rentrant de " + locWork
          : "Achète en librairie — même prix, commerce local soutenu",
        save: "Prix unique · commerce local",
        sc: "#A78BFA",
        badge: "Local",
        bBg: "#EEEDFE",
        bC: "#3C3489",
        url: locWork
          ? "https://www.google.com/maps/search/librairie+proche+de+" + encodeURIComponent(locWork)
          : "https://www.google.com/maps/search/librairie",
        dom: "maps.google.com",
        mapQuery: "librairie",
        actionLabel: "Click & Collect →"
      };
    }

    // Insérer la Maps en position 2 (pas 1) — l'alt cross-widget reste en premier
    if (mapAlt) {
      // Si la première alt est déjà meilleure que Maps (score objectif > achat local),
      // on insère Maps en 2ème. Sinon en 1er.
      var firstAltIsStrong = smartAlts[0] && !smartAlts[0].mapQuery && smartAlts[0].dom !== "maps.google.com";
      if (firstAltIsStrong) {
        smartAlts.splice(1, 0, mapAlt);
      } else {
        smartAlts.unshift(mapAlt);
      }
    }
  }

  return smartAlts.slice(0, 4);
}

// Construit un widget avec carousel 1-par-1 (4 étapes)
function buildCrossWidget(key, data, productInfo) {
  var rawAlts = (productInfo && productInfo._crossAlts && productInfo._crossAlts.length >= 2)
    ? productInfo._crossAlts
    : getSmartAlts(data.alts, productInfo);

  // v7.3 : supporter 3 alternatives avec kind (smart / you / free)
  // Si pas de kind fourni, on devine par position pour la rétro-compatibilité
  rawAlts.forEach(function(a, i) {
    if (a && !a.kind) {
      a.kind = i === 0 ? "smart" : i === 1 ? "you" : "free";
    }
  });

  var alt1 = rawAlts[0];
  var alt2 = rawAlts[1];
  var alt3 = rawAlts[2]; // v7.3 : alternative "libre"
  if (!alt1) return mk("div");

  var parts = key.split("-");

  // Wrapper global — fond transparent
  var W = mk("div");
  W.style.cssText = "display:flex;flex-direction:column;gap:6px;width:100%;box-sizing:border-box;min-width:0;";

  // ── TAGS en haut ──
  var tagsRow = mk("div");
  tagsRow.style.cssText = "display:flex;align-items:center;gap:4px;flex-wrap:wrap;margin-bottom:1px;";
  parts.forEach(function(p, i) {
    if (i > 0) {
      var sep = mk("span"); sep.style.cssText = "font-size:9px;color:#6B6475;"; sep.textContent = "×";
      tagsRow.appendChild(sep);
    }
    var col = PCOLORS[p] || "#888";
    var tag = mk("span");
    tag.style.cssText = "font-size:10px;font-weight:700;padding:2px 8px;border-radius:6px;background:" + col + "20;color:" + col + ";";
    tag.textContent = PNAMES[p] || p;
    tagsRow.appendChild(tag);
  });
  W.appendChild(tagsRow);

  // ── RECTANGLE PRINCIPAL — Titre + alerte + synergie ──
  var mainCard = mk("div");
  mainCard.style.cssText = "background:rgba(8,6,15,.72);border-radius:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(4px);";

  // Titre avec XP
  var mainHead = mk("div"); mainHead.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:6px;";
  var mainIco = mk("span"); mainIco.style.cssText = "font-size:18px;flex-shrink:0;line-height:1;"; mainIco.textContent = data.ico || "⚡";
  var mainTitle = mk("div"); mainTitle.style.cssText = "font-size:13px;font-weight:700;color:#EDE9E0;flex:1;line-height:1.3;"; mainTitle.textContent = data.title || "";
  var xpPill = mk("span"); xpPill.style.cssText = "font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;background:rgba(245,200,66,.15);color:#F5C842;flex-shrink:0;"; xpPill.textContent = "+" + (data.xp || 0) + " XP";
  mainHead.appendChild(mainIco); mainHead.appendChild(mainTitle); mainHead.appendChild(xpPill);
  mainCard.appendChild(mainHead);

  // Alerte contextuelle (synergie ✨ ou tension ⚠️)
  if (data.alert) {
    var alertType = data.t === "s" ? "synergie" : "tension";
    var alertIco = alertType === "synergie" ? "✨" : "⚠️";
    var alertBorderCol = data.alertCol || (alertType === "synergie" ? "#42C47E" : "#E8563A");
    var alertBgCol = alertBorderCol + "12";

    var alertRow = mk("div");
    alertRow.style.cssText = "display:flex;align-items:flex-start;gap:7px;padding:8px 10px;background:" + alertBgCol + ";border:1px solid " + alertBorderCol + "35;border-radius:8px;margin-top:2px;";
    var alertIcoEl = mk("span"); alertIcoEl.style.cssText = "font-size:12px;flex-shrink:0;margin-top:1px;"; alertIcoEl.textContent = alertIco;
    var alertTxt = mk("div"); alertTxt.style.cssText = "font-size:11px;color:#C4C0BB;line-height:1.45;"; alertTxt.textContent = data.alert;
    alertRow.appendChild(alertIcoEl); alertRow.appendChild(alertTxt);
    mainCard.appendChild(alertRow);
  }

  W.appendChild(mainCard);

  // ── RECTANGLE 1 — Alternative IA ou contextuelle ──
  // v7.3 : Table des "kinds" d'alternatives
  var KIND_META = {
    smart: { lbl: "Plus malin",  col: "#E8563A", bg: "rgba(232,86,58,.15)",  ico: "🔄" },
    you:   { lbl: "Plus toi",    col: "#A78BFA", bg: "rgba(167,139,250,.15)", ico: "✨" },
    free:  { lbl: "Plus libre",  col: "#42C47E", bg: "rgba(66,196,126,.15)",  ico: "🌿" }
  };

  function buildKindBadge(kind) {
    var meta = KIND_META[kind];
    if (!meta) return null;
    var b = mk("div");
    b.style.cssText = "display:inline-flex;align-items:center;gap:4px;font-size:9px;font-weight:700;letter-spacing:.5px;padding:3px 8px;border-radius:6px;background:" + meta.bg + ";color:" + meta.col + ";margin-bottom:6px;width:fit-content;";
    b.innerHTML = '<span style="font-size:11px;line-height:1">' + meta.ico + '</span>' + meta.lbl.toUpperCase();
    return b;
  }

  function buildSimpleAlt(alt) {
    var hasUrl = !!alt.url && alt.url.indexOf("http") === 0;
    var r = hasUrl ? mk("a") : mk("div");
    if (hasUrl) { r.href = alt.url; r.target = "_blank"; r.rel = "noopener noreferrer"; }
    r.style.cssText = "display:block;background:rgba(8,6,15,.72);border-radius:10px;padding:10px 12px;border:1px solid rgba(255,255,255,.09);text-decoration:none;" + (hasUrl ? "cursor:pointer;" : "") + "backdrop-filter:blur(4px);transition:border-color .15s;overflow:hidden;box-sizing:border-box;width:100%;";
    if (hasUrl) {
      r.addEventListener("mouseenter", function() { r.style.borderColor = "rgba(255,255,255,.22)"; });
      r.addEventListener("mouseleave", function() { r.style.borderColor = "rgba(255,255,255,.09)"; });
      r.addEventListener("click", function() { recordDecision("alternative"); });
    }

    // v7.3 : badge "kind" coloré en haut (Plus malin / Plus toi / Plus libre)
    var kindBadge = buildKindBadge(alt.kind);
    if (kindBadge) r.appendChild(kindBadge);

    var row1 = mk("div"); row1.style.cssText = "display:flex;align-items:center;gap:7px;margin-bottom:4px;";
    var ico = mk("span"); ico.style.cssText = "font-size:16px;flex-shrink:0;line-height:1;"; ico.textContent = alt.ico || "✦";
    var name = mk("span"); name.style.cssText = "font-size:12px;font-weight:600;color:#EDE9E0;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"; name.textContent = alt.name || "";
    row1.appendChild(ico); row1.appendChild(name);
    if (alt.badge) {
      var badge = mk("span");
      badge.style.cssText = "font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;flex-shrink:0;background:" + (alt.bBg||"#333") + ";color:" + (alt.bC||"#fff") + ";";
      badge.textContent = alt.badge;
      row1.appendChild(badge);
    }

    var desc = mk("div"); desc.style.cssText = "font-size:10px;color:#8A8494;line-height:1.45;margin-bottom:5px;word-wrap:break-word;overflow-wrap:break-word;"; desc.textContent = alt.desc || "";

    var row3 = mk("div"); row3.style.cssText = "display:flex;align-items:center;";
    var save = mk("span"); save.style.cssText = "font-size:10px;font-weight:700;color:" + (alt.sc||"#42C47E") + ";flex:1;"; save.textContent = alt.save || "";
    if (alt.dom) {
      var url = mk("span"); url.style.cssText = "font-size:9px;color:#4A4456;flex-shrink:0;"; url.textContent = "↗ " + alt.dom;
      row3.appendChild(save); row3.appendChild(url);
    } else {
      row3.appendChild(save);
    }

    r.appendChild(row1); r.appendChild(desc); r.appendChild(row3);
    return r;
  }

  // ── RECTANGLE MAPS — avec vraie carte Google Maps + Click & Collect ──
  function buildMapsAlt(alt, locWork) {
    var r = mk("div");
    r.style.cssText = "background:rgba(8,6,15,.72);border-radius:10px;overflow:hidden;border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(4px);box-sizing:border-box;width:100%;";

    // Header du rectangle Maps
    var head = mk("div"); head.style.cssText = "padding:9px 11px 6px;";

    var row1 = mk("div"); row1.style.cssText = "display:flex;align-items:center;gap:7px;margin-bottom:3px;";
    var ico = mk("span"); ico.style.cssText = "font-size:16px;flex-shrink:0;"; ico.textContent = alt.ico;
    var name = mk("span"); name.style.cssText = "font-size:12px;font-weight:600;color:#EDE9E0;flex:1;"; name.textContent = alt.name;
    var badge = mk("span");
    badge.style.cssText = "font-size:9px;font-weight:700;padding:2px 7px;border-radius:5px;flex-shrink:0;background:" + (alt.bBg||"#EAF3DE") + ";color:" + (alt.bC||"#27500A") + ";";
    badge.textContent = alt.badge;
    row1.appendChild(ico); row1.appendChild(name); row1.appendChild(badge);
    head.appendChild(row1);

    // Texte contextuel
    var desc = mk("div"); desc.style.cssText = "font-size:10px;color:#6B6475;line-height:1.4;margin-bottom:2px;"; desc.textContent = alt.desc;
    head.appendChild(desc);

    // Save
    var save = mk("div"); save.style.cssText = "font-size:10px;font-weight:700;color:" + (alt.sc||"#42C47E") + ";margin-bottom:4px;"; save.textContent = alt.save;
    head.appendChild(save);

    r.appendChild(head);

    // ── Carte Google Maps — iframe embed (gratuit, pas de clé API) ──
    var searchQuery = (alt.mapQuery || "magasin") + (locWork ? " proche " + locWork : "");
    var mapContainer = mk("div");
    mapContainer.style.cssText = "position:relative;width:100%;height:150px;overflow:hidden;background:#1a1f2e;cursor:pointer;";

    // Iframe Google Maps Embed
    var iframe = document.createElement("iframe");
    iframe.src = "https://www.google.com/maps/embed/v1/search?q=" + encodeURIComponent(searchQuery) + "&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8";
    iframe.style.cssText = "width:100%;height:150px;border:none;pointer-events:none;filter:saturate(0.8) brightness(0.85);";
    iframe.setAttribute("loading", "lazy");
    iframe.setAttribute("allowfullscreen", "");
    iframe.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
    mapContainer.appendChild(iframe);

    // Overlay cliquable par-dessus l'iframe (l'iframe a pointer-events:none)
    var mapOverlay = mk("a");
    mapOverlay.href = alt.url; mapOverlay.target = "_blank"; mapOverlay.rel = "noopener noreferrer";
    mapOverlay.style.cssText = "position:absolute;inset:0;z-index:1;";
    mapContainer.appendChild(mapOverlay);

    // Label "Ouvrir dans Maps"
    var mapLabel = mk("div");
    mapLabel.style.cssText = "position:absolute;bottom:6px;right:8px;z-index:2;background:rgba(8,6,15,.85);border-radius:6px;padding:3px 8px;font-size:9px;font-weight:700;color:#6B6475;backdrop-filter:blur(4px);pointer-events:none;";
    mapLabel.textContent = "Ouvrir dans Maps ↗";
    mapContainer.appendChild(mapLabel);

    r.appendChild(mapContainer);

    // Footer : heure + bouton Click & Collect
    var footer = mk("div");
    footer.style.cssText = "padding:10px 11px;display:flex;align-items:center;justify-content:space-between;gap:8px;";

    var heureEl = mk("span");
    var now = new Date();
    var heureTravail = new Date(now); heureTravail.setHours(18, 0, 0);
    var heureStr = "Après le travail à " + heureTravail.getHours() + "h";
    heureEl.style.cssText = "font-size:11px;color:#6B6475;";
    heureEl.textContent = heureStr;
    footer.appendChild(heureEl);

    var btnAction = mk("a");
    btnAction.href = alt.url; btnAction.target = "_blank"; btnAction.rel = "noopener noreferrer";
    btnAction.style.cssText = "padding:9px 16px;background:#42C47E;border-radius:10px;font-size:12px;font-weight:700;color:#fff;text-decoration:none;white-space:nowrap;transition:opacity .15s;";
    btnAction.textContent = alt.actionLabel || "Click & Collect →";
    btnAction.addEventListener("mouseenter", function() { btnAction.style.opacity = ".85"; });
    btnAction.addEventListener("mouseleave", function() { btnAction.style.opacity = "1"; });
    btnAction.addEventListener("click", function() { recordDecision("alternative"); });
    footer.appendChild(btnAction);

    r.appendChild(footer);
    return r;
  }

  // ── Affichage : carrousel horizontal auto-scroll sur petits écrans ──
  var locWork = (PROFILE.locWork || "").trim();

  function shouldRenderAsMap(alt) {
    if (!alt) return false;
    // Explicitement Maps
    if (alt.dom === "maps.google.com" || alt.mapQuery) return true;
    // Alternatives locales générées par l'IA (biocoop, épicerie, pharmacie, librairie, etc.)
    var localKeywords = /biocoop|épicerie|magasin|pharmacie|parapharmacie|librairie|boutique|friperie|marché|drive|supermarché|hypermarché|carrefour|leclerc|auchan|intermarché|monoprix|franprix|picard|biocoop|naturalia|la vie claire|day by day/i;
    if (localKeywords.test(alt.name || "") || localKeywords.test(alt.desc || "")) {
      // Enrichir avec mapQuery si pas déjà présent
      if (!alt.mapQuery) {
        alt.mapQuery = (alt.name || "magasin local").replace(/[^\w\sàâéèêëïîôùûüç]/gi, "");
        alt.dom = "maps.google.com";
        alt.url = "https://www.google.com/maps/search/" + encodeURIComponent(alt.mapQuery + (locWork ? " proche " + locWork : ""));
        alt.actionLabel = alt.actionLabel || "Click & Collect →";
      }
      return true;
    }
    if (!productInfo) return false;
    var fullTxt = ([productInfo.title, productInfo.description, productInfo.brand, productInfo.site]).join(" ").toLowerCase();
    var localBuyable = /alimentaire|supermarché|biscuit|madeleines|gateau|chips|yaourt|lait|chocolat|cafe|boisson|fromage|beurre|farine|brioche|croissant|pharmacie|parapharmacie|crème|sérum|shampooing|maquillage|dentifrice|cosmétique|jouet|lego|livre|vêtement|chaussure|meuble/.test(fullTxt);
    return localBuyable && (alt.dom === "maps.google.com" || alt.mapQuery);
  }

  var isMapsAlt1 = shouldRenderAsMap(alt1);
  var isMapsAlt2 = shouldRenderAsMap(alt2);
  var isMapsAlt3 = alt3 ? shouldRenderAsMap(alt3) : false;

  // Enrichir les alts Maps avec mapQuery si nécessaire
  if (isMapsAlt1 && !alt1.mapQuery) {
    var titleLow = (productInfo && productInfo.title || "").toLowerCase();
    alt1.mapQuery = /madeleines|biscuit|gateau|alimentaire|chocolat|café|lait/.test(titleLow) ? "supermarché drive" :
                   /lego|jouet|jeu/.test(titleLow) ? "magasin jouets" :
                   /iphone|samsung|téléphone|ordinateur/.test(titleLow) ? "magasin électronique" :
                   /serum|crème|shampooing|cosmét|pharmacie/.test(titleLow) ? "pharmacie parapharmacie" : "magasin";
    alt1.actionLabel = "Click & Collect →";
  }
  if (isMapsAlt2 && !alt2.mapQuery) {
    alt2.mapQuery = "commerce local";
    alt2.actionLabel = "Click & Collect →";
  }
  if (isMapsAlt3 && alt3 && !alt3.mapQuery) {
    alt3.mapQuery = "lieu gratuit";
    alt3.actionLabel = "Y aller →";
  }

  function renderAlt(alt, isMap) {
    if (isMap) return buildMapsAlt(alt, locWork);
    return buildSimpleAlt(alt);
  }

  // ── Construire les slides ──
  var slides = [];
  slides.push(renderAlt(alt1, isMapsAlt1));
  if (alt2) slides.push(renderAlt(alt2, isMapsAlt2));
  if (alt3) slides.push(renderAlt(alt3, isMapsAlt3));

  if (slides.length <= 1) {
    // Une seule alternative — pas de carrousel
    W.appendChild(slides[0]);
  } else {
    // ── Carrousel auto-scroll ──
    var carousel = mk("div");
    // width:100% + box-sizing → le carrousel fait exactement la largeur du panel2 (hors padding)
    // touch-action:pan-y → permet scroll vertical de la page tout en interceptant le swipe horizontal
    carousel.style.cssText = "position:relative;overflow:hidden;width:100%;box-sizing:border-box;touch-action:pan-y;";

    var track = mk("div");
    // width:N*100% évite tout problème de calcul de flex-basis pendant la transition
    // align-items:stretch → les 2 slides ont la même hauteur (la plus grande)
    track.style.cssText = "display:flex;align-items:stretch;width:" + (slides.length * 100) + "%;transition:transform .4s cubic-bezier(.4,0,.2,1);will-change:transform;";

    slides.forEach(function(slide) {
      var slideWrap = mk("div");
      // flex:1 0 0 partage l'espace équitablement ; width:100%/N fixe en fallback
      slideWrap.style.cssText = "flex:1 0 0;width:" + (100 / slides.length) + "%;box-sizing:border-box;display:flex;";
      // Le slide interne doit remplir toute la largeur
      slide.style.width = "100%";
      slideWrap.appendChild(slide);
      track.appendChild(slideWrap);
    });

    carousel.appendChild(track);

    // Indicateurs (dots)
    var dotsRow = mk("div");
    dotsRow.style.cssText = "display:flex;justify-content:center;gap:6px;padding:8px 0 2px;";
    var dots = [];
    slides.forEach(function(_, idx) {
      var dot = mk("div");
      dot.style.cssText = "width:6px;height:6px;border-radius:50%;background:" + (idx === 0 ? "#EDE9E0" : "rgba(255,255,255,.2)") + ";cursor:pointer;transition:background .2s;";
      dot.addEventListener("click", function() { goToSlide(idx); });
      dotsRow.appendChild(dot);
      dots.push(dot);
    });

    carousel.appendChild(dotsRow);
    W.appendChild(carousel);

    // Logique du carrousel
    var currentSlide = 0;
    var autoTimer = null;
    var SLIDE_INTERVAL = 5000; // 5 secondes — temps de lecture UX standard

    function stopTimer() {
      if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    }
    function startTimer() {
      stopTimer();
      autoTimer = setInterval(nextSlide, SLIDE_INTERVAL);
    }

    function goToSlide(idx) {
      currentSlide = idx;
      // Translation en % relatif à la largeur du TRACK (qui fait slides.length * 100%)
      // → pour glisser d'un slide entier il faut translater de 100%/slides.length
      var translatePct = (idx * 100) / slides.length;
      track.style.transform = "translateX(-" + translatePct + "%)";
      dots.forEach(function(d, i) {
        d.style.background = i === idx ? "#EDE9E0" : "rgba(255,255,255,.2)";
      });
      // Reset le timer auto (une seule fois — plus de double startInterval)
      startTimer();
    }

    function nextSlide() {
      goToSlide((currentSlide + 1) % slides.length);
    }

    // Démarrer l'auto-scroll
    startTimer();

    // Pause au hover (l'utilisateur lit)
    carousel.addEventListener("mouseenter", stopTimer);
    carousel.addEventListener("mouseleave", startTimer);

    // Swipe tactile (mobile)
    var touchStartX = 0;
    var touchStartY = 0;
    var isHorizontalSwipe = false;
    carousel.addEventListener("touchstart", function(e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      isHorizontalSwipe = false;
      stopTimer();
    }, { passive: true });
    carousel.addEventListener("touchmove", function(e) {
      // Détecter la direction du swipe pour ne pas bloquer le scroll vertical
      var dx = Math.abs(e.touches[0].clientX - touchStartX);
      var dy = Math.abs(e.touches[0].clientY - touchStartY);
      if (dx > dy && dx > 10) isHorizontalSwipe = true;
    }, { passive: true });
    carousel.addEventListener("touchend", function(e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (isHorizontalSwipe && Math.abs(diff) > 40) {
        if (diff > 0) goToSlide(Math.min(currentSlide + 1, slides.length - 1));
        else goToSlide(Math.max(currentSlide - 1, 0));
      } else {
        // Pas de swipe → relancer juste le timer
        startTimer();
      }
    }, { passive: true });
  }

  return W;
}


function renderAnalysis(a) {
  updateGoalBanner();
  if (EL.pTitle) EL.pTitle.textContent = a.productName || "Produit analysé";

  // Score compact
  if (EL.pScore && EL.pScoreFill && EL.pScoreLbl) {
    EL.pScore.style.display = "flex";
    var score = a.score || 5;
    var col = score >= 7 ? "#42C47E" : score >= 4 ? "#F5C842" : "#E8563A";
    EL.pScoreFill.style.width = "0%";
    EL.pScoreFill.style.background = col;
    setTimeout(function() { EL.pScoreFill.style.width = (score*10)+"%"; }, 80);
    EL.pScoreLbl.textContent = score+"/10";
    EL.pScoreLbl.style.color = col;
  }

  // Max 3 signals — uniquement les plus impactants
  if (EL.pBody) {
    EL.pBody.innerHTML = "";
    var signals = (a.signals || []).slice(0, 3);
    var sigFrag = document.createDocumentFragment();
    signals.forEach(function(s) {
      var card = mk("div"); card.className = "mrr-sig " + (s.impact || "neutre");
      var ico  = mk("div"); ico.className  = "mrr-sico"; ico.textContent = s.icon || "•";
      var info = mk("div");
      var tit  = mk("div"); tit.className  = "mrr-stit"; tit.textContent = s.title || "";
      var det  = mk("div"); det.className  = "mrr-sdet"; det.textContent = s.detail || "";
      info.appendChild(tit); info.appendChild(det);
      card.appendChild(ico); card.appendChild(info);
      sigFrag.appendChild(card);
    });
    EL.pBody.appendChild(sigFrag);

    // Alternative IA supprimée — les alternatives sont dans panel2
  }

  // ── PANEL 2 — Widget intercroissement ──
  if (EL.pCross) {
    EL.pCross.innerHTML = "";
    var crossWidgets = getCrossWidgets(PROFILE.ambitions || []);
    if (crossWidgets.length > 0) {
      var cw = crossWidgets[0];
      EL.pCross.appendChild(buildCrossWidget(cw.key, cw.data, a._productInfo || null));
      EL.pCross.style.display = "flex";
      EL.pCross.style.flexDirection = "column";
    } else {
      EL.pCross.style.display = "none";
    }
  }

  // ── PANEL 3 — Question miroir ──
  if (EL.pMirrorQ) {
    EL.pMirrorQ.innerHTML = "";
    if (a.mirrorQuestion) {
      var qRow = mk("div");
      qRow.style.cssText = "font-size:12px;font-style:italic;color:rgba(167,139,250,.85);line-height:1.5;text-align:center;";
      qRow.textContent = "« " + a.mirrorQuestion + " »";
      EL.pMirrorQ.appendChild(qRow);
      EL.pMirrorQ.style.display = "block";
    } else {
      EL.pMirrorQ.style.display = "none";
    }
  }

  if (EL.pQ)   EL.pQ.style.display   = "none";
  if (EL.pAlt) EL.pAlt.style.display = "none";
  // Actions panel masqué — les actions sont dans les widgets intercroissement
  if (EL.pAct) EL.pAct.style.display = "none";
}

function renderError(msg) {
  if (EL.pScore) EL.pScore.style.display = "none";
  if (EL.pAct)   EL.pAct.style.display   = "none";
  if (EL.pBody) {
    EL.pBody.innerHTML = "";
    var d = mk("div"); d.style.cssText = "padding:16px;text-align:center;font-size:12px;color:#6B6475;line-height:1.6;";
    d.textContent = msg || "Analyse impossible";
    EL.pBody.appendChild(d);
  }
}

// ─────────────────────────────────────────
// ANALYSE IA
// ─────────────────────────────────────────
function extractProduct(rule) {
  var title = "", price = "";
  (rule.titleSel || ["h1"]).some(function(sel) {
    var el = document.querySelector(sel);
    if (el && el.textContent.trim().length > 3) { title = el.textContent.trim().slice(0,120); return true; }
  });
  if (!title) title = document.title.slice(0,100);

  (rule.priceSel || []).some(function(sel) {
    var els = document.querySelectorAll(sel);
    for (var i=0; i<els.length; i++) {
      var t = els[i].textContent.trim();
      if (/[\d,\.]+\s*[€$£]/.test(t)) { price = t.slice(0,30); return true; }
    }
  });

  var desc = (document.querySelector('meta[name="description"]') || {getAttribute:function(){return "";}}).getAttribute("content") || "";
  if (!desc) { var p = document.querySelector("p"); if(p) desc = p.textContent.trim().slice(0,200); }

  var brand = window.location.hostname.replace("www.","").split(".")[0];
  var og = document.querySelector('meta[property="og:site_name"]');
  if (og) brand = og.getAttribute("content") || brand;

  return { title:title, price:price, description:desc.slice(0,300),
    brand:brand, site:window.location.hostname, category:rule.category||rule.label };
}

function runAnalysis() {
  if (!currentRule || analysisRunning) return;
  if (lastAnalyzedUrl === window.location.href) return;
  // Ne pas analyser sur les pages menu/accueil
  if (!isProductPage(currentRule)) return;

  if (!PROFILE.apiKey) {
    showPanel();
    renderError("🔑 Configure ta clé API Claude dans le popup Miroir pour activer l'analyse IA.");
    return;
  }

  analysisRunning = true;
  lastAnalyzedUrl = window.location.href;
  if (EL.avatar) EL.avatar.classList.add("scanning");

  showPanel();
  renderLoading();

  // Recharger le profil depuis storage pour avoir les derniers engagements sélectionnés
  chrome.storage.local.get("miroir_profile", function(data) {
    if (data && data.miroir_profile) {
      var p = data.miroir_profile;
      if (Array.isArray(p.ambitions)) PROFILE.ambitions = p.ambitions;
      if (Array.isArray(p.domains))   PROFILE.domains   = p.domains;
      if (p.lifePhrase)               PROFILE.lifePhrase= p.lifePhrase;
      if (p.apiKey)                   PROFILE.apiKey    = p.apiKey;
    }

  var currentProduct = extractProduct(currentRule);
  chrome.runtime.sendMessage({
    type: "ANALYZE_PRODUCT",
    product: currentProduct,
    ambitions: PROFILE.ambitions,
    passions: PROFILE.passions || [],
    lifePhrase: PROFILE.lifePhrase,
    url: window.location.href
  }, function(resp) {
    analysisRunning = false;
    if (EL.avatar) EL.avatar.classList.remove("scanning");

    if (!resp)                   { renderError("Erreur de communication."); return; }
    if (resp.error === "NO_KEY") { renderError("🔑 Configure ta clé API dans le popup."); return; }
    if (resp.error)              { renderError("Erreur API : " + resp.error); return; }

    if (resp.ok && resp.analysis) {
      analysisShown = true;
      // Enrichir l'analyse avec les infos produit + les alternatives IA générées
      resp.analysis._productInfo = currentProduct;
      // crossAlts générées par Claude — spécifiques au produit analysé
      if (resp.analysis.crossAlts && resp.analysis.crossAlts.length) {
        resp.analysis._productInfo._crossAlts = resp.analysis.crossAlts;
      }
      renderAnalysis(resp.analysis);
      // ── Journal : tracker cette interception ──
      trackInterception(resp.analysis, currentProduct);
      var v = resp.analysis.verdict;
      showBubble("ANALYSE IA",
        (v==="danger"?"⚠️ Attention à cet achat." : v==="attention"?"🤔 Quelques points à voir." : "✓ Cohérent.") +
        "  Score : " + resp.analysis.score + "/10", 5000);
    }
  });
  }); // fin storage.get
}

// ─────────────────────────────────────────
// INTERCEPT
// ─────────────────────────────────────────
var FALLBACK = {
  ecologie:{msg:"Fast fashion : CO₂ élevé, travailleurs exploités.",icon:"🌱"},
  epargne: {msg:"Achat impulsif = objectif épargne qui recule.",icon:"💰"},
  projet:  {msg:"Cet argent pourrait financer ton projet.",icon:"🚀"},
  voyage:  {msg:"Chaque achat impulsif repousse ton voyage.",icon:"🗺️"},
  sante:   {msg:"Est-ce vraiment bon pour toi ?",icon:"💪"},
  formation:{msg:"Ce budget pourrait financer ta formation.",icon:"📚"},
  impact:  {msg:"Quel impact ce choix a-t-il vraiment ?",icon:"🤝"},
  logement:{msg:"Chaque euro compte pour ton objectif logement.",icon:"🏠"}
};

// Génère un fallback pour un objectif custom
function getCustomFallback(customAmb) {
  return {
    msg: "Cet achat est-il cohérent avec ton objectif « " + customAmb.label + " » ?",
    icon: "✦"
  };
}

function openIntercept() {
  if (!EL.intercept) buildOverlay();
  if (!EL.intercept) return;

  EL.intercept.classList.remove("video-mode");
  EL.iConflicts.innerHTML = "";
  var added = 0;

  if (socialActive) {
    var amb = PROFILE.ambitions && PROFILE.ambitions[0];
    var AMB_MSG = {
      epargne:  { icon:"💰", lbl:"Liberté financière",  msg:"Ce temps = de l'énergie qui ne va pas vers ton objectif." },
      voyage:   { icon:"🗺️", lbl:"Voyager",             msg:"Chaque minute ici est une minute de moins à préparer ton voyage." },
      ecologie: { icon:"🌱", lbl:"Réduire mon impact",  msg:"Les algorithmes de scroll sont conçus pour te capturer." },
      projet:   { icon:"🚀", lbl:"Mon projet",          msg:"30 min de scroll = 30 min que ton projet n'avance pas." },
      formation:{ icon:"📚", lbl:"Me former",           msg:"Ce temps pourrait aller vers ta formation." },
      sante:    { icon:"💪", lbl:"Ma santé",            msg:"Le scroll passif augmente l'anxiété et fragmente le sommeil." },
      logement: { icon:"🏠", lbl:"Mon logement",        msg:"Chaque heure compte pour construire ta stabilité." },
      impact:   { icon:"🤝", lbl:"Avoir un impact",     msg:"Ce temps pourrait aller vers quelque chose qui compte vraiment." }
    };
    var eng = (amb && AMB_MSG[amb]) || null;
    // Objectif custom en premier si pas de standard
    if (!eng && PROFILE.customAmbitions && PROFILE.customAmbitions.length > 0) {
      var ca = PROFILE.customAmbitions[0];
      eng = { icon:"✦", lbl:ca.label, msg:"Ce temps de scroll ne fait pas avancer « " + ca.label + " »." };
    }
    eng = eng || { icon:"🪞", lbl:"Tes engagements", msg:"Est-ce que ce scroll t'apporte vraiment quelque chose ?" };
    var row = mk("div"); row.className = "mrr-ic";
    var ico = mk("div"); ico.className = "mrr-ic-ico"; ico.textContent = eng.icon;
    var body = mk("div");
    var lbl2 = mk("div"); lbl2.className = "mrr-ic-lbl"; lbl2.textContent = eng.lbl;
    var txt2 = mk("div"); txt2.className = "mrr-ic-txt"; txt2.textContent = eng.msg;
    body.appendChild(lbl2); body.appendChild(txt2);
    row.appendChild(ico); row.appendChild(body);
    EL.iConflicts.appendChild(row);
    EL.iSub.textContent = "15 secondes de scroll — rappelle-toi pourquoi tu es là.";
  } else {
    // Mode e-commerce — conflits avec ambitions standard
    var conflictFrag = document.createDocumentFragment();
    PROFILE.ambitions.forEach(function(amb) {
      if (added >= 3) return;
      var eng = (currentRule && currentRule.engagements && currentRule.engagements[amb]) || FALLBACK[amb];
      if (!eng) return;
      var row = mk("div"); row.className = "mrr-ic";
      var ico = mk("div"); ico.className = "mrr-ic-ico"; ico.textContent = eng.icon;
      var body = mk("div");
      var lbl = mk("div"); lbl.className = "mrr-ic-lbl"; lbl.textContent = ambLabel(amb);
      var txt = mk("div"); txt.className = "mrr-ic-txt"; txt.textContent = eng.msg;
      body.appendChild(lbl); body.appendChild(txt);
      row.appendChild(ico); row.appendChild(body);
      conflictFrag.appendChild(row);
      added++;
    });
    // Ajouter les objectifs custom
    if (PROFILE.customAmbitions && added < 3) {
      PROFILE.customAmbitions.forEach(function(ca) {
        if (added >= 3) return;
        var fb = getCustomFallback(ca);
        var row = mk("div"); row.className = "mrr-ic";
        var ico = mk("div"); ico.className = "mrr-ic-ico"; ico.textContent = fb.icon;
        var body = mk("div");
        var lbl = mk("div"); lbl.className = "mrr-ic-lbl"; lbl.textContent = ca.label;
        var txt = mk("div"); txt.className = "mrr-ic-txt"; txt.textContent = fb.msg;
        body.appendChild(lbl); body.appendChild(txt);
        row.appendChild(ico); row.appendChild(body);
        conflictFrag.appendChild(row);
        added++;
      });
    }
    if (added === 0) {
      var def = mk("div"); def.className = "mrr-ic";
      def.innerHTML = '<div class="mrr-ic-ico">🪞</div><div><div class="mrr-ic-lbl">Tes engagements</div><div class="mrr-ic-txt">Cet achat correspond-il à qui tu veux devenir ?</div></div>';
      conflictFrag.appendChild(def);
    }
    EL.iConflicts.appendChild(conflictFrag);
    EL.iSub.textContent = currentRule ? currentRule.label + " détecté · Ça vaut vraiment le coup ?" : "Ça vaut vraiment le coup ?";
  }

  // ── Coût d'opportunité en TEMPS (feature 2) ──
  // S'affiche si l'utilisateur a renseigné un taux horaire ET qu'un prix est détecté
  renderTimeCost();

  // ── Engagement hebdomadaire (feature 4) ──
  // S'affiche si l'utilisateur s'est engagé cette semaine sur ce domaine
  renderWeeklyCommitment();

  EL.iPhrase.textContent = PROFILE.lifePhrase || "Je veux construire une vie qui me ressemble.";
  EL.intercept.classList.add("show");
  if (EL.avatar) EL.avatar.style.opacity = "0";
  hideBubble();
  hidePanel();

  // ── Mode strict (feature 3) : délai 60s sur les verdicts "danger" ──
  maybeActivateStrictMode();
}

// ── Rendu du coût en temps (feature 2) ──
function renderTimeCost() {
  // Nettoyer ancien
  var old = document.getElementById("mrr-time-cost");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  if (!currentInterception || !currentInterception.priceNum) return;
  var price = currentInterception.priceNum;

  mrrJournalGet(function(j) {
    var rate = (j.settings && j.settings.hourlyRate) || 0;
    var refs = [];
    if (rate > 0) {
      var hours = price / rate;
      var hLabel = hours < 1
        ? Math.round(hours * 60) + " min de ton salaire"
        : hours.toFixed(hours < 10 ? 1 : 0) + " h de ton salaire";
      refs.push({ ico: "⏱️", txt: hLabel });
    }
    // Référence universelle indépendante du salaire : jours d'épicerie (~15€/jour = budget courses FR moyen)
    var daysEpicerie = price / 15;
    if (daysEpicerie >= 1) {
      refs.push({ ico: "🛒", txt: Math.round(daysEpicerie) + " jours d'épicerie" });
    }
    // Équivalent café/restau
    if (price >= 8) {
      var cafes = Math.round(price / 3);
      refs.push({ ico: "☕", txt: cafes + " cafés" });
    }
    if (refs.length === 0) return;

    var block = mk("div");
    block.id = "mrr-time-cost";
    block.style.cssText = "margin:10px 15px 0;padding:10px 12px;background:rgba(245,200,66,.08);border:1px solid rgba(245,200,66,.25);border-radius:10px;";
    var head = mk("div");
    head.style.cssText = "font-size:9px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#F5C842;margin-bottom:6px;";
    head.textContent = price + " € — coût réel";
    block.appendChild(head);
    var row = mk("div");
    row.style.cssText = "display:flex;flex-wrap:wrap;gap:6px;";
    refs.forEach(function(r) {
      var pill = mk("span");
      pill.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:4px 9px;background:rgba(245,200,66,.12);border-radius:12px;font-size:11px;color:#EDE9E0;";
      pill.innerHTML = "<span>" + r.ico + "</span><span>=" + r.txt + "</span>";
      row.appendChild(pill);
    });
    block.appendChild(row);

    // Insérer après iConflicts
    if (EL.iConflicts && EL.iConflicts.parentNode) {
      EL.iConflicts.parentNode.insertBefore(block, EL.iConflicts.nextSibling);
    }
  });
}

// ── Rendu de l'engagement hebdo (feature 4) ──
function renderWeeklyCommitment() {
  var old = document.getElementById("mrr-weekly-commit");
  if (old && old.parentNode) old.parentNode.removeChild(old);
  if (!currentRule) return;

  isCommittedAgainstCurrentSite(function(commit) {
    if (!commit) return;
    var block = mk("div");
    block.id = "mrr-weekly-commit";
    block.style.cssText = "margin:10px 15px 0;padding:10px 12px;background:rgba(167,139,250,.1);border:1.5px solid rgba(167,139,250,.4);border-radius:10px;display:flex;align-items:center;gap:10px;";
    var ico = mk("div");
    ico.style.cssText = "font-size:22px;flex-shrink:0;";
    ico.textContent = "🤝";
    var txt = mk("div");
    txt.style.cssText = "flex:1;";
    var head = mk("div");
    head.style.cssText = "font-size:10px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#A78BFA;margin-bottom:2px;";
    head.textContent = "Ton engagement de la semaine";
    var msg = mk("div");
    msg.style.cssText = "font-size:12px;color:#EDE9E0;line-height:1.4;";
    msg.textContent = "« " + (commit.label || ("Éviter " + currentRule.label)) + " »";
    txt.appendChild(head); txt.appendChild(msg);
    block.appendChild(ico); block.appendChild(txt);
    if (EL.iConflicts && EL.iConflicts.parentNode) {
      EL.iConflicts.parentNode.insertBefore(block, EL.iConflicts.nextSibling);
    }
  });
}

// ── Mode strict : délai 60s anti-achat impulsif (feature 3) ──
var strictTimerInterval = null;
function maybeActivateStrictMode() {
  if (strictTimerInterval) { clearInterval(strictTimerInterval); strictTimerInterval = null; }
  var old = document.getElementById("mrr-strict-timer");
  if (old && old.parentNode) old.parentNode.removeChild(old);

  mrrJournalGet(function(j) {
    var strict = j.settings && j.settings.strictModeEnabled;
    var isDanger = currentInterception && currentInterception.verdict === "danger";
    var isCommitted = false; // sera résolu ci-dessous

    // Vérifier aussi l'engagement hebdo (même sans strict global)
    isCommittedAgainstCurrentSite(function(commit) {
      isCommitted = !!commit;
      if (!strict && !isCommitted) return;
      if (!isDanger && !isCommitted) return; // strict = que sur danger ; engagement = sur tout

      // Désactiver le bouton "continuer"
      var btnMiroir = document.querySelector("#mrr-intercept .mrr-ibtn-r");
      if (!btnMiroir) return;
      var originalText = btnMiroir.textContent;
      btnMiroir.disabled = true;
      btnMiroir.style.opacity = "0.45";
      btnMiroir.style.cursor = "not-allowed";
      btnMiroir.style.pointerEvents = "none";

      // Créer le timer
      var timerEl = mk("div");
      timerEl.id = "mrr-strict-timer";
      timerEl.style.cssText = "margin:10px 15px 0;padding:12px;background:rgba(232,86,58,.1);border:1.5px solid rgba(232,86,58,.4);border-radius:10px;text-align:center;";
      var label = mk("div");
      label.style.cssText = "font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#E8563A;margin-bottom:4px;";
      label.textContent = isCommitted ? "⏳ Engagement actif — pause obligatoire" : "⏳ Pause obligatoire (mode strict)";
      var count = mk("div");
      count.style.cssText = "font-size:24px;font-weight:700;color:#EDE9E0;font-variant-numeric:tabular-nums;line-height:1;margin:4px 0;";
      count.textContent = "60s";
      var hint = mk("div");
      hint.style.cssText = "font-size:10px;color:#8A8494;line-height:1.4;";
      hint.textContent = "Prends une minute. Lis les alternatives.";
      timerEl.appendChild(label); timerEl.appendChild(count); timerEl.appendChild(hint);
      if (EL.iConflicts && EL.iConflicts.parentNode) {
        EL.iConflicts.parentNode.insertBefore(timerEl, EL.iConflicts.nextSibling);
      }

      var secondsLeft = 60;
      strictTimerInterval = setInterval(function() {
        secondsLeft--;
        count.textContent = secondsLeft + "s";
        if (secondsLeft <= 0) {
          clearInterval(strictTimerInterval);
          strictTimerInterval = null;
          btnMiroir.disabled = false;
          btnMiroir.style.opacity = "";
          btnMiroir.style.cursor = "pointer";
          btnMiroir.style.pointerEvents = "";
          btnMiroir.textContent = originalText;
          label.textContent = "✓ Pause terminée";
          label.style.color = "#42C47E";
          count.style.color = "#42C47E";
          count.textContent = "0s";
          hint.textContent = "Tu peux continuer si c'est vraiment ce que tu veux.";
        }
      }, 1000);
    });
  });
}

function closeIntercept() {
  if (EL.intercept) {
    EL.intercept.classList.remove("show");
    EL.intercept.classList.remove("video-mode");
  }
  if (EL.avatar) EL.avatar.style.opacity = "";
  // Nettoyer le timer strict si actif
  if (strictTimerInterval) { clearInterval(strictTimerInterval); strictTimerInterval = null; }
}

// ─────────────────────────────────────────
// MODAL TIRELIRE (v7.2)
// S'affiche après "Je résiste" quand un prix a été détecté
// ─────────────────────────────────────────
function openPiggyModal(amount, ambition) {
  // Ne pas ouvrir si montant invalide
  if (!amount || amount <= 0 || isNaN(amount)) { return false; }

  // Déterminer l'ambition cible (epargne par défaut si dispo)
  var ambPool = PROFILE.ambitions || [];
  var targetAmb = ambition ||
    (ambPool.indexOf("epargne") !== -1 ? "epargne" :
     ambPool.indexOf("voyage") !== -1 ? "voyage" :
     ambPool.indexOf("projet") !== -1 ? "projet" :
     ambPool.indexOf("logement") !== -1 ? "logement" :
     ambPool.indexOf("formation") !== -1 ? "formation" :
     ambPool[0] || "epargne");

  // Sauvegarder aussitôt dans la tirelire virtuelle
  var interceptionId = currentInterception ? currentInterception.id : null;
  addToPiggybank(targetAmb, amount, interceptionId);

  // Construire la modal si pas déjà fait
  buildPiggyModal();

  // Mettre à jour les valeurs
  if (EL_P.amount)      EL_P.amount.textContent = amount.toFixed(2).replace(/\.00$/, "") + " €";
  if (EL_P.ambLabel)    EL_P.ambLabel.textContent = ambLabel(targetAmb);
  EL_P.currentAmount = amount;
  EL_P.currentAmbition = targetAmb;

  // Routage selon préférence mémorisée de l'utilisateur
  // preferredMethod : "qr" | "manual" | null
  var pref = PROFILE.preferredTransferMethod;
  if (pref === "qr" && PROFILE.userIban && ibanIsValid(PROFILE.userIban)) {
    showQrStep();
  } else if (pref === "manual") {
    showManualStep();
  } else {
    showChoiceStep();
  }

  EL_P.overlay.classList.add("show");
  return true;
}

function closePiggyModal() {
  if (EL_P.overlay) EL_P.overlay.classList.remove("show");
}

var EL_P = {};

function buildPiggyModal() {
  if (EL_P.overlay) return;

  // CSS spécifique tirelire
  if (!document.getElementById("mrr-piggy-styles")) {
    var s = document.createElement("style");
    s.id = "mrr-piggy-styles";
    s.textContent = [
      "#mrr-piggy-overlay{all:initial;font-family:'DM Sans',system-ui,sans-serif;position:fixed;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;background:rgba(8,6,15,.75);backdrop-filter:blur(8px);opacity:0;transition:opacity .25s;}",
      "#mrr-piggy-overlay.show{opacity:1;display:flex;}",
      "#mrr-piggy-sheet{background:#100E1A;border:1px solid rgba(255,255,255,.1);border-radius:22px;box-shadow:0 20px 60px rgba(0,0,0,.6);padding:22px 22px 20px;width:calc(100vw - 40px);max-width:380px;max-height:90vh;overflow-y:auto;margin:20px;color:#EDE9E0;box-sizing:border-box;}",
      "#mrr-piggy-sheet::-webkit-scrollbar{width:3px;}#mrr-piggy-sheet::-webkit-scrollbar-thumb{background:rgba(255,255,255,.15);border-radius:2px;}",
      ".mrr-pg-title{font-family:Georgia,serif;font-size:19px;font-weight:700;line-height:1.3;margin-bottom:6px;color:#EDE9E0;}",
      ".mrr-pg-sub{font-size:12px;color:#6B6475;line-height:1.5;margin-bottom:16px;}",
      ".mrr-pg-badge{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;background:rgba(66,196,126,.15);border:1px solid rgba(66,196,126,.35);border-radius:20px;font-size:11px;font-weight:700;color:#42C47E;margin-bottom:12px;}",
      ".mrr-pg-amount-big{font-family:Georgia,serif;font-size:38px;font-weight:700;color:#42C47E;line-height:1;margin:4px 0;}",
      ".mrr-pg-amount-lbl{font-size:10px;color:#6B6475;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:14px;}",
      ".mrr-pg-field-lbl{font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#6B6475;margin-bottom:6px;}",
      ".mrr-pg-input{width:100%;background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;padding:10px 12px;font-size:13px;color:#EDE9E0;outline:none;font-family:monospace;letter-spacing:1px;box-sizing:border-box;transition:border-color .15s;}",
      ".mrr-pg-input:focus{border-color:rgba(232,86,58,.6);}",
      ".mrr-pg-input.err{border-color:#E85070;}",
      ".mrr-pg-hint{font-size:10px;color:#6B6475;margin-top:4px;line-height:1.4;}",
      ".mrr-pg-btn{display:block;width:100%;padding:12px;border:none;border-radius:11px;background:#E8563A;color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-top:12px;transition:opacity .15s;font-family:inherit;}",
      ".mrr-pg-btn:active{opacity:.8;}",
      ".mrr-pg-btn-g{background:#42C47E;}",
      ".mrr-pg-btn-sec{background:transparent;border:1.5px solid rgba(255,255,255,.12);color:#EDE9E0;}",
      ".mrr-pg-btn-sec:hover{border-color:rgba(255,255,255,.25);}",
      ".mrr-pg-btn-link{background:transparent;color:#6B6475;font-size:11px;font-weight:500;padding:8px;}",
      ".mrr-pg-btn-link:hover{color:#EDE9E0;}",
      ".mrr-pg-qrwrap{background:#fff;border-radius:14px;padding:12px;text-align:center;margin:10px 0;}",
      ".mrr-pg-qrwrap img{display:block;margin:0 auto;max-width:100%;height:auto;}",
      ".mrr-pg-iban-row{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:8px 10px;font-family:monospace;font-size:11px;color:#EDE9E0;letter-spacing:.5px;margin-top:6px;word-break:break-all;}",
      ".mrr-pg-prov-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:10px;}",
      ".mrr-pg-prov{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:9px 10px;text-decoration:none;color:#EDE9E0;font-size:12px;font-weight:600;cursor:pointer;transition:border-color .15s,background .15s;display:block;}",
      ".mrr-pg-prov:hover{border-color:rgba(232,86,58,.4);background:rgba(232,86,58,.05);}",
      ".mrr-pg-prov-desc{font-size:9px;color:#6B6475;font-weight:400;margin-top:2px;line-height:1.3;}",
      ".mrr-pg-close{position:absolute;top:14px;right:14px;width:28px;height:28px;border-radius:50%;border:none;background:rgba(255,255,255,.08);color:#EDE9E0;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;line-height:1;padding:0;}",
      ".mrr-pg-close:hover{background:rgba(255,255,255,.15);}",
      ".mrr-pg-section{margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06);}",
      // Choix (v7.2.1)
      ".mrr-pg-choice{display:flex;align-items:center;gap:12px;padding:13px;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);border-radius:12px;cursor:pointer;margin-top:8px;transition:border-color .15s,background .15s;}",
      ".mrr-pg-choice:hover{border-color:rgba(232,86,58,.5);background:rgba(232,86,58,.05);}",
      ".mrr-pg-choice-ico{font-size:24px;flex-shrink:0;width:36px;text-align:center;}",
      ".mrr-pg-choice-body{flex:1;min-width:0;}",
      ".mrr-pg-choice-title{font-size:13px;font-weight:700;color:#EDE9E0;margin-bottom:2px;}",
      ".mrr-pg-choice-desc{font-size:11px;color:#6B6475;line-height:1.4;}",
      ".mrr-pg-choice-arrow{color:#6B6475;font-size:18px;flex-shrink:0;}"
    ].join("\n");
    document.head.appendChild(s);
  }

  var overlay = mk("div"); overlay.id = "mrr-piggy-overlay"; EL_P.overlay = overlay;
  var sheet   = mk("div"); sheet.id   = "mrr-piggy-sheet"; sheet.style.position = "relative";

  var close = mk("button", {type:"button"}, "×");
  close.className = "mrr-pg-close";
  close.addEventListener("click", function() { closePiggyModal(); });
  sheet.appendChild(close);

  // Badge + montant + label ambition
  var badge = mk("div"); badge.className = "mrr-pg-badge"; badge.textContent = "✓ Résisté"; sheet.appendChild(badge);
  var amt = mk("div"); amt.className = "mrr-pg-amount-big"; amt.textContent = "—"; EL_P.amount = amt; sheet.appendChild(amt);
  var amblbl = mk("div"); amblbl.className = "mrr-pg-amount-lbl"; EL_P.ambLabel = amblbl; amblbl.textContent = "Épargne"; sheet.appendChild(amblbl);

  // Zone dynamique (change selon étape)
  var zone = mk("div"); EL_P.zone = zone; sheet.appendChild(zone);

  overlay.appendChild(sheet);
  document.documentElement.appendChild(overlay);

  // Clic hors de la sheet ferme
  overlay.addEventListener("click", function(e) {
    if (e.target === overlay) closePiggyModal();
  });
}

// ── Helper : mémoriser la méthode de transfert préférée ──
function savePreferredMethod(method) {
  chrome.storage.local.get("miroir_profile", function(data) {
    var p = data.miroir_profile || {};
    p.preferredTransferMethod = method;
    chrome.storage.local.set({ miroir_profile: p }, function() {
      PROFILE.preferredTransferMethod = method;
    });
  });
}

// ── ÉTAPE 0 : choisir la méthode (QR vs manuel vs tirelire) ──
function showChoiceStep() {
  EL_P.zone.innerHTML = "";

  var title = mk("div"); title.className = "mrr-pg-title";
  title.textContent = "Que fait-on avec ces " + EL_P.currentAmount.toFixed(0) + " € ?";
  EL_P.zone.appendChild(title);

  var sub = mk("div"); sub.className = "mrr-pg-sub";
  sub.textContent = "Choisis la façon qui te convient. Tu peux changer à tout moment.";
  EL_P.zone.appendChild(sub);

  // Option A — QR SEPA (prérempli)
  var optQr = mk("div");
  optQr.className = "mrr-pg-choice";
  optQr.innerHTML =
    '<div class="mrr-pg-choice-ico">🔳</div>'
    + '<div class="mrr-pg-choice-body">'
    +   '<div class="mrr-pg-choice-title">Virement prérempli (QR SEPA)</div>'
    +   '<div class="mrr-pg-choice-desc">Scanne avec ton app bancaire — montant et IBAN déjà remplis. Ultra rapide.</div>'
    + '</div>'
    + '<div class="mrr-pg-choice-arrow">→</div>';
  optQr.addEventListener("click", function() {
    if (PROFILE.userIban && ibanIsValid(PROFILE.userIban)) showQrStep();
    else showIbanStep();
  });
  EL_P.zone.appendChild(optQr);

  // Option B — manuel avec confirmation sur l'honneur
  var optManual = mk("div");
  optManual.className = "mrr-pg-choice";
  optManual.innerHTML =
    '<div class="mrr-pg-choice-ico">✋</div>'
    + '<div class="mrr-pg-choice-body">'
    +   '<div class="mrr-pg-choice-title">Je le fais moi-même</div>'
    +   '<div class="mrr-pg-choice-desc">Pas d\'IBAN à saisir. Tu ouvres ton app et tu confirmes ensuite.</div>'
    + '</div>'
    + '<div class="mrr-pg-choice-arrow">→</div>';
  optManual.addEventListener("click", showManualStep);
  EL_P.zone.appendChild(optManual);

  // Option C — tirelire virtuelle
  var optPiggy = mk("div");
  optPiggy.className = "mrr-pg-choice";
  optPiggy.innerHTML =
    '<div class="mrr-pg-choice-ico">🐷</div>'
    + '<div class="mrr-pg-choice-body">'
    +   '<div class="mrr-pg-choice-title">Juste noter en tirelire</div>'
    +   '<div class="mrr-pg-choice-desc">Ajoute le montant à ton compteur Miroir. Tu transféreras plus tard.</div>'
    + '</div>'
    + '<div class="mrr-pg-choice-arrow">→</div>';
  optPiggy.addEventListener("click", function() {
    showBubble("✓ TIRELIRE", EL_P.currentAmount.toFixed(0) + "€ ajoutés à ta tirelire " + ambLabel(EL_P.currentAmbition), 4000);
    closePiggyModal();
    closeInterceptAndTab();
  });
  EL_P.zone.appendChild(optPiggy);
}

// ── ÉTAPE MANUELLE : pas d'IBAN, juste ouvrir l'app + confirmer ──
function showManualStep() {
  EL_P.zone.innerHTML = "";

  var title = mk("div"); title.className = "mrr-pg-title";
  title.textContent = "Ouvre ton app et fais le virement.";
  EL_P.zone.appendChild(title);

  var sub = mk("div"); sub.className = "mrr-pg-sub";
  sub.textContent = "Choisis ton app — elle s'ouvre dans un onglet. Fais le virement de " + EL_P.currentAmount.toFixed(0) + "€ vers ton livret, puis reviens confirmer ici.";
  EL_P.zone.appendChild(sub);

  // Grille des providers
  var grid = mk("div"); grid.className = "mrr-pg-prov-grid";
  grid.style.marginTop = "0";
  BANK_PROVIDERS.forEach(function(p) {
    var a = mk("a"); a.className = "mrr-pg-prov"; a.href = p.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.innerHTML = p.lbl + '<div class="mrr-pg-prov-desc">' + p.desc + '</div>';
    a.addEventListener("click", function() {
      // Juste ouvrir le lien — on ne marque pas encore le transfert
      // L'utilisateur reviendra cliquer "✓ C'est fait"
      EL_P.lastProviderId = p.id;
      if (EL_P.confirmBtn) {
        EL_P.confirmBtn.textContent = "✓ C'est fait — j'ai viré dans " + p.lbl.replace(/^[^\s]+\s/, "");
        EL_P.confirmBtn.style.background = "#42C47E";
        EL_P.confirmBtn.style.opacity = "1";
        EL_P.confirmBtn.disabled = false;
      }
    });
    grid.appendChild(a);
  });
  EL_P.zone.appendChild(grid);

  // Séparateur
  var sep = mk("div");
  sep.style.cssText = "margin:14px 0 0;padding-top:12px;border-top:1px solid rgba(255,255,255,.06);";
  EL_P.zone.appendChild(sep);

  // Bouton de confirmation sur l'honneur
  var lbl = mk("div"); lbl.className = "mrr-pg-field-lbl";
  lbl.textContent = "Une fois le virement fait";
  sep.appendChild(lbl);

  var btnDone = mk("button", {type:"button"}, "✓ C'est fait — j'ai viré les " + EL_P.currentAmount.toFixed(0) + "€");
  btnDone.className = "mrr-pg-btn mrr-pg-btn-g";
  btnDone.style.marginTop = "6px";
  EL_P.confirmBtn = btnDone;
  btnDone.addEventListener("click", function() {
    recordPiggybankTransfer(EL_P.currentAmbition, EL_P.currentAmount, EL_P.lastProviderId || "manual");
    showBubble("✓ TRANSFÉRÉ", EL_P.currentAmount.toFixed(0) + "€ déplacés vers ton livret. Bravo.", 4000);
    closePiggyModal();
    closeInterceptAndTab();
  });
  sep.appendChild(btnDone);

  // Checkbox "retenir ce choix"
  var rememberWrap = mk("label");
  rememberWrap.style.cssText = "display:flex;align-items:center;gap:7px;margin-top:10px;font-size:11px;color:#6B6475;cursor:pointer;user-select:none;";
  var rememberCb = mk("input"); rememberCb.type = "checkbox"; rememberCb.style.cssText = "width:14px;height:14px;accent-color:#E8563A;cursor:pointer;margin:0;";
  rememberCb.addEventListener("change", function() {
    savePreferredMethod(rememberCb.checked ? "manual" : null);
  });
  var rememberTxt = mk("span"); rememberTxt.textContent = "Toujours utiliser cette méthode";
  rememberWrap.appendChild(rememberCb); rememberWrap.appendChild(rememberTxt);
  sep.appendChild(rememberWrap);

  // Lien retour
  var linkBack = mk("button", {type:"button"}, "← Autres options");
  linkBack.className = "mrr-pg-btn mrr-pg-btn-link";
  linkBack.addEventListener("click", showChoiceStep);
  EL_P.zone.appendChild(linkBack);

  // Lien "Plus tard" fallback
  var linkLater = mk("button", {type:"button"}, "Plus tard — juste garder en tirelire");
  linkLater.className = "mrr-pg-btn mrr-pg-btn-link";
  linkLater.addEventListener("click", function() {
    showBubble("✓ TIRELIRE", EL_P.currentAmount.toFixed(0) + "€ ajoutés à ta tirelire", 4000);
    closePiggyModal();
    closeInterceptAndTab();
  });
  EL_P.zone.appendChild(linkLater);
}

// ── ÉTAPE 1 : demander l'IBAN si pas encore fourni ──
function showIbanStep() {
  EL_P.zone.innerHTML = "";

  var title = mk("div"); title.className = "mrr-pg-title"; title.textContent = "Transfère-les sur ton livret."; EL_P.zone.appendChild(title);
  var sub   = mk("div"); sub.className = "mrr-pg-sub"; sub.textContent = "Miroir génère un virement scannable avec ton app bancaire. Renseigne une fois ton IBAN, il ne quitte jamais ton appareil."; EL_P.zone.appendChild(sub);

  // Input IBAN
  var lblIban = mk("div"); lblIban.className = "mrr-pg-field-lbl"; lblIban.textContent = "Ton IBAN (livret, compte épargne)"; EL_P.zone.appendChild(lblIban);
  var inputIban = mk("input"); inputIban.className = "mrr-pg-input"; inputIban.type = "text"; inputIban.placeholder = "FR76 1234 5678 9012 3456 7890 123"; inputIban.autocomplete = "off"; inputIban.spellcheck = false;
  EL_P.zone.appendChild(inputIban);
  var hintIban = mk("div"); hintIban.className = "mrr-pg-hint"; hintIban.textContent = "Format SEPA · stocké uniquement sur ton appareil"; EL_P.zone.appendChild(hintIban);

  // Input nom
  var lblName = mk("div"); lblName.className = "mrr-pg-field-lbl"; lblName.style.marginTop = "12px"; lblName.textContent = "Nom du bénéficiaire (toi)"; EL_P.zone.appendChild(lblName);
  var inputName = mk("input"); inputName.className = "mrr-pg-input"; inputName.type = "text"; inputName.placeholder = "Prénom Nom"; inputName.style.fontFamily = "inherit"; inputName.style.letterSpacing = "0";
  inputName.value = PROFILE.userIbanName || "";
  EL_P.zone.appendChild(inputName);

  // Bouton valider
  var btn = mk("button", {type:"button"}, "Continuer →");
  btn.className = "mrr-pg-btn";
  btn.addEventListener("click", function() {
    var ibanVal = inputIban.value.trim();
    var nameVal = inputName.value.trim();
    if (!ibanIsValid(ibanVal)) {
      inputIban.classList.add("err");
      hintIban.style.color = "#E85070";
      hintIban.textContent = "⚠️ IBAN invalide — vérifie la saisie";
      return;
    }
    if (!nameVal || nameVal.length < 2) {
      inputName.classList.add("err");
      return;
    }
    saveIban(ibanVal, nameVal, function() {
      showQrStep();
    });
  });
  EL_P.zone.appendChild(btn);

  // Lien retour au menu (sans saisie)
  var linkBack = mk("button", {type:"button"}, "← Je préfère faire sans IBAN");
  linkBack.className = "mrr-pg-btn mrr-pg-btn-link";
  linkBack.addEventListener("click", showManualStep);
  EL_P.zone.appendChild(linkBack);

  // Lien "plus tard"
  var linkLater = mk("button", {type:"button"}, "Plus tard — juste garder en tirelire");
  linkLater.className = "mrr-pg-btn mrr-pg-btn-link";
  linkLater.addEventListener("click", function() {
    showBubble("✓ TIRELIRE", EL_P.currentAmount.toFixed(0) + "€ ajoutés à ta tirelire " + ambLabel(EL_P.currentAmbition), 4000);
    closePiggyModal();
    // Fermer l'onglet comme avant
    closeInterceptAndTab();
  });
  EL_P.zone.appendChild(linkLater);
}

// ── ÉTAPE 2 : afficher le QR + manuel ──
function showQrStep() {
  EL_P.zone.innerHTML = "";

  var title = mk("div"); title.className = "mrr-pg-title"; title.textContent = "Scanne et transfère."; EL_P.zone.appendChild(title);
  var sub   = mk("div"); sub.className = "mrr-pg-sub"; sub.textContent = "Scanne ce QR code avec ton app bancaire. Le virement est prérempli. Tu confirmes dans ton app."; EL_P.zone.appendChild(sub);

  // Générer le QR
  var epcPayload = buildEpcPayload(
    PROFILE.userIban,
    PROFILE.userIbanName,
    EL_P.currentAmount,
    "Miroir — " + ambLabel(EL_P.currentAmbition)
  );
  var qrSrc = qrUrlFromText(epcPayload);

  var qrWrap = mk("div"); qrWrap.className = "mrr-pg-qrwrap";
  var qrImg = mk("img"); qrImg.src = qrSrc; qrImg.alt = "QR SEPA"; qrImg.width = 220; qrImg.height = 220;
  qrImg.onerror = function() {
    qrWrap.innerHTML = '<div style="padding:30px 15px;text-align:center;color:#666;font-size:12px;">⚠️ QR indisponible.<br>Utilise le virement manuel ci-dessous.</div>';
  };
  qrWrap.appendChild(qrImg);
  EL_P.zone.appendChild(qrWrap);

  // Rappel IBAN (masqué) avec bouton changer
  var ibanRow = mk("div"); ibanRow.className = "mrr-pg-iban-row";
  ibanRow.style.display = "flex"; ibanRow.style.alignItems = "center"; ibanRow.style.justifyContent = "space-between"; ibanRow.style.gap = "8px";
  var ibanTxt = mk("span"); ibanTxt.textContent = "→ " + ibanMasked(PROFILE.userIban);
  var ibanChange = mk("button", {type:"button"}, "Changer");
  ibanChange.style.cssText = "background:transparent;border:none;color:#E8563A;font-size:10px;font-weight:600;cursor:pointer;padding:0;font-family:inherit;";
  ibanChange.addEventListener("click", showIbanStep);
  ibanRow.appendChild(ibanTxt); ibanRow.appendChild(ibanChange);
  EL_P.zone.appendChild(ibanRow);

  // Bouton "transfert fait"
  var btnDone = mk("button", {type:"button"}, "✓ C'est fait — virement envoyé");
  btnDone.className = "mrr-pg-btn mrr-pg-btn-g";
  btnDone.addEventListener("click", function() {
    recordPiggybankTransfer(EL_P.currentAmbition, EL_P.currentAmount, "qr_sepa");
    showBubble("✓ TRANSFÉRÉ", EL_P.currentAmount.toFixed(0) + "€ déplacés vers ton livret. Bravo.", 4000);
    closePiggyModal();
    closeInterceptAndTab();
  });
  EL_P.zone.appendChild(btnDone);

  // Section manuelle
  var section = mk("div"); section.className = "mrr-pg-section";
  var secTitle = mk("div"); secTitle.className = "mrr-pg-field-lbl"; secTitle.textContent = "Ou ouvre manuellement ton app"; section.appendChild(secTitle);

  var grid = mk("div"); grid.className = "mrr-pg-prov-grid";
  BANK_PROVIDERS.forEach(function(p) {
    var a = mk("a"); a.className = "mrr-pg-prov"; a.href = p.url; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.innerHTML = p.lbl + '<div class="mrr-pg-prov-desc">' + p.desc + '</div>';
    a.addEventListener("click", function() {
      recordPiggybankTransfer(EL_P.currentAmbition, EL_P.currentAmount, p.id);
      setTimeout(function() {
        showBubble("✓ TRANSFERT ENCOURS", "N'oublie pas de faire le virement de " + EL_P.currentAmount.toFixed(0) + "€ dans " + p.lbl, 5000);
        closePiggyModal();
      }, 400);
    });
    grid.appendChild(a);
  });
  section.appendChild(grid);
  EL_P.zone.appendChild(section);

  // Checkbox "retenir ce choix"
  var rememberWrap = mk("label");
  rememberWrap.style.cssText = "display:flex;align-items:center;gap:7px;margin-top:12px;font-size:11px;color:#6B6475;cursor:pointer;user-select:none;";
  var rememberCb = mk("input"); rememberCb.type = "checkbox"; rememberCb.style.cssText = "width:14px;height:14px;accent-color:#E8563A;cursor:pointer;margin:0;";
  rememberCb.checked = PROFILE.preferredTransferMethod === "qr";
  rememberCb.addEventListener("change", function() {
    savePreferredMethod(rememberCb.checked ? "qr" : null);
  });
  var rememberTxt = mk("span"); rememberTxt.textContent = "Toujours utiliser le QR SEPA";
  rememberWrap.appendChild(rememberCb); rememberWrap.appendChild(rememberTxt);
  EL_P.zone.appendChild(rememberWrap);

  // Retour au menu
  var linkBack = mk("button", {type:"button"}, "← Autres options");
  linkBack.className = "mrr-pg-btn mrr-pg-btn-link";
  linkBack.addEventListener("click", showChoiceStep);
  EL_P.zone.appendChild(linkBack);

  // Plus tard
  var linkLater = mk("button", {type:"button"}, "Plus tard — juste garder en tirelire");
  linkLater.className = "mrr-pg-btn mrr-pg-btn-link";
  linkLater.addEventListener("click", function() {
    showBubble("✓ TIRELIRE", EL_P.currentAmount.toFixed(0) + "€ ajoutés à ta tirelire", 4000);
    closePiggyModal();
    closeInterceptAndTab();
  });
  EL_P.zone.appendChild(linkLater);
}

// Helper pour fermer l'onglet (factorisation de l'ancien comportement)
function closeInterceptAndTab() {
  if (socialActive) {
    showBubble("✓ RÉSISTANCE", "Bien joué. Ton futur toi te remercie.", 3500);
  } else {
    setTimeout(function() {
      window.close();
      setTimeout(function() { window.location.href = "about:blank"; }, 300);
    }, 800);
  }
}

// ─────────────────────────────────────────
// BUILD DOM — tout en createElement, events sur références directes
// ─────────────────────────────────────────
function buildOverlay() {
  if (overlayBuilt) return;
  overlayBuilt = true;
  console.log("[Miroir] buildOverlay() démarré sur", window.location.hostname);

  // CSS (peut être bloqué par CSP stricte — les styles inline restent en fallback)
  try {
    if (document.head) {
      var style = mk("style"); style.id = "mrr-styles"; style.textContent = CSS;
      document.head.appendChild(style);
    } else {
      console.warn("[Miroir] document.head absent — CSS injecté en fallback via setAttribute");
    }
  } catch(e) {
    console.warn("[Miroir] Impossible d'injecter le CSS (CSP) :", e.message);
  }

  // ── ROOT
  var root = mk("div"); root.id = "mrr-root";
  root.style.cssText = "all:initial;font-family:'DM Sans',system-ui,sans-serif;position:fixed;bottom:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;align-items:flex-end;gap:8px;pointer-events:none;";

  // ── PANEL WRAP — conteneur des 3 panels séparés
  var panelWrap = mk("div"); panelWrap.id = "mrr-panel-wrap"; EL.panel = panelWrap;

  // ── PANEL 1 — Header + Objectif + Score + Signaux
  var panel1 = mk("div"); panel1.id = "mrr-panel1"; EL.panel1 = panel1;

  var ph = mk("div"); ph.id = "mrr-ph";
  var pt = mk("div"); pt.id = "mrr-pt"; pt.textContent = "Analyse du produit"; EL.pTitle = pt;
  var pc = mk("button",{type:"button"},"✕"); pc.id = "mrr-pc"; EL.pClose = pc;
  pc.addEventListener("click", function(e) { e.preventDefault(); e.stopPropagation(); hidePanel(); });
  ph.appendChild(pt); ph.appendChild(pc);

  // ── BANNIÈRE OBJECTIF (zone orange) ──
  var pgoal = mk("div"); pgoal.id = "mrr-pgoal"; EL.pGoal = pgoal;
  var pgoalIco  = mk("div"); pgoalIco.id  = "mrr-pgoal-ico"; EL.pGoalIco = pgoalIco;
  var pgoalBody = mk("div"); pgoalBody.id = "mrr-pgoal-body";
  var pgoalLbl  = mk("div"); pgoalLbl.id  = "mrr-pgoal-lbl"; pgoalLbl.textContent = "TON OBJECTIF";
  var pgoalTxt  = mk("div"); pgoalTxt.id  = "mrr-pgoal-txt"; EL.pGoalTxt = pgoalTxt;
  pgoalBody.appendChild(pgoalLbl); pgoalBody.appendChild(pgoalTxt);
  pgoal.appendChild(pgoalIco); pgoal.appendChild(pgoalBody);

  var ps = mk("div"); ps.id = "mrr-ps"; ps.style.display = "none"; EL.pScore = ps;
  var psLbl = mk("span"); psLbl.textContent = "Score d'alignement"; psLbl.style.cssText = "font-size:11px;color:#6B6475;";
  var sbar = mk("div"); sbar.className = "mrr-sbar";
  var sfill = mk("div"); sfill.className = "mrr-sfill"; sfill.style.width = "0%"; EL.pScoreFill = sfill;
  sbar.appendChild(sfill);
  var sl = mk("span"); sl.id = "mrr-sl"; sl.textContent = "–"; EL.pScoreLbl = sl;
  ps.appendChild(psLbl); ps.appendChild(sbar); ps.appendChild(sl);

  var pb = mk("div"); pb.id = "mrr-pb"; EL.pBody = pb;

  panel1.appendChild(ph); panel1.appendChild(pgoal); panel1.appendChild(ps); panel1.appendChild(pb);

  // ── PANEL 2 — Widget intercroissement (séparé visuellement)
  var panel2 = mk("div"); panel2.id = "mrr-panel2"; EL.pCross = panel2;

  // ── PANEL 3 — Question miroir
  var panel3 = mk("div"); panel3.id = "mrr-panel3"; EL.pMirrorQ = panel3;

  // Anciens éléments (cachés, conservés pour compat)
  var pq = mk("div"); pq.id = "mrr-pq"; pq.style.display = "none"; EL.pQ = pq;
  var palt = mk("div"); palt.id = "mrr-pa"; palt.style.display = "none"; EL.pAlt = palt;
  var paltLbl = mk("div"); paltLbl.id = "mrr-pa-lbl"; EL.pAltLbl = paltLbl;
  var paltTxt = mk("div"); paltTxt.id = "mrr-pa-txt"; EL.pAltTxt = paltTxt;
  palt.appendChild(paltLbl); palt.appendChild(paltTxt);
  var pact = mk("div"); pact.id = "mrr-pact"; pact.style.display = "none"; EL.pAct = pact;

  panelWrap.appendChild(panel1);
  panelWrap.appendChild(panel2);
  panelWrap.appendChild(panel3);
  root.appendChild(panelWrap);

  // ── ANIMAL
  var pet = mk("div"); pet.id = "mrr-pet";

  var bubble = mk("div"); bubble.id = "mrr-bubble"; EL.bubble = bubble;
  var bLbl = mk("div"); bLbl.id = "mrr-bubble-lbl"; bLbl.textContent = "MIROIR"; EL.bubbleLbl = bLbl;
  var bTxt = mk("div"); EL.bubbleTxt = bTxt;
  bubble.appendChild(bLbl); bubble.appendChild(bTxt);
  pet.appendChild(bubble);

  // Avatar dans un wrapper indépendant (position:fixed animable)
  var avatarWrap = mk("div"); avatarWrap.id = "mrr-avatar-wrap"; EL.avatarWrap = avatarWrap;
  // Styles critiques en inline (fallback si le CSP de la page bloque notre <style>)
  avatarWrap.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:2147483647;display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:auto;";

  // Bulle de patrouille (dark pattern)
  var patrolBubble = mk("div"); patrolBubble.id = "mrr-patrol-bubble"; EL.patrolBubble = patrolBubble;
  var patrolLbl = mk("div"); patrolLbl.id = "mrr-patrol-lbl"; EL.patrolLbl = patrolLbl;
  var patrolTxt = mk("div"); patrolTxt.id = "mrr-patrol-txt"; EL.patrolTxt = patrolTxt;
  patrolBubble.appendChild(patrolLbl); patrolBubble.appendChild(patrolTxt);

  var avatar = mk("div"); avatar.id = "mrr-avatar"; EL.avatar = avatar;
  var avatarImg = mk("img");
  avatarImg.src = chrome.runtime.getURL("icons/mascot.gif");
  avatarImg.style.cssText = "width:90px;height:90px;image-rendering:pixelated;";
  // Fallback si la CSP de la page bloque chrome-extension:// → afficher un cercle coloré
  avatarImg.onerror = function() {
    avatarImg.style.display = "none";
    avatar.style.cssText += "width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#E8563A,#F5C842);box-shadow:0 4px 16px rgba(232,86,58,.5);";
  };
  avatar.appendChild(avatarImg);
  avatarWrap.appendChild(patrolBubble);
  avatarWrap.appendChild(avatar);
  avatar.addEventListener("click", function() {
    if (EL.intercept && EL.intercept.classList.contains("show")) { closeIntercept(); return; }
    if (EL.panel && EL.panel.classList.contains("show")) { hidePanel(); return; }
    if (EL_AI.panel && EL_AI.panel.classList.contains("show")) { hideAIPanel(); return; }
    if (bubbleVisible) { hideBubble(); return; }
    // Mode social → afficher bilan temps ou ouvrir Miroir
    if (socialActive) {
      var ambStr = PROFILE.ambitions.length ? PROFILE.ambitions[0] : "ton objectif";
      var AMB_LABELS = {epargne:"ta liberté financière",voyage:"ton voyage",ecologie:"ton impact",
        projet:"ton projet",formation:"ta formation",sante:"ta santé",logement:"ton logement",impact:"ton impact"};
      var lbl = AMB_LABELS[ambStr] || ambStr;
      showBubble("TEMPS PASSÉ", fmtTime(socialSeconds) + " de scroll. Pendant ce temps, " + lbl + " attend.", 5000);
      return;
    }
    // Page info → esprit critique
    if (PROFILE.ambitions.indexOf("esprit_critique") !== -1 && isInfoPage()) {
      showAIPanel(); return;
    }
    // Page produit → analyse IA
    if (currentRule && !analysisShown && !analysisRunning) { runAnalysis(); }
    else if (analysisShown) { showPanel(); }
    else { showBubble("MIROIR","Clic pour analyser ce produit ✦",3000); }
  });

  root.appendChild(pet);
  document.body.appendChild(root);
  document.body.appendChild(avatarWrap);

  // ── INTERCEPT (dans body directement)
  var intercept = mk("div"); intercept.id = "mrr-intercept"; EL.intercept = intercept;

  var isheet = mk("div"); isheet.id = "mrr-isheet";
  var ihandle = mk("div"); ihandle.id = "mrr-ihandle";

  // Compagnon numérique centré
  var iCompanion = mk("div"); iCompanion.id = "mrr-companion";
  var iCompanionImg = mk("img");
  iCompanionImg.src = chrome.runtime.getURL("icons/mascot.gif");
  iCompanionImg.style.cssText = "width:160px;height:160px;image-rendering:pixelated;";
  iCompanion.appendChild(iCompanionImg);

  var ihdr = mk("div"); ihdr.id = "mrr-ihdr";
  var ihdrInfo = mk("div");
  var ihdrTitle = mk("div"); ihdrTitle.id = "mrr-ihdr-title"; ihdrTitle.textContent = "Avant de continuer.";
  var ihdrSub = mk("div"); ihdrSub.id = "mrr-ihdr-sub"; ihdrSub.textContent = "Ça vaut vraiment le coup ?"; EL.iSub = ihdrSub;
  ihdrInfo.appendChild(ihdrTitle); ihdrInfo.appendChild(ihdrSub);
  ihdr.appendChild(ihdrInfo);

  var iConflicts = mk("div"); iConflicts.id = "mrr-iconfls"; EL.iConflicts = iConflicts;
  var iPhrase = mk("div"); iPhrase.id = "mrr-iphrase"; EL.iPhrase = iPhrase;

  var iBtnMiroir = mk("button",{type:"button"},"Voir ce que ça représente →");
  iBtnMiroir.className = "mrr-ibtn mrr-ibtn-r";
  iBtnMiroir.addEventListener("click", function(e) {
    e.preventDefault(); e.stopPropagation();
    recordDecision("continued"); // l'utilisateur explore mais ne ferme pas
    closeIntercept();
    window.open("https://th20-art.github.io/mirror-page/?intercept", "_blank");
  });

  var iBtnDismiss = mk("button",{type:"button"},"✓ Fermer sans regarder — je résiste");
  iBtnDismiss.className = "mrr-ibtn mrr-ibtn-g";
  iBtnDismiss.addEventListener("click", function(e) {
    e.preventDefault(); e.stopPropagation();
    recordDecision("abandoned"); // victoire : abandon de l'achat
    closeIntercept();

    // ── Nouveau v7.2 : si un prix est détecté, proposer de mettre de côté ──
    var priceNum = currentInterception ? currentInterception.priceNum : 0;
    if (!socialActive && priceNum > 0 && priceNum < 10000) {
      showBubble("✓ RÉSISTANCE", "Bien joué. Maintenant, que fait-on des " + priceNum.toFixed(0) + "€ ?", 2500);
      setTimeout(function() {
        openPiggyModal(priceNum);
      }, 500);
      return;
    }

    // Comportement legacy sans prix détecté
    if (socialActive) {
      showBubble("✓ RÉSISTANCE","Bien joué. Ton futur toi te remercie.",3500);
    } else {
      showBubble("✓ RÉSISTANCE","Bien joué. Fermeture de la page…",1500);
      setTimeout(function() {
        window.close();
        setTimeout(function() {
          window.location.href = "about:blank";
        }, 300);
      }, 1600);
    }
  });

  isheet.appendChild(iCompanion); isheet.appendChild(ihandle); isheet.appendChild(ihdr); isheet.appendChild(iConflicts);
  isheet.appendChild(iPhrase); isheet.appendChild(iBtnMiroir); isheet.appendChild(iBtnDismiss);
  intercept.appendChild(isheet);

  // iframe pour la vidéo en mode social (chargée à la demande)
  var iframe = mk("iframe", {id:"mrr-video-frame", allow:"camera; microphone; autoplay", sandbox:"allow-scripts allow-same-origin allow-popups allow-forms"});
  EL.videoFrame = iframe;
  intercept.appendChild(iframe);

  // Pas de fermeture sur clic fond — l'utilisateur doit choisir un bouton
  // intercept.addEventListener("click", ...) supprimé intentionnellement

  document.body.appendChild(intercept);
  console.log("[Miroir] Éléments injectés dans le DOM ✓ (avatarWrap:", !!EL.avatarWrap, "intercept:", !!EL.intercept, "bodyContains:", document.body.contains(EL.avatarWrap), ")");

  // Activer immédiatement la surveillance anti-suppression (SPA YouTube etc.)
  guardOverlayOnSPA();

  // Démarrage automatique
  setTimeout(function() {
    // Mode réseaux sociaux — pas d'analyse produit, juste confirmer le chrono
    if (socialActive) {
      showBubble("TEMPS", "Chrono démarré. Je te préviens si tu scrolles trop.", 4000);
      return;
    }
    // Mode esprit critique sur pages d'information
    if (PROFILE.ambitions.indexOf("esprit_critique") !== -1 && isInfoPage()) {
      showBubble("ESPRIT CRITIQUE", "🧠 Clique pour vérifier la fiabilité de cette page.", 6000);
      return;
    }
    if (!currentRule) return;
    if (!isProductPage(currentRule)) {
      showBubble("MIROIR","Je surveille ce site. Clique pour analyser un produit.",5000);
      return;
    }
    if (PROFILE.apiKey && !analysisShown && !analysisRunning) {
      showBubble("MIROIR","J'analyse ce produit pour toi…",-1);
      runAnalysis();
    } else if (!PROFILE.apiKey) {
      showBubble("MIROIR","🔑 Ajoute ta clé API dans le popup pour activer l'analyse IA.",7000);
    }
  }, 2000);
}

// ─────────────────────────────────────────
// SURVEILLANCE BOUTONS ACHAT
// ─────────────────────────────────────────
function watchCartButtons(rule) {
  if (cartWatching) return;
  cartWatching = true;
  var BTN = rule.cartBtns || ["commander","valider","checkout","buy now","acheter","payer"];

  function attach() {
    document.querySelectorAll('button,a,[role="button"],input[type="submit"],input[type="button"]').forEach(function(el) {
      if (el.dataset.mrrWatched) return;
      var txt = (el.textContent || el.value || el.getAttribute("aria-label") || "").toLowerCase().trim();
      if (BTN.some(function(t){ return txt.indexOf(t) !== -1; })) {
        el.dataset.mrrWatched = "1";
        el.addEventListener("click", function(e) {
          e.preventDefault(); e.stopImmediatePropagation();
          openIntercept();
        }, true);
      }
    });
  }
  attach();
  new MutationObserver(attach).observe(document.body, {childList:true, subtree:true});
}

// ─────────────────────────────────────────
// DÉTECTION — sites connus + détection universelle
// ─────────────────────────────────────────

// ═══════════════════════════════════════════
// MODULE ESPRIT CRITIQUE — recherche web via Claude
// ═══════════════════════════════════════════

var aiPanelBuilt = false;
var aiSearchRunning = false;
var EL_AI = {};

// Extraire le sujet principal de la page
function extractPageSubject() {
  // Titre H1 ou titre de page
  var h1 = document.querySelector("h1");
  var title = h1 ? h1.textContent.trim() : document.title.trim();
  // Nettoyer : enlever le nom du site souvent en fin de titre
  title = title.replace(/\s[\|\-–—]\s.{1,40}$/, "").trim();
  // Description meta
  var meta = document.querySelector('meta[name="description"]');
  var desc = meta ? (meta.getAttribute("content") || "").trim() : "";
  return { title: title.slice(0, 120), desc: desc.slice(0, 200), url: window.location.href, site: window.location.hostname.replace(/^www\./,"") };
}

// Lancer la recherche Claude
function runSubjectResearch(subject, callback) {
  if (aiSearchRunning) return;
  aiSearchRunning = true;
  chrome.runtime.sendMessage({
    type: "RESEARCH_SUBJECT",
    subject: subject,
    apiKey: PROFILE.apiKey
  }, function(resp) {
    aiSearchRunning = false;
    if (chrome.runtime.lastError) {
      callback({ error: chrome.runtime.lastError.message || "Extension déconnectée — recharge la page." });
      return;
    }
    callback(resp || { error: "Pas de réponse du service worker." });
  });
}

// Construire le panel
function buildAIPanel() {
  if (aiPanelBuilt) return;
  aiPanelBuilt = true;

  var panel = mk("div"); panel.id = "mrr-ai"; EL_AI.panel = panel;

  // Header
  var head = mk("div"); head.id = "mrr-ai-head";
  var title = mk("div"); title.id = "mrr-ai-title"; title.innerHTML = "🧠 Esprit critique";
  var close = mk("button",{type:"button"},"✕"); close.id = "mrr-ai-close";
  close.addEventListener("click", function(e) { e.preventDefault(); e.stopPropagation(); hideAIPanel(); });
  head.appendChild(title); head.appendChild(close);

  // Sujet détecté
  var subjectRow = mk("div"); subjectRow.id = "mrr-ai-subject"; EL_AI.subjectRow = subjectRow;

  // Verdict (consensus)
  var verdict = mk("div"); verdict.id = "mrr-ai-verdict";
  var vico = mk("div"); vico.id = "mrr-ai-vico"; EL_AI.vico = vico;
  var vinfo = mk("div");
  var vlbl  = mk("div"); vlbl.id = "mrr-ai-vlbl"; EL_AI.vlbl = vlbl;
  var vtxt  = mk("div"); vtxt.id = "mrr-ai-vtxt"; EL_AI.vtxt = vtxt;
  vinfo.appendChild(vlbl); vinfo.appendChild(vtxt);
  verdict.appendChild(vico); verdict.appendChild(vinfo);

  // Body : résumé + divergences + sources
  var body = mk("div"); body.id = "mrr-ai-body"; EL_AI.body = body;

  panel.appendChild(head);
  panel.appendChild(subjectRow);
  panel.appendChild(verdict);
  panel.appendChild(body);
  document.body.appendChild(panel);
}

function showAIPanel() {
  if (!aiPanelBuilt) buildAIPanel();
  EL_AI.panel.classList.add("show");

  if (!PROFILE.apiKey) {
    renderAIError("🔑 Configure ta clé API Claude dans le popup pour activer la recherche.");
    return;
  }

  var subject = extractPageSubject();

  // Afficher le sujet détecté
  EL_AI.subjectRow.style.cssText = "padding:8px 15px 6px;border-bottom:1px solid rgba(167,139,250,.1);flex-shrink:0;font-size:11px;color:#6B6475;line-height:1.4;";
  EL_AI.subjectRow.textContent = "Sujet : " + subject.title;

  // Loading
  EL_AI.vico.textContent = "🔍";
  EL_AI.vlbl.textContent = "RECHERCHE EN COURS";
  EL_AI.vlbl.style.color = "#A78BFA";
  EL_AI.vtxt.textContent = "Je cherche ce qui se dit sur ce sujet…";
  EL_AI.body.innerHTML = '<div style="padding:16px 0;display:flex;flex-direction:column;align-items:center;gap:10px;"><div style="width:24px;height:24px;border:2px solid rgba(167,139,250,.2);border-top-color:#A78BFA;border-radius:50%;animation:mrr-sp .8s linear infinite;"></div><div style="font-size:11px;color:#6B6475;text-align:center;">Analyse des sources…</div></div>';

  runSubjectResearch(subject, function(resp) {
    if (!resp || resp.error) {
      renderAIError(resp && resp.error ? "Erreur : " + resp.error : "Erreur de communication.");
      return;
    }
    renderAIResult(resp.research, subject);
  });
}

function hideAIPanel() {
  if (EL_AI.panel) EL_AI.panel.classList.remove("show");
  aiSearchRunning = false;
}

function renderAIError(msg) {
  EL_AI.vico.textContent = "⚠️";
  EL_AI.vlbl.textContent = "ERREUR";
  EL_AI.vlbl.style.color = "#E8563A";
  EL_AI.vtxt.textContent = "";
  EL_AI.body.innerHTML = '<div style="padding:12px 0;font-size:12px;color:#6B6475;text-align:center;line-height:1.6;">' + msg + '</div>';
}

function renderAIResult(r, subject) {
  // Verdict consensus
  var verdictColors = { consensus:"#42C47E", mitige:"#F5C842", rare:"#E8563A", absent:"#6B6475" };
  var verdictIcos   = { consensus:"✅", mitige:"🤔", rare:"⚠️", absent:"🔇" };
  EL_AI.vico.textContent = verdictIcos[r.coverage]  || "🔍";
  EL_AI.vlbl.textContent = r.coverageLabel          || "COUVERTURE";
  EL_AI.vlbl.style.color = verdictColors[r.coverage] || "#A78BFA";
  EL_AI.vtxt.textContent = r.coverageSummary        || "";

  EL_AI.body.innerHTML = "";

  // ── Résumé de ce que disent les sources
  if (r.summary) {
    var sumCard = mk("div");
    sumCard.style.cssText = "background:rgba(167,139,250,.07);border:1px solid rgba(167,139,250,.18);border-radius:11px;padding:11px 13px;font-size:12px;color:#C4C0BB;line-height:1.55;";
    sumCard.textContent = r.summary;
    EL_AI.body.appendChild(sumCard);
  }

  // ── Divergences / points de désaccord
  if (r.divergences && r.divergences.length) {
    var divTitle = mk("div");
    divTitle.style.cssText = "font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#F5C842;margin:8px 0 5px;";
    divTitle.textContent = "POINTS DE DÉSACCORD";
    EL_AI.body.appendChild(divTitle);
    r.divergences.forEach(function(d) {
      var card = mk("div"); card.className = "mrr-ai-sig warn";
      var ico  = mk("div"); ico.className  = "mrr-ai-ico"; ico.textContent = "⚡";
      var info = mk("div");
      var lbl  = mk("div"); lbl.className  = "mrr-ai-lbl"; lbl.textContent = d.point || "";
      var det  = mk("div"); det.className  = "mrr-ai-det"; det.textContent = d.detail || "";
      info.appendChild(lbl); info.appendChild(det);
      card.appendChild(ico); card.appendChild(info);
      EL_AI.body.appendChild(card);
    });
  }

  // ── Sources qui en parlent
  if (r.sources && r.sources.length) {
    var srcTitle = mk("div");
    srcTitle.style.cssText = "font-size:9px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#6B6475;margin:10px 0 5px;border-top:1px solid rgba(255,255,255,.06);padding-top:10px;";
    srcTitle.textContent = r.sources.length + " SOURCE" + (r.sources.length > 1 ? "S" : "") + " TROUVÉE" + (r.sources.length > 1 ? "S" : "");
    EL_AI.body.appendChild(srcTitle);

    r.sources.forEach(function(s) {
      var a = document.createElement("a");
      a.className = "mrr-src"; a.href = s.url || "#"; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.style.marginBottom = "5px";
      var ico = mk("div"); ico.className = "mrr-src-ico";
      ico.textContent = s.bias === "favorable" ? "👍" : s.bias === "critique" ? "🔴" : "📰";
      var bdy = mk("div"); bdy.className = "mrr-src-body";
      var nm  = mk("div"); nm.className  = "mrr-src-name"; nm.textContent = s.name || s.url;
      var ds  = mk("div"); ds.className  = "mrr-src-desc"; ds.textContent = s.excerpt || "";
      var arr = mk("div"); arr.className = "mrr-src-arr";  arr.textContent = "→";
      bdy.appendChild(nm); bdy.appendChild(ds);
      a.appendChild(ico); a.appendChild(bdy); a.appendChild(arr);
      EL_AI.body.appendChild(a);
    });
  }

  // ── Question critique
  if (r.criticalQuestion) {
    var qCard = mk("div");
    qCard.style.cssText = "background:rgba(167,139,250,.08);border:1px solid rgba(167,139,250,.18);border-radius:11px;padding:11px 13px;font-size:12px;font-style:italic;color:rgba(237,233,224,.75);line-height:1.5;margin-top:6px;";
    qCard.textContent = "« " + r.criticalQuestion + " »";
    EL_AI.body.appendChild(qCard);
  }

  // Spacer bas
  var sp = mk("div"); sp.style.height = "10px";
  EL_AI.body.appendChild(sp);
}

// Pages d'information (articles, blogs, news)
function isInfoPage() {
  // Exclure les pages e-commerce pures
  if (currentRule && currentRule.id !== "social" && currentRule.id !== "generic") return false;
  var hasArticle = !!document.querySelector("article");
  var hasLongText = (document.body.textContent || "").split(/\s+/).length > 400;
  var isNewsSite = /news|actu|info|blog|article|journal|magazine|presse/.test(window.location.hostname + window.location.pathname);
  return hasArticle || (hasLongText && isNewsSite);
}

// Signaux universels indiquant une page e-commerce
var ECOM_SIGNALS = {
  // Structured data JSON-LD
  jsonld: function() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i=0; i<scripts.length; i++) {
      try {
        var d = JSON.parse(scripts[i].textContent);
        var types = [].concat(d["@type"] || []);
        if (types.some(function(t){ return /product|offer|itempage/i.test(t); })) return true;
        if (d["@graph"]) {
          for (var j=0; j<d["@graph"].length; j++) {
            var gt = [].concat(d["@graph"][j]["@type"] || []);
            if (gt.some(function(t){ return /product|offer/i.test(t); })) return true;
          }
        }
      } catch(e) {}
    }
    return false;
  },
  // Open Graph type product
  og: function() {
    var og = document.querySelector('meta[property="og:type"]');
    return og && /product|article/.test(og.getAttribute("content") || "");
  },
  // itemprop="price" ou itemtype Product
  microdata: function() {
    return !!(document.querySelector('[itemprop="price"],[itemprop="offers"],[itemtype*="Product"]'));
  },
  // Boutons d'achat visibles
  buyBtn: function() {
    var BTN_RE = /add.to.cart|ajouter.au.panier|acheter|buy.now|commander|add.to.bag|in.den.warenkorb/i;
    var els = document.querySelectorAll('button,[role="button"],input[type="submit"]');
    for (var i=0; i<els.length; i++) {
      if (BTN_RE.test(els[i].textContent || els[i].value || "")) return true;
    }
    return false;
  },
  // Prix visible sur la page
  price: function() {
    var els = document.querySelectorAll('[class*="price"],[class*="Price"],[id*="price"],[itemprop="price"],[data-price]');
    for (var i=0; i<els.length; i++) {
      if (/[\d]/.test(els[i].textContent)) return true;
    }
    return false;
  },
  // URL contient des patterns produit
  url: function() {
    var p = window.location.pathname.toLowerCase();
    return /\/(product|produit|item|article|p\/|dp\/|sku|ref=)[\/\w-]/.test(p);
  }
};

// Règle générique pour tout site e-commerce inconnu
var GENERIC_RULE = {
  id:"generic", category:"E-commerce",
  domains:[], cartUrls:["/cart","/panier","/checkout","/basket","/order","/commande"],
  cartBtns:["commander","valider","checkout","place order","buy now","acheter","payer",
            "proceed to checkout","go to checkout","ajouter au panier","add to cart",
            "add to bag","confirmer","passer commande","order now"],
  titleSel:["h1","[itemprop='name']","[class*='product-title']","[class*='product-name']","[id*='product-title']"],
  priceSel:["[itemprop='price']","[class*='price']","[data-price]","[id*='price']"],
  icon:"🛒", label:"E-commerce"
};

function detectSite() {
  var host = window.location.hostname.replace(/^www\./,"");
  var path = window.location.pathname.toLowerCase();

  // 1. Chercher dans les règles connues
  for (var i=0; i<SITE_RULES.length; i++) {
    var r = SITE_RULES[i];
    if (PROFILE.domains.indexOf(r.id) === -1) continue;
    if (!r.domains.some(function(d){ return host.indexOf(d) !== -1; })) continue;
    var isCart = r.cartUrls.some(function(u){ return path.indexOf(u) !== -1; });
    return {rule:r, isCart:isCart, known:true};
  }

  // 2. Détection universelle — compter les signaux e-commerce
  var score = 0;
  if (ECOM_SIGNALS.jsonld())    score += 3; // fort signal
  if (ECOM_SIGNALS.microdata()) score += 3;
  if (ECOM_SIGNALS.og())        score += 2;
  if (ECOM_SIGNALS.url())       score += 2;
  if (ECOM_SIGNALS.buyBtn())    score += 2;
  if (ECOM_SIGNALS.price())     score += 1;

  if (score >= 3) {
    var isCart2 = GENERIC_RULE.cartUrls.some(function(u){ return path.indexOf(u) !== -1; });
    return {rule:GENERIC_RULE, isCart:isCart2, known:false, score:score};
  }

  return null;
}

// ─────────────────────────────────────────
// MODULE PATROUILLE — Pikachu se déplace vers les dark patterns
// ─────────────────────────────────────────

var patrolActive = false;
var patrolTimeout = null;
var patrolHome = { bottom: 20, right: 20 };

// Dark patterns détectables dans le DOM
var DARK_PATTERN_DETECTORS = [
  {
    name: "Faux compteur de stock",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "medium",
    find: function() {
      var patterns = [
        /plus que \d+ (en stock|disponible|restant|article|exemplaire)/i,
        /only \d+ left/i,
        /\d+ personnes? (regardent|consultent|ont vu|ont ajouté)/i,
        /réservé \d+ fois (aujourd|cette)/i,
        /\d+ people (are |)(looking|viewing|watching)/i,
        /hurry[!,]?\s*only \d+/i,
        /stock (très |)limité/i,
        /derniers? (articles?|exemplaires?|pièces?)/i,
        /\d+ (acheteurs?|clients?) (en ce moment|actuellement|right now)/i,
        /selling fast/i,
        /presque épuisé/i,
        /almost (sold out|gone)/i,
        /rupture (de stock |)(imminente|prochaine)/i,
        /running (out|low)/i,
        /high demand/i,
        /forte demande/i,
        /ne manquez pas/i,
        /don'?t miss out/i
      ];
      return findTextNode(patterns, "Ce message crée une fausse urgence pour te forcer à acheter maintenant. Ces compteurs sont souvent fictifs ou manipulés.");
    }
  },
  {
    name: "Minuterie d'urgence",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "medium",
    find: function() {
      var timers = document.querySelectorAll("[class*='countdown'],[class*='timer'],[class*='clock'],[id*='countdown'],[id*='timer'],[class*='Countdown'],[class*='Timer'],[data-countdown],[class*='urgency'],[class*='Urgency']");
      if (timers.length > 0) {
        // Vérifier que c'est bien un timer commercial (pas un timer de livraison)
        for (var i = 0; i < timers.length; i++) {
          var ctx = (timers[i].textContent + " " + (timers[i].parentElement ? timers[i].parentElement.textContent : "")).toLowerCase();
          if (/offre|promo|réduc|deal|vente|flash|expire|fin dans|ends|sale|offer|hurry|dépêch/i.test(ctx)) {
            return { el: timers[i], msg: "Ce compte à rebours crée une urgence artificielle. L'offre existera probablement encore demain." };
          }
        }
      }
      var patterns = [
        /offre expire dans/i, /se termine dans/i, /ends in/i, /expires in/i,
        /vente flash/i, /flash sale/i, /limited time/i, /temps limité/i,
        /offer ends/i, /l'offre se termine/i, /dernières heures/i, /last chance/i,
        /dernière chance/i, /plus que \d+\s*(h|heures?|min|minutes?|jours?)/i,
        /dans \d+h\d+/i, /\d+:\d+:\d+/
      ];
      return findTextNode(patterns, "Cette minuterie est conçue pour court-circuiter ta réflexion. Prends le temps de décider.");
    }
  },
  {
    name: "Prix barré suspect",
    label: "DARK PATTERN",
    color: "#F5C842",
    severity: "medium",
    find: function() {
      var struckEls = document.querySelectorAll("s, del, [class*='original-price'], [class*='old-price'], [class*='was-price'], [class*='prix-barre'], [class*='strikethrough'], [class*='crossed'], [class*='compare-price'], [class*='msrp'], [class*='retail-price'], [class*='list-price'], [class*='prix-initial'], [class*='former-price']");
      for (var i = 0; i < struckEls.length; i++) {
        var el = struckEls[i];
        var txt = el.textContent.trim();
        if (/[€$£]|\d+[,.]\d+/.test(txt)) {
          var parent = el.closest("[class*='price'],[class*='Price']") || el.parentElement;
          var parentTxt = parent ? parent.textContent : "";
          var allPrices = parentTxt.match(/\d+[,.]?\d*/g);
          if (allPrices && allPrices.length >= 2) {
            var high = parseFloat(allPrices[0].replace(",","."));
            var low  = parseFloat(allPrices[allPrices.length-1].replace(",","."));
            if (high > 0 && low > 0) {
              var actualPct = Math.round((high - low) / high * 100);
              // Détecter si le % affiché dans le texte est gonflé (>10pts d'écart)
              var claimedMatch = parentTxt.match(/-\s*(\d{1,3})\s*%/);
              if (claimedMatch) {
                var claimed = parseInt(claimedMatch[1]);
                if (claimed > actualPct + 10) {
                  return { el: el, msg: "Réduction affichée : -" + claimed + "%, réduction réelle calculée : -" + actualPct + "%. Le pourcentage est exagéré." };
                }
              }
              if (actualPct > 60) {
                return { el: el, msg: "-" + actualPct + "% ? Cette réduction est suspecte. Les prix de référence sont souvent gonflés artificiellement." };
              }
            }
          }
          return { el: el, msg: "Ce prix barré a-t-il jamais existé ? Les fausses promotions sont une technique très répandue." };
        }
      }
      return null;
    }
  },
  {
    name: "Case pré-cochée",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "high",
    find: function() {
      var checkboxes = document.querySelectorAll("input[type='checkbox']:checked, input[type='checkbox'][checked]");
      for (var i = 0; i < checkboxes.length; i++) {
        var cb = checkboxes[i];
        var label = document.querySelector("label[for='" + cb.id + "']") || cb.closest("label") || cb.parentElement;
        if (label) {
          var txt = label.textContent.toLowerCase();
          if (/assurance|garantie|option|protection|abonnement|newsletter|offre|€|\d+[,.]?\d*\s*€|premium|extension|maintenance|livraison express|express|priority|priorit/i.test(txt)) {
            return { el: cb, msg: "Cette case était déjà cochée pour toi. Vérifie si c'est une option payante que tu n'as pas demandée." };
          }
        }
      }
      return null;
    }
  },
  {
    name: "Confirmshaming",
    label: "DARK PATTERN",
    color: "#7F77DD",
    severity: "medium",
    find: function() {
      var patterns = [
        /non merci.*je (préfère|ne veux|refuse)/i,
        /no thanks.*i (prefer|don'?t|rather)/i,
        /je (veux rester|préfère rester) ignorant/i,
        /je ne veux pas (économiser|profiter|améliorer|gagner)/i,
        /non.*ça ne m'intéresse pas de/i,
        /i don'?t (want to|like) sav(e|ing)/i,
        /no,? i'?d rather (pay|spend) (full|more)/i,
        /je préfère payer (plus cher|le prix fort)/i,
        /non,? je n'aime pas les (bonnes affaires|économies)/i,
        /continue without (saving|discount|offer)/i,
        /continuer sans (réduction|offre|économiser)/i,
        /je refuse (cette|l'|la) (offre|opportunité)/i
      ];
      return findTextNode(patterns, "Ce bouton est conçu pour te faire honte de refuser. Tu as le droit de dire non sans culpabiliser.");
    }
  },
  {
    name: "Ajout forcé au panier",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "high",
    find: function() {
      // Détecter les produits ajoutés automatiquement dans le panier
      var patterns = [
        /ajouté (automatiquement|pour vous|à votre panier)/i,
        /added (automatically|to your (cart|bag|basket))/i,
        /recommandé pour (vous|toi|compléter)/i,
        /recommended for you/i,
        /vous pourriez aussi aimer/i,
        /complétez votre (panier|commande|achat)/i,
        /complete your (order|purchase|look)/i,
        /n'oubliez pas/i,
        /don'?t forget/i,
        /fréquemment achetés? ensemble/i,
        /frequently bought together/i
      ];
      // Chercher ces patterns DANS un contexte de panier/checkout
      if (!/cart|panier|basket|checkout|commande|order/i.test(window.location.href + window.location.pathname)) return null;
      return findTextNode(patterns, "Ce produit a été suggéré pour gonfler ton panier. Vérifie si tu l'as vraiment choisi.");
    }
  },
  {
    name: "Abonnement caché",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "high",
    find: function() {
      var patterns = [
        /abonnement (mensuel|annuel|récurrent|automatique)/i,
        /(monthly|annual|recurring) (subscription|payment|billing)/i,
        /renouvel(é|lement) automatique/i,
        /auto.?renew/i,
        /essai gratuit.*puis \d/i,
        /free trial.*then \$/i,
        /après (l'essai|la période)/i,
        /after (trial|the free period)/i,
        /sera prélevé/i,
        /will be charged/i,
        /engagement (de |)\d+ mois/i,
        /\d+ month commitment/i,
        /se désabonner (avant|pour éviter)/i,
        /cancel (before|to avoid)/i,
        /tacite reconduction/i,
        /reconduit (tacitement|automatiquement)/i,
        /résiliation (à|avant) la fin/i,
        /puis \d+[,.]?\d*\s*€\s*(\/|par)\s*(mois|an)/i,
        /then \$\d+\s*\/\s*(month|year)/i
      ];
      return findTextNode(patterns, "Attention : ceci inclut un abonnement ou un renouvellement automatique. Lis les petites lignes avant de confirmer.");
    }
  },
  {
    name: "Pop-up de rétention",
    label: "DARK PATTERN",
    color: "#F5C842",
    severity: "medium",
    find: function() {
      // Chercher les pop-ups de rétention (apparaissent quand on veut partir)
      var modals = document.querySelectorAll("[class*='exit-intent'],[class*='exitIntent'],[class*='exit_intent'],[class*='leaving'],[class*='popup-overlay'],[class*='modal-overlay'],[class*='retention']");
      for (var i = 0; i < modals.length; i++) {
        var style = window.getComputedStyle(modals[i]);
        if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
          var txt = modals[i].textContent.toLowerCase();
          if (/attend|wait|part(ez|ir|ing)|leav(e|ing)|quit|dernière|offre|réduction|discount|code promo|coupon/i.test(txt)) {
            return { el: modals[i], msg: "Ce pop-up veut t'empêcher de partir. Si tu voulais partir, c'est que tu avais une bonne raison." };
          }
        }
      }
      return null;
    }
  },
  {
    name: "Fausse preuve sociale",
    label: "DARK PATTERN",
    color: "#F5C842",
    severity: "medium",
    find: function() {
      var patterns = [
        /\d+ (personnes?|clients?|acheteurs?) (ont commandé|viennent d'acheter|ont acheté|regardent)/i,
        /\d+ (people|customers|buyers?) (just |recently )?(bought|purchased|ordered|are viewing)/i,
        /best.?seller/i,
        /meilleure vente/i,
        /produit (le plus |)(populaire|vendu|demandé)/i,
        /most popular/i,
        /trending (now|product)/i,
        /en (tendance|vogue)/i,
        /\d+ (avis|reviews) vérifiés?/i,
        /\d+ verified reviews/i,
        /vu \d+ fois (aujourd|cette)/i,
        /viewed \d+ times (today|this)/i,
        /\d+ personnes? l'ont (dans leur|ajouté)/i
      ];
      return findTextNode(patterns, "Ces chiffres créent un effet de foule artificiel. Décide pour toi, pas parce que d'autres auraient acheté.");
    }
  },
  {
    name: "Coûts cachés",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "high",
    find: function() {
      var checkoutCtx = /checkout|commande|panier|cart|basket|order/i.test(window.location.href);
      // Hors checkout, ne signaler que les patterns manifestement abusifs
      if (!checkoutCtx) {
        return findTextNode([
          /frais obligatoire/i,
          /mandatory fee/i,
          /surcharge/i,
          /convenience fee/i,
          /activation fee/i
        ], "Des frais supplémentaires sont mentionnés sur cette page. Vérifiez qu'ils sont bien justifiés.");
      }
      var patterns = [
        /frais (de |)(service|traitement|dossier|gestion|protection|livraison express)/i,
        /(service|handling|processing|booking) fee/i,
        /supplément/i,
        /surcharge/i,
        /frais obligatoire/i,
        /mandatory fee/i,
        /contribution (environnementale|emballage)/i,
        /eco.?participation/i,
        /frais (de |)réservation/i,
        /convenience fee/i,
        /frais de dossier/i,
        /activation fee/i
      ];
      return findTextNode(patterns, "Des frais supplémentaires apparaissent au moment de payer. Compare le prix affiché et le prix final.");
    }
  },
  {
    name: "Bouton piège visuel",
    label: "DARK PATTERN",
    color: "#7F77DD",
    severity: "medium",
    find: function() {
      // Détecter les boutons "refuser" rendus intentionnellement moins visibles
      var buttons = document.querySelectorAll("button, a[role='button'], [class*='btn'], [class*='button']");
      for (var i = 0; i < buttons.length; i++) {
        var el = buttons[i];
        var txt = (el.textContent || "").toLowerCase().trim();
        if (!/refuser|non|decline|reject|skip|passer|ignorer|dismiss|no thanks|non merci|later|plus tard/i.test(txt)) continue;
        var style = window.getComputedStyle(el);
        var fontSize = parseFloat(style.fontSize);
        var opacity = parseFloat(style.opacity);
        // Petit texte ou très transparent = bouton piège
        if (fontSize < 11 || opacity < 0.5) {
          return { el: el, msg: "Le bouton pour refuser est volontairement rendu discret. L'option de dire non devrait être aussi visible que celle d'accepter." };
        }
        // Calcul du contraste WCAG (ratio minimum recommandé : 3.0 pour les composants UI)
        var fgMatch = style.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        var bgMatch = style.backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (fgMatch && bgMatch) {
          var toLum = function(r, g, b) {
            return [r/255, g/255, b/255].map(function(c) {
              return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
            }).reduce(function(s, c, j) { return s + [0.2126, 0.7152, 0.0722][j] * c; }, 0);
          };
          var fgL = toLum(parseInt(fgMatch[1]), parseInt(fgMatch[2]), parseInt(fgMatch[3]));
          var bgL = toLum(parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3]));
          var contrast = (Math.max(fgL, bgL) + 0.05) / (Math.min(fgL, bgL) + 0.05);
          if (contrast < 3.0) {
            return { el: el, msg: "Le bouton pour refuser a un contraste insuffisant (" + contrast.toFixed(1) + ":1, minimum 3.0). C'est fait exprès pour le rendre invisible." };
          }
        } else if (fgMatch) {
          // Fallback : texte gris clair sur fond inconnu
          var r = parseInt(fgMatch[1]), g = parseInt(fgMatch[2]), b = parseInt(fgMatch[3]);
          if (r > 160 && g > 160 && b > 160) {
            return { el: el, msg: "Le bouton pour refuser est quasi invisible. C'est fait exprès pour que tu ne le trouves pas." };
          }
        }
      }
      return null;
    }
  },
  {
    name: "Ancrage de prix",
    label: "DARK PATTERN",
    color: "#F5C842",
    severity: "low",
    find: function() {
      var patterns = [
        /économisez \d+\s*[€$£%]/i,
        /you save \d+/i,
        /save \d+%/i,
        /réduction de \d+\s*[€$£%]/i,
        /\d+[€$£]\s*d'économie/i,
        /valeur (de |)(plus de |)\d+\s*[€$£]/i,
        /worth (over |)\$?\d+/i,
        /(au lieu de|instead of|was)\s*\d+/i,
        /prix (conseillé|initial|catalogue)\s*:?\s*\d+/i,
        /(retail|suggested|list) price:?\s*\$?\d+/i
      ];
      return findTextNode(patterns, "L'ancrage de prix te montre un prix 'original' élevé pour que la réduction paraisse énorme. Le vrai prix est celui que tu paies.");
    }
  },
  {
    name: "Roach motel",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "high",
    find: function() {
      var patterns = [
        /pour (se |)(résilier|annuler|désabonner).*appel(er|ez|lez)/i,
        /to cancel.*call (us|our)/i,
        /résiliation.*par (téléphone|courrier|lettre)/i,
        /cancellation.*by (phone|mail|letter)/i,
        /envoyer.*(courrier|lettre).*(résili|annul)/i,
        /send.*(letter|mail).*(cancel|terminat)/i,
        /tacite reconduction/i,
        /reconduit (tacitement|automatiquement) sauf/i,
        /résiliation (sous|dans les?) \d+ (jours?|mois)/i,
        /cancel (within|before) \d+ days/i,
        /engagement (de |)(minimum |)\d+ (mois|an)/i,
        /\d+.?(month|year) minimum (term|contract|commitment)/i,
        /sans possibilité (de |)résiliation/i,
        /non résiliable/i,
        /résiliation (impossible|non possible)/i
      ];
      return findTextNode(patterns, "Cette offre est facile à souscrire mais difficile à annuler. Cherche les conditions de résiliation AVANT de t'engager.");
    }
  },
  {
    name: "Privacy Zuckering",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "high",
    find: function() {
      var checkboxes = document.querySelectorAll("input[type='checkbox']:checked, input[type='checkbox'][checked]");
      for (var i = 0; i < checkboxes.length; i++) {
        var cb = checkboxes[i];
        var label = document.querySelector("label[for='" + cb.id + "']") || cb.closest("label") || cb.parentElement;
        if (label) {
          var txt = label.textContent.toLowerCase();
          if (/partenaires?|tiers|données personnelles|data|marketing|publicité|partager|third.party|profilage|profiling|ciblage|targeting/i.test(txt)) {
            return { el: cb, msg: "Cette case était déjà cochée pour partager tes données avec des partenaires tiers. Tu peux la décocher." };
          }
        }
      }
      return null;
    }
  },
  {
    name: "Radio piège",
    label: "DARK PATTERN",
    color: "#E8563A",
    severity: "high",
    find: function() {
      // Détecter les boutons radio présélectionnés sur l'option la plus chère
      var radios = document.querySelectorAll("input[type='radio']:checked, input[type='radio'][checked]");
      for (var i = 0; i < radios.length; i++) {
        var rb = radios[i];
        var container = rb.closest("[class*='plan'],[class*='pricing'],[class*='subscription'],[class*='offer'],[class*='abonnement'],[class*='tarif'],[class*='forfait'],[class*='pack']");
        if (!container) continue;
        var label = document.querySelector("label[for='" + rb.id + "']") || rb.closest("label") || rb.parentElement;
        if (!label) continue;
        if (/(annuel|annual|yearly|year|premium|pro|business|plus\b|max\b|advanced|enterprise)/i.test(label.textContent)) {
          return { el: rb, msg: "L'option la plus chère (annuelle ou premium) est présélectionnée. Vérifie si c'est bien ce que tu veux avant de valider." };
        }
      }
      return null;
    }
  }
];

// ─────────────────────────────────────────
// SCAN OPTIMISÉ — viewport-aware + debounced MutationObserver
// ─────────────────────────────────────────

function findTextNode(patterns, msg) {
  // Scan optimisé : querySelectorAll sur éléments textuels, filtré par viewport
  var candidates = document.querySelectorAll("p, span, div, a, button, label, h1, h2, h3, h4, li, td, th, strong, em, b, i, small, [role='button'], [role='alert'], [class*='banner'], [class*='notice'], [class*='badge']");
  for (var ci = 0; ci < candidates.length; ci++) {
    var el = candidates[ci];
    if (el.id && el.id.indexOf("mrr-") === 0) continue;
    if (el.closest && el.closest("[id^='mrr-']")) continue;
    var tag = el.tagName;
    if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") continue;
    // Lazy scan : ne tester que les éléments proches du viewport (±200px)
    var rect = el.getBoundingClientRect();
    if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
    if (rect.width === 0 || rect.height === 0) continue;

    var txt = el.textContent.trim();
    if (txt.length < 3 || txt.length > 500) continue;
    for (var i = 0; i < patterns.length; i++) {
      if (patterns[i].test(txt)) {
        return { el: el, msg: msg };
      }
    }
  }
  return null;
}

function getElCenter(el) {
  try {
    var rect = el.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  } catch(e) { return null; }
}

var patrolQueue = [];
var patrolIndex = 0;
var patrolDoneElements = new WeakSet();  // éléments déjà patrouillés — ne pas revisiter

// ── IntersectionObserver : déclencher le scan quand de nouvelles sections entrent dans le viewport ──
var viewportObserver = null;
var observedSections = new WeakSet();
var viewportScanTimeout = null;
var scrollDebounceTimer = null;

function setupViewportObserver() {
  if (viewportObserver || !window.IntersectionObserver) return;

  viewportObserver = new IntersectionObserver(function(entries) {
    var needsScan = false;
    entries.forEach(function(entry) {
      if (entry.isIntersecting && !observedSections.has(entry.target)) {
        observedSections.add(entry.target);
        needsScan = true;
      }
    });
    if (needsScan && !patrolActive) {
      clearTimeout(viewportScanTimeout);
      viewportScanTimeout = setTimeout(function() {
        patrolQueue = [];
        patrolIndex = 0;
        patrolPage();
      }, 800);
    }
  }, { rootMargin: "200px 0px", threshold: 0.1 });

  // Observer les sections principales
  var sections = document.querySelectorAll("main, article, section, [role='main'], [class*='product'], [class*='checkout'], [class*='cart'], [class*='listing'], [class*='detail'], [class*='content']");
  if (sections.length === 0) {
    var children = document.body.children;
    for (var i = 0; i < Math.min(children.length, 20); i++) {
      if (children[i].tagName !== "SCRIPT" && children[i].tagName !== "STYLE") {
        viewportObserver.observe(children[i]);
      }
    }
  } else {
    sections.forEach(function(s) { viewportObserver.observe(s); });
  }
}

// ── MutationObserver debounced : attraper pop-ups, minuteries, contenus injectés dynamiquement ──
var darkPatternMutObs = null;
var mutDebounceTimer = null;

function setupDarkPatternMutationObserver() {
  if (darkPatternMutObs) return;

  darkPatternMutObs = new MutationObserver(function(mutations) {
    var hasNewNodes = false;
    for (var i = 0; i < mutations.length; i++) {
      if (mutations[i].addedNodes.length > 0) {
        for (var j = 0; j < mutations[i].addedNodes.length; j++) {
          var nd = mutations[i].addedNodes[j];
          if (nd.nodeType === 1 && nd.tagName !== "SCRIPT" && nd.tagName !== "STYLE") {
            if (nd.id && nd.id.indexOf("mrr-") === 0) continue;
            hasNewNodes = true;
            break;
          }
        }
      }
      if (hasNewNodes) break;
    }
    if (!hasNewNodes) return;

    // Debounce 400ms — regroupe les rafales de mutations (React, Vue, SPA)
    clearTimeout(mutDebounceTimer);
    mutDebounceTimer = setTimeout(function() {
      if (!patrolActive) {
        patrolQueue = [];
        patrolIndex = 0;
        patrolPage();
      }
    }, 400);
  });

  darkPatternMutObs.observe(document.body, {
    childList: true,
    subtree: true
  });
}

function patrolPage() {
  if (patrolActive || !EL.avatarWrap) return;

  if (patrolQueue.length === 0 || patrolIndex >= patrolQueue.length) {
    patrolQueue = [];
    patrolIndex = 0;
    for (var i = 0; i < DARK_PATTERN_DETECTORS.length; i++) {
      var result = DARK_PATTERN_DETECTORS[i].find();
      // Ignorer les éléments déjà signalés à l'utilisateur
      if (result && !patrolDoneElements.has(result.el)) {
        patrolQueue.push({ result: result, detector: DARK_PATTERN_DETECTORS[i] });
      }
    }
    if (patrolQueue.length === 0) return;
  }

  var current = patrolQueue[patrolIndex];
  patrolIndex++;
  var found = current.result;
  var detector = current.detector;

  patrolActive = true;
  patrolDoneElements.add(found.el);  // Marquer comme déjà signalé
  var center = getElCenter(found.el);
  if (!center) { patrolActive = false; return; }

  // Calculer la position de destination (à côté de l'élément)
  var avatarSize = 90;
  var targetX = Math.min(Math.max(center.x - avatarSize / 2, 10), window.innerWidth - avatarSize - 10);
  var targetY = Math.min(Math.max(center.y - avatarSize, 10), window.innerHeight - avatarSize - 10);

  // Convertir en bottom/right (car le wrap est position:fixed)
  var targetBottom = window.innerHeight - targetY - avatarSize;
  var targetRight  = window.innerWidth  - targetX - avatarSize;

  // Highlight de l'élément cible (épaisseur selon la sévérité)
  var origOutline = found.el.style.outline;
  var outlineWidth = detector.severity === "high" ? "3px" : detector.severity === "low" ? "1px" : "2px";
  found.el.style.outline = outlineWidth + " solid " + detector.color;
  found.el.style.outlineOffset = "3px";
  found.el.style.borderRadius = "4px";

  // Animer l'avatar vers l'élément
  EL.avatarWrap.style.bottom = targetBottom + "px";
  EL.avatarWrap.style.right  = targetRight  + "px";

  // Afficher la bulle après l'arrivée
  patrolTimeout = setTimeout(function() {
    if (EL.patrolLbl) EL.patrolLbl.textContent = detector.name.toUpperCase();
    if (EL.patrolLbl) EL.patrolLbl.style.color = detector.color;
    if (EL.patrolTxt) EL.patrolTxt.textContent = found.msg;
    if (EL.patrolBubble) EL.patrolBubble.classList.add("show");

    // Rentrer à la maison après 6s
    patrolTimeout = setTimeout(function() {
      if (EL.patrolBubble) EL.patrolBubble.classList.remove("show");
      setTimeout(function() {
        returnHome();
        found.el.style.outline = origOutline;
        found.el.style.outlineOffset = "";
        setTimeout(function() {
          patrolActive = false;
          // S'il y a d'autres dark patterns dans la queue, patrouiller le suivant
          if (patrolIndex < patrolQueue.length) {
            setTimeout(patrolPage, 2000);
          }
        }, 900);
      }, 300);
    }, 6000);
  }, 850);
}

function returnHome() {
  if (!EL.avatarWrap) return;
  EL.avatarWrap.style.bottom = patrolHome.bottom + "px";
  EL.avatarWrap.style.right  = patrolHome.right  + "px";
}

// ── Scroll listener : scanner les dark patterns au fur et à mesure du scroll ──
function setupScrollPatrol() {
  window.addEventListener("scroll", function() {
    clearTimeout(scrollDebounceTimer);
    scrollDebounceTimer = setTimeout(function() {
      if (!patrolActive) {
        patrolQueue = [];
        patrolIndex = 0;
        patrolPage();
      }
    }, 350);
  }, { passive: true });
}

// Lancer la patrouille au chargement + activer les observers
function schedulePatrol() {
  // Scan initial après 3s (laisse la page se charger)
  setTimeout(patrolPage, 3000);
  // Activer l'IntersectionObserver pour les scans au scroll (sections inconnues)
  setTimeout(setupViewportObserver, 1500);
  // Activer le MutationObserver pour le contenu dynamique (pop-ups, minuteries)
  setTimeout(setupDarkPatternMutationObserver, 2000);
  // Activer le scan continu au scroll
  setTimeout(setupScrollPatrol, 3500);
}

function init() {
  // Si le body n'est pas encore prêt (cas rare YouTube SPA), réessayer dans 500ms
  if (!document.body) { setTimeout(init, 500); return; }
  if (!PROFILE.enabled) return;

  // ── Logs de diagnostic (v7.4 fix) ──
  var host = window.location.hostname.replace(/^www\./,"");
  console.log("[Miroir] init sur", host, "| social?", isSocialSite(), "| domains:", PROFILE.domains, "| 'social' coché?", PROFILE.domains.indexOf("social") !== -1);

  // ── Mode réseaux sociaux : chrono + détection collabs + patrouille dark patterns ──
  if (isSocialSite() && PROFILE.domains.indexOf("social") !== -1) {
    console.log("[Miroir] → Mode social activé");
    buildOverlay();
    initSocialMode();
    schedulePatrol(); // v7.4 : patrouille aussi sur les sites sociaux (pubs, miniatures clickbait)
    watchUrlChanges();
    return;
  }
  // Cas où le chip "social" est décoché : on log pour aider au debug
  if (isSocialSite()) {
    console.warn("[Miroir] Site social détecté mais chip 'social' décoché dans le profil. Activez-le dans le popup → Profil.");
  }

  var res = detectSite();

  // ── Vérifier les domaines custom ajoutés par l'utilisateur ──
  if (!res) {
    var host = window.location.hostname.replace(/^www\./,"");
    var customDomains = PROFILE.customDomains || [];
    var isCustom = customDomains.some(function(d) { return host.indexOf(d) !== -1; });
    if (isCustom) {
      // Traiter comme un site e-commerce générique
      res = { rule: GENERIC_RULE, isCart: false, known: false, score: 0, custom: true };
    }
  }

  // Mode esprit critique : animal visible sur toutes les pages
  if (PROFILE.ambitions.indexOf("esprit_critique") !== -1) {
    buildOverlay();
    schedulePatrol();
    watchUrlChanges();
    if (res) {
      currentRule = res.rule;
      if (res.isCart) setTimeout(openIntercept, 900);
      watchCartButtons(res.rule);
    }
    // Même sans res, l'overlay est construit (esprit critique)
    if (!res) setupUnknownSiteMode();
    return;
  }

  // ── Site reconnu → activation normale ──
  if (res) {
    currentRule = res.rule;
    buildOverlay();
    schedulePatrol();
    if (res.isCart) setTimeout(openIntercept, 900);
    watchCartButtons(res.rule);
    watchUrlChanges();
    return;
  }

  // ── Site NON reconnu → Pikachu visible avec bouton "Analyser ce site" ──
  buildOverlay();
  setupUnknownSiteMode();
  watchUrlChanges();
}

// ── Mode site inconnu : Pikachu s'affiche et propose d'analyser ──
function setupUnknownSiteMode() {
  setTimeout(function() {
    showBubble("MIROIR", "Site non reconnu. Clique si tu veux que j'analyse.", 6000);
  }, 2500);

  // Override du clic avatar pour ce mode
  if (EL.avatar && !EL.avatar._unknownModeSetup) {
    EL.avatar._unknownModeSetup = true;
    var origClick = null; // on va remplacer l'event

    // Ajouter un bouton "Analyser ce site" sous le Pikachu
    var addBtn = mk("div");
    addBtn.id = "mrr-add-site-btn";
    addBtn.style.cssText = "pointer-events:auto;background:rgba(232,86,58,.9);border:1px solid rgba(232,86,58,.5);border-radius:10px;padding:7px 12px;font-size:11px;font-weight:700;color:#fff;cursor:pointer;text-align:center;margin-top:4px;transition:opacity .15s;font-family:'DM Sans',system-ui,sans-serif;white-space:nowrap;";
    addBtn.textContent = "🔍 Analyser ce site";

    addBtn.addEventListener("mouseenter", function() { addBtn.style.opacity = ".85"; });
    addBtn.addEventListener("mouseleave", function() { addBtn.style.opacity = "1"; });

    addBtn.addEventListener("click", function(e) {
      e.preventDefault();
      e.stopPropagation();
      activateUnknownSite();
    });

    if (EL.avatarWrap) {
      EL.avatarWrap.appendChild(addBtn);
      EL.addSiteBtn = addBtn;
    }
  }
}

function activateUnknownSite() {
  var host = window.location.hostname.replace(/^www\./, "");

  // Sauvegarder le domaine dans la whitelist custom
  chrome.storage.local.get("miroir_profile", function(data) {
    var p = (data && data.miroir_profile) || {};
    var customs = p.customDomains || [];
    if (customs.indexOf(host) === -1) {
      customs.push(host);
      p.customDomains = customs;
      PROFILE.customDomains = customs;
      chrome.storage.local.set({ miroir_profile: p });
    }
  });

  // Activer le mode analyse avec la règle générique
  currentRule = GENERIC_RULE;

  // Cacher le bouton "Analyser ce site"
  if (EL.addSiteBtn) {
    EL.addSiteBtn.style.display = "none";
  }

  showBubble("MIROIR", "✓ " + host + " ajouté. J'analyse…", -1);
  schedulePatrol();
  watchCartButtons(GENERIC_RULE);

  // Lancer l'analyse IA si clé API dispo et page produit
  if (PROFILE.apiKey) {
    setTimeout(function() {
      // Forcer isProductPage à retourner true pour cette première analyse
      runAnalysis();
    }, 500);
  } else {
    setTimeout(function() {
      showBubble("MIROIR", "🔑 Ajoute ta clé API dans le popup pour activer l'analyse IA.", 7000);
    }, 1500);
  }
}

// ─────────────────────────────────────────
// PONT PWA (v7.1) — synchronisation Miroir extension ↔ PWA
// La PWA est hébergée sur th20-art.github.io/mirror-page/
// On pousse profile + journal, on consomme les engagements pris dans la PWA
// ─────────────────────────────────────────
var PWA_HOST = "th20-art.github.io";
var PWA_PATH = "/mirror-page/";

function isPwaPage() {
  try {
    return window.location.hostname.indexOf(PWA_HOST) !== -1
      && window.location.pathname.indexOf(PWA_PATH) !== -1;
  } catch (e) { return false; }
}

// Pousse profile + journal dans la PWA (localStorage + postMessage)
function pushToPwa() {
  if (!isPwaPage()) return;
  try {
    chrome.storage.local.get(["miroir_profile","miroir_journal"], function(data) {
      var profile = data.miroir_profile || {};
      var journal = data.miroir_journal || { interceptions:[], weeklyCommitments:[], mirrorQuestionStats:{}, settings:{} };

      // localStorage (fallback — la PWA lit au load)
      try {
        localStorage.setItem("miroir_journal_sync", JSON.stringify(journal));
        localStorage.setItem("miroir_profile_sync", JSON.stringify({
          lifePhrase: profile.lifePhrase,
          ambitions: profile.ambitions,
          passions: profile.passions || [],
          locWork: profile.locWork,
          transport: profile.transport
        }));
        if (Array.isArray(profile.passions)) {
          localStorage.setItem("miroir_passions", JSON.stringify(profile.passions));
        }
      } catch(e) {}

      // postMessage (live — si la PWA est déjà chargée)
      try {
        window.postMessage({ type: "MIROIR_JOURNAL", journal: journal }, window.location.origin);
        window.postMessage({ type: "MIROIR_PROFILE", profile: profile }, window.location.origin);
      } catch(e) {}
    });
  } catch(e) {}
}

// Consomme les engagements hebdo pris depuis la PWA
function consumePendingCommits() {
  if (!isPwaPage()) return;
  var pending;
  try {
    pending = JSON.parse(localStorage.getItem("miroir_commits_pending") || "[]");
  } catch(e) { return; }
  if (!pending || pending.length === 0) return;

  chrome.storage.local.get("miroir_journal", function(data) {
    var j = data.miroir_journal || { interceptions:[], weeklyCommitments:[], mirrorQuestionStats:{}, settings:{} };
    if (!j.weeklyCommitments) j.weeklyCommitments = [];

    pending.forEach(function(c) {
      var dup = j.weeklyCommitments.some(function(x) {
        return x.weekStart === c.weekStart && x.domain === c.domain;
      });
      if (!dup) j.weeklyCommitments.push(c);
    });

    chrome.storage.local.set({ miroir_journal: j }, function() {
      // Vider la queue après consommation
      try { localStorage.removeItem("miroir_commits_pending"); } catch(e) {}
      // Re-pousser le journal mis à jour vers la PWA
      pushToPwa();
    });
  });
}

// Écoute des postMessage venant de la PWA (ajout / suppression d'engagement)
if (typeof window !== "undefined" && window.addEventListener) {
  window.addEventListener("message", function(e) {
    if (!isPwaPage()) return;
    if (!e.data || !e.data.type) return;

    if (e.data.type === "MIROIR_PWA_COMMIT" && e.data.commit) {
      var c = e.data.commit;
      chrome.storage.local.get("miroir_journal", function(data) {
        var j = data.miroir_journal || { interceptions:[], weeklyCommitments:[], mirrorQuestionStats:{}, settings:{} };
        if (!j.weeklyCommitments) j.weeklyCommitments = [];
        var dup = j.weeklyCommitments.some(function(x) {
          return x.weekStart === c.weekStart && x.domain === c.domain;
        });
        if (!dup) j.weeklyCommitments.push(c);
        chrome.storage.local.set({ miroir_journal: j }, function() { pushToPwa(); });
      });
    }

    if (e.data.type === "MIROIR_PWA_DEL_COMMIT") {
      var domain = e.data.domain, ws = e.data.weekStart;
      chrome.storage.local.get("miroir_journal", function(data) {
        var j = data.miroir_journal || { interceptions:[], weeklyCommitments:[], mirrorQuestionStats:{}, settings:{} };
        j.weeklyCommitments = (j.weeklyCommitments || []).filter(function(x) {
          return !(x.weekStart === ws && x.domain === domain);
        });
        chrome.storage.local.set({ miroir_journal: j }, function() { pushToPwa(); });
      });
    }

    // v7.3 — sync des passions depuis la PWA
    if (e.data.type === "MIROIR_PWA_PASSIONS" && Array.isArray(e.data.passions)) {
      var newPassions = e.data.passions.slice(0, 30);
      chrome.storage.local.get("miroir_profile", function(data) {
        var p = data.miroir_profile || {};
        p.passions = newPassions;
        chrome.storage.local.set({ miroir_profile: p }, function() {
          PROFILE.passions = newPassions;
          pushToPwa();
        });
      });
    }
  });
}

// ── Consommer les passions en attente dans localStorage (fallback) ──
function consumePendingPassions() {
  if (!isPwaPage()) return;
  var raw;
  try {
    raw = localStorage.getItem("miroir_passions");
  } catch(e) { return; }
  if (!raw) return;
  try {
    var passions = JSON.parse(raw);
    if (!Array.isArray(passions)) return;
    chrome.storage.local.get("miroir_profile", function(data) {
      var p = data.miroir_profile || {};
      // Ne pas écraser si identique (évite les writes inutiles)
      var cur = JSON.stringify(p.passions || []);
      var incoming = JSON.stringify(passions);
      if (cur === incoming) return;
      p.passions = passions.slice(0, 30);
      chrome.storage.local.set({ miroir_profile: p }, function() {
        PROFILE.passions = p.passions;
      });
    });
  } catch(e) {}
}

// ─────────────────────────────────────────
// CHARGEMENT
// ─────────────────────────────────────────
function loadProfile() {
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get("miroir_profile", function(data) {
      if (data && data.miroir_profile) {
        var p = data.miroir_profile;
        if (Array.isArray(p.ambitions))      PROFILE.ambitions     = p.ambitions;
        if (Array.isArray(p.customAmbitions))PROFILE.customAmbitions = p.customAmbitions;
        if (Array.isArray(p.domains))        PROFILE.domains       = p.domains;
        if (p.lifePhrase)                    PROFILE.lifePhrase    = p.lifePhrase;
        if (p.apiKey !== undefined)          PROFILE.apiKey        = p.apiKey;
        if (p.enabled !== undefined)         PROFILE.enabled       = p.enabled;
        if (Array.isArray(p.customDomains))  PROFILE.customDomains = p.customDomains;
        if (p.userIban)                      PROFILE.userIban      = p.userIban;
        if (p.userIbanName)                  PROFILE.userIbanName  = p.userIbanName;
        if (p.preferredTransferMethod)       PROFILE.preferredTransferMethod = p.preferredTransferMethod;
        if (Array.isArray(p.passions))       PROFILE.passions      = p.passions;
      }
      init();
      // Pont PWA : si on est sur la PWA, pousser journal + profil et consommer les engagements en attente
      if (isPwaPage()) {
        consumePendingCommits();
        consumePendingPassions();
        setTimeout(pushToPwa, 300);   // immédiat
        setTimeout(pushToPwa, 1500);  // retry au cas où la PWA n'a pas fini son init
      }
    });
  } else { init(); }
}

if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener(function(msg) {
    if (msg.type === "PROFILE_UPDATED" && msg.profile) {
      var p = msg.profile;
      // Mise à jour des champs — domains accepte aussi le tableau vide []
      if (p.ambitions)                     PROFILE.ambitions     = p.ambitions;
      if (p.customAmbitions)               PROFILE.customAmbitions = p.customAmbitions;
      if (Array.isArray(p.domains))        PROFILE.domains       = p.domains;
      if (p.lifePhrase)                    PROFILE.lifePhrase    = p.lifePhrase;
      if (p.apiKey !== undefined)          PROFILE.apiKey        = p.apiKey;
      if (p.enabled !== undefined)         PROFILE.enabled       = p.enabled;
      if (p.customDomains)                 PROFILE.customDomains = p.customDomains;
      if (Array.isArray(p.passions))       PROFILE.passions      = p.passions;

      // ── Ré-évaluer en temps réel selon les nouveaux paramètres ──

      // 1. Extension désactivée globalement → tout masquer
      if (!PROFILE.enabled) {
        if (socialActive) stopSocialMode();
        if (overlayBuilt) {
          if (EL.avatarWrap) EL.avatarWrap.style.display = "none";
          if (EL.intercept)  EL.intercept.classList.remove("show");
        }
        return;
      }

      // 2. Extension ré-activée → ré-afficher l'avatar si overlay déjà construit
      if (overlayBuilt && EL.avatarWrap) EL.avatarWrap.style.display = "";

      // 3. Mode social — respecter le choix du chip "Réseaux"
      var socialEnabled = PROFILE.domains.indexOf("social") !== -1;
      if (isSocialSite()) {
        if (socialActive && !socialEnabled) {
          // L'utilisateur vient de décocher "Réseaux" → désactiver maintenant
          stopSocialMode();
        } else if (!socialActive && socialEnabled) {
          // L'utilisateur vient de cocher "Réseaux" → activer maintenant
          if (!overlayBuilt) buildOverlay();
          initSocialMode();
          if (EL_S.wrap) EL_S.wrap.style.display = "";
        }
      }
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadProfile);
} else {
  loadProfile();
}
