import { ChatResponseSchema, type ChatResponse, type MediaAsset } from "../types/chat";

type GeminiEnv = {
  GEMINI_API_KEY: string;
  GEMINI_MODEL: string;
};

export type GeminiErrorCode =
  | "gemini_rate_limited"
  | "gemini_auth_failed"
  | "gemini_invalid_request"
  | "gemini_unavailable"
  | "gemini_invalid_response";

export class GeminiApiError extends Error {
  constructor(
    public readonly code: GeminiErrorCode,
    public readonly status: number,
    public readonly retryAfterSeconds?: number,
    message: string = code,
  ) {
    super(message);
    this.name = "GeminiApiError";
  }
}

function errorCodeForStatus(status: number): GeminiErrorCode {
  if (status === 401 || status === 403) return "gemini_auth_failed";
  if (status === 429) return "gemini_rate_limited";
  if (status >= 500) return "gemini_unavailable";
  return "gemini_invalid_request";
}

function retryAfterSecondsFrom(message: string) {
  const match = message.match(/retry in ([\d.]+)s/i);
  if (!match) return undefined;
  const seconds = Math.ceil(Number(match[1]));
  return Number.isFinite(seconds) ? seconds : undefined;
}

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
  const model = env.GEMINI_MODEL || "gemini-3.5-flash";
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

  if (!response.ok) {
    const errorText = await response.text();
    const code = errorCodeForStatus(response.status);
    console.error("gemini_request_failed", {
      status: response.status,
      model,
      code,
      details: errorText.slice(0, 500),
    });
    throw new GeminiApiError(
      code,
      response.status,
      code === "gemini_rate_limited" ? retryAfterSecondsFrom(errorText) : undefined,
      `Gemini returned HTTP ${response.status}`,
    );
  }

  const payload = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };

  const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error("gemini_invalid_response", { reason: "missing_text", model });
    throw new GeminiApiError("gemini_invalid_response", 502, undefined, "Gemini returned no text");
  }

  let parsed: ChatResponse;
  try {
    parsed = ChatResponseSchema.parse(JSON.parse(text));
  } catch (error) {
    console.error("gemini_invalid_response", {
      model,
      reason: "schema_validation_failed",
      error: error instanceof Error ? error.message.slice(0, 300) : "unknown",
    });
    throw new GeminiApiError("gemini_invalid_response", 502, undefined, "Gemini returned an invalid response");
  }
  const allowedMedia = new Set(input.media.map((asset) => asset.url));
  return {
    ...parsed,
    media: parsed.media.filter((asset) => allowedMedia.has(asset.url)),
  };
}
