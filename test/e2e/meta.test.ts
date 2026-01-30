import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("API: _meta", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../fixtures/basic", import.meta.url)),
    browser: false, // API only test
  });

  const authHeader = { Authorization: "Bearer valid-token" };

  it("rejects unauthenticated requests", async () => {
    try {
      await $fetch("/api/_meta");
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });

  it("returns valid Clifland-NAC JSON manifest", async () => {
    const data = await $fetch<any>("/api/_meta", {
      headers: authHeader,
    });

    expect(data.architecture).toBe("Clifland-NAC");
    expect(data.version).toContain("agentic");
    expect(Array.isArray(data.resources)).toBe(true);

    if (data.resources.length > 0) {
      const resource = data.resources[0];
      expect(resource).toHaveProperty("endpoint");
      expect(resource).toHaveProperty("fields");
      // Ensure PROTECTED_FIELDS are marked read-only
      const idField = resource.fields.find((f: any) => f.name === "id");
      if (idField) expect(idField.isReadOnly).toBe(true);
    }
  });

  it("renders Markdown for Agentic Tooling via Accept header", async () => {
    const response = await $fetch<string>("/api/_meta", {
      headers: {
        ...authHeader,
        Accept: "text/markdown",
      },
    });

    expect(typeof response).toBe("string");
    expect(response).toContain("# Clifland-NAC API Manifest");
    expect(response).toContain("| Field | Type | Required |");
  });

  it("renders Markdown via query parameter", async () => {
    const response = await $fetch<string>("/api/_meta?format=md", {
      headers: authHeader,
    });

    expect(response).toContain("### Resource:");
    expect(response).toContain("?token=valid-token"); // Verify token suffix logic
  });
});
