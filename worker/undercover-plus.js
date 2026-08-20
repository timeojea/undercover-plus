// Undercover+ — Proxy IA (Cloudflare Worker)
// -------------------------------------------------
// Garde la cle Google Gemini cote serveur : le front n'y a jamais acces.
// Le client envoie { theme, lang, count, existing } et recoit { pairs: [[civil, undercover], ...] }.
//
// Config (Cloudflare > Settings > Variables) :
//   - GEMINI_API_KEY : secret (ta cle Google AI Studio)  -> "Encrypt"
//   - ALLOWED_ORIGIN : optionnel, ex "https://timeojea.github.io" (verrouille le CORS)
//
// Deploiement : voir worker/README.md

// On tente le meilleur modele d'abord, puis on retombe sur flash-lite si surcharge (503).
const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(env, origin);

    // Preflight CORS
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: "Methode non autorisee." }, 405, cors);
    }
    if (!env.GEMINI_API_KEY) {
      return json({ error: "GEMINI_API_KEY absente cote serveur." }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Corps JSON invalide." }, 400, cors);
    }

    const theme = String(body.theme || "").trim().slice(0, 80);
    const lang = body.lang === "en" ? "en" : "fr";
    const count = Math.min(Math.max(parseInt(body.count, 10) || 15, 1), 30);
    const existing = Array.isArray(body.existing) ? body.existing.slice(0, 200) : [];

    if (!theme) {
      return json({ error: "Theme manquant." }, 400, cors);
    }

    const prompt = buildPrompt({ theme, lang, count, existing });

    let lastError = "Erreur inconnue.";
    // On essaie chaque modele dans l'ordre ; un 503 (surcharge) fait passer au suivant.
    for (const model of MODELS) {
      let data;
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 1.1, // varie les resultats d'une generation a l'autre
                topP: 0.95,
                responseMimeType: "application/json",
                // Pas de raisonnement : inutile pour des paires de mots, et ca coute ~10s.
                thinkingConfig: { thinkingBudget: 0 },
                responseSchema: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      civil: { type: "string" },
                      undercover: { type: "string" },
                    },
                    required: ["civil", "undercover"],
                  },
                },
              },
            }),
          }
        );

        data = await geminiRes.json();
      } catch (e) {
        lastError = "Erreur reseau vers Gemini : " + e.message;
        continue; // on tente le modele suivant
      }

      if (data.error) {
        lastError = `Gemini (${data.error.code}): ${data.error.message}`;
        // 503 = surcharge temporaire -> on tente le modele suivant. Autre erreur -> on arrete.
        if (data.error.code === 503 || data.error.code === 429) continue;
        return json({ error: lastError }, 502, cors);
      }

      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) {
        lastError = "Reponse vide de l'IA (filtre de securite ?).";
        continue;
      }

      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch {
        lastError = "L'IA n'a pas renvoye de JSON valide.";
        continue;
      }

      const pairs = normalizePairs(parsed, existing);
      if (pairs.length === 0) {
        lastError = "Aucune paire exploitable generee.";
        continue;
      }

      return json({ pairs }, 200, cors);
    }

    // Tous les modeles ont echoue
    return json({ error: lastError + " Reessaie dans un instant." }, 502, cors);
  },
};

// --- Prompt : c'est ici que se joue la qualite des paires ---
function buildPrompt({ theme, lang, count, existing }) {
  const langLabel = lang === "en" ? "anglais" : "francais";
  const examples =
    lang === "en"
      ? `Cafe / Tea, Lion / Tiger, Guitar / Violin, Subway / Tram, Pizza / Quiche, Beach / Desert`
      : `Cafe / The, Lion / Tigre, Guitare / Violon, Metro / Tram, Pizza / Quiche, Plage / Desert`;
  const bad =
    lang === "en"
      ? `Car / Automobile (synonyms), Dog / Table (unrelated), Photosynthesis / Mitochondria (too technical)`
      : `Voiture / Automobile (synonymes), Chien / Table (sans rapport), Photosynthese / Mitochondrie (trop technique)`;

  const existingBlock =
    existing.length > 0
      ? `\nNe repete AUCUNE de ces paires deja presentes : ${existing
          .map((p) => `${p[0]}/${p[1]}`)
          .join(", ")}.`
      : "";

  return `Tu generes des paires de mots pour le jeu de deduction sociale "Undercover".
Regle du jeu : les Civils recoivent le 1er mot, l'Undercover recoit le 2e. Une BONNE paire = deux choses DIFFERENTES de la MEME categorie, assez proches pour se decrire de facon ambigue, mais distinctes pour qu'un joueur attentif puisse reperer l'intrus.

Contraintes STRICTES :
- Les deux mots appartiennent au meme univers (ex : deux animaux, deux boissons, deux lieux).
- Proches mais JAMAIS synonymes ni identiques.
- Concrets et connus du grand public, pas de terme obscur ou trop technique.
- 1 a 2 mots maximum par entree, jamais une phrase.
- On doit pouvoir decrire les deux mots avec des indices communs sans qu'un seul indice ne trahisse lequel c'est.
- Sortie exclusivement en ${langLabel}.

Bons exemples : ${examples}.
A EVITER : ${bad}.

Theme demande : "${theme}".
Genere ${count} paires ORIGINALES et VARIEES sur ce theme, sans doublon entre elles.${existingBlock}`;
}

// Nettoie, valide et dedoublonne les paires renvoyees par l'IA.
function normalizePairs(parsed, existing) {
  if (!Array.isArray(parsed)) return [];
  const seen = new Set(
    existing
      .filter((p) => Array.isArray(p) && p.length === 2)
      .map((p) => key(p[0], p[1]))
  );
  const out = [];
  for (const item of parsed) {
    let a, b;
    if (Array.isArray(item) && item.length === 2) {
      [a, b] = item;
    } else if (item && typeof item === "object") {
      a = item.civil ?? item.civilian ?? item[0];
      b = item.undercover ?? item.impostor ?? item[1];
    }
    a = clean(a);
    b = clean(b);
    if (!a || !b) continue;
    if (a.toLowerCase() === b.toLowerCase()) continue; // paire identique
    const k = key(a, b);
    if (seen.has(k)) continue; // doublon
    seen.add(k);
    out.push([a, b]);
  }
  return out;
}

function clean(s) {
  if (typeof s !== "string") return "";
  return s.trim().replace(/\s+/g, " ").slice(0, 40);
}
function key(a, b) {
  return [a, b].map((x) => String(x).trim().toLowerCase()).sort().join("|");
}

function corsHeaders(env, origin) {
  const allowed = env.ALLOWED_ORIGIN; // ex "https://timeojea.github.io"
  const allowOrigin = !allowed ? "*" : origin === allowed ? origin : allowed;
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...cors },
  });
}
