"use strict";
// ── MIROIR — background.js v7 ──
// Gère : stockage profil, appels API Anthropic, relay messages

// ─── INSTALLATION ───
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("miroir_profile", (data) => {
    if (!data.miroir_profile) {
      chrome.storage.local.set({
        miroir_profile: {
          ambitions: ["epargne", "ecologie"],
          domains: ["fashion", "shopping", "delivery", "food", "social", "travel", "housing", "subscription"],
          lifePhrase: "Je veux construire une vie qui me ressemble.",
          enabled: true,
          apiKey: ""
        }
      });
    }
  });
});

// ─── MESSAGE HANDLER ───

// Extrait le JSON depuis une réponse qui peut contenir du markdown
function extractJSON(raw) {
  if (!raw) throw new Error("Réponse vide");
  let s = raw.trim();
  // Enlever les blocs ```json ... ``` ou ``` ... ```
  s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  // Si ça commence par du texte avant {, chercher le premier {
  const braceIdx = s.indexOf("{");
  const bracketIdx = s.indexOf("[");
  const start = braceIdx === -1 ? bracketIdx : bracketIdx === -1 ? braceIdx : Math.min(braceIdx, bracketIdx);
  if (start > 0) s = s.slice(start);
  // Couper tout ce qui dépasse le JSON (texte après la dernière } ou ])
  const lastBrace   = s.lastIndexOf("}");
  const lastBracket = s.lastIndexOf("]");
  const end = Math.max(lastBrace, lastBracket);
  if (end !== -1 && end < s.length - 1) s = s.slice(0, end + 1);
  return JSON.parse(s);
}

// ─── HELPER APPEL CLAUDE ───
async function claudeCall(apiKey, { model, system, messages, tools, maxTokens, useCaching }) {
  const headers = {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  };
  if (useCaching) headers["anthropic-beta"] = "prompt-caching-2024-07-31";
  const body = { model, max_tokens: maxTokens, system, messages };
  if (tools) body.tools = tools;
  return fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  });
}

// ─── HELPERS JOURNAL ───
function buildRecentDecisionsContext(journal) {
  const interceptions = (journal?.interceptions || []).slice(-10).reverse();
  if (interceptions.length === 0) return "";

  const lines = interceptions.map(i => {
    const price = i.product?.price ? ` (${i.product.price})` : "";
    const name = i.product?.title?.slice(0, 40) || i.url?.split("/")[2] || "produit";
    const decision = i.decision === "abandoned" ? "abandonné" : i.decision === "alternative" ? "alternatif" : "continué";
    const q = i.mirrorQuestion ? ` — q: "${i.mirrorQuestion.slice(0, 50)}"` : "";
    return `• ${name}${price} → ${decision}${q}`;
  });

  const abandoned = interceptions.filter(i => i.decision === "abandoned").length;
  const rate = Math.round((abandoned / interceptions.length) * 100);
  return `\nHISTORIQUE RÉCENT (${interceptions.length} dernières décisions — taux d'abandon : ${rate}%) :\n${lines.join("\n")}\nUtilise ce contexte pour personnaliser ton analyse : si l'utilisateur abandonne souvent dans cette catégorie, renforce le signal ; s'il continue toujours, rends la question miroir plus directe et chiffrée.`;
}

function buildMirrorQuestionContext(journal) {
  const stats = journal?.mirrorQuestionStats || {};
  const entries = Object.entries(stats).filter(([, v]) => v.shown >= 2);
  if (entries.length === 0) return "";

  const ineffective = entries
    .filter(([, v]) => (v.abandoned / v.shown) < 0.25)
    .map(([q]) => `"${q.slice(0, 60)}"`)
    .slice(0, 3);
  const effective = entries
    .filter(([, v]) => (v.abandoned / v.shown) >= 0.6)
    .map(([q]) => `"${q.slice(0, 60)}"`)
    .slice(0, 3);

  let ctx = "\nEFFICACITÉ DES QUESTIONS MIROIR PASSÉES :";
  if (effective.length) ctx += `\nQuestions qui ont fait abandonner (à imiter) : ${effective.join(", ")}.`;
  if (ineffective.length) ctx += `\nQuestions ignorées (à éviter) : ${ineffective.join(", ")}.`;
  ctx += "\nGénère une question miroir différente de celles ci-dessus, courte, chiffrée si possible, et directement liée au coût d'opportunité.";
  return ctx;
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // Sauvegarde profil
  if (msg.type === "SAVE_PROFILE") {
    chrome.storage.local.set({ miroir_profile: msg.profile }, () => {
      // Notifie tous les tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          if (tab.id && tab.url && !tab.url.startsWith("chrome://")) {
            chrome.tabs.sendMessage(tab.id, {
              type: "PROFILE_UPDATED",
              profile: msg.profile
            }).catch(() => {});
          }
        });
      });
      sendResponse({ ok: true });
    });
    return true;
  }

  // ─── ANALYSE PRODUIT VIA CLAUDE ───
  if (msg.type === "ANALYZE_PRODUCT") {
    chrome.storage.local.get(["miroir_profile", "miroir_journal"], async (data) => {
      const profile = data.miroir_profile || {};
      const journal = data.miroir_journal || {};
      const apiKey = profile.apiKey || "";

      if (!apiKey) {
        sendResponse({ error: "NO_KEY" });
        return;
      }

      const { product, ambitions, lifePhrase, url, passions } = msg;

      // Construire la liste complète des engagements (standard + custom)
      const customAmbitions = profile.customAmbitions || [];
      const customLabels = customAmbitions.map(c => c.label);
      const allEngagements = [...ambitions, ...customLabels];

      // Construire la liste des types autorisés selon les ambitions standard
      const AMB_TO_TYPES = {
        ecologie:  ["ecologie", "transport", "ethique"],
        epargne:   ["epargne", "prix"],
        voyage:    ["epargne", "prix"],
        projet:    ["epargne", "prix"],
        formation: ["epargne", "prix", "qualite"],
        sante:     ["sante", "qualite"],
        logement:  ["epargne", "prix"],
        impact:    ["ethique", "ecologie"],
        esprit_critique: []
      };
      const allowedTypes = [...new Set(ambitions.flatMap(a => AMB_TO_TYPES[a] || []))];
      // Les objectifs custom ajoutent leurs propres types libres
      if (customLabels.length > 0) {
        allowedTypes.push(...customLabels.map(l => l.toLowerCase()));
      }

      const customSection = customLabels.length > 0
        ? `\nObjectifs personnalisés de l'utilisateur : ${customLabels.join(", ")}.\nCes objectifs personnalisés DOIVENT être pris en compte dans l'analyse au même titre que les engagements standard. Analyse l'impact du produit sur chacun de ces objectifs personnalisés.`
        : "";

      // v7.3 : passions de l'utilisateur pour générer l'alternative "Plus toi"
      const userPassions = Array.isArray(passions) ? passions.filter(p => p && typeof p === "string").slice(0, 15) : [];
      const passionsSection = userPassions.length > 0
        ? `\nPassions de l'utilisateur (CE QU'IL AIME VRAIMENT) : ${userPassions.join(", ")}.\nCes passions doivent inspirer l'alternative "Plus toi" — suggérer une expérience, un achat ou une pratique qui nourrit CES passions précises avec le même budget.`
        : `\nL'utilisateur n'a pas renseigné ses passions. L'alternative "Plus toi" sera remplacée par une expérience enrichissante généraliste.`;

      // Contexte personnalisé depuis le journal (comportement réel de l'utilisateur)
      const recentDecisions = buildRecentDecisionsContext(journal);
      const mirrorQStats = buildMirrorQuestionContext(journal);

      // Partie stable du prompt → mise en cache (profil + règles fixes)
      const systemStable = `Tu es l'assistant de l'application Miroir, qui aide à transformer les achats impulsifs en choix conscients.

L'utilisateur a ces engagements : ${allEngagements.join(", ")}.
Sa phrase d'engagement : "${lifePhrase}"${customSection}${passionsSection}

RÈGLE STRICTE : tu n'analyses QUE ce qui touche à ces engagements (standard ET personnalisés). Tu n'introduis AUCUN autre angle.
Types de signals autorisés : ${allowedTypes.join(", ") || allEngagements.join(", ")}.

Réponds UNIQUEMENT en JSON valide, sans markdown :
{"productName":"string","verdict":"bon"|"attention"|"danger","score":1-10,"signals":[{"type":"string","icon":"emoji","title":"5 mots max","detail":"1-2 phrases concrètes","impact":"positif"|"negatif"|"neutre"}],"mirrorQuestion":"question courte","crossAlts":[{"kind":"smart"|"you"|"free","ico":"emoji","name":"nom court","desc":"1 phrase concrète","save":"bénéfice court","badge":"mot clé","url":"https://url-réelle.com","dom":"domaine.com"}]}

Génère 2 à 3 signals maximum, tous liés aux engagements listés ci-dessus.

Pour crossAlts : génère EXACTEMENT 3 alternatives dans cet ordre précis, chacune avec son "kind" :

1. kind="smart" — ALTERNATIVE PLUS MALIN (substitution éthique/économique du même besoin)
   Ex: LEGO Ferrari → "Leboncoin LEGO d'occasion"
   Ex: iPhone → "Back Market iPhone reconditionné"
   Ex: Sérum Nuxe → "Huile Aroma-Zone équivalente"
   badge: "Malin" / "Seconde main" / "Local"

2. kind="you" — ALTERNATIVE PLUS TOI (au même prix, ou moins, une expérience qui nourrit SES PASSIONS précises)
   Tu DOIS puiser dans les passions listées ci-dessus.
   Si le produit coûte X €, propose une expérience au même budget liée à une passion.
   Ex: Uber Eats 35€ + passion "cuisine japonaise" → "Resto yakiniku local à 32€"
   Ex: Sac Shein 45€ + passion "photo argentique" → "Pellicule + développement 2 rouleaux"
   Ex: iPhone 1200€ + passion "voyage slow" → "Weekend train de nuit Paris-Milan"
   Le nom DOIT mentionner la passion activée. Le desc DOIT mentionner le prix équivalent.
   badge: nom de la passion courte (ex: "Cuisine JP" / "Photo argentique")

3. kind="free" — ALTERNATIVE PLUS LIBRE (expérience GRATUITE ou quasi-gratuite connectée à une ambition ou passion)
   Ex: "Randonnée au Bois de Vincennes" / "Méditation guidée 20 min" / "Tuto cuisine italienne YouTube"
   Ex: Avec passion "littérature" → "Lecture 1h dans un parc"
   badge: "Gratuit" / "0€"
   URL optionnelle (peut pointer vers YouTube/Wikipedia/app gratuite), dom peut être vide.

RÈGLES DURES :
- Les 3 alternatives doivent être PRÉCISES (pas génériques), cliquables si URL fournie, et réalistes.
- Les prix doivent être cohérents avec le produit de départ.
- Pour kind="you", si aucune passion n'est renseignée, propose une expérience qualitative enrichissante (cours, soirée, activité locale).`;

      // Partie dynamique → contexte comportemental de l'utilisateur (non mis en cache car change à chaque analyse)
      const systemDynamic = recentDecisions + mirrorQStats;

      // Système final : tableau pour activer le cache sur la partie stable
      const systemPrompt = systemDynamic
        ? [
            { type: "text", text: systemStable, cache_control: { type: "ephemeral" } },
            { type: "text", text: systemDynamic }
          ]
        : systemStable;

      const userPrompt = `Produit consulté :
URL: ${url}
Titre de la page: ${product.title}
Prix: ${product.price || "non détecté"}
Marque/Site: ${product.brand || product.site}
Description courte: ${product.description || "non disponible"}
Catégorie détectée: ${product.category}

Analyse ce produit selon les engagements de l'utilisateur et génère les 3 alternatives (smart / you / free) en respectant strictement les consignes du système.`;

      try {
        const response = await claudeCall(apiKey, {
          model: "claude-sonnet-4-20250514",
          maxTokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
          useCaching: Array.isArray(systemPrompt)
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          sendResponse({ error: err.error?.message || "API_ERROR", status: response.status });
          return;
        }

        const data2 = await response.json();
        const raw = data2.content?.[0]?.text || "";

        // Parse JSON robuste — gère backticks, texte avant/après, etc.
        const parsed = extractJSON(raw);
        sendResponse({ ok: true, analysis: parsed });

      } catch (e) {
        sendResponse({ error: e.message || "PARSE_ERROR" });
      }
    });
    return true; // async
  }

  // ─── ANALYSE MÉDIA VIA CLAUDE (v7.4 — Haiku rapide) ───
  if (msg.type === "ANALYZE_MEDIA") {
    chrome.storage.local.get("miroir_profile", async (data) => {
      const profile = data.miroir_profile || {};
      const apiKey = profile.apiKey || "";
      if (!apiKey) { sendResponse({ error: "NO_KEY" }); return; }

      const { content, ambitions, passions, lifePhrase } = msg;
      if (!content || !content.title) { sendResponse({ error: "NO_CONTENT" }); return; }

      const userPassions = Array.isArray(passions) ? passions.filter(p => p && typeof p === "string").slice(0, 15) : [];
      const userAmbitions = Array.isArray(ambitions) ? ambitions : [];

      const mediaSystemPrompt = `Tu es un analyste de contenu média pour l'application Miroir. Ton rôle : juger rapidement si un contenu (vidéo YouTube / TikTok / Reel Insta) est aligné avec les engagements et passions d'un utilisateur.

Engagements : ${userAmbitions.join(", ") || "non renseignés"}.
Passions : ${userPassions.join(", ") || "non renseignées"}.
Phrase de vie : "${lifePhrase || ""}"

Réponds UNIQUEMENT en JSON valide, sans markdown, sans préambule :
{
  "category": "learning"|"info"|"entertainment"|"ads"|"manipulation"|"inspiration",
  "alignment": 0-10,
  "passionMatch": "nom de passion exacte si match, sinon null",
  "manipulationSignals": ["signal1","signal2"],
  "summary": "1 phrase neutre qui décrit le contenu",
  "mirrorQuestion": "1 question courte si alignment<5, sinon null"
}

Guide de classement :
- "learning" : tutoriel, explication, savoir-faire, développement perso SÉRIEUX
- "info" : actu, news, journalisme, vulgarisation
- "entertainment" : humour, divertissement, fiction, divertissement pur sans autre valeur
- "ads" : publicité, sponso évidente, contenu promotionnel (#ad, code promo, unboxing, haul)
- "manipulation" : promesse miracle, body shaming, comparaison toxique, diète extrême, pseudo-investissement, get-rich-quick
- "inspiration" : motivation positive, récit de vie, art

Guide d'alignement (0-10) :
- 9-10 : contenu qui nourrit directement une passion ou ambition de l'utilisateur
- 6-8 : contenu enrichissant, pas directement lié mais compatible
- 3-5 : divertissement neutre
- 0-2 : contenu qui éloigne, pousse à consommer, crée de l'anxiété ou de la comparaison

Pour passionMatch : si la vidéo parle clairement d'UNE des passions listées, retourne le texte EXACT de cette passion. Sinon null.`;

      const mediaUserPrompt = `Contenu à analyser :
Plateforme : ${content.platform}
Créateur : ${content.creator || "inconnu"}
Titre : ${content.title}
Description : ${(content.description || "").slice(0, 400)}

Analyse en JSON selon les règles du système.`;

      try {
        const resp = await claudeCall(apiKey, {
          model: "claude-haiku-4-5-20251001",
          maxTokens: 400,
          system: mediaSystemPrompt,
          messages: [{ role: "user", content: mediaUserPrompt }]
        });
        if (!resp.ok) {
          const err = await resp.json().catch(() => ({}));
          sendResponse({ error: err.error?.message || "API_ERROR", status: resp.status });
          return;
        }
        const d = await resp.json();
        const raw = d.content?.[0]?.text || "";
        const parsed = extractJSON(raw);
        sendResponse({ ok: true, analysis: parsed });
      } catch(e) {
        sendResponse({ error: e.message || "PARSE_ERROR" });
      }
    });
    return true;
  }

  // ─── RECHERCHE SUJET VIA CLAUDE + WEB SEARCH (optimisé vitesse) ───
  if (msg.type === "RESEARCH_SUBJECT") {
    const apiKey = msg.apiKey || "";
    if (!apiKey) { sendResponse({ error: "NO_KEY" }); return true; }

    async function doResearch() {
      const { subject } = msg;
      const MODEL = "claude-haiku-4-5-20251001";
      const TOOLS = [{ type: "web_search_20250305", name: "web_search" }];

      const systemPrompt = `Tu es un vérificateur de sources rapide. Cherche le sujet sur le web, puis réponds UNIQUEMENT en JSON (sans markdown) :
{"coverage":"consensus"|"mitige"|"rare"|"absent","coverageLabel":"string","coverageSummary":"1 phrase","summary":"2 phrases neutres","divergences":[{"point":"5 mots max","detail":"string"}],"sources":[{"name":"string","url":"url","excerpt":"1 phrase","bias":"favorable"|"critique"|"neutre"}],"criticalQuestion":"string"}
sources: 2-4 liens réels. divergences: [] si aucun désaccord.`;

      const systemPromptNoSearch = systemPrompt + `\nTu n'as pas accès au web — utilise tes connaissances d'entraînement pour estimer la couverture médiatique et citer des sources connues plausibles.`;

      const userMsg = `Sujet: "${subject.title}" (${subject.site})${subject.desc ? " — "+subject.desc.slice(0,80) : ""}`;

      // Tentative 1 : avec web search
      async function tryWithSearch() {
        let messages = [{ role: "user", content: userMsg }];
        let attempts = 0;
        const MAX_TURNS = 4;

        while (attempts < MAX_TURNS) {
          attempts++;
          const resp = await claudeCall(apiKey, {
            model: MODEL, maxTokens: 1200,
            system: systemPrompt, tools: TOOLS,
            messages: messages
          });

          if (!resp.ok) {
            const e = await resp.json().catch(() => ({}));
            const errMsg = e.error?.message || "";
            // Web search non dispo sur ce plan → fallback sans outil
            if (resp.status === 400 && (errMsg.includes("web_search") || errMsg.includes("tool") || errMsg.includes("beta"))) {
              return null; // signal pour basculer sur le fallback
            }
            throw new Error(errMsg || "ERR_" + resp.status);
          }

          const data = await resp.json();

          if (data.stop_reason === "end_turn" || data.stop_reason === "max_tokens") {
            const raw = data.content?.find(b => b.type === "text")?.text || "";
            return extractJSON(raw);
          }

          if (data.stop_reason === "tool_use") {
            messages.push({ role: "assistant", content: data.content });
            // Pour les tools server-side (web_search), l'API gère les résultats elle-même.
            // Si l'API demande quand même un tool_result, on fournit un contenu vide valide.
            const toolResults = data.content
              .filter(b => b.type === "tool_use")
              .map(b => ({ type: "tool_result", tool_use_id: b.id, content: "" }));
            if (toolResults.length > 0) {
              messages.push({ role: "user", content: toolResults });
            }
            continue;
          }

          // Fallback : texte présent sans stop_reason reconnu
          const fallbackRaw = data.content?.find(b => b.type === "text")?.text || "";
          if (fallbackRaw) return extractJSON(fallbackRaw);
          throw new Error("Réponse inattendue de l'API");
        }
        throw new Error("Trop de tours de recherche");
      }

      // Tentative 2 (fallback) : sans web search, connaissances du modèle
      async function tryWithoutSearch() {
        const resp = await claudeCall(apiKey, {
          model: MODEL, maxTokens: 1200,
          system: systemPromptNoSearch,
          messages: [{ role: "user", content: userMsg }]
        });
        if (!resp.ok) {
          const e = await resp.json().catch(() => ({}));
          throw new Error(e.error?.message || "ERR_" + resp.status);
        }
        const data = await resp.json();
        const raw = data.content?.find(b => b.type === "text")?.text || "";
        return extractJSON(raw);
      }

      try {
        let result = await tryWithSearch();
        if (result === null) {
          // Web search non disponible → fallback
          result = await tryWithoutSearch();
        }
        sendResponse({ ok: true, research: result });
      } catch(e) {
        sendResponse({ error: e.message || "FETCH_ERROR" });
      }
    }

    doResearch();
    return true;
  }
});
