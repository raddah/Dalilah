import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  output: "server",
  adapter: cloudflare({ prerenderEnvironment: "node" }),
  integrations: [react()],
  i18n: {
    locales: ["ar", "en"],
    defaultLocale: "ar",
    routing: "manual",
  },
  security: {
    checkOrigin: true,
  },
});
