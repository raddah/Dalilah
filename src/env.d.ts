/// <reference types="astro/client" />
/// <reference types="@cloudflare/workers-types" />

interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  CACHE: KVNamespace;
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
  APP_ENV: string;
  PUBLIC_APP_ORIGIN: string;
}

declare namespace App {
  interface Locals {
    runtime: {
      env: Env;
      cfContext: ExecutionContext;
    };
    requestId: string;
  }
}
