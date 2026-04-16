import { fetchFollowedTags } from "./api.js";
import { loadHashtagCache, saveHashtagCache } from "./storage.js";

function normalizeTagName(rawTag) {
  return rawTag.replace(/^#+/, "").trim();
}

export async function fetchFavoriteHashtags(authSession) {
  if (!authSession) {
    return { tags: [], warning: null };
  }

  try {
    const rawTags = await fetchFollowedTags(authSession.instanceDomain, authSession.accessToken);
    const tags = [...new Set(rawTags.map((tag) => normalizeTagName(tag?.name || "")).filter(Boolean))];

    saveHashtagCache(authSession.instanceDomain, tags);

    return {
      tags,
      warning: null,
    };
  } catch (error) {
    const cached = loadHashtagCache(authSession.instanceDomain);
    if (cached.length > 0) {
      return {
        tags: cached,
        warning: "Could not refresh followed tags. Showing cached favorites.",
      };
    }

    return {
      tags: [],
      warning: "Could not load followed tags for this instance.",
    };
  }
}

export function insertHashtagAtCursor(textarea, tagName) {
  const cleanTag = normalizeTagName(tagName);
  if (!cleanTag) {
    return;
  }

  const insertion = `#${cleanTag}`;
  const text = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  const before = text.slice(0, start);
  const after = text.slice(end);

  const needsLeadingSpace = before.length > 0 && !/\s$/.test(before);
  const needsTrailingSpace = after.length > 0 && !/^\s/.test(after);

  const finalInsertion = `${needsLeadingSpace ? " " : ""}${insertion}${needsTrailingSpace ? " " : ""}`;
  const nextText = `${before}${finalInsertion}${after}`;

  textarea.value = nextText;

  const cursor = before.length + finalInsertion.length;
  textarea.setSelectionRange(cursor, cursor);
}
