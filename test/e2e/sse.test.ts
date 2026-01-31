import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("NAC SSE Feature", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../fixtures/basic", import.meta.url)),
  });

  it("establishes SSE connection and receives a heartbeat", async () => {
    let response: any;
    const stream = await $fetch<ReadableStream>("/api/sse", {
      responseType: "stream",
      onResponse(ctx) {
        response = ctx.response;
      },
    });

    // 1. Protocol Validation
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(response.headers.get("x-accel-buffering")).toBe("no");

    // 2. Data Validation (Heartbeat)
    const reader = stream.getReader();
    const { value } = await reader.read();
    const decoded = new TextDecoder().decode(value);

    // Expecting either a ping or a stored signal
    expect(decoded).toMatch(/event:|data:|: ping/);

    // 3. Cleanup
    await reader.cancel();
  });
});