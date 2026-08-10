import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import MarkdownAnswer from "./MarkdownAnswer";

describe("MarkdownAnswer", () => {
  it("renders common Markdown and GFM structures", () => {
    const html = renderToStaticMarkup(
      <MarkdownAnswer
        language="ar"
        title="إجابة موثقة"
        markdown={"## عنوان\n\n**نص مهم**\n\n1. خطوة\n2. خطوة ثانية\n\n| الموقع | المنطقة |\n| --- | --- |\n| العلا | المدينة |\n\n```js\nconst place = 'AlUla';\n```"}
      />,
    );

    expect(html).toContain("<h2>عنوان</h2>");
    expect(html).toContain("<strong>نص مهم</strong>");
    expect(html).toContain("<ol>");
    expect(html).toContain("<table>");
    expect(html).toContain("<pre>");
    expect(html).toContain("نسخ الرد بصيغة Markdown");
    expect(html).toContain("نسخ الكود");
  });

  it("does not render raw HTML supplied by the model", () => {
    const html = renderToStaticMarkup(
      <MarkdownAnswer language="en" title="Grounded answer" markdown={'Safe text<script>alert("x")</script>'} />,
    );

    expect(html).toContain("Safe text");
    expect(html).not.toContain("<script>");
  });
});
