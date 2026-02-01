import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { getHeader, getQuery } from "h3";
import { eq } from "drizzle-orm";

type Auth = typeof import("../../src/runtime/server/utils/auth");

// Mock h3 module
vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>();
  return {
    ...actual,
    getHeader: vi.fn(),
    getQuery: vi.fn(),
    createError: (opts: { statusCode: number; message: string }) => {
      const error = new Error(opts.message);
      (error as any).statusCode = opts.statusCode;
      return error;
    },
  };
});

vi.mock("drizzle-orm", async (importOriginal) => {
  const actual = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...actual,
    eq: vi.fn(),
    getTableColumns: vi.fn((t) => t),
  };
});

describe("auth.ts", () => {
  let auth: Auth;

  const mockGetUserSession = vi.fn();
  const mockRequireUserSession = vi.fn();
  const mockAllows = vi.fn();
  const mockUseRuntimeConfig = vi.fn();
  const mockDbGet = vi.fn();
  const mockGetTableForModel = vi.fn();
  const mockSiteAbility = vi.fn();
  const mockGetHiddenFields = vi.fn().mockReturnValue([]);

  beforeAll(async () => {
    vi.doMock("#site/ability", () => ({
      default: mockSiteAbility,
    }));

    vi.doMock("../../src/runtime/server/utils/modelMapper", () => ({
      getTableForModel: mockGetTableForModel,
      getTableColumns: (table: any) => Object.keys(table), // Mock implementation
      getHiddenFields: mockGetHiddenFields,
    }));

    vi.doMock("#imports", () => ({
      useRuntimeConfig: mockUseRuntimeConfig,
      getUserSession: mockGetUserSession,
      requireUserSession: mockRequireUserSession,
      allows: mockAllows,
      abilities: null,
      abilityLogic: null,
    }));

    vi.doMock("hub:db", () => ({
      db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        get: mockDbGet,
      },
    }));
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();
    // Default config: auth enabled
    mockUseRuntimeConfig.mockReturnValue({
      public: { autoCrud: { auth: { authentication: true } } },
      apiSecretToken: "",
    });
    (getHeader as any).mockReturnValue(undefined);
    (getQuery as any).mockReturnValue({});
    auth = await import("../../src/runtime/server/utils/auth");
  });

  describe("checkAdminAccess", () => {
    it("allows access when authentication is disabled", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: { autoCrud: { auth: { authentication: false } } },
      });
      const result = await auth.checkAdminAccess({} as any, "users", "read");
      expect(result).toBe(true);
    });

    it("allows access with valid API token (Header)", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: { autoCrud: { auth: { authentication: true } } },
        apiSecretToken: "secret",
      });
      (getHeader as any).mockReturnValue("Bearer secret");

      const result = await auth.checkAdminAccess({} as any, "users", "read");
      expect(result).toBe(true);
    });

    it("allows access with valid API token (Query)", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: { autoCrud: { auth: { authentication: true } } },
        apiSecretToken: "secret",
      });
      (getHeader as any).mockReturnValue(undefined);
      (getQuery as any).mockReturnValue({ token: "secret" });

      const result = await auth.checkAdminAccess({} as any, "users", "read");
      expect(result).toBe(true);
    });

    it("denies access when not authenticated (no session)", async () => {
      mockGetUserSession.mockResolvedValue({ user: null });
      const result = await auth.checkAdminAccess({} as any, "users", "read");
      expect(result).toBe(false);
    });

    it("allows access when authenticated and authorization is disabled", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: false } },
        },
      });
      mockGetUserSession.mockResolvedValue({ user: { id: 1 } });
      const result = await auth.checkAdminAccess({} as any, "users", "read");
      expect(result).toBe(true);
    });

    it("checks authorization via allows when enabled", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({ user: { id: 1 } });
      mockAllows.mockResolvedValue(true);

      const result = await auth.checkAdminAccess({} as any, "users", "read");
      expect(result).toBe(true);
      expect(mockAllows).toHaveBeenCalled();
    });

    it("throws Forbidden if allows denies and no ownership fallback", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({ user: { id: 1 } });
      mockAllows.mockResolvedValue(false);

      await expect(
        auth.checkAdminAccess({} as any, "users", "read"),
      ).rejects.toThrow("Forbidden");
    });

    it("allows access via ownership check (createdBy)", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["read_own"] } },
      });
      mockAllows.mockResolvedValue(false);

      mockGetTableForModel.mockReturnValue({
        id: { primary: true },
        createdBy: {},
      });
      mockDbGet.mockResolvedValue({ owner: 1 });

      const result = await auth.checkAdminAccess({} as any, "posts", "read", {
        id: 100,
      });
      expect(result).toBe(true);
    });

    it("allows access via ownership check (userId)", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["read_own"] } },
      });
      mockAllows.mockResolvedValue(false);

      mockGetTableForModel.mockReturnValue({
        id: { primary: true },
        userId: {},
      });
      mockDbGet.mockResolvedValue({ owner: 1 });

      const result = await auth.checkAdminAccess({} as any, "posts", "read", {
        id: 100,
      });
      expect(result).toBe(true);
    });

    it("allows access via ownership check with String ID (UUID)", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["read_own"] } },
      });
      mockAllows.mockResolvedValue(false);

      mockGetTableForModel.mockReturnValue({
        id: { primary: true },
        createdBy: {},
      });
      mockDbGet.mockResolvedValue({ owner: 1 });

      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = await auth.checkAdminAccess({} as any, "posts", "read", {
        id: uuid,
      });
      expect(result).toBe(true);
      expect(vi.mocked(eq)).toHaveBeenCalledWith(expect.anything(), uuid);
    });

    it("allows access via ownership check (self user update)", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { users: ["update_own"] } },
      });
      mockAllows.mockResolvedValue(false);
      mockGetTableForModel.mockReturnValue({ id: { primary: true } });

      const result = await auth.checkAdminAccess({} as any, "users", "update", {
        id: 1,
      });
      expect(result).toBe(true);
    });

    it("denies access when ownership IDs do not match", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["read_own"] } },
      });
      mockAllows.mockResolvedValue(false);
      mockGetTableForModel.mockReturnValue({
        id: { primary: true },
        createdBy: {},
      });
      mockDbGet.mockResolvedValue({ createdBy: 999 }); // Mismatch

      await expect(
        auth.checkAdminAccess({} as any, "posts", "read", { id: 100 }),
      ).rejects.toThrow("Forbidden");
    });

    it("denies access when record is missing and ownership fallback is required", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["read_own"] } },
      });
      mockAllows.mockResolvedValue(false);
      mockGetTableForModel.mockReturnValue({
        id: { primary: true },
        createdBy: {},
      });
      mockDbGet.mockResolvedValue(null); // Record not found

      await expect(
        auth.checkAdminAccess({} as any, "posts", "read", { id: 100 }),
      ).rejects.toThrow("Forbidden");
    });

    it("denies access when table lacks ownership columns", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["read_own"] } },
      });
      mockAllows.mockResolvedValue(false);
      mockGetTableForModel.mockReturnValue({ id: {} }); // No createdBy/userId

      await expect(
        auth.checkAdminAccess({} as any, "posts", "read", { id: 100 }),
      ).rejects.toThrow("Forbidden");
    });

    it("handles database errors during ownership check gracefully", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["read_own"] } },
      });
      mockAllows.mockResolvedValue(false);
      mockGetTableForModel.mockReturnValue({
        id: { primary: true },
        createdBy: {},
      });
      mockDbGet.mockRejectedValue(new Error("DB_DOWN"));

      await expect(
        auth.checkAdminAccess({} as any, "posts", "read", { id: 100 }),
      ).rejects.toThrow("DB_DOWN");
    });

    it("denies access if user attempts to update hidden fields on own record", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({
        user: { id: 1, permissions: { posts: ["update_own"] } },
      });
      mockAllows.mockResolvedValue(false);
      mockGetTableForModel.mockReturnValue({
        id: { primary: true },
        createdBy: {},
      });
      mockDbGet.mockResolvedValue({ owner: 1 });
      mockGetHiddenFields.mockReturnValue(["is_verified"]); // Field is hidden

      const payload = { id: 100, is_verified: true };

      await expect(
        auth.checkAdminAccess({} as any, "posts", "update", payload),
      ).rejects.toThrow("Forbidden");
    });

    it("delegates to siteAbility for unauthenticated guests", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: {
          autoCrud: { auth: { authentication: true, authorization: true } },
        },
      });
      mockGetUserSession.mockResolvedValue({ user: null });
      mockSiteAbility.mockResolvedValue(true);

      const result = await auth.checkAdminAccess({} as any, "posts", "read");
      expect(result).toBe(true);
      expect(mockSiteAbility).toHaveBeenCalledWith(
        null,
        "posts",
        "read",
        undefined,
      );
    });
  });

  describe("ensureAuthenticated", () => {
    it("returns if authentication is disabled", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: { autoCrud: { auth: { authentication: false } } },
      });
      await auth.ensureAuthenticated({} as any);
      expect(mockRequireUserSession).not.toHaveBeenCalled();
    });

    it("returns if API token is valid", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: { autoCrud: { auth: { authentication: true } } },
        apiSecretToken: "secret",
      });
      (getHeader as any).mockReturnValue("Bearer secret");
      await auth.ensureAuthenticated({} as any);
      expect(mockRequireUserSession).not.toHaveBeenCalled();
    });

    it("calls requireUserSession if no token", async () => {
      mockUseRuntimeConfig.mockReturnValue({
        public: { autoCrud: { auth: { authentication: true } } },
        apiSecretToken: "secret",
      });
      (getHeader as any).mockReturnValue(undefined);
      await auth.ensureAuthenticated({} as any);
      expect(mockRequireUserSession).toHaveBeenCalled();
    });
  });
});
