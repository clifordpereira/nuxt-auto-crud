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
  abilityLogic,
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

  if (!auth?.authentication) {
    return true;
  }

  // 1. Bearer Token or Query Check (Agentic/MCP Tooling)
  const authHeader = getHeader(event, "authorization");
  const query = getQuery(event);
  const apiToken = useRuntimeConfig(event).apiSecretToken;

  // Extract token from Header or fallback to Query param
  const token =
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) ||
    query.token;

  if (token && apiToken && token === apiToken) {
    return true;
  }

  // Session based (default)
  let user = null;
  try {
    const session = await (
      getUserSession as (event: H3Event) => Promise<{
        user: {
          id: string | number;
          permissions?: Record<string, string[]>;
        } | null;
      }>
    )(event);
    user = session.user;
  } catch {
    // No session or error fetching session
  }

  // Check authorization if enabled
  if (auth.authorization) {
    // If no user, fallback to the raw ability logic for guest checks
    // If user exists, use the standard 'allows' helper with our injected siteAbility
    const allowed = !user 
      ? await siteAbility(null, model, action, context) // Guest: Direct call to Bridge
      : await allows(event, siteAbility, model, action, context); // Auth: Standard Helper
      
    if (!allowed) {
      // Fallback: Check for "Own Record" permission (e.g. update_own, delete_own)
      if (
        user &&
        ["read", "update", "delete"].includes(action) &&
        context &&
        typeof context === "object" &&
        "id" in context
      ) {
        const ownAction = `${action}_own`;
        const userPermissions = user.permissions?.[model] as
          | string[]
          | undefined;

        if (userPermissions?.includes(ownAction)) {
          // Verify ownership via DB
          const { getTableForModel, getTableColumns, getHiddenFields } = await import("./modelMapper");

          const table = getTableForModel(model);

          // Special case: User updating their own profile (record.id === user.id)
          if (
            model === "users" &&
            String((context as { id: string | number }).id) === String(user.id)
          ) {
            return true;
          }

          // 2. Dynamic Ownership Check (Polymorphic)
          const columns = getTableColumns(table);
          const ownershipColumn = columns.find(col => ["createdBy", "userId", "ownerId"].includes(col));

          if (ownershipColumn) {
            // @ts-expect-error - hub:db virtual alias
            const { db } = await import("hub:db");
            const { eq } = await import("drizzle-orm");
            
            const primaryKey = (table as any).id || Object.values(columns).find(c => (c as any).primary);
            if (!primaryKey) return false;

            const rawId = (context as { id: string | number }).id;
            const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

            // @ts-expect-error - dynamic table
            const record = await db.select({ [ownershipColumn]: table[ownershipColumn] })
              .from(table)
              .where(eq(primaryKey, id))
              .get();
            
            if (record && String(record[ownershipColumn]) === String(user.id)) {
              // 3. Field-Level Guard
              const hidden = getHiddenFields(model);
              const accessingHidden = Object.keys(context || {}).some(f => hidden.includes(f));
              
              return !accessingHidden;
            }
          }
        }
      }

      if (user) throw createError({ statusCode: 403, message: "Forbidden" });
      return false;
    }
    return true;
  }

  // If authorization is NOT enabled, we rely on authentication only.
  if (user) {
    return true;
  }

  return false;
}

export async function ensureAuthenticated(event: H3Event): Promise<void> {
  const { auth } = useAutoCrudConfig();
  const runtimeConfig = useRuntimeConfig(event);

  if (!auth?.authentication) return;

  // Extract Token: Priority 1: Authorization Header | Priority 2: Query String (?token=)
  const authHeader = getHeader(event, "authorization");
  const query = getQuery(event);
  const apiToken = runtimeConfig.apiSecretToken;

  const token =
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) ||
    query.token;

  // 1. API Token Check (Agentic/MCP)
  if (token && apiToken && token === apiToken) {
    return;
  }

  // 2. Session Check (Standard UI)
  await (requireUserSession as (event: H3Event) => Promise<void>)(event);
}
