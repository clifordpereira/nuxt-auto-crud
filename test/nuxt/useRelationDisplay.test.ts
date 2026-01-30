import { describe, it, expect, vi, afterEach } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { useRelationDisplay } from "../../src/runtime/composables/useRelationDisplay";
import { createError } from "h3";

describe("useRelationDisplay", () => {
  const schema = {
    resource: "posts",
    fields: [
      { name: "authorId", type: "integer" },
      { name: "title", type: "string" },
    ],
  };

  afterEach(() => {
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
        composableResult = useRelationDisplay(schema);
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
        composableResult = useRelationDisplay(schema);
        return () => {};
      },
    });

    const { fetchRelations, getDisplayValue } = composableResult;

    await fetchRelations();

    // When relation fetch fails, getDisplayValue should return the raw value
    expect(getDisplayValue("categoryId", 5)).toBe(5);
    consoleSpy.mockRestore();
  });
});
