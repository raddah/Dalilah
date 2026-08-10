import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadCatalog } from "./lib/okf-catalog.mjs";

const { catalog, sha256 } = await loadCatalog();
const sites = new Map(catalog.sites.map((site) => [site.id, site]));
const sources = new Map(catalog.sources.map((source) => [source.id, source]));
const records = [];

for (const claim of catalog.claims) {
  const site = sites.get(claim.siteId);
  const source = sources.get(claim.sourceId);
  for (const [language, text] of [["ar", claim.textAr], ["en", claim.textEn]]) {
    records.push({
      id: `${claim.id}.${language}`,
      text: `${language === "ar" ? site.nameAr : site.nameEn}\n${text}`,
      metadata: {
        site_id: site.id,
        source_id: source.id,
        language,
        claim_type: claim.claimType,
        source_url: source.url,
      },
    });
  }
}

const outputDir = join(process.cwd(), "generated");
await mkdir(outputDir, { recursive: true });
await writeFile(join(outputDir, "vectorize-corpus.ndjson"), `${records.map((record) => JSON.stringify(record)).join("\n")}\n`, "utf8");
await writeFile(join(outputDir, "vectorize-manifest.json"), `${JSON.stringify({ schemaVersion: 1, catalogSha256: sha256, recordCount: records.length, embeddingStatus: "not-generated", runtimeEnabled: false }, null, 2)}\n`, "utf8");
console.log(`Prepared ${records.length} deterministic records for later embedding and Vectorize ingestion.`);
