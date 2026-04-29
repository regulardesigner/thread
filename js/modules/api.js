import { APP_SCOPES, DEFAULT_CHAR_LIMIT } from "./constants.js";

function parseErrorPayload(payload, fallbackMessage) {
  if (!payload) {
    return fallbackMessage;
  }
  if (typeof payload === "string") {
    return payload;
  }
  if (typeof payload.error_description === "string") {
    return payload.error_description;
  }
  if (typeof payload.error === "string") {
    return payload.error;
  }
  if (typeof payload.message === "string") {
    return payload.message;
  }
  return fallbackMessage;
}

async function parseResponse(response) {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function buildInstanceUrl(instanceDomain, path) {
  return new URL(path, `https://${instanceDomain}`).toString();
}

async function request(instanceDomain, path, options = {}) {
  const { method = "GET", token = null, form = null, query = null } = options;

  const url = new URL(buildInstanceUrl(instanceDomain, path));
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const headers = {
    Accept: "application/json",
  };

  let body;
  if (form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded;charset=UTF-8";
    body = new URLSearchParams();
    for (const [key, value] of Object.entries(form)) {
      if (value !== undefined && value !== null && value !== "") {
        body.set(key, String(value));
      }
    }
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url.toString(), {
      method,
      headers,
      body,
    });
  } catch (error) {
    const networkError = new Error(
      `Network/CORS error while calling ${path} on ${instanceDomain}. If this app is opened as file://, run it via http://localhost.`
    );
    networkError.status = 0;
    networkError.cause = error;
    throw networkError;
  }

  const payload = await parseResponse(response);
  if (!response.ok) {
    const message = parseErrorPayload(payload, `Mastodon request failed (${response.status})`);
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export function getAuthorizeUrl({
  instanceDomain,
  clientId,
  redirectUri,
  state,
  codeChallenge,
  scopes = APP_SCOPES,
}) {
  const url = new URL(buildInstanceUrl(instanceDomain, "/oauth/authorize"));
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scopes);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  return url.toString();
}

export async function registerApp(instanceDomain, { clientName, redirectUri, scopes = APP_SCOPES }) {
  return request(instanceDomain, "/api/v1/apps", {
    method: "POST",
    form: {
      client_name: clientName,
      redirect_uris: redirectUri,
      scopes,
      website: "https://regulardesigner.github.io/thread/",
    },
  });
}

export async function exchangeToken(instanceDomain, params) {
  return request(instanceDomain, "/oauth/token", {
    method: "POST",
    form: {
      grant_type: "authorization_code",
      client_id: params.clientId,
      client_secret: params.clientSecret,
      code: params.code,
      redirect_uri: params.redirectUri,
      scope: params.scopes ?? APP_SCOPES,
      code_verifier: params.codeVerifier,
    },
  });
}

export async function verifyCredentials(instanceDomain, accessToken) {
  return request(instanceDomain, "/api/v1/accounts/verify_credentials", {
    token: accessToken,
  });
}

export async function fetchInstanceLimits(instanceDomain) {
  try {
    const v2 = await request(instanceDomain, "/api/v2/instance");
    const v2Limit = Number(v2?.configuration?.statuses?.max_characters);
    if (Number.isFinite(v2Limit) && v2Limit > 0) {
      return v2Limit;
    }
  } catch {
    // Fallback to v1 if v2 endpoint is unavailable.
  }

  try {
    const v1 = await request(instanceDomain, "/api/v1/instance");
    const v1Limit = Number(v1?.max_toot_chars ?? v1?.configuration?.statuses?.max_characters);
    if (Number.isFinite(v1Limit) && v1Limit > 0) {
      return v1Limit;
    }
  } catch {
    return DEFAULT_CHAR_LIMIT;
  }

  return DEFAULT_CHAR_LIMIT;
}

export async function fetchFollowedTags(instanceDomain, accessToken) {
  const result = await request(instanceDomain, "/api/v1/followed_tags", {
    token: accessToken,
    query: { limit: 80 },
  });

  return Array.isArray(result) ? result : [];
}

export async function createStatus(instanceDomain, accessToken, payload) {
  return request(instanceDomain, "/api/v1/statuses", {
    method: "POST",
    token: accessToken,
    form: {
      status: payload.status,
      visibility: payload.visibility,
      in_reply_to_id: payload.inReplyToId,
      language: payload.language,
    },
  });
}

export async function getStatus(instanceDomain, accessToken, statusId) {
  return request(instanceDomain, `/api/v1/statuses/${encodeURIComponent(statusId)}`, {
    token: accessToken,
  });
}
