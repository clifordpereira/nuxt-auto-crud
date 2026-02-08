// src/runtime/types/index.d.ts
declare module '#site/schema' {
  const schema: Record<string, unknown>
  export default schema
}

export interface QueryContext {
  /** 'own' limits queries to createdBy, 'all' ignores restrictions */
  restriction?: 'own' | 'all' | string | null;
  /** Normal query will only return active status records */
  listAllStatus?: boolean;
  /** The authenticated user's unique identifier */
  userId?: number | string;
  /** Pre-fetched record from guards to avoid redundant DB hits */
  record?: Record<string, unknown>;
}

export {}
