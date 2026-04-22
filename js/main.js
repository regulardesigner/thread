import { DEFAULT_CHAR_LIMIT } from "./modules/constants.js";
import {
  clearCheckpoint,
  loadAuthSession,
  loadCheckpoint,
  loadDraft,
  loadLastInstance,
  loadPreferredLanguage,
  saveCheckpoint,
  saveDraft,
  savePreferredLanguage,
} from "./modules/storage.js";
import {
  handleAuthCallback,
  normalizeInstanceDomain,
  signIn,
  signOut,
  verifySession,
} from "./modules/auth.js";
import { fetchInstanceLimits } from "./modules/api.js";
import { filterInstances, loadInstances } from "./modules/instances.js";
import { analyzeText } from "./modules/splitter.js";
import { fetchFavoriteHashtags, insertHashtagAtCursor } from "./modules/hashtags.js";
import { publishNextPending, publishThread, resumeThread } from "./modules/publisher.js";
import {
  renderAuthState,
  renderHashtags,
  renderInstanceDropdown,
  renderLandingPage,
  renderPublishButtons,
  renderSplitPreview,
  setBanner,
} from "./modules/ui.js";

const dom = {
  landingPage: document.getElementById("landingPage"),
  landingInstanceInput: document.getElementById("landingInstanceInput"),
  landingInstanceDropdown: document.getElementById("landingInstanceDropdown"),
  landingSignInForm: document.getElementById("landingSignInForm"),
  landingSignInButton: document.getElementById("landingSignInButton"),
  landingAuthStatus: document.getElementById("landingAuthStatus"),
  appShell: document.getElementById("appShell"),
  signedOutAuthPanel: document.getElementById("signedOutAuthPanel"),
  signedInAuthPanel: document.getElementById("signedInAuthPanel"),
  signInForm: document.getElementById("signInForm"),
  instanceInput: document.getElementById("instanceInput"),
  instanceDropdown: document.getElementById("instanceDropdown"),
  signInButton: document.getElementById("signInButton"),
  signOutButton: document.getElementById("signOutButton"),
  authStatus: document.getElementById("authStatus"),
  accountAvatar: document.getElementById("accountAvatar"),
  accountDisplayName: document.getElementById("accountDisplayName"),
  accountHandle: document.getElementById("accountHandle"),
  accountInstance: document.getElementById("accountInstance"),
  accountStatuses: document.getElementById("accountStatuses"),
  accountFollowers: document.getElementById("accountFollowers"),
  accountFollowing: document.getElementById("accountFollowing"),
  messageBanner: document.getElementById("messageBanner"),
  sourceText: document.getElementById("sourceText"),
  focusModeButton: document.getElementById("focusModeButton"),
  focusModePanel: document.getElementById("focusModePanel"),
  focusModeExitButton: document.getElementById("focusModeExitButton"),
  focusModeText: document.getElementById("focusModeText"),
  textCount: document.getElementById("textCount"),
  chunkCount: document.getElementById("chunkCount"),
  currentSplitCount: document.getElementById("currentSplitCount"),
  focusCurrentSplitCount: document.getElementById("focusCurrentSplitCount"),
  limitsSummary: document.getElementById("limitsSummary"),
  tootLanguageInput: document.getElementById("tootLanguageInput"),
  publishButton: document.getElementById("publishButton"),
  retryButton: document.getElementById("retryButton"),
  manualNextButton: document.getElementById("manualNextButton"),
  discardRecoveryButton: document.getElementById("discardRecoveryButton"),
  publishStatus: document.getElementById("publishStatus"),
  refreshTagsButton: document.getElementById("refreshTagsButton"),
  hashtagsHint: document.getElementById("hashtagsHint"),
  hashtagsList: document.getElementById("hashtagsList"),
  splitPreview: document.getElementById("splitPreview"),
  focusSplitPreview: document.getElementById("focusSplitPreview"),
};

const state = {
  authSession: null,
  account: null,
  charLimit: DEFAULT_CHAR_LIMIT,
  chunks: [],
  splitAnalysis: {
    currentSplit: { length: 0, limit: DEFAULT_CHAR_LIMIT },
    hasManualSplit: false,
  },
  favoriteTags: [],
  publishBusy: false,
  checkpoint: null,
  lastProgress: null,
  focusMode: false,
  preferredLanguage: "",
};

const SUPPORTED_LANGUAGE_CODES = new Set(["en", "fr", "es", "de", "it", "pt", "nl", "ja", "ko", "zh"]);
const DEFAULT_LANGUAGE_CODE = "en";

function hasActiveCheckpoint() {
  return Boolean(state.checkpoint && state.checkpoint.nextIndex < state.checkpoint.chunks.length);
}

function setMessage(type, message) {
  setBanner(dom.messageBanner, message ? { type, message } : null);
}

function normalizeLanguageCode(rawInput, fallback = DEFAULT_LANGUAGE_CODE) {
  const normalized = (rawInput || "").trim().toLowerCase();
  if (SUPPORTED_LANGUAGE_CODES.has(normalized)) {
    return normalized;
  }
  return fallback;
}

function activeEditor() {
  return state.focusMode ? dom.focusModeText : dom.sourceText;
}

function refreshSplitState(cursorPosition = dom.sourceText.selectionStart || 0) {
  const text = dom.sourceText.value;
  state.splitAnalysis = analyzeText(text, state.charLimit, cursorPosition);
  state.chunks = state.splitAnalysis.chunks;

  dom.textCount.textContent = `${text.length} characters`;
  dom.chunkCount.textContent = `${state.chunks.length} toots`;

  const currentSplit = state.splitAnalysis.currentSplit;
  const currentSplitLabel = `Current toot: ${currentSplit.length}/${currentSplit.limit}`;
  dom.currentSplitCount.textContent = currentSplitLabel;
  dom.focusCurrentSplitCount.textContent = currentSplitLabel;

  renderSplitPreview(dom.splitPreview, state.chunks, state.charLimit);
  renderSplitPreview(dom.focusSplitPreview, state.chunks, state.charLimit, state.splitAnalysis.currentChunkIndex);
}

function applyComposerText(nextText, cursorPosition) {
  dom.sourceText.value = nextText;
  saveDraft(nextText);

  if (state.focusMode && dom.focusModeText.value !== nextText) {
    dom.focusModeText.value = nextText;
  }

  refreshSplitState(cursorPosition);

  if (hasActiveCheckpoint()) {
    setMessage(
      "warn",
      "Recovery is active. Retry/manual publish uses the previously generated toot set."
    );
  }

  render();
}

function persistCheckpoint(checkpoint) {
  state.checkpoint = checkpoint;
  saveCheckpoint(checkpoint);
}

function clearRecoveryState() {
  clearCheckpoint();
  state.checkpoint = null;
}

function renderPublishStatus() {
  if (state.publishBusy) {
    if (state.lastProgress) {
      dom.publishStatus.textContent = `Publishing... ${state.lastProgress.publishedCount}/${state.lastProgress.total}`;
      return;
    }
    dom.publishStatus.textContent = "Publishing...";
    return;
  }

  if (!hasActiveCheckpoint()) {
    dom.publishStatus.textContent = "";
    return;
  }

  const pending = state.checkpoint.chunks.length - state.checkpoint.nextIndex;
  const modeLabel = state.checkpoint.manualMode ? "Manual mode" : "Recovery mode";
  const suffix = state.checkpoint.lastError
    ? ` Last error: ${state.checkpoint.lastError}`
    : "Ready to continue.";

  dom.publishStatus.textContent = `${modeLabel}: ${pending} toot(s) remaining.${suffix}`;
}

function renderHashtagHint() {
  if (!state.authSession) {
    dom.hashtagsHint.textContent = "Sign in to load followed tags.";
    return;
  }

  if (state.favoriteTags.length === 0) {
    dom.hashtagsHint.textContent = "No favorite hashtags found yet.";
    return;
  }

  dom.hashtagsHint.textContent = "Click a hashtag to insert it at the cursor.";
}

function openFocusMode() {
  state.focusMode = true;
  dom.focusModePanel.classList.remove("hidden");

  dom.focusModeText.value = dom.sourceText.value;

  const sourceStart = dom.sourceText.selectionStart || dom.sourceText.value.length;
  const sourceEnd = dom.sourceText.selectionEnd || sourceStart;
  dom.focusModeText.focus();
  dom.focusModeText.setSelectionRange(sourceStart, sourceEnd);

  refreshSplitState(sourceStart);
  render();
}

function closeFocusMode() {
  state.focusMode = false;
  dom.focusModePanel.classList.add("hidden");

  const focusStart = dom.focusModeText.selectionStart || dom.sourceText.value.length;
  dom.sourceText.focus();
  dom.sourceText.setSelectionRange(focusStart, focusStart);

  refreshSplitState(focusStart);
  render();
}

function render() {
  renderLandingPage(dom, { isVisible: !state.authSession });
  renderAuthState(dom, state.authSession, state.account);

  dom.limitsSummary.textContent = `Character limit per toot: ${state.charLimit}`;

  renderHashtags(dom.hashtagsList, state.favoriteTags, (tag) => {
    const editor = activeEditor();
    insertHashtagAtCursor(editor, tag);

    const cursor = editor.selectionStart || editor.value.length;
    if (editor === dom.focusModeText) {
      applyComposerText(dom.focusModeText.value, cursor);
    } else {
      applyComposerText(dom.sourceText.value, cursor);
    }

    editor.focus();
  });

  renderHashtagHint();

  renderPublishButtons(dom, {
    isBusy: state.publishBusy,
    canPublish: Boolean(state.authSession && state.chunks.length > 0),
    isSignedIn: Boolean(state.authSession),
    checkpoint: state.checkpoint,
  });

  dom.focusModeButton.disabled = state.publishBusy;
  dom.tootLanguageInput.disabled = state.publishBusy;

  renderPublishStatus();
}

function updateProgress(progress) {
  state.lastProgress = progress;
  renderPublishStatus();
}

async function refreshInstanceLimit() {
  if (!state.authSession) {
    state.charLimit = DEFAULT_CHAR_LIMIT;
    refreshSplitState(activeEditor().selectionStart || 0);
    render();
    return;
  }

  state.charLimit = await fetchInstanceLimits(state.authSession.instanceDomain);
  refreshSplitState(activeEditor().selectionStart || 0);
  render();
}

async function refreshFavoriteTags() {
  if (!state.authSession) {
    state.favoriteTags = [];
    render();
    return;
  }

  const result = await fetchFavoriteHashtags(state.authSession);
  state.favoriteTags = result.tags;
  render();

  if (result.warning) {
    setMessage("warn", result.warning);
  }
}

async function hydrateAuthenticatedState() {
  await refreshInstanceLimit();
  await refreshFavoriteTags();

  const checkpoint = loadCheckpoint();
  if (checkpoint && checkpoint.instanceDomain === state.authSession.instanceDomain) {
    if (Array.isArray(checkpoint.chunks) && checkpoint.nextIndex < checkpoint.chunks.length) {
      state.checkpoint = checkpoint;
    } else {
      clearRecoveryState();
    }
  }

  render();
}

async function bootstrapSession() {
  const callback = await handleAuthCallback();

  if (callback.status === "error") {
    setMessage("error", callback.message);
  }

  if (callback.status === "success") {
    state.authSession = callback.session;
    state.account = callback.account;
    setMessage("success", "Signed in successfully.");
    await hydrateAuthenticatedState();
    return;
  }

  const existing = loadAuthSession();
  if (!existing) {
    render();
    return;
  }

  try {
    const verified = await verifySession(existing);
    state.authSession = verified.session;
    state.account = verified.account;
    await hydrateAuthenticatedState();
  } catch {
    signOut();
    setMessage("warn", "Previous sign-in expired. Please sign in again.");
    render();
  }
}

async function withPublishingState(task) {
  state.publishBusy = true;
  state.lastProgress = null;
  render();

  try {
    await task();
  } catch (error) {
    setMessage("error", error.message || "Publishing action failed.");
  } finally {
    state.publishBusy = false;
    state.lastProgress = null;
    render();
  }
}

let instanceList = [];

function bindInstanceAutocomplete(inputEl, dropdownEl) {
  let highlightIndex = -1;

  function getItems() {
    return Array.from(dropdownEl.querySelectorAll("li"));
  }

  function setHighlight(index) {
    const items = getItems();
    items.forEach((li, i) => li.setAttribute("aria-selected", String(i === index)));
    highlightIndex = index;
  }

  function selectItem(domain) {
    inputEl.value = domain;
    renderInstanceDropdown(dropdownEl, [], () => {});
    highlightIndex = -1;
  }

  let listLoaded = false;
  inputEl.addEventListener("focus", async () => {
    if (!listLoaded) {
      listLoaded = true;
      instanceList = await loadInstances();
    }
    const matches = filterInstances(instanceList, inputEl.value);
    renderInstanceDropdown(dropdownEl, matches, selectItem);
    highlightIndex = -1;
  }, { once: false });

  inputEl.addEventListener("input", () => {
    const matches = filterInstances(instanceList, inputEl.value);
    renderInstanceDropdown(dropdownEl, matches, selectItem);
    highlightIndex = -1;
  });

  inputEl.addEventListener("keydown", (e) => {
    const items = getItems();
    if (!items.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight(Math.min(highlightIndex + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight(Math.max(highlightIndex - 1, 0));
    } else if (e.key === "Enter" && highlightIndex >= 0) {
      e.preventDefault();
      selectItem(items[highlightIndex].textContent);
    } else if (e.key === "Escape") {
      renderInstanceDropdown(dropdownEl, [], () => {});
      highlightIndex = -1;
    }
  });

  inputEl.addEventListener("blur", () => {
    setTimeout(() => {
      renderInstanceDropdown(dropdownEl, [], () => {});
      highlightIndex = -1;
    }, 150);
  });
}

async function handleSignIn(rawValue, statusEl) {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    if (statusEl) statusEl.textContent = "Please enter your Mastodon instance (e.g. mastodon.social).";
    return;
  }
  if (statusEl) statusEl.textContent = "";
  try {
    const instanceDomain = normalizeInstanceDomain(trimmed);
    setMessage("info", `Redirecting to ${instanceDomain} for sign-in...`);
    await signIn(instanceDomain);
  } catch (error) {
    setMessage("error", error.message);
  }
}

function bindEvents() {
  bindInstanceAutocomplete(dom.instanceInput, dom.instanceDropdown);
  bindInstanceAutocomplete(dom.landingInstanceInput, dom.landingInstanceDropdown);

  dom.signInForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleSignIn(dom.instanceInput.value, null);
  });

  dom.landingSignInForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await handleSignIn(dom.landingInstanceInput.value, dom.landingAuthStatus);
  });

  dom.signOutButton.addEventListener("click", () => {
    signOut();
    state.authSession = null;
    state.account = null;
    state.favoriteTags = [];
    state.charLimit = DEFAULT_CHAR_LIMIT;
    clearRecoveryState();
    refreshSplitState(0);
    setMessage("info", "Signed out.");
    render();
  });

  dom.sourceText.addEventListener("input", () => {
    applyComposerText(dom.sourceText.value, dom.sourceText.selectionStart || 0);
  });

  ["click", "keyup", "select"].forEach((eventName) => {
    dom.sourceText.addEventListener(eventName, () => {
      if (state.focusMode) {
        return;
      }
      refreshSplitState(dom.sourceText.selectionStart || 0);
      render();
    });
  });

  dom.focusModeButton.addEventListener("click", () => {
    openFocusMode();
  });

  dom.focusModeExitButton.addEventListener("click", () => {
    closeFocusMode();
  });

  dom.focusModeText.addEventListener("input", () => {
    applyComposerText(dom.focusModeText.value, dom.focusModeText.selectionStart || 0);
  });

  ["click", "keyup", "select"].forEach((eventName) => {
    dom.focusModeText.addEventListener(eventName, () => {
      if (!state.focusMode) {
        return;
      }
      refreshSplitState(dom.focusModeText.selectionStart || 0);
      render();
    });
  });

  dom.focusModeText.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeFocusMode();
    }
  });

  dom.tootLanguageInput.addEventListener("change", () => {
    const normalized = normalizeLanguageCode(dom.tootLanguageInput.value, DEFAULT_LANGUAGE_CODE);
    state.preferredLanguage = normalized;
    dom.tootLanguageInput.value = normalized;
    savePreferredLanguage(normalized);
  });

  dom.publishButton.addEventListener("click", () =>
    withPublishingState(async () => {
      if (!state.authSession) {
        setMessage("error", "Sign in before publishing.");
        return;
      }

      if (hasActiveCheckpoint()) {
        setMessage("warn", "Recovery is active. Continue with retry/manual actions or discard recovery.");
        return;
      }

      if (state.chunks.length === 0) {
        setMessage("warn", "Write some text before publishing.");
        return;
      }

      const result = await publishThread(state.authSession, state.chunks, {
        onCheckpoint: persistCheckpoint,
        onProgress: updateProgress,
      }, {
        language: state.preferredLanguage,
      });

      if (result.status === "completed") {
        clearRecoveryState();
        setMessage("success", `Thread published (${state.chunks.length} toots).`);
        return;
      }

      setMessage("warn", "Publishing stopped due to an error. Use Retry publish to resume.");
    })
  );

  dom.retryButton.addEventListener("click", () =>
    withPublishingState(async () => {
      if (!state.authSession || !hasActiveCheckpoint()) {
        return;
      }

      const result = await resumeThread(state.authSession, state.checkpoint, {
        onCheckpoint: persistCheckpoint,
        onProgress: updateProgress,
      });

      if (result.status === "completed") {
        clearRecoveryState();
        setMessage("success", "Thread published successfully after retry.");
        return;
      }

      if (result.status === "failed") {
        setMessage(
          "warn",
          "Retry failed again. You can now publish remaining toots one by one with Publish next toot."
        );
      }
    })
  );

  dom.manualNextButton.addEventListener("click", () =>
    withPublishingState(async () => {
      if (!state.authSession || !hasActiveCheckpoint()) {
        return;
      }

      const result = await publishNextPending(state.authSession, state.checkpoint, {
        onCheckpoint: persistCheckpoint,
        onProgress: updateProgress,
      });

      if (result.status === "completed") {
        clearRecoveryState();
        setMessage("success", "All remaining toots were published.");
        return;
      }

      if (result.status === "failed") {
        setMessage("warn", "Could not publish this toot yet. You can try Publish next toot again.");
        return;
      }

      const pending = state.checkpoint.chunks.length - state.checkpoint.nextIndex;
      setMessage("info", `Published one toot. ${pending} remaining.`);
    })
  );

  dom.discardRecoveryButton.addEventListener("click", () => {
    clearRecoveryState();
    setMessage("info", "Recovery checkpoint discarded.");
    render();
  });

  dom.refreshTagsButton.addEventListener("click", async () => {
    try {
      await refreshFavoriteTags();
    } catch (error) {
      setMessage("warn", error.message || "Could not refresh hashtags.");
    }
  });
}

async function init() {
  const lastInstance = loadLastInstance();
  dom.instanceInput.value = lastInstance;
  dom.landingInstanceInput.value = lastInstance;
  state.preferredLanguage = normalizeLanguageCode(loadPreferredLanguage(), DEFAULT_LANGUAGE_CODE);
  dom.tootLanguageInput.value = state.preferredLanguage;
  savePreferredLanguage(state.preferredLanguage);

  const draft = loadDraft();
  dom.sourceText.value = draft;
  dom.focusModeText.value = draft;

  bindEvents();
  refreshSplitState(dom.sourceText.selectionStart || 0);
  render();

  await bootstrapSession();
}

init().catch((error) => {
  setMessage("error", error.message || "Unexpected error during initialization.");
});
