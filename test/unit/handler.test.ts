import "drizzle-orm"; // Hoisted for performance cache

import { describe, it, expect, vi, beforeEach } from "vitest";

// Import module under test
import * as handler from "../../src/runtime/server/utils/handler";

// Mock dependencies
const {
  mockSanitizeResource,
  mockUseAutoCrudConfig,
  mockHashPassword,
} = vi.hoisted(() => ({
  mockSanitizeResource: vi.fn(),
  mockUseAutoCrudConfig: vi.fn(),
  mockHashPassword: vi.fn(),
}));

vi.mock("../../src/runtime/server/utils/modelMapper", () => ({
  sanitizeResource: mockSanitizeResource,
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
    it("always returns true (Auth decoupled from Core)", async () => {
      const result = await handler.ensureResourceAccess(
        {} as any,
        "users",
        "read",
      );
      expect(result).toBe(true);
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
      mockSanitizeResource.mockReturnValue({ public: 1 });
      const result = handler.formatResourceResult(
        "users",
        { public: 1, private: 2 },
        true,
      );
      expect(mockSanitizeResource).toHaveBeenCalledWith("users", {
        public: 1,
        private: 2,
      }, true);
      expect(result).toEqual({ public: 1 });
    });

    it("filters hidden fields for authenticated users", () => {
      mockSanitizeResource.mockReturnValue({ public: 1, private: 2 });
      const result = handler.formatResourceResult(
        "users",
        { public: 1, private: 2, hidden: 3 },
        false,
      );
      expect(mockSanitizeResource).toHaveBeenCalledWith("users", {
        public: 1,
        private: 2,
        hidden: 3,
      }, false);
      expect(result).toEqual({ public: 1, private: 2 });
    });

    it("handles null or undefined data gracefully", () => {
      const resultNull = handler.formatResourceResult("users", null, true);
      expect(resultNull).toBeNull();
      expect(mockSanitizeResource).not.toHaveBeenCalled();

      const resultUndefined = handler.formatResourceResult("users", undefined, true);
      expect(resultUndefined).toBeUndefined();
      expect(mockSanitizeResource).not.toHaveBeenCalled();
    });

    it("handles arrays of records (List Endpoints)", () => {
      const data = [{ id: 1 }, { id: 2 }];
      mockSanitizeResource.mockReturnValue({ public: 1 });

      const result = handler.formatResourceResult("users", data, true);

      expect(result).toHaveLength(2);
      expect(mockSanitizeResource).toHaveBeenCalledTimes(2);
      expect(mockSanitizeResource).toHaveBeenCalledWith("users", data[0], true);
      expect(mockSanitizeResource).toHaveBeenCalledWith("users", data[1], true);
    });

    it("returns empty array when input is empty array", () => {
      const result = handler.formatResourceResult("users", [], true);
      expect(result).toEqual([]);
      expect(mockSanitizeResource).not.toHaveBeenCalled();
    });

    it("strips extra properties not handled by mappers", () => {
      // Scenario: Database returns a field not defined in public/hidden configs
      const dirtyData = { id: 1, unexpected_field: "malicious_leak" };
      
      mockSanitizeResource.mockImplementation((_, item) => {
        const { unexpected_field, ...rest } = item as any;
        return rest;
      });

      const result = handler.formatResourceResult("users", dirtyData, true);
      
      expect(result).not.toHaveProperty("unexpected_field");
      expect(result).toEqual({ id: 1 });
    });

    it("returns empty array immediately if data is []", () => {
      const result = handler.formatResourceResult("users", [], true);
      expect(result).toEqual([]);
      expect(mockSanitizeResource).not.toHaveBeenCalled();
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
