// playground/shared/utils/abilities.ts
import { defineAbility } from "nuxt-authorization/utils";
import {
  hasPermission,
  hasOwnershipPermission,
  type AuthUser,
} from "./auth-logic";

// Global state to persist across renders/requests
let publicPermissionsCache: Record<string, string[]> | null = null;
let isFetching = false;
let lastFetchTime = 0;
const TTL = 60000;

export async function abilityLogic(
  user: unknown,
  model: string,
  action: string,
) {
  const userRecord = user as AuthUser;

  // 1. Priority Check: Static Roles
  if (userRecord?.role === "admin") return true;

  // 2. Permission Check: Explicit or Ownership tokens
  if (userRecord) {
    if (
      hasPermission(userRecord, model, action) ||
      hasOwnershipPermission(userRecord, model, action)
    ) {
      return true;
    }
  }

  // 3. Public Permissions: Gated Fetch
  const now = Date.now();
  const isExpired = now - lastFetchTime > TTL;

  if ((!publicPermissionsCache && !isFetching) || (isExpired && !isFetching)) {
    isFetching = true;
    try {
      publicPermissionsCache = await $fetch<Record<string, string[]>>(
        "/api/public-permissions",
      );
      lastFetchTime = now;
    } catch (e) {
      console.error("NAC_AUTH_ERROR: Public permissions fetch failed", e);
      publicPermissionsCache = publicPermissionsCache || {};
    } finally {
      isFetching = false;
    }
  }

  const resourcePublicPermissions = publicPermissionsCache?.[model];
  return (
    Array.isArray(resourcePublicPermissions) &&
    resourcePublicPermissions.includes(action)
  );
}

export const canAccess = defineAbility(abilityLogic);
