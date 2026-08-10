CREATE TABLE IF NOT EXISTS site_aliases (
  site_id TEXT NOT NULL,
  alias TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ar', 'en', 'mixed')),
  alias_type TEXT NOT NULL DEFAULT 'name',
  PRIMARY KEY (site_id, alias),
  FOREIGN KEY (site_id) REFERENCES sites(id)
);

CREATE INDEX IF NOT EXISTS idx_site_aliases_alias ON site_aliases(alias);

INSERT OR IGNORE INTO site_aliases (site_id, alias, language, alias_type) VALUES
  ('place.historic-jeddah', 'Historic Jeddah', 'en', 'name'),
  ('place.historic-jeddah', 'Jeddah Historical Area', 'en', 'name'),
  ('place.historic-jeddah', 'Al-Balad', 'en', 'name'),
  ('place.historic-jeddah', 'UNESCO 1361', 'mixed', 'source'),
  ('place.historic-jeddah', 'جدة التاريخية', 'ar', 'name'),
  ('place.historic-jeddah', 'البلد', 'ar', 'name'),
  ('place.historic-jeddah', 'جدة القديمة', 'ar', 'name'),
  ('place.historic-jeddah', 'اليونسكو', 'ar', 'source');
