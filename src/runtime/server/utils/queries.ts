import { eq, desc, and } from "drizzle-orm";
// @ts-expect-error - hub:db is a virtual alias
import { db } from "hub:db";
import type { TableWithId } from "../types";
import type { QueryContext } from "../../types";
import { useRuntimeConfig } from "#imports";

export async function getRows(table: TableWithId, context: QueryContext = {}) {
  const { restriction, userId, listAllStatus } = context;
  console.log(context)
  let query = db.select().from(table).$dynamic();
  const filters = [];

  if (restriction === "own" && userId) {
    const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || "createdBy";
    filters.push(eq((table as any)[ownerKey], Number(userId)));
  }

  // Only filter by status if user lacks list_all and column exists
  if (!listAllStatus && 'status' in table) {
    filters.push(eq((table as any).status, "active"));
  }

  if (filters.length > 0) query = query.where(and(...filters));
  return await query.orderBy(desc(table.id)).all();
}

export async function getRow(table: TableWithId, id: string, context: QueryContext = {}) {
  if (context.record) return context.record;
  return await db.select().from(table).where(eq(table.id, Number(id))).get();
}

export async function createRow(table: TableWithId, data: Record<string, unknown>) {
  return await db.insert(table).values(data).returning().get();
}

export async function updateRow(table: TableWithId, id: string, data: Record<string, unknown>, context: QueryContext = {}) {
  const targetId = Number(id);
  
  // Optimization: If guard already fetched and verified record, we proceed
  const [updated] = await db
    .update(table)
    .set(data)
    .where(eq(table.id, targetId))
    .returning();

  return updated;
}

export async function deleteRow(table: TableWithId, id: string, context: QueryContext = {}) {
  const targetId = Number(id);

  if (context.record) {
    await db.delete(table).where(eq(table.id, targetId)).run();
    return context.record;
  }

  return await db.delete(table).where(eq(table.id, targetId)).returning().get();
}