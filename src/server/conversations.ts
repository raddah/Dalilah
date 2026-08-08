import type { ChatResponse } from "../types/chat";

export async function saveConversation(
  db: D1Database,
  input: {
    conversationId: string;
    userMessage: string;
    answer: ChatResponse;
    requestId: string;
  },
) {
  if (!db) return;

  await db
    .prepare(
      `INSERT OR IGNORE INTO conversations (id, language)
       VALUES (?, ?)`,
    )
    .bind(input.conversationId, input.answer.language)
    .run();

  await db
    .prepare(
      `INSERT INTO messages
       (id, conversation_id, role, content, citations_json, confidence, request_id)
       VALUES (?, ?, 'user', ?, NULL, NULL, ?)`,
    )
    .bind(crypto.randomUUID(), input.conversationId, input.userMessage, input.requestId)
    .run();

  await db
    .prepare(
      `INSERT INTO messages
       (id, conversation_id, role, content, citations_json, confidence, request_id)
       VALUES (?, ?, 'assistant', ?, ?, ?, ?)`,
    )
    .bind(
      crypto.randomUUID(),
      input.conversationId,
      input.answer.answer,
      JSON.stringify(input.answer.citations),
      input.answer.confidence,
      input.requestId,
    )
    .run();
}
