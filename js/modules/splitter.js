import { DEFAULT_CHAR_LIMIT } from "./constants.js";

function splitByCharLimit(text, charLimit) {
  if (!text) {
    return [];
  }

  const chunks = [];
  for (let cursor = 0; cursor < text.length; cursor += charLimit) {
    chunks.push(text.slice(cursor, cursor + charLimit));
  }
  return chunks;
}

function cleanSegmentRawText(rawText) {
  return rawText.replace(/^\n+/, "").replace(/\n+$/, "");
}

function parseManualSegments(text) {
  const normalizedText = text.replace(/\r\n/g, "\n");
  const lines = normalizedText.split("\n");
  const segments = [];

  let cursor = 0;
  let segmentStart = 0;

  lines.forEach((line, index) => {
    const lineStart = cursor;
    const lineEnd = lineStart + line.length;
    const hasTrailingNewline = index < lines.length - 1;
    const nextCursor = lineEnd + (hasTrailingNewline ? 1 : 0);

    if (line.trim() === "---") {
      segments.push({
        start: segmentStart,
        end: lineStart,
        rawText: normalizedText.slice(segmentStart, lineStart),
      });
      segmentStart = nextCursor;
    }

    cursor = nextCursor;
  });

  segments.push({
    start: segmentStart,
    end: normalizedText.length,
    rawText: normalizedText.slice(segmentStart),
  });

  return segments.map((segment) => {
    const cleanedText = cleanSegmentRawText(segment.rawText);
    const leadingTrim = segment.rawText.length - segment.rawText.replace(/^\n+/, "").length;
    const trailingTrim = segment.rawText.length - segment.rawText.replace(/\n+$/, "").length;

    const cleanedStart = Math.min(segment.start + leadingTrim, segment.end);
    const cleanedEnd = Math.max(cleanedStart, segment.end - trailingTrim);

    return {
      ...segment,
      cleanedText,
      cleanedStart,
      cleanedEnd,
    };
  });
}

export function analyzeText(text, charLimit = DEFAULT_CHAR_LIMIT, cursorPosition) {
  const safeText = text || "";
  const normalizedLimit = Math.max(1, Number(charLimit) || DEFAULT_CHAR_LIMIT);
  const manualSegments = parseManualSegments(safeText);
  const filteredSegments = manualSegments.filter((segment) => segment.cleanedText.trim() !== "");

  const chunks = [];
  const chunksPerSegment = [];

  filteredSegments.forEach((segment) => {
    const segmentChunks = splitByCharLimit(segment.cleanedText, normalizedLimit);
    chunksPerSegment.push(segmentChunks.length);
    segmentChunks.forEach((chunk) => chunks.push(chunk));
  });

  const safeCursor = Math.max(0, Math.min(cursorPosition ?? safeText.length, safeText.length));
  const activeRawSegmentIndex = Math.max(
    0,
    manualSegments.findIndex((segment) => safeCursor >= segment.start && safeCursor <= segment.end)
  );

  const activeRawSegment =
    manualSegments[activeRawSegmentIndex] || manualSegments[manualSegments.length - 1] || null;

  const activeSegmentTextLength = activeRawSegment?.cleanedText.length || 0;
  const cursorInActiveSegment = activeRawSegment
    ? Math.max(0, safeCursor - activeRawSegment.cleanedStart)
    : 0;
  const maxChunkIndexInActiveSegment =
    activeSegmentTextLength === 0 ? 0 : Math.max(0, Math.ceil(activeSegmentTextLength / normalizedLimit) - 1);
  const activeChunkIndexInSegment = Math.min(
    Math.floor(cursorInActiveSegment / normalizedLimit),
    maxChunkIndexInActiveSegment
  );
  const activeChunkStart = activeChunkIndexInSegment * normalizedLimit;
  const activeChunkLength =
    activeSegmentTextLength === 0
      ? 0
      : Math.min(normalizedLimit, activeSegmentTextLength - activeChunkStart);

  // Find the index of the active raw segment within filteredSegments
  const filteredActiveSegmentIndex = filteredSegments.findIndex(
    (seg) => seg.start === manualSegments[activeRawSegmentIndex].start
  );

  // Sum chunk counts from all preceding filtered segments, then add in-segment offset
  let currentChunkIndex = 0;
  if (filteredActiveSegmentIndex >= 0) {
    for (let i = 0; i < filteredActiveSegmentIndex; i++) {
      currentChunkIndex += chunksPerSegment[i];
    }
    currentChunkIndex += activeChunkIndexInSegment;
  }

  return {
    chunks,
    manualSegmentsCount: manualSegments.length,
    hasManualSplit: manualSegments.length > 1,
    currentChunkIndex,
    currentSplit: {
      length: activeChunkLength,
      limit: normalizedLimit,
      segmentIndex: activeRawSegmentIndex + 1,
      tootIndexInSegment: activeChunkIndexInSegment + 1,
    },
  };
}

export function splitText(text, charLimit = DEFAULT_CHAR_LIMIT) {
  return analyzeText(text, charLimit).chunks;
}
