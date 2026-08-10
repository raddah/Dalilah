import { useEffect, useRef, useState } from "react";
import { askDalilah } from "../lib/api-client";
import type { ChatResponse } from "../types/chat";

type Language = "ar" | "en";
type Turn = { question: string; answer: ChatResponse };

const copy = {
  ar: { empty: "اسأل دليلة عن التراث والثقافة السعودية.", placeholder: "اكتب سؤالك هنا...", send: "إرسال السؤال", requestError: "تعذر إكمال الطلب الآن", sources: "المصادر المرجعية" },
  en: { empty: "Ask Dalilah about Saudi heritage and culture.", placeholder: "Type your question here...", send: "Send question", requestError: "Unable to complete the request right now", sources: "Reference sources" },
} as const;

export default function ChatShell({ language, initialMessage = "" }: { language: Language; initialMessage?: string }) {
  const text = copy[language];
  const [message, setMessage] = useState(initialMessage);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const initialSubmitted = useRef(false);

  async function submit(value = message) {
    const question = value.trim();
    if (!question || loading) return;
    setLoading(true);
    setError("");
    try {
      const answer = await askDalilah(question, language);
      setTurns((current) => [...current, { question, answer }]);
      setError("");
      setMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (initialMessage.trim() && !initialSubmitted.current) {
      initialSubmitted.current = true;
      void submit(initialMessage);
    }
  }, [initialMessage]);

  return (
    <section className={`chat-shell ${turns.length === 0 ? "is-empty" : ""}`} dir={language === "ar" ? "rtl" : "ltr"} aria-live="polite">
      <div className="conversation">
        {turns.length === 0 ? <div className="empty-answer">{text.empty}</div> : null}
        {turns.map(({ question, answer }) => (
          <div className="conversation-turn" key={`${question}-${answer.answer}`}>
            <div className="user-bubble">{question}</div>
            <article className="answer-card">
              <div className="answer-label"><span className="answer-orb" aria-hidden="true">✦</span>{language === "ar" ? "دليلة" : "Dalilah"}</div>
              {answer.media[0] ? <figure className="answer-media"><img src={answer.media[0].url} alt={answer.media[0].alt} /><figcaption><span>{answer.media[0].title}</span><a href={answer.media[0].sourceUrl} target="_blank" rel="noreferrer">{answer.media[0].sourceTitle} ↗</a></figcaption></figure> : null}
              <div className="answer-copy"><h2>{answer.media[0]?.title ?? (language === "ar" ? "إجابة موثقة" : "Grounded answer")}</h2><p>{answer.answer}</p></div>
              <div className="answer-sources"><div className="sources-label"><span aria-hidden="true">▧</span>{text.sources}</div><div className="source-chips">{answer.citations.map((citation) => <a href={citation.url} target="_blank" rel="noreferrer" key={citation.url}><span className={`source-chip-icon source-chip-${citation.sourceType}`} aria-hidden="true">↗</span>{citation.title}</a>)}</div></div>
              <div className="suggested-prompts">{answer.suggestedPrompts.map((prompt) => <button type="button" onClick={() => submit(prompt)} key={prompt}>{prompt}</button>)}</div>
            </article>
          </div>
        ))}
      </div>
      {error ? <p className="error-message">{error}</p> : null}
      <form className="chat-composer" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
        <input value={message} onChange={(event) => { setMessage(event.target.value); if (error) setError(""); }} placeholder={text.placeholder} aria-label={text.send} maxLength={4000} />
        <button type="submit" disabled={loading} aria-label="Send message">{loading ? "..." : "➤"}</button>
      </form>
    </section>
  );
}
