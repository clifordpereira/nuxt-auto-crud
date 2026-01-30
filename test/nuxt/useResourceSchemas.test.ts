import { describe, it, expect, vi, afterEach } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { useResourceSchemas } from "../../src/runtime/composables/useResourceSchemas";

describe("useResourceSchemas", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("fetches schemas and provides accessors", async () => {
    const mockSchemas = {
      posts: {
        resource: "posts",
        fields: [{ name: "title", type: "string" }],
      },
      users: {
        resource: "users",
        fields: [{ name: "username", type: "string" }],
      },
    };

    registerEndpoint("/api/_schema", () => mockSchemas);

    let composableResult: any;

    await mountSuspended({
      async setup() {
        composableResult = await useResourceSchemas();
        return () => {};
      },
    });

    const { schemas, getSchema, status } = composableResult;

    expect(status.value).toBe("success");
    expect(schemas.value).toEqual(mockSchemas);
    expect(getSchema("posts")).toEqual(mockSchemas.posts);
    expect(getSchema("users")).toEqual(mockSchemas.users);
    expect(getSchema("unknown")).toBeUndefined();
  });
});
