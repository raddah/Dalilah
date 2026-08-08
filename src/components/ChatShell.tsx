import { useState } from "react";
import { askDalilah } from "../lib/api-client";

type Answer = {
  answer: string;
  confidence: "high" | "medium" | "low";
  citations: Array<{ title: string; url: string }>;
  suggestedPrompts: string[];
};

type Language = "ar" | "en";

const copy = {
  ar: {
    sampleQuestion: "ما هي أهمية حي الطريف التاريخية؟",
    empty: "اسأل دليلة عن التراث والثقافة السعودية.",
    placeholder: "اسأل دليلة عن المواقع التراثية في المملكة...",
    confidence: "مستوى الثقة",
    send: "إرسال السؤال",
    loading: "جاري البحث...",
    requestError: "تعذر إكمال الطلب الآن",
  },
  en: {
    sampleQuestion: "What is the historical importance of At-Turaif District?",
    empty: "Ask Dalilah about Saudi heritage and culture.",
    placeholder: "Ask Dalilah about heritage sites in Saudi Arabia...",
    confidence: "Confidence",
    send: "Send question",
    loading: "Searching...",
    requestError: "Unable to complete the request right now",
  },
} as const;

export default function ChatShell({
  language,
  initialMessage = "",
}: {
  language: Language;
  initialMessage?: string;
}) {
  const text = copy[language];
  const [message, setMessage] = useState(initialMessage);
  const [submittedMessage, setSubmittedMessage] = useState(
    initialMessage || text.sampleQuestion,
  );
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(value = message) {
    if (!value.trim() || loading) return;
    setLoading(true);
    setError("");
    setSubmittedMessage(value);
    try {
      setAnswer(await askDalilah(value, language));
      setMessage("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : text.requestError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="chat-shell" dir={language === "ar" ? "rtl" : "ltr"} aria-live="polite">
      <div className="conversation">
        <div className="user-bubble">{submittedMessage}</div>

        {answer ? (
          <article className="answer-card">
            <div className="answer-label">دليلة ✦</div>
            <p>{answer.answer}</p>
            <div className="answer-meta">
              <span>{text.confidence}: {answer.confidence}</span>
              {answer.citations.map((citation) => (
                <a href={citation.url} target="_blank" rel="noreferrer" key={citation.url}>
                  {citation.title}
                </a>
              ))}
            </div>
            <div className="suggested-prompts">
              {answer.suggestedPrompts.map((prompt) => (
                <button type="button" onClick={() => submit(prompt)} key={prompt}>
                  {prompt}
                </button>
              ))}
            </div>
          </article>
        ) : (
          <div className="empty-answer">{text.empty}</div>
        )}
      </div>

      {error ? <p className="error-message">{error}</p> : null}

      <form
        className="chat-composer"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={text.placeholder}
          aria-label={text.send}
          maxLength={4000}
        />
        <button type="submit" disabled={loading} aria-label="Send message">
          {loading ? "..." : "➤"}
        </button>
      </form>
    </section>
  );
}
