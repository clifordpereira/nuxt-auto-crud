import type { H3Event } from "h3";
import { useAutoCrudConfig } from "./config";
// @ts-expect-error - virtual alias
import { checkAdminAccess } from "#imports";

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