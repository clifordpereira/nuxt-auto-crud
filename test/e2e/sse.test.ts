import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("NAC SSE Feature", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../fixtures/basic", import.meta.url)),
  });

  it("establishes SSE connection with correct headers", async () => {
    let response: any;
    const stream = await $fetch<any>("/api/sse", {
      responseType: "stream",
      onResponse(ctx) {
        response = ctx.response;
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.headers.get("cache-control")).toContain("no-cache");
    expect(response.headers.get("connection")).toBe("keep-alive");
    expect(response.headers.get("x-accel-buffering")).toBe("no");

    // Close stream to avoid hanging
    if (stream && typeof stream.destroy === "function") {
      stream.destroy();
    } else if (stream && typeof stream.cancel === "function") {
      await stream.cancel();
    }
  });
});
