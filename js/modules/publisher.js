import { createStatus } from "./api.js";

function cloneCheckpoint(checkpoint) {
  return {
    ...checkpoint,
    chunks: [...checkpoint.chunks],
    publishedStatusIds: [...checkpoint.publishedStatusIds],
  };
}

function asErrorMessage(error) {
  return error?.message || "Publishing failed.";
}

function markFailure(checkpoint, error, failedIndex) {
  checkpoint.lastError = asErrorMessage(error);
  checkpoint.failedIndex = failedIndex;
  checkpoint.updatedAt = new Date().toISOString();
}

function markSuccess(checkpoint, statusId) {
  checkpoint.publishedStatusIds.push(statusId);
  if (!checkpoint.rootStatusId) {
    checkpoint.rootStatusId = statusId;
  }
  checkpoint.nextIndex += 1;
  checkpoint.lastError = null;
  checkpoint.failedIndex = null;
  checkpoint.updatedAt = new Date().toISOString();
}

function normalizeCallbacks(callbacks = {}) {
  return {
    onProgress: callbacks.onProgress || (() => {}),
    onCheckpoint: callbacks.onCheckpoint || (() => {}),
  };
}

async function publishCurrentIndex(authSession, checkpoint) {
  const index = checkpoint.nextIndex;
  if (index >= checkpoint.chunks.length) {
    return null;
  }

  if (index > 0 && !checkpoint.rootStatusId) {
    checkpoint.rootStatusId = checkpoint.publishedStatusIds[0] || null;
    if (!checkpoint.rootStatusId) {
      throw new Error("Missing root toot id for reply publication.");
    }
  }

  const response = await createStatus(authSession.instanceDomain, authSession.accessToken, {
    status: checkpoint.chunks[index],
    visibility: index === 0 ? "public" : "unlisted",
    inReplyToId: index === 0 ? null : checkpoint.rootStatusId,
    language: checkpoint.language || undefined,
  });

  if (!response?.id) {
    throw new Error("Status creation succeeded but no id was returned.");
  }

  markSuccess(checkpoint, response.id);
  return response;
}

async function publishRemaining(authSession, checkpoint, options = {}) {
  const callbacks = normalizeCallbacks(options);
  const maxSteps = Number.isFinite(options.maxSteps) ? options.maxSteps : Infinity;
  let steps = 0;

  while (checkpoint.nextIndex < checkpoint.chunks.length && steps < maxSteps) {
    try {
      const response = await publishCurrentIndex(authSession, checkpoint);
      steps += 1;
      callbacks.onCheckpoint(checkpoint);
      callbacks.onProgress({
        publishedCount: checkpoint.nextIndex,
        total: checkpoint.chunks.length,
        statusId: response?.id || null,
      });
    } catch (error) {
      markFailure(checkpoint, error, checkpoint.nextIndex);
      callbacks.onCheckpoint(checkpoint);
      return {
        status: "failed",
        checkpoint,
        error,
      };
    }
  }

  if (checkpoint.nextIndex >= checkpoint.chunks.length) {
    checkpoint.completedAt = new Date().toISOString();
    checkpoint.updatedAt = checkpoint.completedAt;
    callbacks.onCheckpoint(checkpoint);
    return {
      status: "completed",
      checkpoint,
    };
  }

  return {
    status: "partial",
    checkpoint,
  };
}

export function createPublishCheckpoint(instanceDomain, chunks, language = "") {
  return {
    version: 1,
    instanceDomain,
    chunks: [...chunks],
    language,
    rootStatusId: null,
    publishedStatusIds: [],
    nextIndex: 0,
    failedIndex: null,
    lastError: null,
    resumeFailures: 0,
    manualMode: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function publishThread(authSession, chunks, callbacks = {}, options = {}) {
  if (!authSession?.instanceDomain || !authSession?.accessToken) {
    throw new Error("You need to sign in before publishing.");
  }

  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No toots to publish.");
  }

  const checkpoint = createPublishCheckpoint(
    authSession.instanceDomain,
    chunks,
    options.language || ""
  );
  const normalized = normalizeCallbacks(callbacks);
  normalized.onCheckpoint(checkpoint);
  return publishRemaining(authSession, checkpoint, normalized);
}

export async function resumeThread(authSession, existingCheckpoint, callbacks = {}) {
  const checkpoint = cloneCheckpoint(existingCheckpoint);
  checkpoint.manualMode = false;

  const result = await publishRemaining(authSession, checkpoint, callbacks);
  if (result.status === "failed") {
    checkpoint.resumeFailures += 1;
    checkpoint.manualMode = true;
    checkpoint.updatedAt = new Date().toISOString();
    const normalized = normalizeCallbacks(callbacks);
    normalized.onCheckpoint(checkpoint);
  }

  return {
    ...result,
    checkpoint,
  };
}

export async function publishNextPending(authSession, existingCheckpoint, callbacks = {}) {
  const checkpoint = cloneCheckpoint(existingCheckpoint);
  checkpoint.manualMode = true;

  const result = await publishRemaining(authSession, checkpoint, {
    ...callbacks,
    maxSteps: 1,
  });

  return {
    ...result,
    checkpoint,
  };
}
