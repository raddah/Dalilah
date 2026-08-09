import { z } from "zod";

export const CitationSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  sourceType: z.enum(["official", "unesco", "open_data", "supporting"]),
});

export const MediaAssetSchema = z.object({
  url: z.string().url(),
  alt: z.string(),
  title: z.string(),
  sourceTitle: z.string(),
  sourceUrl: z.string().url(),
});

export type MediaAsset = z.infer<typeof MediaAssetSchema>;

export const ChatResponseSchema = z.object({
  answer: z.string(),
  language: z.enum(["ar", "en"]),
  confidence: z.enum(["high", "medium", "low"]),
  citations: z.array(CitationSchema),
  media: z.array(MediaAssetSchema).default([]),
  suggestedPrompts: z.array(z.string()).max(4),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
