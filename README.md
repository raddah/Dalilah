# Dalilah App

A bilingual, grounded Saudi heritage assistant built with Astro Full-stack, React Islands, Cloudflare Workers, and Gemini.

The public experience is available at `/ar/` and `/en/`. Arabic uses RTL layout and English uses LTR layout. The chat sends the selected language to Gemini and returns a structured answer in that language.

## Architecture

```text
Astro
├── Public website pages
├── React Island for the chat interface
├── Server API routes
└── Cloudflare adapter

Cloudflare Workers
├── Gemini API integration
├── D1 for trusted sources and conversations
├── R2 for images and documents
├── KV for cache and sessions
└── Vectorize later for semantic RAG
```

## Final MVP architecture

```text
OKF in GitHub
├── Human-readable Markdown and YAML frontmatter
├── Verified sources and freshness metadata
├── Arabic and English content
└── Relationships between sites, sources, and media

Cloudflare projection
├── D1 for entities, relationships, sources, and conversations
├── R2 for original images and documents
├── KV for cache and sessions
└── Vectorize corpus prepared but runtime integration deferred
```

The MVP uses alias-first plus FTS5 retrieval: OKF is the canonical knowledge layer, an automated projector upserts D1 entities and claim-level provenance, R2 serves approved media, and Gemini generates answers only from verified context. Vectorize is intentionally not a runtime dependency yet.

## Internationalization

- Arabic route: `/ar/`
- English route: `/en/`
- Arabic pages use `lang="ar"` and `dir="rtl"`.
- English pages use `lang="en"` and `dir="ltr"`.
- SEO metadata and alternate language links are generated per route.
- Sites should provide Arabic and English titles and descriptions in OKF.

The browser never calls Gemini directly. The Astro API route retrieves trusted evidence, calls Gemini with a Worker secret, validates the structured response, stores the conversation, and returns a stable response to the chat island.

## Chat response rendering

- Assistant answers render safe Markdown and GitHub Flavored Markdown without executing raw HTML.
- The UI supports headings, lists, links, tables, inline code, and fenced code blocks in RTL and LTR layouts.
- Users can copy the original Markdown response or copy an individual code block through localized copy actions.

## Requirements

- Node.js LTS.
- A Cloudflare account.
- A Gemini API key from Google AI Studio or Google Cloud.
- Wrangler authentication.

## Local setup

```bash
npm install
cp .dev.vars.example .dev.vars
npx wrangler login
npm run dev
```

Edit `.dev.vars` and set `GEMINI_API_KEY`. Never commit that file.

## Create Cloudflare resources

For the complete infrastructure sequence and MVP completion checklist, see:

[`../implementation/dalilah-project/docs/04-cloudflare-infrastructure-setup.md`](../implementation/dalilah-project/docs/04-cloudflare-infrastructure-setup.md)

```bash
npx wrangler d1 create dalilah-db
npx wrangler r2 bucket create dalilah-media
npx wrangler kv namespace create CACHE
```

Copy the returned IDs into `wrangler.jsonc`, then generate the binding types:

```bash
npm run cf-typegen
```

Apply the database migration locally:

```bash
npx wrangler d1 migrations apply dalilah-db --local
```

Apply it remotely only after reviewing the target environment:

```bash
npx wrangler d1 migrations apply dalilah-db --remote
```

## Gemini production secret

```bash
npx wrangler secret put GEMINI_API_KEY
npx wrangler secret put GEMINI_MODEL
```

The model is configurable because model availability and names can change. Verify the selected model before production deployment.

## Run checks

```bash
npm run check
npm run typecheck
npm run build
```

## Deploy

```bash
npm run deploy
```

After deployment, verify:

```text
https://YOUR_DOMAIN/api/health
```

## Trusted data workflow

1. Collect only approved sources such as the Saudi Heritage Commission, Visit Saudi, UNESCO, and Saudi government open data.
2. Store source metadata and searchable descriptions in D1.
3. Store original images and documents in R2.
4. Add image keys and source IDs to the content model.
5. Retrieve relevant evidence before calling Gemini.
6. Display citations with every factual answer.
7. Return insufficient evidence instead of guessing.

Build and validate the complete knowledge projection:

```bash
npm run build:knowledge
npx wrangler d1 migrations apply dalilah-db --local
npx wrangler d1 execute dalilah-db --local --file generated/okf-projection.sql
```

`knowledge-base/okf/catalog.json` is the machine-readable source of truth. Important facts use stable claim IDs, and `knowledge_projection_runs` records the exact catalog SHA-256 applied to D1.

## Current MVP limitation

Retrieval uses aliases and D1 FTS5 rather than semantic embeddings. `generated/vectorize-corpus.ndjson` prepares stable claim records and metadata, but embeddings, index creation, runtime bindings, and hybrid ranking remain deferred until the corpus and evaluation set justify them.

## Admin and BaaS decision

An Admin page and an external BaaS are intentionally out of scope for the MVP.

Knowledge is curated in OKF files through GitHub pull requests, validated, and projected into D1, R2, and Vectorize. Cloudflare Workers, D1, R2, KV, and Vectorize provide the backend services required for the MVP, so Firebase or Supabase is not required.

Add an Admin page later when non-technical editors need to manage sources, images, freshness, moderation, or users.

## Project references

- `../implementation/ASTRO_FULL_STACK_EXECUTION_PLAN.md` contains the complete English execution plan.
- `../implementation/architecture.mmd` contains the architecture diagram source.
- `../knowledge-base/` contains the current source policy and content model.

## Security rules

- Never commit `.dev.vars`, `.env`, or API keys.
- Never expose the Gemini key in public environment variables.
- Validate every request body.
- Limit message and upload sizes.
- Keep R2 private unless a public asset is explicitly approved.
- Do not let Gemini create citations that are not present in the evidence set.
