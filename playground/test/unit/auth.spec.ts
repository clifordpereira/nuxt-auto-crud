import { describe, it, expect, vi, beforeEach } from "vitest";
import { guardEventAccess } from "../../server/utils/auth";
import { db } from "hub:db";
import { eq, getTableColumns, getTableName } from "drizzle-orm";
import { getHeader, getQuery, readBody } from "h3";
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
  method: "PATCH",
  headers: {},
  context: { params: { id: "1" } },
} as any;

describe("server/utils/auth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default Mock Implementations
    vi.mocked(getHeader).mockReturnValue(undefined);
    vi.mocked(getQuery).mockReturnValue({});
    vi.mocked(readBody).mockResolvedValue({});
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

  describe("guardEventAccess - Authentication", () => {
    it("allows agent access via Bearer token", async () => {
      vi.mocked(getHeader).mockReturnValue("Bearer test_secret");
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(requireUserSession).not.toHaveBeenCalled();
    });

    it("allows agent access via query token", async () => {
      vi.mocked(getQuery).mockReturnValue({ token: "test_secret" });
      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(requireUserSession).not.toHaveBeenCalled();
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
      vi.mocked(requireUserSession).mockRejectedValue(new Error("Unauthorized"));
      
      await expect(guardEventAccess(mockEvent)).rejects.toThrow("Unauthorized");
      expect(requireUserSession).toHaveBeenCalled();
    });
  });

  describe("guardEventAccess - Authorization & Ownership", () => {
    it("allows access to system endpoints", async () => {
      const systemPaths = ["/api/_nac/_meta", "/api/_nac/sse"];
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
      vi.mocked(getUserSession).mockResolvedValue({ 
        user: { ...mockUser, permissions: { posts: ["update_own"] } } 
      });
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });

      await expect(guardEventAccess(mockEvent)).resolves.toBeUndefined();
      expect(db.select).toHaveBeenCalled();
    });

    it("verified ownership fallbacks logic (coercion)", async () => {
      vi.mocked(getUserSession).mockResolvedValue({ 
        user: { ...mockUser, permissions: { posts: ["update_own"] } } 
      });
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });

      await guardEventAccess({ ...mockEvent, path: "/api/_nac/posts/123" });
      expect(eq).toHaveBeenCalledWith(expect.anything(), 123);
    });

    it("verifies self-update optimization for users table", async () => {
      vi.mocked(getTableName).mockReturnValue("users");
      const user = { id: 5, permissions: { users: ["update_own"] } };
      vi.mocked(getUserSession).mockResolvedValue({ user });
      
      const event = { ...mockEvent, path: "/api/_nac/users/5" };
      await expect(guardEventAccess(event)).resolves.toBeUndefined();
      expect(db.select).not.toHaveBeenCalled();
    });

    it("fails if both authorization and ownership fail", async () => {
      vi.mocked(db.get).mockResolvedValue({ owner: "someone_else" });

      await expect(guardEventAccess(mockEvent)).rejects.toMatchObject({
        statusCode: 403,
        message: "Forbidden",
      });
    });

    it("throws 403 if updating hidden fields even if owned", async () => {
      vi.mocked(db.get).mockResolvedValue({ owner: "user_123" });
      vi.mocked(getHiddenFields).mockReturnValue(["secret"]);
      vi.mocked(readBody).mockResolvedValue({ secret: "illegal" });
      
      vi.mocked(getUserSession).mockResolvedValue({ 
        user: { ...mockUser, permissions: { posts: ["update_own"] } } 
      });

      await expect(guardEventAccess(mockEvent)).rejects.toMatchObject({ 
        statusCode: 403,
        message: "Forbidden: Hidden fields"
      });
    });
  });
});
