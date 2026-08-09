type SourceRow = {
  title: string;
  url: string;
  source_type: "official" | "unesco" | "open_data" | "supporting";
  description_ar: string | null;
  description_en: string | null;
};

const fallbackEvidence = [
  "No verified local evidence was found for this question. Do not invent a factual answer.",
];

export async function getEvidence(db: D1Database, query: string) {
  if (!db) return fallbackEvidence.join("\n");

  const result = await db
    .prepare(
      `SELECT title, url, source_type, description_ar
       FROM sources
       WHERE title LIKE ? OR description_ar LIKE ? OR description_en LIKE ?
       ORDER BY last_verified DESC
       LIMIT 5`,
    )
    .bind(`%${query}%`, `%${query}%`, `%${query}%`)
    .all<SourceRow>();

  if (!result.results.length) return fallbackEvidence.join("\n");

  return result.results
    .map(
      (source) =>
        `Title: ${source.title}\nURL: ${source.url}\nType: ${source.source_type}\nArabic description: ${source.description_ar ?? ""}\nEnglish description: ${source.description_en ?? ""}`,
    )
    .join("\n\n");
}

export async function getRelatedMedia(db: D1Database, query: string, language: "ar" | "en") {
  if (!db) return [] as MediaAsset[];

  try {
    const result = await db
      .prepare(
        `SELECT url, alt_ar, alt_en, title_ar, title_en, source_title_ar, source_title_en, source_url
         FROM media_assets
         WHERE title_ar LIKE ? OR title_en LIKE ? OR alt_ar LIKE ? OR alt_en LIKE ?
         ORDER BY last_verified DESC
         LIMIT 3`,
      )
      .bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`)
      .all<{
        url: string;
        alt_ar: string;
        alt_en: string;
        title_ar: string;
        title_en: string;
        source_title_ar: string;
        source_title_en: string;
        source_url: string;
      }>();

    return result.results.map((asset) => ({
      url: asset.url,
      alt: language === "ar" ? asset.alt_ar : asset.alt_en,
      title: language === "ar" ? asset.title_ar : asset.title_en,
      sourceTitle: language === "ar" ? asset.source_title_ar : asset.source_title_en,
      sourceUrl: asset.source_url,
    }));
  } catch {
    // Media is optional until the media_assets migration is deployed.
    return [] as MediaAsset[];
  }
}
import type { MediaAsset } from "../types/chat";
