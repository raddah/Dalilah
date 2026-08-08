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
