import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkOwnership,
  resolveAuthContext,
  guardEventAccess,
} from "../../server/utils/auth";
import { db } from "hub:db";
import { eq, getTableColumns as getDrizzleTableColumns } from "drizzle-orm";
import { getHeader, getQuery, readBody } from "h3";
import {
  useAutoCrudConfig,
  useRuntimeConfig,
  getUserSession,
  requireUserSession,
  getTableForModel,
  getHiddenFields,
  allows,
  getTableColumns,
} from "#imports";
import { canAccess } from "../../shared/utils/abilities";

const mockUser = { id: "user_123", permissions: { posts: ["update_own"] } };
const mockEvent = {
  path: "/api/_nac/posts/1",
  method: "GET",
} as any;

describe("server/utils/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getUserSession).mockResolvedValue({ user: mockUser });
    vi.mocked(requireUserSession).mockResolvedValue({ user: mockUser });
    vi.mocked(allows).mockResolvedValue(false);
    vi.mocked(getTableForModel).mockReturnValue("posts_table");
    vi.mocked(getTableColumns).mockReturnValue(["id", "title", "userId"]);
  });

  describe("resolveAuthContext", () => {
    it("should resolve agent via Bearer token", async () => {
      vi.mocked(getHeader).mockReturnValue("Bearer test_secret");
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({
        user: null,
        isAgent: true,
        token: "test_secret",
      });
      expect(getUserSession).not.toHaveBeenCalled();
    });

    it("should resolve agent via query token", async () => {
      vi.mocked(getQuery).mockReturnValue({ token: "test_secret" });
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({
        user: null,
        isAgent: true,
        token: "test_secret",
      });
      expect(getUserSession).not.toHaveBeenCalled();
    });

    it("should return agent context when authentication is disabled", async () => {
      vi.mocked(useAutoCrudConfig).mockReturnValue({
        auth: { authentication: false },
      });
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({ user: null, isAgent: true, token: null });
      expect(getUserSession).not.toHaveBeenCalled();
    });

    it("should resolve user from session", async () => {
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({ user: mockUser, isAgent: false, token: null });
      expect(getUserSession).toHaveBeenCalled();
    });

    it("should return null user if session is not found", async () => {
      vi.mocked(getUserSession).mockResolvedValue(null);
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({ user: null, isAgent: false, token: null });
    });

    it("should return null user if getUserSession throws", async () => {
      vi.mocked(getUserSession).mockRejectedValue(new Error("Session error"));
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({ user: null, isAgent: false, token: null });
    });
  });

  describe("guardEventAccess", () => {
    it("should allow agent access", async () => {
      vi.mocked(getHeader).mockReturnValue("Bearer test_secret");
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(requireUserSession).not.toHaveBeenCalled();
      expect(allows).not.toHaveBeenCalled();
    });

    it("should allow access if authentication is disabled", async () => {
      vi.mocked(useAutoCrudConfig).mockReturnValue({
        auth: { authentication: false },
      });
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(requireUserSession).not.toHaveBeenCalled();
    });

    it("should require session if user is not authenticated", async () => {
      vi.mocked(getUserSession).mockResolvedValue(null);
      await guardEventAccess(mockEvent);
      expect(requireUserSession).toHaveBeenCalled();
    });

    it("should allow access if authorization is disabled", async () => {
      vi.mocked(useAutoCrudConfig).mockReturnValue({
        auth: { authentication: true, authorization: false },
      });
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(allows).not.toHaveBeenCalled();
    });

    it("should allow access to system endpoints (prefixed with _)", async () => {
      const systemEvent = { ...mockEvent, path: "/api/_nac/_meta" };
      await expect(guardEventAccess(systemEvent)).resolves.toBeUndefined();
      expect(allows).not.toHaveBeenCalled();
    });

    it("should allow access if `allows` returns true", async () => {
      vi.mocked(allows).mockResolvedValue(true);
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(allows).toHaveBeenCalled();
    });

    it("should fall back to ownership check if `allows` is false", async () => {
      vi.mocked(allows).mockResolvedValue(false);
      // Mock checkOwnership to return true
      vi.mocked(db.get).mockResolvedValue({
        owner: "user_123",
      });

      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(allows).toHaveBeenCalled();
      expect(getTableForModel).toHaveBeenCalledWith("posts");
    });

    it("should throw 403 if both `allows` and ownership check fail", async () => {
      vi.mocked(allows).mockResolvedValue(false);
      // Mock checkOwnership to return false
      vi.mocked(db.get).mockResolvedValue({
        owner: "another_user",
      });

      await expect(guardEventAccess(mockEvent)).rejects.toMatchObject({
        statusCode: 403,
        message: "Forbidden",
      });
    });

    it("should correctly parse action and context for POST request", async () => {
      const postEvent = {
        ...mockEvent,
        method: "POST",
        path: "/api/_nac/posts",
      };
      const body = { title: "New Post" };
      vi.mocked(readBody).mockResolvedValue(body);
      vi.mocked(allows).mockResolvedValue(true);

      await guardEventAccess(postEvent);

      expect(allows).toHaveBeenCalledWith(
        postEvent,
        canAccess,
        "posts",
        "create",
        body,
      );
    });

    it("should correctly parse action and context for PATCH request", async () => {
      const patchEvent = {
        ...mockEvent,
        method: "PATCH",
        path: "/api/_nac/posts/1",
      };
      const body = { title: "Updated Post" };
      vi.mocked(readBody).mockResolvedValue(body);
      vi.mocked(allows).mockResolvedValue(true);

      await guardEventAccess(patchEvent);

      expect(allows).toHaveBeenCalledWith(
        patchEvent,
        canAccess,
        "posts",
        "update",
        { id: "1", ...body },
      );
    });
  });

  describe("checkOwnership", () => {
    it("returns true when user.id matches record owner", async () => {
      const user = { id: "user_123", permissions: { posts: ["update_own"] } };
      const context = { id: "post_99" };

      vi.mocked(db.get).mockResolvedValue({
        owner: "user_123",
      });

      const result = await checkOwnership(user, "posts", "update", context);
      expect(result).toBe(true);
      expect(getTableForModel).toHaveBeenCalledWith("posts");
      expect(getDrizzleTableColumns).toHaveBeenCalledWith("posts_table");
    });

    it("fails fast if user lacks _own permission", async () => {
      const user = { id: "user_123", permissions: { posts: ["read"] } };
      const result = await checkOwnership(user, "posts", "update", {
        id: "99",
      });

      expect(result).toBe(false);
      expect(db.select).not.toHaveBeenCalled();
    });

    it("optimizes self-update for users table without DB hit", async () => {
      const user = { id: "5", permissions: { users: ["update_own"] } };
      const context = { id: "5" };

      const result = await checkOwnership(user, "users", "update", context);
      expect(result).toBe(true);
      expect(db.select).not.toHaveBeenCalled();
    });

    it("throws 403 if updating hidden fields", async () => {
      const user = { id: "user_123", permissions: { posts: ["update_own"] } };
      const context = { id: "post_99", secretField: "hack" };

      vi.mocked(getHiddenFields).mockReturnValue(["secretField"]);
      vi.mocked(db.get).mockResolvedValue({
        owner: "user_123",
      });

      await expect(
        checkOwnership(user, "posts", "update", context),
      ).rejects.toMatchObject({
        statusCode: 403,
        message: "Forbidden: Hidden fields",
      });
    });

    it("returns false if ownership column is missing", async () => {
      const user = { id: "user_123", permissions: { posts: ["update_own"] } };
      const context = { id: "post_99" };

      vi.mocked(getTableColumns).mockReturnValue(["id", "title"]); // No userId/ownerId/createdBy

      const result = await checkOwnership(user, "posts", "update", context);
      expect(result).toBe(false);
    });
  });
});
