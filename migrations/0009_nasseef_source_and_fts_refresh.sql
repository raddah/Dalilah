-- Migration 0009: Give Nasseef House its own source record and refresh FTS.
-- Existing migrations are immutable once applied, so this corrects the 0007 projection.

INSERT OR IGNORE INTO sources (
  id, site_id, title, url, source_type, description_ar, description_en, authority, last_verified
) VALUES (
  'source.visitsaudi.nasseef-house',
  'place.nasseef-house',
  'بيت نصيف والبيوت التاريخية — روح السعودية',
  'https://www.visitsaudi.com/ar/jeddah',
  'official',
  'مرجع رسمي لسياق جدة التاريخية وبيوت البلد، مرتبط ببطاقة بيت نصيف لإتاحة الاسترجاع الموثق.',
  'Official destination context for Historic Jeddah and Al-Balad houses, linked to the Nasseef House knowledge card.',
  'Saudi Tourism Authority & Ministry of Culture',
  '2026-08-11'
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
