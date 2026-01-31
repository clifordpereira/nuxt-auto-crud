// schema.test.ts
import "drizzle-orm"; // Hoisted for performance cache

import { describe, it, expect, vi } from "vitest";
import { mockSchema } from "../utils/schema";
import * as schemaUtils from "../../src/runtime/server/utils/schema";

vi.mock("#imports", () => ({
  useRuntimeConfig: () => ({
    autoCrud: { resources: { users: ["email", "lastLogin"] } },
  }),
}));

vi.mock("#site/schema", async () => {
  const utils = await import("../utils/schema");
  return utils.mockSchema;
});

describe("schema.ts", () => {
  it("maps Drizzle types to NAC Field types", () => {
    const { fields } = schemaUtils.drizzleTableToFields(
      mockSchema.users,
      "users",
    );

    const bioField = fields.find((f) => f.name === "bio");
    const emailField = fields.find((f) => f.name === "email");

    expect(bioField?.type).toBe("textarea");
    expect(emailField?.required).toBe(true);
  });

  it("handles foreign key detection", () => {
    const result = schemaUtils.drizzleTableToFields(mockSchema.posts, "posts");
    const authorField = result.fields.find((f) => f.name === "authorId");

    // Maps back to the model key 'users'
    expect(authorField?.references).toBe("users");
  });

  it("strips hidden/protected fields from UI field list", () => {
    const { fields } = schemaUtils.drizzleTableToFields(
      mockSchema.users,
      "users",
    );
    const fieldNames = fields.map((f) => f.name);

    // Identity and sensitive fields should not be in the dynamic form fields
    expect(fieldNames).not.toContain("password");

    // Protected fields should be present but read-only
    expect(fieldNames).toContain("createdAt");
    expect(fields.find((f) => f.name === "createdAt")?.isReadOnly).toBe(true);
  });

  it("maps enum values to selectOptions", () => {
    const { fields } = schemaUtils.drizzleTableToFields(
      mockSchema.users,
      "users",
    );
    const roleField = fields.find((f) => f.name === "role");

    expect(roleField?.type).toBe("enum");
    expect(roleField?.selectOptions).toContain("admin");
  });

  it("identifies timestamp/date fields via name heuristics", () => {
    const { fields } = schemaUtils.drizzleTableToFields(
      mockSchema.users,
      "users",
    );
    const lastLoginField = fields.find((f) => f.name === "lastLogin");

    // Even if it is a SQLite integer, if name ends in 'At' or 'Login', it should be 'date'
    expect(lastLoginField?.type).toBe("date");
  });

  it("correctly identifies labelField using Clifland Heuristic", () => {
    const result = schemaUtils.drizzleTableToFields(mockSchema.users, "users");
    expect(result.labelField).toBe("name");
  });

  it("verifies getRelations auto-links system fields to users", async () => {
    const relations = await schemaUtils.getSchemaRelations();
    expect(relations.users).toBeDefined();
    expect(relations.users?.createdBy).toBe("users");
  });

  it('falls back to "id" if no heuristic matches', () => {
    const result = schemaUtils.drizzleTableToFields(mockSchema.logs, "logs");
    expect(result.labelField).toBe("id");
  });

  it("returns empty references if no foreign keys exist", () => {
    const result = schemaUtils.drizzleTableToFields(mockSchema.logs, "logs");
    const messageField = result.fields.find((f) => f.name === "message");
    expect(messageField?.references).toBeUndefined();
  });

  it("identifies semantic types from Zod", () => {
    // This test ensures the bridge between Zod metadata and NAC Field types works
    const { fields } = schemaUtils.drizzleTableToFields(
      mockSchema.users,
      "users",
    );

    const emailField = fields.find((f) => f.name === "email");
    expect(emailField?.type).toBeDefined();
  });
});
