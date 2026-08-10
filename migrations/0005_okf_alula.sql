-- Migration 0005: OKF Projection for AlUla Heritage Sites, Sources, Aliases & Media

INSERT OR IGNORE INTO sites (
  id, name_ar, name_en, city, category, description_ar, latitude, longitude, last_verified
) VALUES 
(
  'place.alula',
  'العُلا',
  'AlUla',
  'AlUla',
  'Cultural Heritage & Tourism',
  'العلا واحة صحراوية تاريخية ملتقى للحضارات القديمة تضم أول موقع تراث عالمي في السعودية (الحجر) والبلدة القديمة وموقع دادان وجبل عكمة.',
  26.6174,
  37.9225,
  '2026-08-11'
),
(
  'place.hegra',
  'موقع الحِجر الأثري',
  'Hegra Archaeological Site',
  'AlUla',
  'World Heritage',
  'أول موقع تراث عالمي لليونسكو في السعودية يضم 111 مقبرة نبطية ضخمة منحوتة في الصخور الجرانيتية والرمالية بينها قصر الفريد وجبل أثلب.',
  26.8028,
  37.9542,
  '2026-08-11'
),
(
  'place.alula-old-town',
  'البلدة القديمة في العُلا',
  'AlUla Old Town',
  'AlUla',
  'Historic Village',
  'بلدة تاريخية مبنية من الطين واللبن تضم أكثر من 800 منزل متلاصق وسوق تراثي وقلعة العلا التاريخية المطلة على النخيل.',
  26.6212,
  37.9189,
  '2026-08-11'
),
(
  'place.dadan-jabal-ikmah',
  'دادان وجبل عِكمة',
  'Dadan & Jabal Ikmah',
  'AlUla',
  'Ancient Archaeological Site',
  'عاصمة المملكتين الدادانية واللحيانية تضم مقابر الأسود وجبل عكمة المكتبة المفتوحة للنقوش والمدونة في سجل ذاكرة العالم لليونسكو.',
  26.6417,
  37.9351,
  '2026-08-11'
);

INSERT OR IGNORE INTO sources (
  id, site_id, title, url, source_type, description_ar, description_en, authority, last_verified
) VALUES
(
  'source.visitsaudi.alula',
  'place.alula',
  'العُلا — روح السعودية',
  'https://www.visitsaudi.com/ar/alula',
  'official',
  'الدليل الرسمي لوجهة العلا من وزارة السياحة السعودية، يغطي الأنشطة والإقامة والفعاليات والوصول.',
  'Official Visit Saudi hub for AlUla destination, covering heritage attractions, resorts, events, and transit.',
  'Ministry of Tourism / Saudi Tourism Authority',
  '2026-08-11'
),
(
  'source.visitsaudi.hegra',
  'place.hegra',
  'موقع الحِجر الأثري — روح السعودية',
  'https://www.visitsaudi.com/ar/alula/attractions/a-carved-phenomenon-envisioning-the-past',
  'official',
  'دليل موقع الحجر الأثري المعتمد، يستعرض التاريخ النبطي والمقابر المحفورة وجولات المرشدين.',
  'Official Visit Saudi entry for Hegra (Al-Hijr), detailing Nabataean monumental tombs and guided tours.',
  'Saudi Tourism Authority & RCU',
  '2026-08-11'
),
(
  'source.visitsaudi.alula-old-town',
  'place.alula-old-town',
  'البلدة القديمة في العلا — روح السعودية',
  'https://www.visitsaudi.com/ar/alula/attractions/alula-old-town',
  'official',
  'دليل البلدة القديمة في العلا يصف المباني الطينية والتراث المعماري وسوق طريق البخور ومطاعم الفناء.',
  'Official guide for AlUla Old Town detailing mudbrick architecture, Incense Road bazaar, and local dining.',
  'Saudi Tourism Authority & RCU',
  '2026-08-11'
),
(
  'source.visitsaudi.dadan-jabal-ikmah',
  'place.dadan-jabal-ikmah',
  'موقع دادان الأثري وجبل عكمة — روح السعودية',
  'https://www.visitsaudi.com/ar/alula/attractions/jabal-ikmah-in-alula',
  'official',
  'دليل دادان وجبل عكمة يستعرض الحضارات الماقبل نبطية ونقوش جبل عكمة المسجلة في اليونسكو.',
  'Official Dadan & Jabal Ikmah portal showcasing pre-Nabataean epigraphy and UNESCO Memory of the World inscriptions.',
  'Saudi Tourism Authority & RCU',
  '2026-08-11'
);

INSERT OR IGNORE INTO site_aliases (site_id, alias, language, alias_type) VALUES
  ('place.alula', 'العلا', 'ar', 'name'),
  ('place.alula', 'العُلا', 'ar', 'name'),
  ('place.alula', 'AlUla', 'en', 'name'),
  ('place.alula', 'Al-Ula', 'en', 'name'),
  ('place.alula', 'واحة العلا', 'ar', 'name'),
  ('place.hegra', 'الحجر', 'ar', 'name'),
  ('place.hegra', 'الحِجر', 'ar', 'name'),
  ('place.hegra', 'مدائن صالح', 'ar', 'name'),
  ('place.hegra', 'Hegra', 'en', 'name'),
  ('place.hegra', 'Madain Salih', 'en', 'name'),
  ('place.hegra', 'Al-Hijr', 'en', 'name'),
  ('place.alula-old-town', 'البلدة القديمة', 'ar', 'name'),
  ('place.alula-old-town', 'البلدة القديمة في العلا', 'ar', 'name'),
  ('place.alula-old-town', 'ديرة العلا', 'ar', 'name'),
  ('place.alula-old-town', 'AlUla Old Town', 'en', 'name'),
  ('place.alula-old-town', 'Old AlUla', 'en', 'name'),
  ('place.dadan-jabal-ikmah', 'دادان', 'ar', 'name'),
  ('place.dadan-jabal-ikmah', 'جبل عكمة', 'ar', 'name'),
  ('place.dadan-jabal-ikmah', 'جبل عِكمة', 'ar', 'name'),
  ('place.dadan-jabal-ikmah', 'مقابر الأسود', 'ar', 'name'),
  ('place.dadan-jabal-ikmah', 'Dadan', 'en', 'name'),
  ('place.dadan-jabal-ikmah', 'Jabal Ikmah', 'en', 'name'),
  ('place.dadan-jabal-ikmah', 'Lion Tombs', 'en', 'name');

INSERT OR IGNORE INTO media_assets (
  id, site_id, source_id, url, title_ar, title_en, alt_ar, alt_en,
  source_title_ar, source_title_en, source_url, rights_holder, rights_url, last_verified
) VALUES
(
  'media.visitsaudi.alula.banner',
  'place.alula',
  'source.visitsaudi.alula',
  'https://scth.scene7.com/is/image/scth/alula-banner-new',
  'العُلا — المشهد التراثي والصحراوي',
  'AlUla — Heritage & Desert Landscape',
  'صورة موثقة لمعالم العلا الصحراوية والتراثية من روح السعودية',
  'Verified AlUla heritage landscape image from Visit Saudi',
  'العُلا — روح السعودية',
  'AlUla — Visit Saudi',
  'https://www.visitsaudi.com/ar/alula',
  '© Saudi Tourism Authority (STA)',
  'https://www.visitsaudi.com/ar/alula',
  '2026-08-11'
),
(
  'media.visitsaudi.alula.landscape',
  'place.alula',
  'source.visitsaudi.alula',
  'https://scth.scene7.com/is/image/scth/alUla',
  'العُلا — الواحة والتكاوين الصخرية',
  'AlUla — Oasis & Rock Formations',
  'صورة موثقة لواحة العلا والتضاريس الصخرية',
  'Verified image of AlUla oasis and desert rock formations',
  'العُلا — روح السعودية',
  'AlUla — Visit Saudi',
  'https://www.visitsaudi.com/ar/alula',
  '© Saudi Tourism Authority (STA)',
  'https://www.visitsaudi.com/ar/alula',
  '2026-08-11'
);
