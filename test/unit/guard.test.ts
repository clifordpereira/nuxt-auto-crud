// guard.test.ts
import "drizzle-orm"; 

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as guard from "../../src/runtime/server/utils/guard";

const { mockUseAutoCrudConfig } = vi.hoisted(() => ({
  mockUseAutoCrudConfig: vi.fn(),
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
    mockUseAutoCrudConfig.mockReturnValue({});
  });

  describe("ensureResourceAccess", () => {
    it("returns true by default to allow playground implementation", async () => {
      const result = await guard.ensureResourceAccess(
        {} as any,
        "users",
        "read",
      );
      expect(result).toBe(true);
    });
  });
});