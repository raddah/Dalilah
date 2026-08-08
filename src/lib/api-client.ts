import type { ChatResponse } from "../types/chat";

export async function askDalilah(
  message: string,
  language: "ar" | "en",
): Promise<ChatResponse> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message, language }),
  });

  const payload = (await response.json()) as ChatResponse & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? "Request failed");
  return payload;
}
