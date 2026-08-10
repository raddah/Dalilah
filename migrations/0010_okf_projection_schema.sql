-- Migration 0010: Schema required by the automated OKF projector.
-- Content is projected from knowledge-base/okf/catalog.json, not hand-authored here.

ALTER TABLE sites ADD COLUMN description_en TEXT;

CREATE TABLE IF NOT EXISTS knowledge_claims (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL,
  source_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ar', 'en')),
  claim_type TEXT NOT NULL,
  claim_text TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 1 CHECK (verified IN (0, 1)),
  last_verified TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (site_id) REFERENCES sites(id),
  FOREIGN KEY (source_id) REFERENCES sources(id)
);

CREATE INDEX IF NOT EXISTS idx_knowledge_claims_site_language
  ON knowledge_claims(site_id, language);
CREATE INDEX IF NOT EXISTS idx_knowledge_claims_source
  ON knowledge_claims(source_id);

CREATE TABLE IF NOT EXISTS knowledge_projection_runs (
  id TEXT PRIMARY KEY,
  catalog_sha256 TEXT NOT NULL,
  catalog_revision TEXT NOT NULL,
  site_count INTEGER NOT NULL,
  source_count INTEGER NOT NULL,
  claim_count INTEGER NOT NULL,
  media_count INTEGER NOT NULL,
  projected_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
