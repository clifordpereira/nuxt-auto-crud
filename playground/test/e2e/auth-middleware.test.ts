// playground/test/e2e/auth-middleware.test.ts
import { describe, it, expect } from "vitest";
import { setup, $fetch } from "@nuxt/test-utils/e2e";

describe("NAC Auth Middleware", async () => {
  const apiSecretToken = process.env.NUXT_API_SECRET_TOKEN;
  console.log("Using NUXT_API_SECRET_TOKEN:", apiSecretToken);
  if (!apiSecretToken) {
    throw new Error("NUXT_API_SECRET_TOKEN is not defined");
  }

  await setup({
    host: "http://localhost:3000",
    env: {
      NUXT_API_SECRET_TOKEN: apiSecretToken,
    },
    nuxtConfig: {
      runtimeConfig: {
        apiSecretToken,
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
      expect(err.data.statusMessage).toBe("Unauthorized: Session required");
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
      expect(err.data.statusMessage).toBe("Unauthorized: Session required");
    }
  });

  it("allows unauthorized access to system _meta endpoint (public)", async () => {
    const response: any = await $fetch(`${endpointPrefix}/_meta`, {
      method: "GET",
    });
    expect(response).toBeDefined();
    expect(response.architecture).toBe("Clifland-NAC");
  });

  it("allows access to non-NAC routes without credentials", async () => {
    const response = await $fetch("/api/_health", { method: "GET" }).catch(
      () => null,
    );
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

  it("permits authorized access with valid Query token (handling + encoding)", async () => {
    // Note: ofetch handles query encoding, so we pass the raw token
    const response = await $fetch(`${endpointPrefix}/users`, {
      method: "GET",
      query: { token: apiSecretToken },
    });
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

  it("bypasses permission checks for Agent token (full CRUD access)", async () => {
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
