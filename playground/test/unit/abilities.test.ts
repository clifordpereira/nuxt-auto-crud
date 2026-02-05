// playground/shared/utils/abilities.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  hasPermission,
  hasOwnershipPermission,
} from "../../shared/utils/auth-logic";

// 1. Mock the module
vi.mock("../../shared/utils/auth-logic", () => ({
  hasPermission: vi.fn(),
  hasOwnershipPermission: vi.fn(),
}));

vi.mock("nuxt-authorization/utils", () => ({
  defineAbility: (fn: any) => fn,
}));

describe("NAC Abilities: abilityLogic", () => {
  let abilityLogic: any;
  const mockFetch = vi.fn();

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    vi.resetModules();
    vi.stubGlobal("$fetch", mockFetch);

    const mod = await import("../../shared/utils/abilities");
    abilityLogic = mod.abilityLogic;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  describe("Static Role Priority", () => {
    it("grants full access to admin regardless of permissions", async () => {
      const result = await abilityLogic({ role: "admin" }, "posts", "delete");
      expect(result).toBe(true);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("User Permission Checks", () => {
    it("returns true if user has explicit permission", async () => {
      vi.mocked(hasPermission).mockReturnValue(true);
      const user = { role: "user", id: 1 };

      const result = await abilityLogic(user, "posts", "update");
      expect(result).toBe(true);
      expect(hasPermission).toHaveBeenCalledWith(user, "posts", "update");
    });

    it("returns true if user has ownership permission", async () => {
      vi.mocked(hasPermission).mockReturnValue(false);
      vi.mocked(hasOwnershipPermission).mockReturnValue(true);

      const result = await abilityLogic({ role: "user" }, "posts", "delete");
      expect(result).toBe(true);
    });
  });

  describe("Public Permissions & Cache Management", () => {
    it("fetches and caches public permissions for guests", async () => {
      mockFetch.mockResolvedValue({ posts: ["read"] });

      const firstCall = await abilityLogic(null, "posts", "read");
      const secondCall = await abilityLogic(null, "posts", "read");

      expect(firstCall).toBe(true);
      expect(secondCall).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1); // Verified caching
    });

    it("prevents multiple concurrent fetches (Race Condition)", async () => {
      let resolveFetch: any;
      mockFetch.mockReturnValue(
        new Promise((res) => {
          resolveFetch = res;
        }),
      );

      // Fire two requests while first is still pending
      const req1 = abilityLogic(null, "posts", "read");
      const req2 = abilityLogic(null, "posts", "read");

      resolveFetch({ posts: ["read"] });
      const [res1, res2] = await Promise.all([req1, req2]);

      expect(res1).toBe(true);
      expect(res2).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("refetches data after TTL expires", async () => {
      mockFetch.mockResolvedValue({ posts: ["read"] });

      await abilityLogic(null, "posts", "read");

      // Advance 61 seconds (TTL is 60000ms)
      vi.advanceTimersByTime(61000);

      await abilityLogic(null, "posts", "read");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("recovers from fetch failures gracefully", async () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      mockFetch.mockRejectedValueOnce(new Error("Network Failure"));

      const result = await abilityLogic(null, "posts", "read");

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Public permissions fetch failed"),
        expect.any(Error),
      );

      // Next call should retry because cache is empty
      mockFetch.mockResolvedValue({ posts: ["read"] });
      expect(await abilityLogic(null, "posts", "read")).toBe(true);

      consoleSpy.mockRestore();
    });
  });
});
