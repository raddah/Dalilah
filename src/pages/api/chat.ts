import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { z } from "zod";
import { generateChatAnswer, GeminiApiError, type GeminiErrorCode } from "../../server/gemini";
import { getEvidence, getRelatedMedia } from "../../server/retrieval";
import { saveConversation } from "../../server/conversations";

const RequestSchema = z.object({
  message: z.string().trim().min(1).max(4000),
  language: z.enum(["ar", "en"]).default("ar"),
  conversationId: z.string().max(100).optional(),
});

const errorMessages: Record<Exclude<GeminiErrorCode, "gemini_rate_limited"> | "gemini_not_configured" | "internal_error", { ar: string; en: string }> = {
  gemini_auth_failed: {
    ar: "تعذر التحقق من مفتاح Gemini. تحقق من المفتاح والمشروع المرتبط به.",
    en: "Gemini authentication failed. Check the API key and its linked project.",
  },
  gemini_invalid_request: {
    ar: "رفض Gemini صيغة الطلب. حاول مرة أخرى بسؤال أقصر.",
    en: "Gemini rejected the request format. Try again with a shorter question.",
  },
  gemini_unavailable: {
    ar: "خدمة Gemini غير متاحة مؤقتًا. أعد المحاولة بعد قليل.",
    en: "Gemini is temporarily unavailable. Please try again shortly.",
  },
  gemini_invalid_response: {
    ar: "وصل رد غير مكتمل من Gemini. أعد المحاولة، وإذا استمرت المشكلة استخدم رقم الطلب للدعم.",
    en: "Gemini returned an incomplete response. Try again, and use the request ID for support if it continues.",
  },
  gemini_not_configured: {
    ar: "لم يتم إعداد Gemini في بيئة التشغيل بعد.",
    en: "Gemini has not been configured in the runtime environment.",
  },
  internal_error: {
    ar: "تعذر إكمال الطلب الآن. أعد المحاولة، واستخدم رقم الطلب إذا استمرت المشكلة.",
    en: "Unable to complete the request right now. Try again and use the request ID if it continues.",
  },
};

function localizedError(code: GeminiErrorCode | "gemini_not_configured" | "internal_error", language: "ar" | "en", retryAfterSeconds?: number) {
  if (code === "gemini_rate_limited") {
    const wait = retryAfterSeconds ? (language === "ar" ? ` حاول بعد ${retryAfterSeconds} ثانية تقريبًا.` : ` Please retry in about ${retryAfterSeconds} seconds.`) : "";
    return language === "ar"
      ? `تم بلوغ حد استخدام Gemini حاليًا. تحقق من حصة المشروع.${wait}`
      : `The Gemini usage limit has been reached. Check the project's quota.${wait}`;
  }
  return errorMessages[code][language];
}

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
    return Response.json({ error: "Invalid request payload", errorCode: "invalid_request" }, { status: 400 });
  }

  if (!appEnv.GEMINI_API_KEY) {
    const language = body.language;
    return Response.json(
      { error: errorMessages.gemini_not_configured[language], errorCode: "gemini_not_configured", requestId },
      { status: 503, headers: { "x-request-id": requestId } },
    );
  }

  try {
    const evidence = await getEvidence(appEnv.DB, body.message);
    const media = await getRelatedMedia(
      appEnv.DB,
      body.message,
      body.language,
      new URL(context.request.url).origin,
    );
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
    const code = error instanceof GeminiApiError ? error.code : "internal_error";
    const status = error instanceof GeminiApiError ? error.status : 502;
    const language = body.language;
    const retryAfterSeconds = error instanceof GeminiApiError ? error.retryAfterSeconds : undefined;
    return Response.json(
      { error: localizedError(code, language, retryAfterSeconds), errorCode: code, requestId },
      {
        status,
        headers: {
          "cache-control": "no-store",
          "x-request-id": requestId,
          ...(retryAfterSeconds ? { "retry-after": String(retryAfterSeconds) } : {}),
        },
      },
    );
  }
};
