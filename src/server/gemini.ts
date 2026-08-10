import { ChatResponseSchema, type ChatResponse, type MediaAsset } from "../types/chat";

type GeminiEnv = {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
};

const SYSTEM_PROMPT = `
You are Dalilah, a trusted Saudi heritage guide.
Answer in the user's language.
Use only the supplied evidence for factual claims.
Never invent historical facts, opening hours, locations, URLs, or citations.
Only return media whose exact URL appears in the supplied availableMedia list.
Never invent image URLs or image credits.
If evidence is missing, clearly say that there is insufficient evidence.
Return valid JSON matching the requested schema.
`;

export async function generateChatAnswer(
  input: { message: string; evidence: string; media: MediaAsset[]; language: "ar" | "en" },
  env: GeminiEnv,
): Promise<ChatResponse> {
  const model = env.GEMINI_MODEL || "gemini-2.5-flash";
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [
        {
          role: "user",
          parts: [
            {
              text: JSON.stringify({
                language: input.language,
                question: input.message,
                evidence: input.evidence,
                availableMedia: input.media,
              }),
            },
          ],
        },
      ],
      generationConfig: {
        responseMimeType: "application/json",
        responseJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            answer: { type: "string" },
            language: { type: "string", enum: ["ar", "en"] },
            confidence: {
              type: "string",
              enum: ["high", "medium", "low"],
            },
            citations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  url: { type: "string" },
                  sourceType: { type: "string" },
                },
                required: ["title", "url", "sourceType"],
              },
            },
            media: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string" },
                  alt: { type: "string" },
                  title: { type: "string" },
                  sourceTitle: { type: "string" },
                  sourceUrl: { type: "string" },
                },
                required: ["url", "alt", "title", "sourceTitle", "sourceUrl"],
              },
            },
            suggestedPrompts: {
              type: "array",
              items: { type: "string" },
            },
          },
          required: [
            "answer",
            "language",
            "confidence",
            "citations",
            "suggestedPrompts",
          ],
        },
      },
    }),
  });

  if (!response.ok) throw new Error(`Gemini returned HTTP ${response.status}`);

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned no text");

  const parsed = ChatResponseSchema.parse(JSON.parse(text));
  const allowedMedia = new Set(input.media.map((asset) => asset.url));
  return {
    ...parsed,
    media: parsed.media.filter((asset) => allowedMedia.has(asset.url)),
  };
}
