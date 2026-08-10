ALTER TABLE media_assets ADD COLUMN rights_holder TEXT;
ALTER TABLE media_assets ADD COLUMN rights_url TEXT;

INSERT OR IGNORE INTO media_assets (
  id, site_id, source_id, url, title_ar, title_en, alt_ar, alt_en,
  source_title_ar, source_title_en, source_url, rights_holder, rights_url, last_verified
) VALUES
(
  'media.unesco.historic-jeddah.182377',
  'place.historic-jeddah',
  'source.unesco.historic-jeddah',
  '/api/media/heritage/historic-jeddah/unesco-182377.jpg',
  'جدة التاريخية — صورة UNESCO 182377',
  'Historic Jeddah — UNESCO image 182377',
  'صورة موثقة لجدة التاريخية من معرض اليونسكو',
  'Verified Historic Jeddah image from the UNESCO gallery',
  'اليونسكو — جدة التاريخية',
  'UNESCO — Historic Jeddah, the Gate to Makkah',
  'https://whc.unesco.org/en/documents/182377',
  '© Kingdom of Saudi Arabia; source: Permanent Delegation of the Kingdom of Saudi Arabia to UNESCO',
  'https://whc.unesco.org/en/documents/182377',
  '2026-08-10'
),
(
  'media.unesco.historic-jeddah.182378',
  'place.historic-jeddah',
  'source.unesco.historic-jeddah',
  '/api/media/heritage/historic-jeddah/unesco-182378.jpg',
  'جدة التاريخية — صورة UNESCO 182378',
  'Historic Jeddah — UNESCO image 182378',
  'صورة موثقة لجدة التاريخية من معرض اليونسكو',
  'Verified Historic Jeddah image from the UNESCO gallery',
  'اليونسكو — جدة التاريخية',
  'UNESCO — Historic Jeddah, the Gate to Makkah',
  'https://whc.unesco.org/en/documents/182378',
  '© Kingdom of Saudi Arabia; source: Permanent Delegation of the Kingdom of Saudi Arabia to UNESCO',
  'https://whc.unesco.org/en/documents/182378',
  '2026-08-10'
);
