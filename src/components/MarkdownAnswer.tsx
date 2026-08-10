import React, { Children, isValidElement, type ReactNode, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Language = "ar" | "en";

const labels = {
  ar: {
    copyAnswer: "نسخ الرد بصيغة Markdown",
    copyCode: "نسخ الكود",
    copied: "تم النسخ",
    copyFailed: "تعذر النسخ",
  },
  en: {
    copyAnswer: "Copy response as Markdown",
    copyCode: "Copy code",
    copied: "Copied",
    copyFailed: "Could not copy",
  },
} as const;

function nodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
  return "";
}

async function writeClipboard(value: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy failed");
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
    </svg>
  );
}

function CopyButton({ value, label, language, compact = false }: { value: string; label: string; language: Language; compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const text = labels[language];

  async function copy() {
    try {
      await writeClipboard(value);
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    window.setTimeout(() => setStatus("idle"), 1800);
  }

  const statusLabel = status === "copied" ? text.copied : status === "failed" ? text.copyFailed : label;

  return (
    <button className={`copy-button${compact ? " is-compact" : ""}`} type="button" onClick={() => void copy()} aria-label={statusLabel} title={statusLabel}>
      <CopyIcon />
      <span>{statusLabel}</span>
    </button>
  );
}

export default function MarkdownAnswer({ markdown, language, title }: { markdown: string; language: Language; title: string }) {
  const text = labels[language];

  return (
    <div className="answer-copy">
      <div className="answer-copy-heading">
        <h2>{title}</h2>
        <CopyButton value={markdown} label={text.copyAnswer} language={language} />
      </div>
      <div className="markdown-body">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          skipHtml
          components={{
            a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
            pre: ({ node: _node, children, ...props }) => {
              const value = nodeText(Children.toArray(children)).replace(/\n$/, "");
              return (
                <div className="code-block">
                  <CopyButton value={value} label={text.copyCode} language={language} compact />
                  <pre {...props}>{children}</pre>
                </div>
              );
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
