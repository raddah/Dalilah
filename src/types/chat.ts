import { z } from "zod";

export const CitationSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  sourceType: z.enum(["official", "unesco", "open_data", "supporting"]),
});

export const ChatResponseSchema = z.object({
  answer: z.string(),
  language: z.enum(["ar", "en"]),
  confidence: z.enum(["high", "medium", "low"]),
  citations: z.array(CitationSchema),
  suggestedPrompts: z.array(z.string()).max(4),
});

export type ChatResponse = z.infer<typeof ChatResponseSchema>;
