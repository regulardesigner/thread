import { describe, it, expect } from "vitest";
import { parseTootUrl, isSameInstance } from "../js/modules/continuation.js";

describe("parseTootUrl", () => {
  it("parses short URL /@username/id", () => {
    expect(parseTootUrl("https://mastodon.social/@alice/123456789")).toEqual({
      instanceDomain: "mastodon.social",
      statusId: "123456789",
    });
  });

  it("parses ActivityPub URL /users/username/statuses/id", () => {
    expect(parseTootUrl("https://fosstodon.org/users/bob/statuses/987654321")).toEqual({
      instanceDomain: "fosstodon.org",
      statusId: "987654321",
    });
  });

  it("returns null for non-URL strings", () => {
    expect(parseTootUrl("not-a-url")).toBeNull();
    expect(parseTootUrl("")).toBeNull();
  });

  it("returns null for URLs without a matching toot path", () => {
    expect(parseTootUrl("https://mastodon.social/explore")).toBeNull();
    expect(parseTootUrl("https://mastodon.social/@alice")).toBeNull();
    expect(parseTootUrl("https://mastodon.social/@alice/abc")).toBeNull();
  });

  it("returns null for non-https URLs", () => {
    expect(parseTootUrl("http://mastodon.social/@alice/123")).toBeNull();
  });
});

describe("isSameInstance", () => {
  it("returns true when domains match", () => {
    expect(isSameInstance({ instanceDomain: "mastodon.social" }, "mastodon.social")).toBe(true);
  });

  it("returns false when domains differ", () => {
    expect(isSameInstance({ instanceDomain: "fosstodon.org" }, "mastodon.social")).toBe(false);
  });

  it("returns false when parsed is null", () => {
    expect(isSameInstance(null, "mastodon.social")).toBe(false);
  });
});
