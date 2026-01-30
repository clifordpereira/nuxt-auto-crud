import "drizzle-orm"; // Hoisted for performance cache

import { describe, it, expect, vi, beforeEach } from "vitest";

// Import module under test
import * as handler from "../../src/runtime/server/utils/handler";

// Mock dependencies
const {
  mockCheckAdminAccess,
  mockFilterHiddenFields,
  mockFilterPublicColumns,
  mockUseAutoCrudConfig,
  mockHashPassword,
} = vi.hoisted(() => ({
  mockCheckAdminAccess: vi.fn(),
  mockFilterHiddenFields: vi.fn(),
  mockFilterPublicColumns: vi.fn(),
  mockUseAutoCrudConfig: vi.fn(),
  mockHashPassword: vi.fn(),
}));

vi.mock("../../src/runtime/server/utils/auth", () => ({
  checkAdminAccess: mockCheckAdminAccess,
}));

vi.mock("../../src/runtime/server/utils/modelMapper", () => ({
  filterHiddenFields: mockFilterHiddenFields,
  filterPublicColumns: mockFilterPublicColumns,
}));

vi.mock("../../src/runtime/server/utils/config", () => ({
  useAutoCrudConfig: mockUseAutoCrudConfig,
}));

vi.mock("h3", () => ({
  createError: (opts: { statusCode: number; message: string }) => {
    const error = new Error(opts.message);
    (error as any).statusCode = opts.statusCode;
    return error;
  },
}));

// Stub global hashPassword
vi.stubGlobal("hashPassword", mockHashPassword);

describe("handler.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAutoCrudConfig.mockReturnValue({});
  });

  describe("ensureResourceAccess", () => {
    it("returns true if authorized", async () => {
      mockCheckAdminAccess.mockResolvedValue(true);
      const result = await handler.ensureResourceAccess(
        {} as any,
        "users",
        "read",
      );
      expect(result).toBe(true);
    });

    it("throws 401 if unauthorized", async () => {
      mockCheckAdminAccess.mockResolvedValue(false);
      await expect(
        handler.ensureResourceAccess({} as any, "users", "read"),
      ).rejects.toThrow("Unauthorized");
    });

    it("passes context to checkAdminAccess", async () => {
      mockCheckAdminAccess.mockResolvedValue(true);
      const context = { id: 1 };
      await handler.ensureResourceAccess({} as any, "users", "read", context);
      expect(mockCheckAdminAccess).toHaveBeenCalledWith(
        expect.anything(),
        "users",
        "read",
        context,
      );
    });

    it("throws 401 specifically (Identity vs Permission)", async () => {
      mockCheckAdminAccess.mockResolvedValue(false);
      
      try {
        await handler.ensureResourceAccess({} as any, "users", "read");
      } catch (e: any) {
        // Critical for multi-instance routing logic
        expect(e.statusCode).toBe(401); 
        expect(e.message).toBe("Unauthorized");
      }
    });
  });

  describe("hashPayloadFields", () => {
    it("hashes fields defined in config", async () => {
      mockUseAutoCrudConfig.mockReturnValue({ hashedFields: ["password"] });
      mockHashPassword.mockResolvedValue("hashed_secret");

      const payload = { password: "secret", name: "john" };
      await handler.hashPayloadFields(payload);

      expect(mockHashPassword).toHaveBeenCalledWith("secret");
      expect(payload.password).toBe("hashed_secret");
      expect(payload.name).toBe("john");
    });

    it("skips hashing if field is missing or not string", async () => {
      mockUseAutoCrudConfig.mockReturnValue({ hashedFields: ["password"] });

      const payload = { password: 123, name: "john" };
      await handler.hashPayloadFields(payload);

      expect(mockHashPassword).not.toHaveBeenCalled();
      expect(payload.password).toBe(123);
    });

    it("does nothing if no hashedFields configured", async () => {
      mockUseAutoCrudConfig.mockReturnValue({});
      const payload = { password: "secret" };
      await handler.hashPayloadFields(payload);
      expect(mockHashPassword).not.toHaveBeenCalled();
    });

    it("hashes multiple fields iteratively", async () => {
      mockUseAutoCrudConfig.mockReturnValue({ hashedFields: ["password", "token"] });
      mockHashPassword.mockImplementation((val) => `hashed_${val}`);

      const payload = { password: "p1", token: "t1", other: "keep" };
      await handler.hashPayloadFields(payload);

      expect(payload.password).toBe("hashed_p1");
      expect(payload.token).toBe("hashed_t1");
      expect(payload.other).toBe("keep");
    });

    it("preserves object integrity for non-hashed keys", async () => {
      mockUseAutoCrudConfig.mockReturnValue({ hashedFields: ["password"] });
      mockHashPassword.mockResolvedValue("hashed");
      
      const payload = { 
        id: "uuid-123", 
        password: "raw", 
        metadata: { role: "admin" } 
      };
      
      await handler.hashPayloadFields(payload);
      
      // Ensure mutation is surgical
      expect(payload.id).toBe("uuid-123");
      expect(payload.metadata.role).toBe("admin");
    });
  });

  describe("formatResourceResult", () => {
    it("filters public columns for guests", () => {
      mockFilterPublicColumns.mockReturnValue({ public: 1 });
      const result = handler.formatResourceResult(
        "users",
        { public: 1, private: 2 },
        true,
      );
      expect(mockFilterPublicColumns).toHaveBeenCalledWith("users", {
        public: 1,
        private: 2,
      });
      expect(result).toEqual({ public: 1 });
    });

    it("filters hidden fields for authenticated users", () => {
      mockFilterHiddenFields.mockReturnValue({ public: 1, private: 2 });
      const result = handler.formatResourceResult(
        "users",
        { public: 1, private: 2, hidden: 3 },
        false,
      );
      expect(mockFilterHiddenFields).toHaveBeenCalledWith("users", {
        public: 1,
        private: 2,
        hidden: 3,
      });
      expect(result).toEqual({ public: 1, private: 2 });
    });

    it("handles null or undefined data gracefully", () => {
      const resultNull = handler.formatResourceResult("users", null, true);
      expect(resultNull).toBeNull();
      expect(mockFilterPublicColumns).not.toHaveBeenCalled();

      const resultUndefined = handler.formatResourceResult("users", undefined, true);
      expect(resultUndefined).toBeUndefined();
      expect(mockFilterPublicColumns).not.toHaveBeenCalled();
    });

    it("handles arrays of records (List Endpoints)", () => {
      const data = [{ id: 1 }, { id: 2 }];
      mockFilterPublicColumns.mockReturnValue({ public: 1 });

      const result = handler.formatResourceResult("users", data, true);

      expect(result).toHaveLength(2);
      expect(mockFilterPublicColumns).toHaveBeenCalledTimes(2);
      expect(mockFilterPublicColumns).toHaveBeenCalledWith("users", data[0]);
      expect(mockFilterPublicColumns).toHaveBeenCalledWith("users", data[1]);
    });

    it("returns empty array when input is empty array", () => {
      const result = handler.formatResourceResult("users", [], true);
      expect(result).toEqual([]);
      expect(mockFilterPublicColumns).not.toHaveBeenCalled();
    });

    it("strips extra properties not handled by mappers", () => {
      // Scenario: Database returns a field not defined in public/hidden configs
      const dirtyData = { id: 1, unexpected_field: "malicious_leak" };
      
      mockFilterPublicColumns.mockImplementation((_, item) => {
        const { unexpected_field, ...rest } = item;
        return rest;
      });

      const result = handler.formatResourceResult("users", dirtyData, true);
      
      expect(result).not.toHaveProperty("unexpected_field");
      expect(result).toEqual({ id: 1 });
    });

    it("returns empty array immediately if data is []", () => {
      const result = handler.formatResourceResult("users", [], true);
      expect(result).toEqual([]);
      expect(mockFilterPublicColumns).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases & Security", () => {
    it("preserves non-hashed fields during mutation", async () => {
      mockUseAutoCrudConfig.mockReturnValue({ hashedFields: ["password"] });
      const payload = { password: "123", email: "cliford@clifland.com", metadata: { role: "admin" } };
      await handler.hashPayloadFields(payload);
      
      expect(payload.email).toBe("cliford@clifland.com");
      expect(payload.metadata.role).toBe("admin");
    });

    it("handles malformed hashedFields config (null/undefined)", async () => {
      mockUseAutoCrudConfig.mockReturnValue({ hashedFields: null });
      const payload = { password: "123" };
      await expect(handler.hashPayloadFields(payload)).resolves.not.toThrow();
    });
  });
});
