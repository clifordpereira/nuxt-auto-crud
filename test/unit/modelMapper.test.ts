import "drizzle-orm"; // Hoisted for performance cache

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { H3Error } from "h3";
import * as mapper from "../../src/runtime/server/utils/modelMapper";
import z from "zod";

const mockUseRuntimeConfig = vi.fn();

vi.mock("#imports", () => ({
  useRuntimeConfig: () => mockUseRuntimeConfig(),
}));

vi.mock("#site/schema", async () => {
  const utils = await import("../utils/schema");
  return utils.mockSchema;
});

describe("modelMapper.ts", () => {
  beforeEach(() => {
    mockUseRuntimeConfig.mockReturnValue({
      // Private/Server Config
      autoCrud: {},
      // Public Config
      public: {
        autoCrud: {
          resources: { users: ["email", "lastLogin"] },
          hiddenFields: ["password"],
          // Moved to public to match modelMapper.ts implementation
          protectedFields: ["id", "createdAt"],
          systemUserFields: ["createdBy"],
        },
      },
    });
  });

  it("returns plural/singular names correctly", () => {
    expect(mapper.getModelSingularName("user_profiles")).toBe("UserProfile");
    expect(mapper.getModelPluralName("category")).toBe("categories");
  });

  it("handles irregular and uncountable nouns for stable routing", () => {
    expect(mapper.getModelSingularName("analyses")).toBe("Analysis");
    expect(mapper.getModelPluralName("Analysis")).toBe("analyses");
    expect(mapper.getModelSingularName("audit_logs")).toBe("AuditLog");
    expect(mapper.getModelPluralName("data")).toBe("data");
  });

  it("coerces ISO strings to Date in filterUpdatableFields", () => {
    const input = {
      email: "clif@clifland.com",
      lastLogin: "2026-01-28T18:00:00.000Z",
    };
    const result = mapper.filterUpdatableFields("users", input);
    expect(result.lastLogin).toBeInstanceOf(Date);
    expect((result.lastLogin as Date).toISOString()).toBe(
      "2026-01-28T18:00:00.000Z",
    );
  });

  it("throws 404 with hints when model is missing", () => {
    try {
      mapper.getTableForModel("non_existent");
    } catch (e: unknown) {
      const error = e as H3Error;
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain("users");
    }
  });

  it("generates agentic-safe Zod schemas", () => {
    const schema = mapper.getZodSchema("users", "insert");
    expect(schema.shape.id).toBeUndefined();
    expect(schema.shape.email).toBeDefined();
  });

  it("generates partial schemas for patch operations", () => {
    // Use z.ZodObject<any> to access .shape safely in tests
    const schema = mapper.getZodSchema("users", "patch") as z.ZodObject<any>;
    
    const emailSchema = schema.shape.email;
    expect(emailSchema).toBeDefined();
    
    // Cast to z.ZodType (or just z.Schema) for safeParse
    const result = (emailSchema as z.ZodType).safeParse(undefined);
    expect(result.success).toBe(true);
  });

  it("validates required fields via generated schema", () => {
    const schema = mapper.getZodSchema("users", "insert");
    const result = schema.safeParse({ password: "123" });

    expect(result.success).toBe(false);
    const fieldErrors = !result.success
      ? result.error.flatten().fieldErrors
      : {};
    expect(fieldErrors).toHaveProperty("email");
  });

  it("respects customUpdatableFields overrides", () => {
    mapper.customUpdatableFields["users"] = ["email"];
    const result = mapper.filterUpdatableFields("users", {
      email: "a@b.com",
      lastLogin: "2026-01-28",
    });
    expect(result.lastLogin).toBeUndefined();
  });

  it("strips soft-delete fields from public output", () => {
    const result = mapper.sanitizeResource("users", {
      email: "a@b.com",
      deletedAt: new Date(),
    });
    expect(result.deletedAt).toBeUndefined();
  });

  it("handles empty/non-table exports in schema safely", () => {
    // Test buildModelTableMap logic against unexpected exports
    expect(mapper.getAvailableModels()).not.toContain("nonTableExport");
  });

  it("does not throw when omitting fields that do not exist in the table", () => {
    expect(() => {
      mapper.getZodSchema("logs", "insert");
    }).not.toThrow();

    const schema = mapper.getZodSchema("logs", "insert");
    expect(schema.shape.message).toBeDefined();
  });

  it("filters HIDDEN_FIELDS from resource output", () => {
    const result = mapper.sanitizeResource("logs", {
      id: 100,
      message: "boot",
      password: "123",
    });
    expect(result.message).toBeDefined();
    expect(result.password).toBeUndefined();
  });

  it("prioritizes customHiddenFields and respects constants (Admin Mode)", () => {
    mapper.customHiddenFields["users"] = ["email"];
    const result = mapper.sanitizeResource("users", {
      email: "secret",
      password: "123",
      username: "clif",
    });
    expect(result.email).toBeUndefined(); // Custom hidden
    expect(result.password).toBeUndefined(); // Constant hidden
    expect(result.username).toBe("clif"); // Safe
  });

  it("ensures PROTECTED_FIELDS are never updatable even if public", () => {
    const input = {
      email: "new@clifland.com",
      id: 999,
      createdAt: "2026-01-01",
    };
    const result = mapper.filterUpdatableFields("users", input);

    expect(result.email).toBeDefined();
    expect(result.id).toBeUndefined(); // Protected
    expect(result.createdAt).toBeUndefined(); // Protected
  });

  it("formats resource results (single and array)", () => {
    mapper.customHiddenFields["users"] = ["password"];
    const single = { email: "a@b.com", password: "123" };
    const array = [{ email: "a@b.com", password: "123" }];

    const resSingle = mapper.formatResourceResult("users", single);
    expect(resSingle).not.toHaveProperty("password");
    expect(resSingle).toHaveProperty("email");

    const resArray = mapper.formatResourceResult("users", array);
    expect(Array.isArray(resArray)).toBe(true);
    expect((resArray as any[])[0]).not.toHaveProperty("password");
  });

  it("extracts relations from table config", () => {
    const relations = mapper.getRelations();
    expect(relations.posts).toBeDefined();
    const userRel = Object.values(relations.posts || {}).find(
      (r) => r === "users",
    );
    expect(userRel).toBeDefined();
  });

  it("reads system and protected fields from config", () => {
    mockUseRuntimeConfig.mockReturnValue({
      public: {
        autoCrud: {
          protectedFields: ["createdAt"],
          systemUserFields: ["createdBy"],
        },
      },
    });
    expect(mapper.getProtectedFields()).toContain("createdAt");
    expect(mapper.getSystemUserFields()).toContain("createdBy");
  });

  it("retrieves public columns from config", () => {
    mockUseRuntimeConfig.mockReturnValue({
      public: {
        autoCrud: { resources: { users: ["email"] } },
      },
    });
    expect(mapper.getPublicColumns("users")).toEqual(["email"]);
  });
});
