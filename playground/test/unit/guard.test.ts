// guard.test.ts
import "drizzle-orm";

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as guard from "../../server/utils/guard";

const { mockUseAutoCrudConfig, mockCheckAdminAccess } = vi.hoisted(() => ({
  mockUseAutoCrudConfig: vi.fn(),
  mockCheckAdminAccess: vi.fn(),
}));

vi.mock("#imports", () => ({
  checkAdminAccess: mockCheckAdminAccess,
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

describe("guard.ts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns true ONLY when authentication is explicitly false", async () => {
    mockUseAutoCrudConfig.mockReturnValue({ auth: { authentication: false } });
    const result = await guard.ensureResourceAccess({} as any, "posts", "delete");
    expect(result).toBe(true);
    expect(mockCheckAdminAccess).not.toHaveBeenCalled();
  });

  it("delegates to engine when auth config is missing (Secure by Default)", async () => {
    mockUseAutoCrudConfig.mockReturnValue({}); // Empty config
    mockCheckAdminAccess.mockResolvedValue(false);
    
    const result = await guard.ensureResourceAccess({} as any, "posts", "delete");
    
    expect(result).toBe(false);
    expect(mockCheckAdminAccess).toHaveBeenCalled();
  });

  it("passes all parameters and respects the H3Event context", async () => {
    mockUseAutoCrudConfig.mockReturnValue({ auth: { authentication: true } });
    
    // Create a mock event that resembles a real Nitro event with a user resolver
    const mockEvent = {
      context: {
        $authorization: { resolveServerUser: vi.fn() }
      }
    } as any;

    const mockContext = { additionalData: true };
    
    await guard.ensureResourceAccess(mockEvent, "orders", "update", mockContext);
    
    expect(mockCheckAdminAccess).toHaveBeenCalledWith(
      mockEvent, // Verify the exact event object is passed
      "orders",
      "update",
      mockContext
    );
  });
});
