// server/utils/auth.ts
import { type H3Event, createError, getHeader, getQuery, readBody } from "h3";
import { canAccess } from "../../shared/utils/abilities";
import { hasOwnershipPermission, isOwner, OWNERSHIP_ACTIONS } from "../../shared/utils/auth-logic";

/**
 * Resolves authentication context (User session or Agentic/MCP token)
 */
async function resolveAuthContext(event: H3Event) {
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
    return { user: null, isAgent: false, token: null };
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
/**
 * Checks if the user owns the record based on schema conventions
 */
async function checkOwnership(user: any, model: string, action: string, context: any) {
  if (!user || !OWNERSHIP_ACTIONS.includes(action as any) || !context?.id) return false;
  if (!hasOwnershipPermission(user, model, action)) return false;

  // 1. Context-based check (fast)
  if (isOwner(user, model, context)) return true;

  // 2. DB Fallback (optimized)
  try {
    const { eq, getTableColumns } = await import("drizzle-orm");
    const { db } = await import("hub:db");
    const table = getTableForModel(model);

    if (!table) return false;

    const tableColumns = getTableColumns(table as any);
    const keys = Object.keys(tableColumns);
    
    // Ownership convention lookup
    const ownershipColumn = ["ownerId", "createdBy", "userId"].find(k => keys.includes(k));
    if (!ownershipColumn) return false;

    const pkEntry = Object.entries(tableColumns).find(([_, c]) => (c as any).primary);
    if (!pkEntry) return false;
    const [_, pkColumn] = pkEntry;

    // Type-safe ID casting
    const isInt = (pkColumn as any).columnType?.includes('integer');
    const id = isInt && !isNaN(Number(context.id)) ? Number(context.id) : context.id;

    const record = await db
      .select({ owner: tableColumns[ownershipColumn] })
      .from(table as any)
      .where(eq(pkColumn as any, id))
      .get() as { owner: any } | undefined;

    if (record && String(record.owner) === String(user.id)) {
      if (["update", "create"].includes(action)) {
        const hidden = getHiddenFields(model);
        const hasHidden = Object.keys(context).some((f) => keys.includes(f) && hidden.includes(f));
        if (hasHidden) throw createError({ statusCode: 403, message: "Forbidden: Hidden fields" });
      }
      return true;
    }
  } catch (e: any) {
    if (e.statusCode === 403) throw e;
    return false;
  }
  
  return false;
}

/**
 * Consolidated guard for NAC routes - used in server middleware
 */
// server/utils/auth.ts
export async function guardEventAccess(event: H3Event) {
  const { user, isAgent } = await resolveAuthContext(event);
  if (isAgent) return;

  const { auth, endpointPrefix = "/api/_nac" } = useAutoCrudConfig();
  const path = event.path ?? '';

  if (auth?.authentication === false || !path.startsWith(endpointPrefix)) return;

  const relativePath = path.slice(endpointPrefix.length).replace(/^\//, '');
  const segments = relativePath.split('/');
  const model = segments[0];
  const id = segments[1];

  // Allow system routes (starting with _) to pass through without session check
  if (!model || model.startsWith('_')) return;

  // Assert user existence for subsequent logic
  if (!user) {
    throw createError({ 
      statusCode: 401, 
      statusMessage: "Unauthorized: Session required" 
    });
  }

  const actionMap: Record<string, string> = {
    GET: "read", POST: "create", PATCH: "update", PUT: "update", DELETE: "delete",
  };
  const action = actionMap[event.method] || "read";

  const allowed = await allows(event, canAccess, model, action);
  if (!allowed) throw createError({ statusCode: 403 });

  // Use non-null assertion 'user!' since we've passed requireUserSession
  const permissions = user.permissions?.[model] || [];
  const hasGlobal = permissions.includes(action);
  const hasOwn = permissions.includes(`${action}_own`);

  if (user.role !== 'admin' && !hasGlobal && hasOwn) {
    const body = ["POST", "PATCH", "PUT"].includes(event.method) 
      ? await readBody(event).catch(() => ({})) 
      : {};
    
    if (!(await checkOwnership(user, model, action, { id, ...body }))) {
      throw createError({ statusCode: 403, message: "Ownership required" });
    }
  }
}