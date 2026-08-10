# Dalilah OKF Knowledge Base

This directory is the versioned, bilingual knowledge layer for Dalilah. Editorial cards are Markdown with YAML frontmatter; `catalog.json` is the validated machine-readable projection contract.

## Rules

- Only `verified: true` cards may be projected into production retrieval.
- Every factual card must cite a specific source URL.
- Keep Arabic and English records separate but use the same stable `id` when they describe the same entity.
- Preserve `last_verified` and `stale_after` dates.
- Do not store API keys, tokens, passwords, or private R2 credentials here.
- Give important factual statements a stable `claim_id` linked to a `source_id`.
- Serve production media from private R2 through `/api/media/`; retain the original source URL, rights holder, and SHA-256 in the catalog.

## Layout

- `ar/` — Arabic policy and source records.
- `en/` — English policy and source records.
- `cards/` — focused, retrieval-ready knowledge cards.
- `catalog.json` — canonical sites, sources, aliases, claims, media provenance, and R2 paths.
- `../../generated/okf-projection.sql` — deterministic D1 projection generated from the catalog.
- `../../generated/vectorize-corpus.ndjson` — embedding input prepared for the deferred Vectorize phase.

## Record contract

```yaml
id: string
title: string
language: ar | en
type: place | source | guide | policy
source_url: https://example.com/specific-page
source_type: official | unesco | government | museum | reviewed
source_credibility: high | medium | low
verified: true | false
last_verified: YYYY-MM-DD
stale_after: YYYY-MM-DD
tags: []
related_concepts: []
source_id: source.authority.record
claim_ids: [claim.place.fact]
```

## Projection workflow

```bash
npm run build:knowledge
npx wrangler d1 migrations apply dalilah-db --local
npx wrangler d1 execute dalilah-db --local --file generated/okf-projection.sql
```

The projector is non-destructive and idempotent: it upserts catalog records, refreshes aliases and FTS5, and records the catalog SHA-256 in `knowledge_projection_runs`. Schema changes still use reviewed D1 migrations; content changes do not require hand-written migrations.

Vectorize remains intentionally disabled at runtime until the corpus is larger and an embedding model, dimensions, evaluation set, and cost limits are approved.
