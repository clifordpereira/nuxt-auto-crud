import { eq, desc } from "drizzle-orm";
// @ts-expect-error - hub:db is a virtual alias
import { db } from "hub:db";
import type { TableWithId } from "../types";
import { useRuntimeConfig } from "#imports";


export async function deleteRow( table: TableWithId, id: string, context: { record?: Record<string, any> } = {}) {
  const targetId = Number(id);

  // If record is pre-verified by guard, delete via .run() to skip RETURNING overhead
  if (context.record) {
    await db.delete(table).where(eq(table.id, targetId)).run();
    return context.record;
  }

  const [deleted] = await db.delete(table).where(eq(table.id, targetId)).returning();
  return deleted;
}

export async function getRow( table: TableWithId, id: string, context: { record?: Record<string, unknown> } = {}) {
  // If record is pre-verified by guard, return it
  if (context.record) return context.record;

  return await db.select().from(table).where(eq(table.id, Number(id))).get();
}

export async function updateRow( table: TableWithId, id: string, data: Record<string, any>) {
  const targetId = Number(id);

  const [updated] = await db
    .update(table)
    .set(data)
    .where(eq(table.id, targetId))
    .returning();

  return updated;
}

export async function getRows( table: TableWithId, context: { restriction?: string | null; userId?: number | string } = {}) {
  const { restriction, userId } = context;
  let query = db.select().from(table).$dynamic();

  if (restriction === "own" && userId) {
    const ownerKey = useRuntimeConfig().autoCrud.auth?.ownerKey || "createdBy";
    query = query.where(eq((table as any)[ownerKey], Number(userId)));
  }

  return await query.orderBy(desc(table.id)).all();
}

export async function createRow( table: TableWithId, data: Record<string, unknown>) {
  return await db.insert(table).values(data).returning().get();
}
