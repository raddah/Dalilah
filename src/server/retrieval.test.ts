import { describe, expect, it } from "vitest";
import { getSearchTokens } from "./retrieval";

describe("getSearchTokens", () => {
  it("keeps the meaningful Arabic place name from a location question", () => {
    expect(getSearchTokens("جبل عِكمة أين يقع؟")).toEqual(["جبل", "عكمة"]);
  });

  it("removes generic image-request words", () => {
    expect(getSearchTokens("هات صور عن دادان")).toEqual(["دادان"]);
  });

  it("keeps English heritage names", () => {
    expect(getSearchTokens("Where is Jabal Ikmah?")).toEqual(["jabal", "ikmah"]);
  });
});
