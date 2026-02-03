// server/utils/auth.ts
import { type H3Event, createError, getHeader, getQuery } from "h3";

export async function checkAdminAccess(
  event: H3Event,
  model: string,
  action: string,
  context?: any,
): Promise<boolean> {
  const { auth } = useAutoCrudConfig();
  if (!auth?.authentication) return true;

  // Lazy load Nuxt/Auth helpers only if authentication is enabled
  // 1. Token Check (Agentic/MCP)
  const authHeader = getHeader(event, "authorization");
  const query = getQuery(event);
  const apiToken = useRuntimeConfig(event).apiSecretToken;
  const token =
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) ||
    query.token;

  if (token && apiToken && token === apiToken) return true;

  // 2. Session Resolve
  let user = null;
  try {
    const session = await (getUserSession as any)(event);
    user = session?.user;
  } catch {}

  if (!auth.authorization) return !!user;

  // 3. Primary Authorization (Bridge)
  const allowed = !user
    ? await abilityLogic(null, model, action, context)
    : await allows(event, abilityLogic, model, action, context);

  if (allowed) return true;

  // 4. Ownership Fallback Logic
  if (user && ["read", "update", "delete"].includes(action) && context?.id) {
    const userPermissions = user.permissions?.[model] as string[] | undefined;

    if (userPermissions?.includes(`${action}_own`)) {
      const { getTableForModel, getTableColumns, getHiddenFields } =
        await import("../../../src/runtime/server/utils/modelMapper");
      const { db } = await import("hub:db");
      const { eq, getTableColumns: getDrizzleColumns } =
        await import("drizzle-orm");

      const table = getTableForModel(model);

      // Self-update optimization
      if (model === "users" && String(context.id) === String(user.id))
        return true;

      const columns = getTableColumns(table);
      const ownershipColumn = columns.find((c) =>
        ["createdBy", "userId", "ownerId"].includes(c),
      );

      if (ownershipColumn) {
        const tableColumns = getDrizzleColumns(table as any);
        const primaryKey = Object.values(tableColumns).find(
          (c) => (c as any).primary,
        );

        if (primaryKey) {
          const rawId = context.id;
          const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

          const record = await db
            .select({ owner: tableColumns[ownershipColumn] })
            .from(table)
            .where(eq(primaryKey as any, id))
            .get();

          if (record && String(record.owner) === String(user.id)) {
            const hidden = getHiddenFields(model);
            if (["update", "create"].includes(action)) {
              const hasHidden = Object.keys(context).some((f) =>
                hidden.includes(f),
              );
              if (hasHidden)
                throw createError({
                  statusCode: 403,
                  message: "Forbidden: Hidden fields",
                });
            }
            return true;
          }
        }
      }
    }
  }

  if (user) throw createError({ statusCode: 403, message: "Forbidden" });
  return false;
}

export async function ensureAuthenticated(event: H3Event): Promise<void> {
  const { auth } = useAutoCrudConfig();
  if (!auth?.authentication) return;

  const authHeader = getHeader(event, "authorization");
  const token =
    (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) ||
    getQuery(event).token;
  const apiToken = useRuntimeConfig(event).apiSecretToken;

  if (token && apiToken && token === apiToken) return;

  await (requireUserSession as any)(event);
}

export async function ensureResourceAccess(
  event: H3Event,
  model: string,
  action: string,
  context?: unknown,
): Promise<boolean> {
  const { auth } = useAutoCrudConfig();
  
  // Explicitly bypass ONLY if authentication is strictly set to false
  if (auth?.authentication === false) {
    return true;
  }

  // Otherwise, delegate to the engine (Security by Default)
  return await checkAdminAccess(event, model, action, context);
}