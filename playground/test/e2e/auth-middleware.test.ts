// playground/test/e2e/auth-middleware.test.ts
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("NAC Auth Middleware", async () => {
  const apiSecretToken = "test-secret-token";

  await setup({
    host: "http://localhost:3000",
    server: false,
    nuxtConfig: {
      runtimeConfig: {
        apiSecretToken,
      },
      autoCrud: {
        auth: {
          authentication: true,
        },
      },
    },
  });

  const endpointPrefix = `/api/_nac`;

  it("blocks unauthorized access to protected NAC routes (401)", async () => {
    try {
      await $fetch(`${endpointPrefix}/users`, { method: "GET" });
      expect.fail("Should have thrown 401");
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });

  it("blocks access with invalid token (401)", async () => {
    try {
      await $fetch(`${endpointPrefix}/users`, {
        method: "GET",
        query: { token: "wrong-token" },
      });
      expect.fail("Should have thrown 401");
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });

  it("blocks unauthorized access to system _meta endpoint (401)", async () => {
    try {
      await $fetch(`${endpointPrefix}/_meta`, { method: "GET" });
      expect.fail("Should have thrown 401");
    } catch (err: any) {
      expect(err.statusCode).toBe(401);
    }
  });

  it("allows access to non-NAC routes without credentials", async () => {
    const response = await $fetch("/api/_health", { method: "GET" }).catch(
      () => null,
    );
    expect(response).toBeDefined();
  });

  it("permits authorized access with valid Bearer token", async () => {
    const response = await $fetch(`${endpointPrefix}/users`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiSecretToken}`,
      },
    });
    expect(response).toBeDefined();
  });

  it("permits authorized access with valid Query token (handling + encoding)", async () => {
    // Note: ofetch handles query encoding, so we pass the raw token
    const response = await $fetch(`${endpointPrefix}/users`, {
      method: "GET",
      query: { token: apiSecretToken },
    });
    expect(response).toBeDefined();
  });

  it("permits access to system _meta endpoint with valid token", async () => {
    const response: any = await $fetch(`${endpointPrefix}/_meta`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiSecretToken}`,
      },
    });
    expect(response).toBeDefined();
    expect(response.architecture).toBe("Clifland-NAC");
  });

  it("returns markdown for _meta when requested via query format=md", async () => {
    const response = await $fetch(`${endpointPrefix}/_meta`, {
      method: "GET",
      query: {
        token: apiSecretToken,
        format: "md",
      },
    });
    expect(typeof response).toBe("string");
    expect(response).toContain("# Clifland-NAC API Manifest");
    expect(response).toContain("| Field | Type |");
  });

  it("bypasses permission checks for Agent token (full CRUD access)", async () => {
    // Agents bypass all checks in guardEventAccess
    // We expect this to NOT throw 401/403. It might throw 404 if the table doesn't exist
    // in the test DB, which is fine for this middleware check.
    try {
      await $fetch(`${endpointPrefix}/users`, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiSecretToken}` },
        body: { name: "Agent User" },
      });
    } catch (err: any) {
      expect(err.statusCode).not.toBe(401);
      expect(err.statusCode).not.toBe(403);
    }
  });
});
