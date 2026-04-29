function setHidden(element, hidden) {
  element.classList.toggle("hidden", hidden);
}

const FALLBACK_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='112' height='112' viewBox='0 0 112 112'%3E%3Crect width='112' height='112' fill='%23d8dfdf'/%3E%3Ctext x='56' y='64' text-anchor='middle' font-size='40' font-family='Arial' fill='%23587070'%3E@%3C/text%3E%3C/svg%3E";

function formatCount(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    return "0";
  }
  return new Intl.NumberFormat().format(amount);
}

export function setBanner(banner, payload) {
  if (!payload?.message) {
    banner.textContent = "";
    banner.className = "banner hidden";
    return;
  }

  banner.textContent = payload.message;
  banner.className = `banner ${payload.type || "info"}`;
}

export function renderAuthState(elements, authSession, account) {
  const isSignedIn = Boolean(authSession);

  setHidden(elements.signedOutAuthPanel, isSignedIn);
  setHidden(elements.signedInAuthPanel, !isSignedIn);

  elements.instanceInput.disabled = isSignedIn;

  if (!isSignedIn) {
    elements.authStatus.textContent = "Not signed in.";
    setHidden(elements.authStatus, false);
    return;
  }

  const displayName =
    (typeof account?.display_name === "string" && account.display_name.trim()) ||
    account?.username ||
    account?.acct ||
    "Account";
  const handle = account?.acct || account?.username || "account";
  const avatar = account?.avatar_static || account?.avatar || FALLBACK_AVATAR;

  elements.accountAvatar.src = avatar;
  elements.accountAvatar.alt = `Avatar for @${handle}`;
  elements.accountDisplayName.textContent = displayName;
  elements.accountHandle.textContent = `@${handle}`;
  elements.accountInstance.textContent = `Connected to ${authSession.instanceDomain}`;
  elements.accountStatuses.textContent = formatCount(account?.statuses_count);
  elements.accountFollowers.textContent = formatCount(account?.followers_count);
  elements.accountFollowing.textContent = formatCount(account?.following_count);

  elements.authStatus.textContent = `Signed in as @${handle} on ${authSession.instanceDomain}.`;
  setHidden(elements.authStatus, true);
}

export function renderHashtags(container, tags, onInsert) {
  container.innerHTML = "";

  if (!tags.length) {
    const muted = document.createElement("p");
    muted.className = "muted";
    muted.textContent = "No hashtags available.";
    container.append(muted);
    return;
  }

  tags.forEach((tag) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hashtag-pill";
    button.textContent = `#${tag}`;
    button.addEventListener("click", () => onInsert(tag));
    container.append(button);
  });
}

export function renderSplitPreview(container, chunks, charLimit, activeIndex = -1) {
  container.innerHTML = "";

  if (!chunks.length) {
    const empty = document.createElement("li");
    empty.className = "preview-item muted";
    empty.textContent = "Write text to generate toot preview.";
    container.append(empty);
    return;
  }

  chunks.forEach((chunk, index) => {
    const item = document.createElement("li");
    item.className = "preview-item";
    if (index === activeIndex) {
      item.classList.add("preview-item--active");
    }

    const meta = document.createElement("div");
    meta.className = "preview-meta";

    const label = document.createElement("span");
    label.textContent = `Toot ${index + 1}`;

    const count = document.createElement("span");
    count.textContent = `${chunk.length}/${charLimit}`;

    meta.append(label, count);

    const text = document.createElement("p");
    text.className = "preview-text";
    text.textContent = chunk;

    item.append(meta, text);
    container.append(item);
  });

  const activeEl = container.children[activeIndex];
  activeEl?.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

export function renderInstanceDropdown(dropdownEl, matches, onSelect) {
  dropdownEl.innerHTML = "";
  setHidden(dropdownEl, matches.length === 0);

  matches.forEach((domain) => {
    const li = document.createElement("li");
    li.role = "option";
    li.textContent = domain;
    li.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onSelect(domain);
    });
    dropdownEl.append(li);
  });
}

export function renderLandingPage(elements, { isVisible }) {
  setHidden(elements.landingPage, !isVisible);
  setHidden(elements.appShell, isVisible);
}

function htmlToPlainText(html) {
  if (!html) return "";
  const withBreaks = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n\n")
    .replace(/<\/?p[^>]*>/gi, "");
  const doc = new DOMParser().parseFromString(withBreaks, "text/html");
  return (doc.body.textContent || "").trim();
}

export function renderContinuationSection(elements, { continuationToot, isBusy }) {
  const hasInput = Boolean(elements.continuationUrlInput?.value?.trim());

  elements.continuationUrlInput.disabled = isBusy;
  elements.continuationClearButton.disabled = isBusy;
  setHidden(elements.continuationClearButton, !hasInput);

  if (!continuationToot) {
    setHidden(elements.continuationPreview, true);
    elements.continuationPreview.innerHTML = "";
    return;
  }

  setHidden(elements.continuationPreview, false);
  elements.continuationPreview.innerHTML = "";

  const text = htmlToPlainText(continuationToot.text);
  const truncated = text.length > 300 ? text.slice(0, 300).trimEnd() + "…" : text;

  const p = document.createElement("p");
  p.className = "continuation-preview-toot";
  p.textContent = truncated;
  elements.continuationPreview.append(p);
}

export function renderPublishButtons(elements, context) {
  const activeRecovery =
    context.checkpoint && context.checkpoint.nextIndex < context.checkpoint.chunks.length;

  elements.publishButton.disabled =
    context.isBusy || !context.canPublish || Boolean(activeRecovery);

  setHidden(elements.retryButton, !(activeRecovery && !context.isBusy && !context.checkpoint.manualMode));
  setHidden(elements.manualNextButton, !(activeRecovery && !context.isBusy && context.checkpoint.manualMode));
  setHidden(elements.discardRecoveryButton, !(activeRecovery && !context.isBusy));

  elements.refreshTagsButton.disabled = context.isBusy || !context.isSignedIn;
}
