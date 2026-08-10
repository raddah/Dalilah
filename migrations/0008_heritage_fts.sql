-- Migration 0008: Materialized FTS5 index for bilingual heritage retrieval.
-- Rebuild this projection after future migrations that change sites, sources, or aliases.

CREATE VIRTUAL TABLE IF NOT EXISTS heritage_search USING fts5(
  source_id UNINDEXED,
  site_id UNINDEXED,
  name_ar,
  name_en,
  city,
  category,
  site_description_ar,
  source_title,
  source_description_ar,
  source_description_en,
  aliases,
  tokenize = 'unicode61'
);

DELETE FROM heritage_search;

INSERT INTO heritage_search (
  source_id,
  site_id,
  name_ar,
  name_en,
  city,
  category,
  site_description_ar,
  source_title,
  source_description_ar,
  source_description_en,
  aliases
)
SELECT
  s.id,
  st.id,
  st.name_ar,
  COALESCE(st.name_en, ''),
  COALESCE(st.city, ''),
  COALESCE(st.category, ''),
  COALESCE(st.description_ar, ''),
  s.title,
  COALESCE(s.description_ar, ''),
  COALESCE(s.description_en, ''),
  COALESCE((
    SELECT group_concat(sa.alias, ' ')
    FROM site_aliases sa
    WHERE sa.site_id = st.id
  ), '')
FROM sources s
JOIN sites st ON st.id = s.site_id;
