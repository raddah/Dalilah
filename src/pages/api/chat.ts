import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { generateChatAnswer } from "../../server/gemini";
import { getEvidence, getRelatedMedia } from "../../server/retrieval";
import { saveConversation } from "../../server/conversations";

const RequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  language: z.enum(["ar", "en"]).default("ar"),
  conversationId: z.string().max(100).optional(),
});

export const POST: APIRoute = async (context) => {
  const requestId = crypto.randomUUID();
  const appEnv = env as unknown as {
    DB: D1Database;
    GEMINI_API_KEY: string;
    GEMINI_MODEL: string;
  };

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await context.request.json());
  } catch {
    return Response.json({ error: "Invalid request payload" }, { status: 400 });
  }

  if (!appEnv.GEMINI_API_KEY) {
    return Response.json({ error: "Gemini is not configured" }, { status: 503 });
  }

  try {
    const evidence = await getEvidence(appEnv.DB, body.message);
    const media = await getRelatedMedia(appEnv.DB, body.message, body.language);
    const answer = await generateChatAnswer(
      { message: body.message, language: body.language, evidence, media },
      appEnv,
    );
    const conversationId = body.conversationId ?? crypto.randomUUID();

    await saveConversation(appEnv.DB, {
      conversationId,
      userMessage: body.message,
      answer,
      requestId,
    });

    return Response.json(
      { ...answer, conversationId },
      { headers: { "cache-control": "no-store", "x-request-id": requestId } },
    );
  } catch (error) {
    console.error("chat_request_failed", { requestId, error });
    return Response.json(
      { error: "Unable to complete the request right now", requestId },
      { status: 502 },
    );
  }
};
