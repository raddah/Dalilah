-- Migration 0007: OKF Projection for Historic Jeddah Sites, Sources, Aliases & Media

INSERT OR IGNORE INTO sites (
  id, name_ar, name_en, city, category, description_ar, latitude, longitude, last_verified
) VALUES 
(
  'place.nasseef-house',
  'بيت نصيف والبيوت التاريخية',
  'Nasseef House & Historic Palaces',
  'Jeddah',
  'Historic House & Museum',
  'أشهر بيوت جدة التاريخية شُيد عام 1872م وكان مقراً لإقامة ورئاسة الملك عبدالعزيز آل سعود، يتكون من 7 طوابق ورواشين خشبية وسلالم عريضة.',
  21.4851,
  39.1869,
  '2026-08-11'
);

INSERT OR IGNORE INTO sources (
  id, site_id, title, url, source_type, description_ar, description_en, authority, last_verified
) VALUES
(
  'source.visitsaudi.jeddah',
  'place.historic-jeddah',
  'جدة — روح السعودية',
  'https://www.visitsaudi.com/ar/jeddah',
  'official',
  'الدليل الرسمي لوجهة جدة يغطي جدة التاريخية (البلد) وعمارة الرواشين والأسواق الشعبية.',
  'Official Visit Saudi hub for Jeddah, covering Al-Balad UNESCO site, Roshan craft, and traditional souks.',
  'Saudi Tourism Authority & Ministry of Culture',
  '2026-08-11'
);

INSERT OR IGNORE INTO site_aliases (site_id, alias, language, alias_type) VALUES
  ('place.nasseef-house', 'بيت نصيف', 'ar', 'name'),
  ('place.nasseef-house', 'بيت شربتلي', 'ar', 'name'),
  ('place.nasseef-house', 'بيت باعشن', 'ar', 'name'),
  ('place.nasseef-house', 'بيوت البلد', 'ar', 'name'),
  ('place.nasseef-house', 'Nasseef House', 'en', 'name'),
  ('place.nasseef-house', 'Nassif House', 'en', 'name'),
  ('place.nasseef-house', 'Sharbatly House', 'en', 'name');
