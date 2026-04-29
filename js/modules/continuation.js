export function parseTootUrl(urlString) {
  let url;
  try {
    url = new URL(urlString);
  } catch {
    return null;
  }

  if (url.protocol !== "https:") {
    return null;
  }

  const instanceDomain = url.hostname;
  const pathname = url.pathname;

  const shortMatch = pathname.match(/^\/@[^/]+\/(\d+)$/);
  if (shortMatch) {
    return { instanceDomain, statusId: shortMatch[1] };
  }

  const longMatch = pathname.match(/^\/users\/[^/]+\/statuses\/(\d+)$/);
  if (longMatch) {
    return { instanceDomain, statusId: longMatch[1] };
  }

  return null;
}

export function isSameInstance(parsed, instanceDomain) {
  return parsed?.instanceDomain === instanceDomain;
}
