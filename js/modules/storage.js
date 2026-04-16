import { STORAGE_KEYS, hashtagCacheKey } from "./constants.js";

function readJson(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(storage, key, value) {
  storage.setItem(key, JSON.stringify(value));
}

export function loadDraft() {
  const draft = readJson(localStorage, STORAGE_KEYS.draft);
  return typeof draft?.text === "string" ? draft.text : "";
}

export function saveDraft(text) {
  writeJson(localStorage, STORAGE_KEYS.draft, {
    version: 1,
    text,
    updatedAt: new Date().toISOString(),
  });
}

export function saveAuthSession(session) {
  writeJson(sessionStorage, STORAGE_KEYS.authSession, session);
}

export function loadAuthSession() {
  return readJson(sessionStorage, STORAGE_KEYS.authSession);
}

export function clearAuthSession() {
  sessionStorage.removeItem(STORAGE_KEYS.authSession);
}

export function savePendingAuth(pendingAuth) {
  writeJson(sessionStorage, STORAGE_KEYS.pendingAuth, pendingAuth);
}

export function loadPendingAuth() {
  return readJson(sessionStorage, STORAGE_KEYS.pendingAuth);
}

export function clearPendingAuth() {
  sessionStorage.removeItem(STORAGE_KEYS.pendingAuth);
}

export function saveCheckpoint(checkpoint) {
  writeJson(localStorage, STORAGE_KEYS.checkpoint, checkpoint);
}

export function loadCheckpoint() {
  return readJson(localStorage, STORAGE_KEYS.checkpoint);
}

export function clearCheckpoint() {
  localStorage.removeItem(STORAGE_KEYS.checkpoint);
}

export function saveLastInstance(instanceDomain) {
  localStorage.setItem(STORAGE_KEYS.lastInstance, instanceDomain);
}

export function loadLastInstance() {
  return localStorage.getItem(STORAGE_KEYS.lastInstance) || "";
}

export function savePreferredLanguage(languageCode) {
  localStorage.setItem(STORAGE_KEYS.preferredLanguage, languageCode || "");
}

export function loadPreferredLanguage() {
  const raw = localStorage.getItem(STORAGE_KEYS.preferredLanguage) || "";
  const normalized = raw.trim().toLowerCase();
  return /^[a-z]{2}$/.test(normalized) ? normalized : "";
}

export function saveHashtagCache(instanceDomain, tags) {
  writeJson(localStorage, hashtagCacheKey(instanceDomain), {
    version: 1,
    instanceDomain,
    tags,
    updatedAt: new Date().toISOString(),
  });
}

export function loadHashtagCache(instanceDomain) {
  const cache = readJson(localStorage, hashtagCacheKey(instanceDomain));
  if (!cache || !Array.isArray(cache.tags)) {
    return [];
  }
  return cache.tags.filter((tag) => typeof tag === "string");
}
