import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("NAC CRUD Fixture", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("../fixtures/crud", import.meta.url)),
    browser: false,
  });

  const model = "users";

  // Validate Open Access
  it("allows unauthenticated access to models by default", async () => {
    const list = await $fetch(`/api/${model}`);
    expect(Array.isArray(list)).toBe(true);
  });

  let createdId: any;
  const newUser = {
    email: `test-${Date.now()}@example.com`,
    name: "Test User",
    password: "password123",
  };

  // Tests [model].post.ts
  it(`POST /api/${model} creates a new user`, async () => {
    const created = await $fetch<any>(`/api/${model}`, {
      method: "POST",
      body: newUser,
    });

    expect(created).toBeDefined();
    expect(created.id).toBeDefined();
    expect(created.email).toBe(newUser.email);
    createdId = created.id;
  });

  // Tests [model].get.ts
  it(`GET /api/${model} lists the created user`, async () => {
    const list = await $fetch<any[]>(`/api/${model}`);
    expect(Array.isArray(list)).toBe(true);
    expect(list.find((u) => u.id === createdId)).toBeDefined();
  });

  // Tests [model]/[id].get.ts
  it(`GET /api/${model}/:id retrieves the user`, async () => {
    const item = await $fetch<any>(`/api/${model}/${createdId}`);
    expect(item.id).toBe(createdId);
    expect(item.email).toBe(newUser.email);
  });

  // Tests [model]/[id].patch.ts
  it(`PATCH /api/${model}/:id updates the user`, async () => {
    const updated = await $fetch<any>(`/api/${model}/${createdId}`, {
      method: "PATCH",
      body: { name: "Updated Name" },
    });
    expect(updated.name).toBe("Updated Name");
  });

  it("PATCH /api/${model}/:id ignores protected system fields", async () => {
    const original = await $fetch<any>(`/api/${model}/${createdId}`);

    await $fetch(`/api/${model}/${createdId}`, {
      method: "PATCH",
      body: {
        id: "hacked-id", // Should be ignored
        name: "Hacker",
        createdAt: new Date("2000-01-01"), // Should be ignored
      },
    });

    const verification = await $fetch<any>(`/api/${model}/${createdId}`);
    expect(verification.id).toBe(original.id);
    expect(verification.name).toBe("Hacker");
  });

  it(`GET /api/${model}/:id excludes fields defined in HIDDEN_FIELDS`, async () => {
    const user = await $fetch<any>(`/api/${model}/${createdId}`);

    // 'password' should be in HIDDEN_FIELDS in your NAC constants
    expect(user).not.toHaveProperty("password");
    expect(user).toHaveProperty("email");
  });

  // Tests [model]/[id].delete.ts
  it(`DELETE /api/${model}/:id deletes the user`, async () => {
    await $fetch(`/api/${model}/${createdId}`, {
      method: "DELETE",
    });

    // Verify Deletion
    try {
      await $fetch(`/api/${model}/${createdId}`);
    } catch (err: any) {
      expect(err.statusCode).toBe(404);
    }
  });
});
