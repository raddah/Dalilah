import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const rootPath = join(process.cwd(), "knowledge-base", "okf");
const required = [
  "title",
  "language",
  "type",
  "source_url",
  "source_type",
  "source_credibility",
  "verified",
  "last_verified",
  "stale_after",
];

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(path)));
    else if (entry.name.endsWith(".md") && entry.name !== "README.md") files.push(path);
  }
  return files;
}

const files = await walk(rootPath);
const errors = [];
for (const file of files) {
  const text = await readFile(file, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    errors.push(`${file}: missing YAML frontmatter`);
    continue;
  }
  for (const field of required) {
    if (!new RegExp(`^${field}:\\s*.+$`, "m").test(match[1])) errors.push(`${file}: missing ${field}`);
  }
  if (!/^language:\s*(ar|en)\s*$/m.test(match[1])) errors.push(`${file}: language must be ar or en`);
  if (!/^source_url:\s*https:\/\//m.test(match[1])) errors.push(`${file}: source_url must be HTTPS`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`OKF validation passed for ${files.length} Markdown records.`);
