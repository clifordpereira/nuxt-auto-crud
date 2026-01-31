// engine.test.ts
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("NAC Core Engine", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../fixtures/basic", import.meta.url)),
    browser: false,
  });

  // Basic Boot
  it("boots without internal server errors", async () => {
    const html = await $fetch("/");
    expect(html).toBeDefined();
    expect(html).not.toContain("Internal Server Error");
  });

  // Meta & Agentic Manifests
  describe("API: _meta", async () => {
    it("returns valid Clifland-NAC JSON manifest", async () => {
      const data = await $fetch<any>("/api/_meta");

      expect(data.architecture).toBe("Clifland-NAC");
      expect(data.version).toContain("agentic");
      expect(Array.isArray(data.resources)).toBe(true);

      const userResource = data.resources.find(
        (r: any) => r.resource === "users",
      );
      if (userResource) {
        // 1. Verify Protection Logic
        const idField = userResource.fields.find((f: any) => f.name === "id");
        expect(idField.isReadOnly).toBe(true);

        // 2. Verify Visibility Logic (Security)
        const hasPassword = userResource.fields.some(
          (f: any) => f.name === "password",
        );
        expect(hasPassword).toBe(false); // Hidden fields must be omitted entirely

        // 3. Verify Agentic Metadata
        expect(userResource).toHaveProperty("labelField");
        expect(userResource.methods).toContain("POST");
      }
    });

    it("renders Markdown for Agentic Tooling via Accept header", async () => {
      const response = await $fetch<string>("/api/_meta", {
        headers: { Accept: "text/markdown" },
      });

      expect(typeof response).toBe("string");
      expect(response).toContain("# Clifland-NAC API Manifest");
      expect(response).toContain("| Field | Type | Required | Writable |");
      // Ensure hidden fields aren't leaked in Markdown either
      expect(response).not.toContain("| password |");
    });

    it("renders Markdown via query parameter", async () => {
      const response = await $fetch<string>("/api/_meta?format=md");
      expect(response).toContain("### Resource:");
    });
  });

  describe("API: _relations", async () => {
    it("returns a valid relation map for Agentic pathfinding", async () => {
      const response = await $fetch<Record<string, any>>("/api/_relations");

      expect(response).toBeDefined();
      expect(typeof response).toBe("object");

      // Verify expected structure (Assuming 'posts' and 'users' exist in fixture)
      // Adjust keys based on your actual fixture schemas
      const tables = Object.keys(response);
      expect(tables.length).toBeGreaterThan(0);

      // Check for standard NAC relation structure
      for (const table of tables) {
        const relations = response[table];
        expect(Array.isArray(relations)).toBe(true);

        if (relations.length > 0) {
          const rel = relations[0];
          expect(rel).toHaveProperty("name");
          expect(rel).toHaveProperty("type"); // e.g., 'one' or 'many'
          expect(rel).toHaveProperty("target"); // the related table
        }
      }
    });

    it("identifies foreign key constraints accurately", async () => {
      const response = await $fetch<any>("/api/_relations");

      // Example: If a 'post' belongs to a 'user'
      if (response.posts) {
        const userRel = response.posts.find((r: any) => r.target === "users");
        expect(userRel).toBeDefined();
        expect(["one", "many"]).toContain(userRel.type);
      }
    });
  });

  // Schema Reflection
  describe("Schema Reflection E2E", async () => {
    it("GET /api/_schema returns all registered schemas", async () => {
      const data = await $fetch<Record<string, any>>("/api/_schema");

      expect(data).toBeDefined();
      expect(Object.keys(data).length).toBeGreaterThan(0);

      expect(data).toHaveProperty("users");
      expect(data.users).toHaveProperty("fields");
    });

    it("GET /api/_schema/:table returns 404 for non-existent table", async () => {
      try {
        await $fetch("/api/_schema/non_existent_table");
        expect.fail("Should have thrown 404");
      } catch (e: any) {
        expect(e.response?.status).toBe(404);
      }
    });

    it("GET /api/_schema/:table returns specific table metadata", async () => {
      const tableName = "users";
      const schema = await $fetch<any>(`/api/_schema/${tableName}`);

      expect(schema).toBeDefined();

      // Standardize fields to an array regardless of NAC's internal reflection format
      const fields = Array.isArray(schema.fields)
        ? schema.fields
        : Object.entries(schema.fields).map(
            ([name, config]: [string, any]) => ({
              name,
              ...config,
            }),
          );

      const hasId = fields.some(
        (f: any) => f.name === "id" || f.dbName === "id",
      );
      expect(hasId).toBe(true);
    });
  });

  describe("NAC SSE Feature", async () => {
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
});
