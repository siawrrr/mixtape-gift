import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("cassette repository", () => {
  it("requires authentication to save a cassette", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.cassettes.create({
      id: "preview-cassette",
      title: "A little test tape",
      recipient: "Maya",
      sender: "Me",
      letter: "hello",
      body: { id: "skin-01" },
      songs: [],
      decorations: [],
      effects: [],
      background: "desk",
    })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("rejects malformed public share tokens before querying the database", async () => {
    const caller = appRouter.createCaller(publicContext());
    await expect(caller.cassettes.byShareToken({ shareToken: "short" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
