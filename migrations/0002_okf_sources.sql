INSERT OR IGNORE INTO sites (
  id, name_ar, name_en, city, category, description_ar, latitude, longitude, last_verified
) VALUES (
  'place.historic-jeddah',
  'جدة التاريخية',
  'Historic Jeddah, the Gate to Makkah',
  'Jeddah',
  'World Heritage',
  'بطاقة معرفة أولية مستندة إلى صفحة اليونسكو المحددة.',
  NULL,
  NULL,
  '2026-08-09'
);

INSERT OR IGNORE INTO sources (
  id, site_id, title, url, source_type, description_ar, description_en, authority, last_verified
) VALUES
(
  'source.unesco.historic-jeddah',
  'place.historic-jeddah',
  'Historic Jeddah, the Gate to Makkah',
  'https://whc.unesco.org/en/list/1361',
  'unesco',
  'صفحة اليونسكو الرسمية لجدة التاريخية بوصفها موقعًا من مواقع التراث العالمي.',
  'UNESCO official record for Historic Jeddah, the Gate to Makkah.',
  'UNESCO World Heritage Centre',
  '2026-08-09'
),
(
  'source.unesco.historic-jeddah-documents',
  'place.historic-jeddah',
  'Historic Jeddah UNESCO Documents',
  'https://whc.unesco.org/en/list/1361/documents',
  'unesco',
  'فهرس وثائق اليونسكو الخاص بالترشيح والخرائط وخطط الإدارة والقرارات.',
  'UNESCO document index for nomination material, maps, management plans, and decisions.',
  'UNESCO World Heritage Centre',
  '2026-08-09'
);
