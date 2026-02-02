import { describe, it, expect, vi, afterEach } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { useNacRelationDisplay } from "../../src/runtime/composables/useNacRelationDisplay";
import { createError } from "h3";
import { clearNuxtData } from "#app";

describe("useNacRelationDisplay", () => {
  const schema = {
    resource: "posts",
    fields: [
      { name: "authorId", type: "integer" },
      { name: "title", type: "string" },
    ],
  };

  afterEach(() => {
    clearNuxtData();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches relations and populates display values", async () => {
    registerEndpoint("/api/_relations", () => ({
      posts: {
        authorId: "users",
      },
    }));

    registerEndpoint("/api/users", () => [
      { id: 1, username: "alice" },
      { id: 2, username: "bob" },
    ]);

    let composableResult: any;

    await mountSuspended({
      setup() {
        composableResult = useNacRelationDisplay(schema);
        return () => {};
      },
    });

    const { fetchRelations, getDisplayValue, relationsMap } =
      composableResult;

    await fetchRelations();

    expect(relationsMap.value).toEqual({
      posts: {
        authorId: "users",
      },
    });

    expect(getDisplayValue("authorId", 1)).toBe("alice");
    expect(getDisplayValue("authorId", 2)).toBe("bob");
    expect(getDisplayValue("authorId", 3)).toBe(3);
    expect(getDisplayValue("title", "Some Title")).toBe("Some Title");
  });

  it("handles missing relations gracefully", async () => {
    registerEndpoint("/api/_relations", () => ({
      posts: {
        categoryId: "categories",
      },
    }));

    registerEndpoint("/api/categories", () => {
      throw createError({ statusCode: 500, statusMessage: "Internal Error" });
    });

    let composableResult: any;
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await mountSuspended({
      setup() {
        composableResult = useNacRelationDisplay(schema);
        return () => {};
      },
    });

    const { fetchRelations, getDisplayValue } = composableResult;

    await fetchRelations();

    // When relation fetch fails, getDisplayValue should return the raw value
    expect(getDisplayValue("categoryId", 5)).toBe(5);
    consoleSpy.mockRestore();
  });

  it("falls back to ID string if no standard display keys exist", async () => {
    registerEndpoint("/api/_relations", () => ({ posts: { authorId: "users" } }));
    registerEndpoint("/api/users", () => [{ id: 99 }]); // No name/title/username

    let result: any;
    await mountSuspended({ setup() { result = useNacRelationDisplay(schema); return () => {} } });
    
    await result.fetchRelations();
    expect(result.getDisplayValue("authorId", 99)).toBe("#99");
  });

  it("handles non-existent resource in relations map", async () => {
    registerEndpoint("/api/_relations", () => ({ non_existent: {} }));
    
    let result: any;
    await mountSuspended({ setup() { result = useNacRelationDisplay(schema); return () => {} } });
    
    await expect(result.fetchRelations()).resolves.not.toThrow();
    expect(result.getDisplayValue("authorId", 1)).toBe(1);
  });

  it("respects custom headers for SSR/Auth parity", async () => {
    let capturedHeaders: Record<string, string> = {};
    
    registerEndpoint("/api/_relations", () => ({ posts: { authorId: "users" } }));
    registerEndpoint("/api/users", (req) => {
      capturedHeaders = Object.fromEntries(req.headers.entries());
      return [{ id: 1, name: "Admin" }];
    });

    let res: any;
    await mountSuspended({ setup() { res = useNacRelationDisplay(schema); return () => {} } });
    await res.fetchRelations();

    expect(capturedHeaders).toHaveProperty("host", "localhost");
  });

  it("handles multiple relation fields for the same resource", async () => {
    registerEndpoint("/api/_relations", () => ({
      posts: { authorId: "users", categoryId: "tags" },
    }));
    registerEndpoint("/api/users", () => [{ id: 1, username: "cliford" }]);
    registerEndpoint("/api/tags", () => [{ id: 10, name: "typescript" }]);

    let res: any;
    await mountSuspended({ setup() { res = useNacRelationDisplay(schema); return () => {} } });
    
    await res.fetchRelations();

    expect(res.getDisplayValue("authorId", 1)).toBe("cliford");
    expect(res.getDisplayValue("categoryId", 10)).toBe("typescript");
  });

  it("overwrites existing display values on subsequent fetches", async () => {
    let res: any;
    await mountSuspended({ setup() { res = useNacRelationDisplay(schema); return () => {} } });

    // First fetch
    registerEndpoint("/api/_relations", () => ({ posts: { authorId: "users" } }));
    registerEndpoint("/api/users", () => [{ id: 1, username: "v1" }]);
    await res.fetchRelations();
    expect(res.getDisplayValue("authorId", 1)).toBe("v1");

    // Second fetch (Simulating data update)
    registerEndpoint("/api/users", () => [{ id: 1, username: "v2" }]);
    await res.fetchRelations();
    expect(res.getDisplayValue("authorId", 1)).toBe("v2");
  });

  it("supports string-based keys for relations", async () => {
    registerEndpoint("/api/_relations", () => ({ posts: { typeId: "types" } }));
    registerEndpoint("/api/types", () => [{ id: "slug-1", name: "Article" }]);

    let res: any;
    await mountSuspended({ setup() { res = useNacRelationDisplay(schema); return () => {} } });
    
    await res.fetchRelations();

    expect(res.getDisplayValue("typeId", "slug-1")).toBe("Article");
  });

  it("handles null or undefined values safely", async () => {
    let res: any;
    await mountSuspended({ setup() { res = useNacRelationDisplay(schema); return () => {} } });
    
    // Should return the input directly without error
    expect(res.getDisplayValue("authorId", null)).toBe(null);
    expect(res.getDisplayValue("authorId", undefined)).toBe(undefined);
  });

  it("handles empty API responses without breaking map", async () => {
    registerEndpoint("/api/_relations", () => ({ posts: { authorId: "users" } }));
    registerEndpoint("/api/users", () => []); // Empty table

    let res: any;
    await mountSuspended({ setup() { res = useNacRelationDisplay(schema); return () => {} } });
    
    await res.fetchRelations();
    expect(res.getDisplayValue("authorId", 1)).toBe(1); // Fallback to raw ID
  });
});
