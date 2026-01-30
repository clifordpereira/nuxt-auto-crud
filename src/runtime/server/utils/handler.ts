import { createError } from "h3";
import type { H3Event } from "h3";

import { sanitizeResource } from "./modelMapper";

import { useAutoCrudConfig } from "./config";

export async function ensureResourceAccess(
  event: H3Event,
  model: string,
  action: string,
  context?: unknown,
): Promise<boolean> {
  return true;
}

export async function hashPayloadFields(
  payload: Record<string, unknown>,
): Promise<void> {
  // Auto-hash fields based on config (default: ['password'])
  const { hashedFields } = useAutoCrudConfig();

  if (hashedFields) {
    for (const field of hashedFields) {
      if (payload[field] && typeof payload[field] === "string") {
        // @ts-expect-error - hashPassword is auto-imported from nuxt-auth-utils or stub
        payload[field] = await hashPassword(payload[field]);
      }
    }
  }
}

export function formatResourceResult(
  model: string,
  data: Record<string, unknown> | Record<string, unknown>[] | null | undefined,
  isGuest: boolean,
) {
  if (!data) return data;

  const sanitize = (item: Record<string, unknown>) => sanitizeResource(model, item, isGuest);

  if (Array.isArray(data)) {
    return data.map(sanitize);
  }

  return sanitize(data);
}
