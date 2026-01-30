import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("Schema Reflection E2E", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../fixtures/basic", import.meta.url)),
    browser: false,
  });

  const authHeader = { Authorization: "Bearer valid-token" };

  // Test index.get.ts (List all tables)
  it("GET /api/_schema returns all registered schemas", async () => {
    const data = await $fetch<Record<string, any>>("/api/_schema", {
      headers: authHeader,
    });

    expect(data).toBeDefined();
    expect(Object.keys(data).length).toBeGreaterThan(0);
    // Verify system field protection or existence
    if (data.users) {
      expect(data.users).toHaveProperty("fields");
    }
  });

  // Test [table].get.ts (Single table reflection)
  it("GET /api/_schema/:table returns specific table metadata", async () => {
    const tableName = "users";
    const schema = await $fetch<any>(`/api/_schema/${tableName}`, {
      headers: authHeader,
    });

    expect(schema).toBeDefined();
    expect(schema.resource).toBe(tableName);
    // Validate Agentic-ready structure
    expect(schema.fields).toSatisfy((cols: any[]) =>
      cols.some((c) => c.name === "id"),
    );
  });

  it("GET /api/_schema/:table returns 404 for non-existent table", async () => {
    try {
      await $fetch("/api/_schema/non_existent_table", {
        headers: authHeader,
      });
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }
  });

  it("GET /api/_schema returns 401 when unauthenticated", async () => {
    try {
      await $fetch("/api/_schema");
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });
});
