// server/utils/auth.ts
import { type H3Event, createError, getHeader, getQuery, readBody } from "h3";
import { canAccess } from "../../shared/utils/abilities";

/**
 * Resolves authentication context (User session or Agentic/MCP token)
 */
export async function resolveAuthContext(event: H3Event) {
  const { auth } = useAutoCrudConfig();
  const runtimeConfig = useRuntimeConfig(event);
  
  // 1. Token Check (Agentic/MCP)
  const authHeader = getHeader(event, "authorization");
  const query = getQuery(event);
  const apiToken = runtimeConfig.apiSecretToken;
  const token = (authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null) || (query.token as string);

  if (apiToken && token === apiToken) {
    return { user: null, isAgent: true, token };
  }

  if (!auth?.authentication) {
    return { user: null, isAgent: true, token: null };
  }

  // 2. Session Resolve
  try {
    const session = await getUserSession(event);
    return { user: session?.user || null, isAgent: false, token: null };
  } catch {
    return { user: null, isAgent: false, token: null };
  }
}

/**
 * Checks if the user owns the record based on schema conventions
 */
export async function checkOwnership(user: any, model: string, action: string, context: any) {
  if (!user || !["read", "update", "delete"].includes(action) || !context?.id) return false;

  const userPermissions = user.permissions?.[model] as string[] | undefined;
  if (!userPermissions?.includes(`${action}_own`)) return false;

  // Self-update optimization for users table
  if (model === "users" && String(context.id) === String(user.id)) return true;

  const { db } = await import("hub:db");
  const { eq, getTableColumns: getDrizzleTableColumns } = await import("drizzle-orm");

  const table = getTableForModel(model);
  const columns = getTableColumns(table);
  const ownershipColumn = columns.find((c) => ["createdBy", "userId", "ownerId"].includes(c));

  if (!ownershipColumn) return false;

  const tableColumns = getDrizzleTableColumns(table as any);
  const primaryKey = Object.values(tableColumns).find((c) => (c as any).primary);

  if (!primaryKey) return false;

  const rawId = context.id;
  const id = isNaN(Number(rawId)) ? rawId : Number(rawId);

  const record = (await db
    .select({ owner: tableColumns[ownershipColumn] })
    .from(table as any)
    .where(eq(primaryKey as any, id))
    .get()) as { owner: any } | undefined;

  if (record && String(record.owner) === String(user.id)) {
    // Prevent updating hidden fields even if owned
    if (["update", "create"].includes(action)) {
      const hidden = getHiddenFields(model);
      const hasHidden = Object.keys(context).some((f) => hidden.includes(f));
      if (hasHidden) {
        throw createError({ statusCode: 403, message: "Forbidden: Hidden fields" });
      }
    }
    return true;
  }
  
  return false;
}

/**
 * Consolidated guard for NAC routes - used in server middleware
 */
export async function guardEventAccess(event: H3Event) {
  const { user, isAgent } = await resolveAuthContext(event);
  if (isAgent) return; // Full access for agents/MCP

  const { auth, endpointPrefix = "/api/_nac" } = useAutoCrudConfig();
  if (auth?.authentication === false) return; // Explicitly disabled

  // 1. Mandatory Session check
  if (!user) {
    await requireUserSession(event);
  }

  // 2. Authorization check
  if (!auth?.authorization) return;

  // Extract context from path using endpointPrefix
  const path = (event.path || '').split('?')[0];
  if (!path || !path.startsWith(endpointPrefix)) return;

  const relativePath = path.slice(endpointPrefix.length).replace(/^\//, '');
  const segments = relativePath.split('/');

  // If first segment starts with _, it's a system endpoint (e.g. _meta, _schema)
  if (!segments[0] || segments[0].startsWith('_') || segments[0] === 'sse') return;

  const model = segments[0];
  const id = segments[1];
  
  if (!model) return;

  const actionMap: Record<string, string> = {
    GET: "read",
    POST: "create",
    PATCH: "update",
    PUT: "update",
    DELETE: "delete",
  };
  const action = actionMap[event.method] || "read";

  const context: any = id ? { id } : {};
  if (["POST", "PATCH", "PUT"].includes(event.method)) {
    const body = await readBody(event).catch(() => ({}));
    Object.assign(context, body);
  }

  // Check permissions via bridge
  const allowed = await allows(event, canAccess, model, action, context);
  if (allowed) return;

  // Ownership Fallback
  if (await checkOwnership(user, model, action, context)) return;

  throw createError({ statusCode: 403, message: "Forbidden" });
}