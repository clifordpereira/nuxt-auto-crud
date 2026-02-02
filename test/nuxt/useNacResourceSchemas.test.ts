import { describe, it, expect, vi, afterEach } from "vitest";
import { mountSuspended, registerEndpoint } from "@nuxt/test-utils/runtime";
import { useNacResourceSchemas } from "../../src/runtime/composables/useNacResourceSchemas";
import { createError } from "h3";
import { clearNuxtData } from "#app";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";

mockNuxtImport("useRuntimeConfig", () => {
  return () => ({
    public: {
      autoCrud: {
        endpointPrefix: "/api/_nac",
      },
    },
  });
});

describe("useNacResourceSchemas", () => {
  afterEach(() => {
    vi.clearAllMocks();
    clearNuxtData();
  });

  const endpointPrefix = `/api/_nac`;

  it("fetches schemas and provides accessors", async () => {
    const mockSchemas = {
      posts: { resource: "posts", fields: [{ name: "title", type: "string" }] },
      users: {
        resource: "users",
        fields: [{ name: "username", type: "string" }],
      },
    };

    registerEndpoint(`${endpointPrefix}/_schema`, {
      method: "GET",
      handler: () => mockSchemas,
    });

    const component = await mountSuspended({
      template: "<div></div>",
      async setup() {
        return await useNacResourceSchemas();
      },
    });

    const vm = component.setupState;

    expect(vm.status.value).toBe("success");
    expect(vm.schemas.value).toEqual(mockSchemas);
    expect(vm.getSchema("posts")).toEqual(mockSchemas.posts);
    expect(vm.getSchema("unknown")).toBeUndefined();
  });

  it("handles fetch errors gracefully", async () => {
    registerEndpoint(`${endpointPrefix}/_schema`, {
      method: "GET",
      handler: () => {
        throw createError({
          statusCode: 500,
          statusMessage: "Internal Server Error",
        });
      },
    });

    const component = await mountSuspended({
      template: "<div></div>",
      async setup() {
        return await useNacResourceSchemas();
      },
    });

    expect(component.setupState.status.value).toBe("error");
    expect(component.setupState.error.value?.statusCode).toBe(500);
  });

  it("triggers refresh and updates data", async () => {
    let count = 0;
    registerEndpoint(`${endpointPrefix}/_schema`, () => {
      count++;
      return { count };
    });

    const component = await mountSuspended({
      template: "<div></div>",
      async setup() {
        return await useNacResourceSchemas();
      },
    });

    expect(component.setupState.schemas.value).toEqual({ count: 1 });

    await component.setupState.refresh();

    expect(component.setupState.schemas.value).toEqual({ count: 2 });
  });

  it("returns undefined for getSchema when schemas are null", async () => {
    registerEndpoint(`${endpointPrefix}/_schema`, {
      method: "GET",
      handler: () => null,
    });

    const component = await mountSuspended({
      template: "<div></div>",
      async setup() {
        return await useNacResourceSchemas();
      },
    });

    expect(component.setupState.getSchema("any")).toBeUndefined();
  });

  it("prevents redundant fetches using useAsyncData key", async () => {
    let callCount = 0;
    registerEndpoint(`${endpointPrefix}/_schema`, () => {
      callCount++;
      return { success: true };
    });

    // Mount first instance
    await mountSuspended({
      template: "<div></div>",
      async setup() {
        await useNacResourceSchemas();
      },
    });
    // Mount second instance
    await mountSuspended({
      template: "<div></div>",
      async setup() {
        await useNacResourceSchemas();
      },
    });

    // useAsyncData should deduplicate based on the 'resource-schemas' key
    expect(callCount).toBe(1);
  });

  it("maintains reactivity in getSchema after refresh", async () => {
    let schemaData = { version: 1 };
    registerEndpoint(`${endpointPrefix}/_schema`, () => schemaData);

    const component = await mountSuspended({
      template: "<div></div>",
      async setup() {
        return await useNacResourceSchemas();
      },
    });

    expect(component.setupState.getSchema("version")).toBe(1);

    schemaData = { version: 2 };
    await component.setupState.refresh();

    expect(component.setupState.getSchema("version")).toBe(2);
  });
});
