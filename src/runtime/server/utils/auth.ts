// server/utils/auth.ts
import type { H3Event } from "h3";
import { createError, getHeader, getQuery } from "h3";

// @ts-expect-error - virtual alias
import siteAbility from "#site/ability";
// @ts-expect-error - #imports is a virtual alias
import {
  requireUserSession,
  allows,
  getUserSession,
  useRuntimeConfig,
} from "#imports";

import { useAutoCrudConfig } from "./config";

export async function checkAdminAccess(
  event: H3Event,
  model: string,
  action: string,
  context?: unknown,
): Promise<boolean> {
  const { auth } = useAutoCrudConfig();

  if (!auth?.authentication) return true;

  const authHeader = getHeader(event, "authorization");
  const query = getQuery(event);
  const apiToken = useRuntimeConfig(event).apiSecretToken;

  const token = (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) || query.token;

  if (token && apiToken && token === apiToken) return true;

  let user = null;
  try {
    const session = await (getUserSession as any)(event);
    user = session.user;
  } catch {}

  if (auth.authorization) {
    const allowed = !user 
      ? await siteAbility(null, model, action, context) 
      : await allows(event, siteAbility, model, action, context);

    if (!allowed) {
      if (
        user &&
        ["read", "update", "delete"].includes(action) &&
        context &&
        typeof context === "object" &&
        "id" in context
      ) {
        const ownAction = `${action}_own`;
        const userPermissions = user.permissions?.[model] as string[] | undefined;

        if (userPermissions?.includes(ownAction)) {
          const { getTableForModel, getTableColumns, getHiddenFields } = await import("./modelMapper");
          const table = getTableForModel(model);

          if (model === "users" && String((context as any).id) === String(user.id)) {
            return true;
          }

          const columns = getTableColumns(table);
          const ownershipColumn = columns.find(col => ["createdBy", "userId", "ownerId"].includes(col));

          if (ownershipColumn) {
            // @ts-expect-error - hub:db virtual alias
            const { db } = await import("hub:db");
            const { eq } = await import("drizzle-orm");
            
            const primaryKey = Object.values(columns).find(c => (c as any).primary);
            if (!primaryKey) return false;

            const rawId = (context as { id: string | number }).id;
            const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

            // Selective fetch aliased to 'owner'
            // @ts-expect-error - dynamic table
            const record = await db.select({ owner: table[ownershipColumn] })
              .from(table)
              .where(eq(primaryKey as any, id))
              .get();
            
            if (record && String(record.owner) === String(user.id)) {
              const hidden = getHiddenFields(model);
              
              if (action === 'update' || action === 'create') {
                const accessingHidden = Object.keys(context || {}).some(f => hidden.includes(f));
                if (accessingHidden) return false; 
              }
              return true; 
            }
          }
        }
      }

      if (user) throw createError({ statusCode: 403, message: "Forbidden" });
      return false;
    }
    return true;
  }

  return !!user;
}

export async function ensureAuthenticated(event: H3Event): Promise<void> {
  const { auth } = useAutoCrudConfig();
  if (!auth?.authentication) return;

  const authHeader = getHeader(event, "authorization");
  const query = getQuery(event);
  const apiToken = useRuntimeConfig(event).apiSecretToken;
  const token = (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) || query.token;

  if (token && apiToken && token === apiToken) return;

  await (requireUserSession as any)(event);
}