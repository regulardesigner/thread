import { describe, it, expect, vi, beforeEach } from "vitest";

const createStatusMock = vi.fn();
vi.mock("../js/modules/api.js", () => ({
  createStatus: createStatusMock,
}));

const { publishThread } = await import("../js/modules/publisher.js");

const session = { instanceDomain: "mastodon.social", accessToken: "token" };

const makeStatus = (id) => ({ id });

beforeEach(() => {
  createStatusMock.mockReset();
});

describe("publishThread — fresh thread (no continuation)", () => {
  it("first toot is public with no inReplyToId", async () => {
    createStatusMock.mockResolvedValueOnce(makeStatus("1"));
    createStatusMock.mockResolvedValueOnce(makeStatus("2"));

    await publishThread(session, ["A", "B"], {}, { language: "en" });

    const first = createStatusMock.mock.calls[0][2];
    expect(first.visibility).toBe("public");
    expect(first.inReplyToId).toBeNull();
  });

  it("subsequent toots are unlisted and reply to the first toot id", async () => {
    createStatusMock.mockResolvedValueOnce(makeStatus("root-id"));
    createStatusMock.mockResolvedValueOnce(makeStatus("second-id"));

    await publishThread(session, ["A", "B"], {}, { language: "en" });

    const second = createStatusMock.mock.calls[1][2];
    expect(second.visibility).toBe("unlisted");
    expect(second.inReplyToId).toBe("root-id");
  });
});

describe("publishThread — continuation", () => {
  it("first toot is unlisted and replies to continuationStatusId", async () => {
    createStatusMock.mockResolvedValueOnce(makeStatus("new-1"));
    createStatusMock.mockResolvedValueOnce(makeStatus("new-2"));

    await publishThread(session, ["A", "B"], {}, {
      language: "en",
      continuationStatusId: "existing-99",
    });

    const first = createStatusMock.mock.calls[0][2];
    expect(first.visibility).toBe("unlisted");
    expect(first.inReplyToId).toBe("existing-99");
  });

  it("every subsequent toot also replies to continuationStatusId (siblings)", async () => {
    createStatusMock.mockResolvedValueOnce(makeStatus("new-1"));
    createStatusMock.mockResolvedValueOnce(makeStatus("new-2"));
    createStatusMock.mockResolvedValueOnce(makeStatus("new-3"));

    await publishThread(session, ["A", "B", "C"], {}, {
      continuationStatusId: "existing-99",
    });

    expect(createStatusMock.mock.calls[1][2].inReplyToId).toBe("existing-99");
    expect(createStatusMock.mock.calls[1][2].visibility).toBe("unlisted");
    expect(createStatusMock.mock.calls[2][2].inReplyToId).toBe("existing-99");
    expect(createStatusMock.mock.calls[2][2].visibility).toBe("unlisted");
  });

  it("single-toot continuation is unlisted and replies to continuationStatusId", async () => {
    createStatusMock.mockResolvedValueOnce(makeStatus("new-1"));

    await publishThread(session, ["Only one"], {}, {
      continuationStatusId: "existing-99",
    });

    const first = createStatusMock.mock.calls[0][2];
    expect(first.visibility).toBe("unlisted");
    expect(first.inReplyToId).toBe("existing-99");
  });
});
