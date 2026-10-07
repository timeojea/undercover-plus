# Undercover+ AI proxy (Cloudflare Worker)

Keeps the Google Gemini key **server-side**. The front-end never calls Gemini directly: it calls this Worker, which adds the key and the prompt.

## 1. Get a Gemini API key

Create a free key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).

## 2. Deploy the Worker

Requirements: a (free) Cloudflare account and Node.js.

```bash
cd worker
npx wrangler login
npx wrangler secret put GEMINI_API_KEY   # paste your key when prompted
npx wrangler deploy
```

Wrangler prints the public URL, e.g. `https://undercover-plus.<your-subdomain>.workers.dev`.

## 3. Wire up the front-end

In [`../script.js`](../script.js), set `AI_ENDPOINT` (top of the file) to that URL.

## 4. Lock CORS (recommended)

So that only your site can call the Worker from a browser, uncomment `ALLOWED_ORIGIN` in [`wrangler.toml`](wrangler.toml), set it to your GitHub Pages domain, then run `npx wrangler deploy` again.

> CORS only restricts browsers. Anyone can still call the Worker with `curl`; your Gemini free-tier quota is the real limit.

## Test

```bash
curl -X POST https://undercover-plus.<your-subdomain>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"theme":"Harry Potter","lang":"en","count":5}'
```

Expected response: `{"pairs":[["Wand","Broom"], ...]}`

## API

`POST /` with a JSON body:

| Field | Type | Description |
|---|---|---|
| `theme` | string | Theme of the pairs (required) |
| `lang` | `"fr"` \| `"en"` | Language of the words |
| `count` | number | Number of pairs, 1–30 (default 15) |
| `existing` | `[string, string][]` | Pairs already in the pack, excluded from the result |

Models: `gemini-2.5-flash`, falling back to `gemini-2.5-flash-lite` on 503/429.
