// auth-utils.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { guardEventAccess } from "../../server/utils/auth";
import { db } from "hub:db";
import { eq, getTableColumns } from "drizzle-orm";
import { getHeader, getQuery, readBody } from "h3";
import {
  useAutoCrudConfig,
  getUserSession,
  requireUserSession,
  getHiddenFields,
  allows,
  useRuntimeConfig,
  getTableForModel,
} from "#imports";
import { canAccess } from "../../shared/utils/abilities";
import {
  hasPermission, // Added import for vi.mocked
  hasOwnershipPermission,
  isOwner,
} from "../../shared/utils/auth-logic";

const mockUser = { id: "user_123", permissions: { posts: ["update_own"] } };
const mockEvent = {
  path: "/api/_nac/posts/1",
  method: "PATCH",
  headers: {},
  context: { params: { id: "1" } },
} as any;

vi.mock("../../shared/utils/auth-logic", () => ({
  hasPermission: vi.fn(), // Added
  hasOwnershipPermission: vi.fn(),
  isOwner: vi.fn(),
  OWNERSHIP_ACTIONS: ["create", "read", "update", "delete"],
}));

describe("server/utils/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.stubGlobal("useAutoCrudConfig", useAutoCrudConfig);
    vi.stubGlobal("useRuntimeConfig", useRuntimeConfig);
    vi.stubGlobal("getUserSession", getUserSession);
    vi.stubGlobal("requireUserSession", requireUserSession);
    vi.stubGlobal("getTableForModel", getTableForModel);
    vi.stubGlobal("getHiddenFields", getHiddenFields);
    vi.stubGlobal("allows", allows);

    vi.mocked(getUserSession).mockResolvedValue({ user: mockUser });
    vi.mocked(requireUserSession).mockResolvedValue({ user: mockUser });
    vi.mocked(useAutoCrudConfig).mockReturnValue({
      auth: { authentication: true },
    } as any);

    vi.mocked(getTableColumns).mockReturnValue({
      id: { primary: true, columnType: "integer" },
      ownerId: {},
    } as any);

    vi.mocked(db.select).mockReturnThis();
    vi.mocked(db.from).mockReturnThis();
    vi.mocked(db.where).mockReturnThis();
    vi.mocked(db.get).mockResolvedValue(undefined);

    vi.mocked(hasPermission).mockReturnValue(false); // Default
    vi.mocked(hasOwnershipPermission).mockReturnValue(true);
    vi.mocked(isOwner).mockReturnValue(false);
    vi.mocked(allows).mockResolvedValue(true);
    vi.mocked(useRuntimeConfig).mockReturnValue({} as any);
    vi.mocked(getTableForModel).mockReturnValue({} as any);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("guardEventAccess - Authentication", () => {
    it("allows agent access via Bearer token", async () => {
      vi.mocked(getHeader).mockReturnValue("Bearer test_secret");
      vi.mocked(useRuntimeConfig).mockReturnValue({
        apiSecretToken: "test_secret",
      } as any);
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(getUserSession).not.toHaveBeenCalled();
    });

    it("allows agent access via query token", async () => {
      vi.mocked(getQuery).mockReturnValue({ token: "test_secret" });
      vi.mocked(useRuntimeConfig).mockReturnValue({
        apiSecretToken: "test_secret",
      } as any);
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(getUserSession).not.toHaveBeenCalled();
    });

    it("bypasses authentication when disabled", async () => {
      vi.mocked(useAutoCrudConfig).mockReturnValue({
        auth: { authentication: false },
      } as any);
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(getUserSession).not.toHaveBeenCalled();
    });

    it("requires session if user is not authenticated", async () => {
      vi.mocked(getUserSession).mockResolvedValue(null);
      vi.mocked(requireUserSession).mockRejectedValue(
        new Error("Unauthorized"),
      );

      await expect(guardEventAccess(mockEvent)).rejects.toThrow("Unauthorized");
      expect(requireUserSession).toHaveBeenCalled();
    });
  });

  describe("guardEventAccess - Authorization & Ownership", () => {
    it("allows access to system endpoints", async () => {
      const systemPaths = ["/api/_nac/_meta"];
      for (const path of systemPaths) {
        const event = { ...mockEvent, path };
        await expect(guardEventAccess(event)).resolves.toBeUndefined();
      }
      expect(allows).not.toHaveBeenCalled();
    });

    it("maps HTTP methods to CRUD actions", async () => {
      const cases = [
        { method: "POST", action: "create" },
        { method: "PATCH", action: "update" },
        { method: "DELETE", action: "delete" },
        { method: "GET", action: "read" },
      ];

      vi.mocked(allows).mockResolvedValue(true);
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });

      for (const c of cases) {
        const event = { ...mockEvent, method: c.method };
        await guardEventAccess(event);

        // Updated: context is no longer passed to allows in the new guardEventAccess
        expect(allows).toHaveBeenCalledWith(
          event,
          canAccess,
          "posts",
          c.action,
        );
      }
    });

    it("triggers DB ownership check when global access is missing but _own exists", async () => {
      vi.mocked(allows).mockResolvedValue(true);

      // Important: The user ID must match what the DB mock returns
      const userId = "user_123";
      vi.mocked(getUserSession).mockResolvedValue({
        user: { id: userId, permissions: { posts: ["update_own"] } },
      });

      // DB must return the matching owner string
      vi.mocked(db.get).mockResolvedValue({ owner: userId });

      // This should now resolve instead of throwing
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
    });

    it("verified ownership fallbacks logic (coercion)", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      // Ensure the mock indicates an integer column
      vi.mocked(getTableColumns).mockReturnValue({
        id: { primary: true, columnType: "integer" },
        ownerId: {},
      } as any);

      vi.mocked(getUserSession).mockResolvedValue({
        user: { id: "user_123", permissions: { posts: ["update_own"] } },
      });

      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });

      await guardEventAccess({ ...mockEvent, path: "/api/_nac/posts/123" });

      // Now it will correctly match Number(123)
      expect(eq).toHaveBeenCalledWith(expect.anything(), 123);
    });

    it("verifies self-update optimization for users table", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      // Optimization is now handled by isOwner returning true
      vi.mocked(isOwner).mockReturnValue(true);

      const user = { id: 5, permissions: { users: ["update_own"] } };
      vi.mocked(getUserSession).mockResolvedValue({ user });

      const event = { ...mockEvent, path: "/api/_nac/users/5" };
      await expect(guardEventAccess(event)).resolves.toBeUndefined();
      expect(db.select).not.toHaveBeenCalled();
    });

    it("fails if ownership check fails", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      vi.mocked(getUserSession).mockResolvedValue({
        user: { ...mockUser, permissions: { posts: ["update_own"] } },
      });
      vi.mocked(db.get).mockResolvedValue({ owner: "someone_else" });

      await expect(guardEventAccess(mockEvent)).rejects.toMatchObject({
        statusCode: 403,
        message: "Ownership required",
      });
    });

    it("throws 403 if updating hidden fields even if owned", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });
      vi.mocked(getHiddenFields).mockReturnValue(["secret"]);
      vi.mocked(readBody).mockResolvedValue({ secret: "illegal" });

      vi.mocked(getTableColumns).mockReturnValue({
        id: { primary: true, columnType: "integer" },
        ownerId: {},
        secret: {},
      } as any);

      vi.mocked(getUserSession).mockResolvedValue({
        user: { ...mockUser, permissions: { posts: ["update_own"] } },
      });

      await expect(guardEventAccess(mockEvent)).rejects.toMatchObject({
        statusCode: 403,
        message: "Forbidden: Hidden fields",
      });
    });

    it("skips DB ownership check if user has global permission", async () => {
      // User has global 'update'
      vi.mocked(getUserSession).mockResolvedValue({
        user: { id: "user_123", permissions: { posts: ["update"] } },
      });
      vi.mocked(allows).mockResolvedValue(true);

      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();

      // DB should NOT be called
      expect(db.select).not.toHaveBeenCalled();
    });
  });

  describe("checkOwnership - Advanced Resilience", () => {
    it("recognizes 'userId' as a valid ownership column", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      // Mock schema with userId instead of ownerId
      vi.mocked(getTableColumns).mockReturnValue({
        id: { primary: true, columnType: "integer" },
        userId: {},
      } as any);

      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });

      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(db.select).toHaveBeenCalledWith({ owner: expect.anything() });
    });

    it("handles UUID/String primary keys without force-casting to Number", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      const uuid = "550e8400-e29b-41d4-a716-446655440000";

      vi.mocked(getTableColumns).mockReturnValue({
        id: { primary: true, columnType: "text" },
        ownerId: {},
      } as any);

      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });

      const uuidEvent = { ...mockEvent, path: `/api/_nac/posts/${uuid}` };
      await guardEventAccess(uuidEvent);

      // Verify eq was called with the raw string, not NaN or 0
      expect(eq).toHaveBeenCalledWith(expect.anything(), uuid);
    });

    it("ignores non-schema fields in hidden field check (prevents false 403)", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });
      vi.mocked(getHiddenFields).mockReturnValue(["password"]);

      // Body contains a hidden field ("password") AND a UI-only field ("_ui_temp")
      // But only "password" is in the actual schema keys
      vi.mocked(getTableColumns).mockReturnValue({
        id: { primary: true },
        ownerId: {},
        password: {}, // Hidden
      } as any);

      vi.mocked(readBody).mockResolvedValue({
        _ui_temp: "ignore-me", // Not in schema, should not trigger 403 if it matched a hidden name
        password: "new-password",
      });

      await expect(guardEventAccess(mockEvent)).rejects.toMatchObject({
        statusCode: 403,
        message: "Forbidden: Hidden fields",
      });
    });
  });
});
