# Proxy IA Undercover+ (Cloudflare Worker)

Garde la clé Google Gemini **côté serveur**. Le front n'appelle plus Gemini
directement : il appelle ce Worker, qui ajoute la clé et le prompt.

## 1. Révoquer l'ancienne clé (obligatoire)

L'ancienne clé a été publiée sur GitHub, elle est compromise.
Sur https://aistudio.google.com/apikey → supprime-la → crée-en une neuve.

## 2. Déployer le Worker

Prérequis : un compte Cloudflare (gratuit) et Node installé.

```bash
cd worker
npx wrangler login
npx wrangler secret put GEMINI_API_KEY   # colle la NOUVELLE clé quand c'est demandé
npx wrangler deploy
```

Wrangler affiche l'URL publique, du type :
`https://undercover-plus.<ton-sous-domaine>.workers.dev`

## 3. Brancher le front

Dans `../script.js`, en haut, remplace la valeur de `AI_ENDPOINT` par cette URL.

## 4. (Optionnel) Verrouiller le CORS

Pour que seul ton site puisse appeler le Worker, décommente `ALLOWED_ORIGIN`
dans `wrangler.toml` (mets ton domaine GitHub Pages), puis `npx wrangler deploy`.

## Tester

```bash
curl -X POST https://undercover-plus.<ton-sous-domaine>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"theme":"Harry Potter","lang":"fr","count":5}'
```

Réponse attendue : `{"pairs":[["Baguette","Balai"], ...]}`
