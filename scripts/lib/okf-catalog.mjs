import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const catalogPath = join(process.cwd(), "knowledge-base", "okf", "catalog.json");

const sourceTypes = new Set(["official", "unesco", "open_data", "supporting"]);

function assert(condition, message) {
  if (!condition) throw new Error(`OKF catalog validation failed: ${message}`);
}

function uniqueIds(items, label) {
  const ids = new Set();
  for (const item of items) {
    assert(typeof item.id === "string" && item.id.length > 0, `${label} has an invalid id`);
    assert(!ids.has(item.id), `duplicate ${label} id ${item.id}`);
    ids.add(item.id);
  }
  return ids;
}

export async function loadCatalog() {
  const raw = await readFile(catalogPath, "utf8");
  const catalog = JSON.parse(raw);
  validateCatalog(catalog);
  return {
    catalog,
    raw,
    sha256: createHash("sha256").update(raw).digest("hex"),
  };
}

export function validateCatalog(catalog) {
  assert(catalog.schemaVersion === 1, "schemaVersion must be 1");
  assert(/^\d{4}-\d{2}-\d{2}T/.test(catalog.revision), "revision must be an ISO timestamp");
  for (const key of ["sites", "sources", "claims", "media"]) assert(Array.isArray(catalog[key]), `${key} must be an array`);

  const siteIds = uniqueIds(catalog.sites, "site");
  const sourceIds = uniqueIds(catalog.sources, "source");
  uniqueIds(catalog.claims, "claim");
  uniqueIds(catalog.media, "media");

  for (const site of catalog.sites) {
    for (const field of ["nameAr", "nameEn", "city", "category", "descriptionAr", "descriptionEn", "lastVerified"])
      assert(typeof site[field] === "string" && site[field].length > 0, `${site.id}.${field} is required`);
    assert(site.aliases && typeof site.aliases === "object", `${site.id}.aliases is required`);
    assert([...(site.aliases.ar ?? []), ...(site.aliases.en ?? []), ...(site.aliases.mixed ?? [])].length > 0, `${site.id} needs aliases`);
  }

  for (const source of catalog.sources) {
    assert(siteIds.has(source.siteId), `${source.id} references missing site ${source.siteId}`);
    assert(sourceTypes.has(source.sourceType), `${source.id} has invalid sourceType`);
    assert(/^https:\/\//.test(source.url), `${source.id} must use an HTTPS URL`);
  }

  for (const claim of catalog.claims) {
    assert(siteIds.has(claim.siteId), `${claim.id} references missing site ${claim.siteId}`);
    assert(sourceIds.has(claim.sourceId), `${claim.id} references missing source ${claim.sourceId}`);
    assert(claim.textAr?.length > 0 && claim.textEn?.length > 0, `${claim.id} needs Arabic and English text`);
  }

  for (const media of catalog.media) {
    assert(siteIds.has(media.siteId), `${media.id} references missing site ${media.siteId}`);
    assert(sourceIds.has(media.sourceId), `${media.id} references missing source ${media.sourceId}`);
    assert(media.url.startsWith("/api/media/"), `${media.id} runtime URL must be served from R2 through /api/media/`);
    assert(/^https:\/\//.test(media.sourceUrl), `${media.id} sourceUrl must use HTTPS`);
    assert(typeof media.sha256 === "string" && /^[a-f0-9]{64}$/.test(media.sha256), `${media.id} needs SHA-256 provenance`);
  }
}

export function sqlText(value) {
  if (value === null || value === undefined) return "NULL";
  return `'${String(value).replaceAll("'", "''")}'`;
}

export function sqlNumber(value) {
  return value === null || value === undefined ? "NULL" : String(value);
}
