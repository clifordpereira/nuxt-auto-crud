import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  checkOwnership,
  resolveAuthContext,
  guardEventAccess,
} from "../../server/utils/auth";
import { db } from "hub:db";
import { eq, getTableColumns, getTableName } from "drizzle-orm";
import { getHeader, getQuery } from "h3";
import {
  useAutoCrudConfig,
  useRuntimeConfig,
  getUserSession,
  requireUserSession,
  getTableForModel,
  getHiddenFields,
  allows,
} from "#imports";
import { canAccess } from "../../shared/utils/abilities";

const mockUser = { id: "user_123", permissions: { posts: ["update_own"] } };
const mockEvent = {
  path: "/api/_nac/posts/1",
  method: "GET",
  headers: {},
  context: { params: { id: "1" } },
} as any;

describe("server/utils/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Mock Implementations
    vi.mocked(getHeader).mockReturnValue(undefined);
    vi.mocked(getQuery).mockReturnValue({});
    vi.mocked(getUserSession).mockResolvedValue({ user: mockUser });
    vi.mocked(requireUserSession).mockResolvedValue({ user: mockUser });
    vi.mocked(allows).mockResolvedValue(false);
    vi.mocked(getTableForModel).mockReturnValue("posts_table" as any);
    vi.mocked(getTableName).mockReturnValue("posts");
    vi.mocked(getHiddenFields).mockReturnValue([]);
    vi.mocked(useRuntimeConfig).mockReturnValue({ apiSecretToken: "test_secret" } as any);
    vi.mocked(useAutoCrudConfig).mockReturnValue({
      endpointPrefix: '/api/_nac',
      auth: { authentication: true, authorization: true }
    } as any);

    // Drizzle Schema Mock
    vi.mocked(getTableColumns).mockReturnValue({
      id: { primary: true },
      ownerId: {},
    } as any);
    
    // Reset DB fluent mocks
    vi.mocked(db.select).mockReturnThis();
    vi.mocked(db.from).mockReturnThis();
    vi.mocked(db.where).mockReturnThis();
    vi.mocked(db.get).mockResolvedValue(undefined);
  });

  describe("resolveAuthContext", () => {
    it("resolves agent via Bearer token", async () => {
      vi.mocked(getHeader).mockReturnValue("Bearer test_secret");
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({
        user: null,
        isAgent: true,
        token: "test_secret",
      });
    });

    it("resolves agent via query token", async () => {
      vi.mocked(getQuery).mockReturnValue({ token: "test_secret" });
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({
        user: null,
        isAgent: true,
        token: "test_secret",
      });
    });

    it("returns agent context when authentication is disabled", async () => {
      vi.mocked(useAutoCrudConfig).mockReturnValue({
        auth: { authentication: false },
      } as any);
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({ user: null, isAgent: false, token: null });
    });

    it("resolves user from session", async () => {
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({ user: mockUser, isAgent: false, token: null });
      expect(getUserSession).toHaveBeenCalled();
    });

    it("handles session retrieval failure", async () => {
      vi.mocked(getUserSession).mockRejectedValue(new Error("Session error"));
      const context = await resolveAuthContext(mockEvent);
      expect(context).toEqual({ user: null, isAgent: false, token: null });
    });
  });

  describe("guardEventAccess", () => {
    it("allows agent access (bypass)", async () => {
      vi.mocked(getHeader).mockReturnValue("Bearer test_secret");
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(requireUserSession).not.toHaveBeenCalled();
    });

    it("allows access if authentication is disabled", async () => {
      vi.mocked(useAutoCrudConfig).mockReturnValue({
        auth: { authentication: false },
      } as any);
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
    });

    it("requires session if user is not authenticated", async () => {
      vi.mocked(getUserSession).mockResolvedValue(null);
      vi.mocked(requireUserSession).mockRejectedValue(new Error("Unauthorized"));
      
      await expect(guardEventAccess(mockEvent)).rejects.toThrow("Unauthorized");
      expect(requireUserSession).toHaveBeenCalled();
    });

    it("allows access to system endpoints (_meta, sse, etc)", async () => {
      const systemPaths = ["/api/_nac/_meta", "/api/_nac/sse", "/api/_nac/"];
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
        { method: "PUT", action: "update" },
        { method: "DELETE", action: "delete" },
        { method: "GET", action: "read" },
      ];

      vi.mocked(allows).mockResolvedValue(true);

      for (const c of cases) {
        const event = { ...mockEvent, method: c.method };
        await guardEventAccess(event);
        expect(allows).toHaveBeenCalledWith(
          event,
          canAccess,
          "posts",
          c.action,
          expect.any(Object)
        );
      }
    });

    it("falls back to ownership check if authorization fails", async () => {
      // Ensure user has read_own permission for the GET request
      vi.mocked(getUserSession).mockResolvedValue({ 
        user: { ...mockUser, permissions: { posts: ["read_own"] } } 
      });

      // Setup: Fail initial RBAC check
      vi.mocked(allows).mockResolvedValue(false);
      
      // Setup: DB returns a record owned by the mock user
      // Note: checkOwnership selects columns AS 'owner'
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });

      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(db.select).toHaveBeenCalled();
    });

    it("throws 403 if both authorization and ownership fail", async () => {
      vi.mocked(allows).mockResolvedValue(false);
      vi.mocked(db.get).mockResolvedValue({ owner: "someone_else" });

      await expect(guardEventAccess(mockEvent)).rejects.toMatchObject({
        statusCode: 403,
        message: "Forbidden",
      });
    });
  });

  describe("checkOwnership", () => {
    it("returns true if user matches record field (ownerId, createdBy)", async () => {
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });
      const result = await checkOwnership(mockUser, "posts", "update", { id: 1 });
      expect(result).toBe(true);
      expect(db.where).toHaveBeenCalled();
    });

    it("coerces ID string to number for DB query", async () => {
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });
      await checkOwnership(mockUser, "posts", "update", { id: "123" });
      
      // The eq call should have used Number(123)
      expect(eq).toHaveBeenCalledWith(expect.anything(), 123);
    });

    it("optimizes users table for self-update", async () => {
      vi.mocked(getTableName).mockReturnValue("users");
      const user = { id: 5, permissions: { users: ["update_own"] } };
      const result = await checkOwnership(user, "users", "update", { id: "5" });
      expect(result).toBe(true);
      expect(db.select).not.toHaveBeenCalled();
    });

    it("fails if user lacks _own permission", async () => {
      const user = { id: "u1", permissions: { posts: ["read"] } };
      const result = await checkOwnership(user, "posts", "update", { id: 1 });
      expect(result).toBe(false);
    });

    it("fails if table has no ownership columns", async () => {
      vi.mocked(getTableColumns).mockReturnValue({
        id: {},
        name: {}
      } as any); // no ownerId/createdBy
      const result = await checkOwnership(mockUser, "posts", "update", { id: 1 });
      expect(result).toBe(false);
    });

    it("fails if table has no primary key", async () => {
      vi.mocked(getTableColumns).mockReturnValue({
        id: {}, // not primary
      } as any);
      const result = await checkOwnership(mockUser, "posts", "update", { id: 1 });
      expect(result).toBe(false);
    });

    it("throws 403 if updating hidden fields even if owner", async () => {
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });
      vi.mocked(getHiddenFields).mockReturnValue(["secret"]);
      
      const context = { id: 1, secret: "illegal" };
      await expect(checkOwnership(mockUser, "posts", "update", context))
        .rejects.toMatchObject({ statusCode: 403 });
    });
  });
});
