import { APP_SCOPES } from "./constants.js";
import {
  clearAuthSession,
  clearPendingAuth,
  loadPendingAuth,
  saveAuthSession,
  savePendingAuth,
  saveLastInstance,
} from "./storage.js";
import {
  exchangeToken,
  getAuthorizeUrl,
  registerApp,
  verifyCredentials,
} from "./api.js";

function randomString(length = 64) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const value of bytes) {
    binary += String.fromCharCode(value);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function makeCodeChallenge(verifier) {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return base64UrlEncode(digest);
}

function getRedirectUri() {
  return `${window.location.origin}${window.location.pathname}`;
}

function assertSupportedAppOrigin() {
  if (window.location.protocol === "file:") {
    throw new Error(
      "Sign-in requires http://localhost (or https). You are running from file://. Start a local server and open the app over HTTP."
    );
  }

  const isLocalhost =
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
  const isHttps = window.location.protocol === "https:";

  if (!isLocalhost && !isHttps) {
    throw new Error(
      "Sign-in requires HTTPS on non-localhost origins. Use https://... or run locally on http://localhost."
    );
  }
}

export function normalizeInstanceDomain(input) {
  const raw = input.trim();
  if (!raw) {
    throw new Error("Please enter an instance domain.");
  }

  let parsed;
  try {
    parsed = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
  } catch {
    throw new Error("Invalid instance domain.");
  }

  if (!parsed.hostname) {
    throw new Error("Invalid instance domain.");
  }

  return parsed.hostname.toLowerCase();
}

export async function signIn(instanceInput) {
  assertSupportedAppOrigin();

  const instanceDomain = normalizeInstanceDomain(instanceInput);
  const redirectUri = getRedirectUri();

  const app = await registerApp(instanceDomain, {
    clientName: "Calm Thread Publisher",
    redirectUri,
    scopes: APP_SCOPES,
  });

  if (!app?.client_id || !app?.client_secret) {
    throw new Error("Could not register Mastodon app.");
  }

  const codeVerifier = randomString(64);
  const codeChallenge = await makeCodeChallenge(codeVerifier);
  const state = randomString(32);

  savePendingAuth({
    version: 1,
    instanceDomain,
    clientId: app.client_id,
    clientSecret: app.client_secret,
    codeVerifier,
    state,
    redirectUri,
    scopes: APP_SCOPES,
    createdAt: new Date().toISOString(),
  });

  saveLastInstance(instanceDomain);

  const authorizeUrl = getAuthorizeUrl({
    instanceDomain,
    clientId: app.client_id,
    redirectUri,
    state,
    codeChallenge,
    scopes: APP_SCOPES,
  });

  window.location.assign(authorizeUrl);
}

function stripAuthQueryParams() {
  const cleanUrl = `${window.location.pathname}${window.location.hash}`;
  window.history.replaceState({}, document.title, cleanUrl);
}

export async function handleAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const error = params.get("error");
  const errorDescription = params.get("error_description");
  const code = params.get("code");
  const state = params.get("state");

  if (!error && !code) {
    return { status: "none" };
  }

  if (error) {
    stripAuthQueryParams();
    return {
      status: "error",
      message: errorDescription || error,
    };
  }

  const pendingAuth = loadPendingAuth();
  if (!pendingAuth) {
    stripAuthQueryParams();
    return {
      status: "error",
      message: "Missing pending sign-in session. Please sign in again.",
    };
  }

  if (state !== pendingAuth.state) {
    clearPendingAuth();
    stripAuthQueryParams();
    return {
      status: "error",
      message: "OAuth state mismatch. Please sign in again.",
    };
  }

  try {
    const token = await exchangeToken(pendingAuth.instanceDomain, {
      code,
      clientId: pendingAuth.clientId,
      clientSecret: pendingAuth.clientSecret,
      redirectUri: pendingAuth.redirectUri,
      scopes: pendingAuth.scopes,
      codeVerifier: pendingAuth.codeVerifier,
    });

    if (!token?.access_token) {
      throw new Error("Token exchange did not return an access token.");
    }

    const session = {
      version: 1,
      instanceDomain: pendingAuth.instanceDomain,
      accessToken: token.access_token,
      tokenType: token.token_type || "Bearer",
      scopes: token.scope || pendingAuth.scopes,
      createdAt: new Date().toISOString(),
    };

    saveAuthSession(session);
    clearPendingAuth();
    stripAuthQueryParams();

    const account = await verifyCredentials(session.instanceDomain, session.accessToken);

    return {
      status: "success",
      session,
      account,
    };
  } catch (authError) {
    clearPendingAuth();
    clearAuthSession();
    stripAuthQueryParams();
    return {
      status: "error",
      message: authError.message,
    };
  }
}

export async function verifySession(session) {
  if (!session?.instanceDomain || !session?.accessToken) {
    throw new Error("Missing session.");
  }

  const account = await verifyCredentials(session.instanceDomain, session.accessToken);
  return { session, account };
}

export function signOut() {
  clearPendingAuth();
  clearAuthSession();
}
