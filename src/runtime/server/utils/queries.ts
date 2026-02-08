import { eq, desc, and, or } from "drizzle-orm";
// @ts-expect-error - hub:db is a virtual alias
import { db } from "hub:db";
import type { TableWithId } from "../types";
import type { QueryContext } from "../../types";
import { useRuntimeConfig } from "#imports";

/**
 * Fetches rows from the database based on the provided table and context.
 * @param table - The table to query.
 * @param context - The context object containing user ID and permissions.
 * @returns An array of rows from the database.
 */
export async function getRows(table: TableWithId, context: QueryContext = {}) {
  const { userId, permissions } = context;
  
  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || "createdBy";
  const filters = [];

  if (permissions?.includes('list_all')) {
    // Promotion: Return all records, zero filters
  } 
  else if (permissions?.includes('list')) {
    // Logic: (status == 'active') OR (owner == userId)
    // This allows users to see public active content AND their own drafts/private items
    if ('status' in table && ownerKey in table) {
      filters.push(
        or(
          eq((table as any).status, "active"), 
          eq((table as any)[ownerKey], Number(userId))
        )
      );
    } else if ('status' in table) {
       filters.push(eq((table as any).status, "active"));
    }
  } 
  else if (permissions?.includes('list_own') && userId) {
    // Strictly personal records, status ignored
    if (ownerKey in table) {
      filters.push(eq((table as any)[ownerKey], Number(userId)));
    }
  }

  let query = db.select().from(table).$dynamic();
  if (filters.length > 0) query = query.where(and(...filters));

  return await query.orderBy(desc(table.id)).all();
}

/**
 * Fetches a single row from the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to fetch.
 * @param context - The context object containing user ID and permissions.
 * @returns The row from the database.
 */
export async function getRow(table: TableWithId, id: string, context: QueryContext = {}) {
  if (context.record) return context.record;
  return await db.select().from(table).where(eq(table.id, Number(id))).get();
}

/**
 * Creates a new row in the database based on the provided table and data.
 * @param table - The table to query.
 * @param data - The data to insert into the table.
 * @param context - The context object containing user ID and permissions.
 */
export async function createRow(table: TableWithId, data: Record<string, unknown>, context: QueryContext = {}) {
  const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || "createdBy";
  
  const payload = { ...data };
  // Only inject if userId is provided and column exists in schema
  if (context.userId && ownerKey in table) {
    payload[ownerKey] = Number(context.userId);
  }

  return await db.insert(table).values(payload).returning().get();
}

/**
 * Updates a row in the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to update.
 * @param data - The data to update in the table.
 * @param context - The context object containing user ID and permissions.
 */
export async function updateRow(table: TableWithId, id: string, data: Record<string, unknown>, context: QueryContext = {}) {
  const targetId = Number(id);
  const payload = { ...data };

  // Update audit metadata
  if (context.userId && 'updatedBy' in table) {
    payload.updatedBy = Number(context.userId);
  }
  
  // Explicitly refresh updatedAt for SQLite
  if ('updatedAt' in table) {
    payload.updatedAt = new Date();
  }
  
  const [updated] = await db.update(table).set(payload).where(eq(table.id, targetId)).returning();

  return updated;
}

/**
 * Deletes a row from the database based on the provided table and ID.
 * @param table - The table to query.
 * @param id - The ID of the row to delete.
 * @param context - The context object containing user ID and permissions.
 */
export async function deleteRow(table: TableWithId, id: string, context: QueryContext = {}) {
  const targetId = Number(id);

  if (context.record) {
    await db.delete(table).where(eq(table.id, targetId)).run();
    return context.record;
  }

  return await db.delete(table).where(eq(table.id, targetId)).returning().get();
}