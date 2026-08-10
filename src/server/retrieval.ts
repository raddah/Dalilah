type SourceRow = {
  source_id: string;
  site_id: string;
  name_ar: string;
  name_en: string | null;
  city: string | null;
  category: string | null;
  site_description_ar: string | null;
  site_description_en: string | null;
  latitude: number | null;
  longitude: number | null;
  title: string;
  url: string;
  source_type: "official" | "unesco" | "open_data" | "supporting";
  description_ar: string | null;
  description_en: string | null;
  verified_claims: string | null;
};

const fallbackEvidence = [
  "No verified local evidence was found for this question. Do not invent a factual answer.",
];

const stopWords = new Set([
  "اين",
  "أين",
  "ايش",
  "ما",
  "ماذا",
  "عن",
  "في",
  "من",
  "هل",
  "هو",
  "هي",
  "يقع",
  "تقع",
  "هات",
  "اعطني",
  "أعطني",
  "صور",
  "صورة",
  "the",
  "a",
  "an",
  "is",
  "are",
  "of",
  "in",
  "on",
  "where",
  "what",
  "show",
  "give",
  "me",
  "images",
  "image",
  "photos",
  "photo",
]);

export function getSearchTokens(query: string) {
  const normalized = query
    .normalize("NFKC")
    .replace(/[\u0610-\u061a\u064b-\u065f\u0670\u06d6-\u06ed]/g, "")
    .toLocaleLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();

  return [...new Set(normalized.split(/\s+/).filter((token) => token.length > 1 && !stopWords.has(token)))].slice(
    0,
    8,
  );
}

function toFtsQuery(query: string) {
  return getSearchTokens(query)
    .map((token) => `"${token.replaceAll('"', '""')}"`)
    .join(" OR ");
}

const sourceSelect = `
  SELECT
    s.id AS source_id,
    s.site_id,
    st.name_ar,
    st.name_en,
    st.city,
    st.category,
    st.description_ar AS site_description_ar,
    st.description_en AS site_description_en,
    st.latitude,
    st.longitude,
    s.title,
    s.url,
    s.source_type,
    s.description_ar,
    s.description_en,
    (SELECT group_concat('[' || kc.id || '] ' || kc.claim_text, char(10))
     FROM knowledge_claims kc
     WHERE kc.source_id = s.id AND kc.verified = 1) AS verified_claims
  FROM sources s
  JOIN sites st ON st.id = s.site_id`;

async function getMatchingSiteIds(db: D1Database, query: string) {
  const directMatches = await db
    .prepare(
      `SELECT DISTINCT site_id
       FROM site_aliases
       WHERE ? LIKE '%' || alias || '%' OR alias LIKE ?
       LIMIT 10`,
    )
    .bind(query, `%${query}%`)
    .all<{ site_id: string }>();

  if (directMatches.results.length) return directMatches.results.map((row) => row.site_id);

  const tokens = getSearchTokens(query);
  if (!tokens.length) return [];

  const tokenClause = tokens.map(() => "alias LIKE ?").join(" OR ");
  const tokenMatches = await db
    .prepare(`SELECT DISTINCT site_id FROM site_aliases WHERE ${tokenClause} LIMIT 10`)
    .bind(...tokens.map((token) => `%${token}%`))
    .all<{ site_id: string }>();

  return tokenMatches.results.map((row) => row.site_id);
}

export async function getEvidence(db: D1Database, query: string) {
  if (!db) return fallbackEvidence.join("\n");

  let siteIds: string[] = [];
  try {
    siteIds = await getMatchingSiteIds(db, query);
  } catch {
    // Keep the pre-alias search working until migration 0004 is deployed.
  }

  if (siteIds.length) {
    const siteClause = siteIds.map(() => "?").join(",");
    const aliasResult = await db
      .prepare(
        `${sourceSelect}
         WHERE s.site_id IN (${siteClause})
         ORDER BY s.last_verified DESC
         LIMIT 5`,
      )
      .bind(...siteIds)
      .all<SourceRow>();

    if (aliasResult.results.length) return formatEvidence(aliasResult.results);
  }

  const ftsQuery = toFtsQuery(query);
  if (ftsQuery) {
    try {
      const ftsResult = await db
        .prepare(
          `${sourceSelect}
           JOIN heritage_search hs ON hs.source_id = s.id
           WHERE heritage_search MATCH ?
           ORDER BY bm25(heritage_search), s.last_verified DESC
           LIMIT 5`,
        )
        .bind(ftsQuery)
        .all<SourceRow>();

      if (ftsResult.results.length) return formatEvidence(ftsResult.results);
    } catch {
      // Fall back while migration 0008 is pending or if FTS is unavailable.
    }
  }

  const result = await db
    .prepare(
      `${sourceSelect}
       WHERE s.title LIKE ? OR s.description_ar LIKE ? OR s.description_en LIKE ?
       ORDER BY s.last_verified DESC
       LIMIT 5`,
    )
    .bind(`%${query}%`, `%${query}%`, `%${query}%`)
    .all<SourceRow>();

  if (!result.results.length) return fallbackEvidence.join("\n");

  return formatEvidence(result.results);
}

function formatEvidence(sources: SourceRow[]) {
  return sources
    .map(
      (source) =>
        `Source ID: ${source.source_id}\nSite ID: ${source.site_id}\nPlace (Arabic): ${source.name_ar}\nPlace (English): ${source.name_en ?? ""}\nCity: ${source.city ?? ""}\nCategory: ${source.category ?? ""}\nCoordinates: ${source.latitude ?? ""}, ${source.longitude ?? ""}\nArabic site context: ${source.site_description_ar ?? ""}\nEnglish site context: ${source.site_description_en ?? ""}\nVerified claims:\n${source.verified_claims ?? ""}\nSource title: ${source.title}\nSource URL: ${source.url}\nSource type: ${source.source_type}\nArabic source description: ${source.description_ar ?? ""}\nEnglish source description: ${source.description_en ?? ""}`,
    )
    .join("\n\n");
}

export async function getRelatedMedia(
  db: D1Database,
  query: string,
  language: "ar" | "en",
  origin: string,
) {
  if (!db) return [] as MediaAsset[];

  try {
    const siteIds = await getMatchingSiteIds(db, query);
    const siteClause = siteIds.length ? ` OR site_id IN (${siteIds.map(() => "?").join(",")})` : "";
    const result = await db
      .prepare(
        `SELECT url, alt_ar, alt_en, title_ar, title_en, source_title_ar, source_title_en, source_url
         FROM media_assets
         WHERE title_ar LIKE ? OR title_en LIKE ? OR alt_ar LIKE ? OR alt_en LIKE ?${siteClause}
         ORDER BY last_verified DESC
         LIMIT 3`,
      )
      .bind(`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`, ...siteIds)
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
      url: new URL(asset.url, origin).toString(),
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
