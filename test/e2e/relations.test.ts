import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("API: _relations", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../fixtures/basic", import.meta.url)),
  });

  it("rejects unauthenticated requests", async () => {
    try {
      await $fetch("/api/_relations");
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });

  it("returns relations for authenticated users", async () => {
    const response = await $fetch<any>("/api/_relations", {
      headers: {
        Authorization: "Bearer valid-token",
      },
    });

    expect(response).toBeDefined();
    expect(typeof response).toBe("object");
    expect(response).not.toBeNull();
  });
});
