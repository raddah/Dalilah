-- Migration 0006: OKF Projection for ad-Dir'iyah Heritage Sites, Sources, Aliases & Media

INSERT OR IGNORE INTO sites (
  id, name_ar, name_en, city, category, description_ar, latitude, longitude, last_verified
) VALUES 
(
  'place.diriyah',
  'الدرعية التاريخية',
  'Historic ad-Dir''iyah',
  'Riyadh',
  'Cultural Heritage & Tourism',
  'الدرعية العاصمة التاريخية ومقصد تأسيس الدولة السعودية الأولى عام 1727م، تقع على وادي حنيفة وتضم حي الطريف اليونسكو ومطل البجيري.',
  24.7337,
  46.5744,
  '2026-08-11'
),
(
  'place.at-turaif',
  'حي الطريف بالدرعية',
  'At-Turaif District in ad-Dir''iyah',
  'Riyadh',
  'World Heritage',
  'موقع التراث العالمي لليونسكو بالدرعية، مقر الحكم وعاصمة الدولة السعودية الأولى، يضم قصوراً طينية ضخمة أبرزها قصر سلوى وقصر سعد.',
  24.7331,
  46.5728,
  '2026-08-11'
),
(
  'place.bujairi-terrace',
  'مطل البجيري ووادي حنيفة',
  'Bujairi Terrace & Wadi Hanifah',
  'Riyadh',
  'Heritage Dining & Overlook',
  'وجهة فاخرة للمطاعم العالمية والتراثية تطل مباشرة على حي الطريف التاريخي عبر وادي حنيفة.',
  24.7348,
  46.5761,
  '2026-08-11'
);

INSERT OR IGNORE INTO sources (
  id, site_id, title, url, source_type, description_ar, description_en, authority, last_verified
) VALUES
(
  'source.visitsaudi.diriyah',
  'place.diriyah',
  'الدرعية — روح السعودية',
  'https://www.visitsaudi.com/ar/see-do/destinations/diriyah',
  'official',
  'الدليل الرسمي لوجهة الدرعية من وزارة السياحة السعودية، يغطي حي الطريف ومطل البجيري والأنشطة.',
  'Official Visit Saudi hub for Diriyah, covering At-Turaif UNESCO site, Bujairi Terrace, and culture.',
  'Saudi Tourism Authority & DGDA',
  '2026-08-11'
),
(
  'source.unesco.at-turaif',
  'place.at-turaif',
  'At-Turaif District in ad-Dir''iyah — UNESCO World Heritage Centre',
  'https://whc.unesco.org/en/list/1329',
  'unesco',
  'سجل اليونسكو الرسمي لحي الطريف بالدرعية بوصفه موقع تراث عالمي فريد للعمارة النجدية الطينية.',
  'Official UNESCO World Heritage record for At-Turaif District in ad-Dir''iyah.',
  'UNESCO World Heritage Centre',
  '2026-08-11'
);

INSERT OR IGNORE INTO site_aliases (site_id, alias, language, alias_type) VALUES
  ('place.diriyah', 'الدرعية', 'ar', 'name'),
  ('place.diriyah', 'الدرعية التاريخية', 'ar', 'name'),
  ('place.diriyah', 'ad-Diriyah', 'en', 'name'),
  ('place.diriyah', 'Diriyah', 'en', 'name'),
  ('place.diriyah', 'Historic Diriyah', 'en', 'name'),
  ('place.at-turaif', 'حي الطريف', 'ar', 'name'),
  ('place.at-turaif', 'الطريف', 'ar', 'name'),
  ('place.at-turaif', 'قصر سلوى', 'ar', 'name'),
  ('place.at-turaif', 'At-Turaif', 'en', 'name'),
  ('place.at-turaif', 'At-Turaif District', 'en', 'name'),
  ('place.at-turaif', 'Salwa Palace', 'en', 'name'),
  ('place.at-turaif', 'UNESCO 1329', 'mixed', 'source'),
  ('place.bujairi-terrace', 'البجيري', 'ar', 'name'),
  ('place.bujairi-terrace', 'مطل البجيري', 'ar', 'name'),
  ('place.bujairi-terrace', 'Bujairi', 'en', 'name'),
  ('place.bujairi-terrace', 'Bujairi Terrace', 'en', 'name');

INSERT OR IGNORE INTO media_assets (
  id, site_id, source_id, url, title_ar, title_en, alt_ar, alt_en,
  source_title_ar, source_title_en, source_url, rights_holder, rights_url, last_verified
) VALUES
(
  'media.visitsaudi.diriyah.1',
  'place.diriyah',
  'source.visitsaudi.diriyah',
  'https://scth.scene7.com/is/image/scth/deriyah-1',
  'الدرعية — قصر سلوى وحي الطريف',
  'Diriyah — Salwa Palace & At-Turaif District',
  'صورة موثقة لقصور الطريف الطينية بالدرعية من روح السعودية',
  'Verified At-Turaif mudbrick palace image from Visit Saudi',
  'الدرعية — روح السعودية',
  'Diriyah — Visit Saudi',
  'https://www.visitsaudi.com/ar/see-do/destinations/diriyah',
  '© Saudi Tourism Authority (STA) / DGDA',
  'https://www.visitsaudi.com/ar/see-do/destinations/diriyah',
  '2026-08-11'
);
