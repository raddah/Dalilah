# Dalilah OKF Knowledge Base

This directory is the versioned, bilingual knowledge layer for Dalilah. Each card is Markdown with YAML frontmatter and traceable source metadata.

## Rules

- Only `verified: true` cards may be projected into production retrieval.
- Every factual card must cite a specific source URL.
- Keep Arabic and English records separate but use the same stable `id` when they describe the same entity.
- Preserve `last_verified` and `stale_after` dates.
- Do not store API keys, tokens, passwords, or private R2 credentials here.

## Layout

- `ar/` — Arabic policy and source records.
- `en/` — English policy and source records.
- `cards/` — focused, retrieval-ready knowledge cards.

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
```

The D1 projection stores source metadata and operational relationships. Vectorize is intentionally deferred until keyword retrieval and source review are stable.
