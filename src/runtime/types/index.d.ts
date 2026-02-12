// src/runtime/types/index.d.ts
declare module '#nac/schema' {
  const schema: Record<string, unknown>
  export default schema
}

export interface QueryContext {
  userId?: number | string;
  record?: Record<string, unknown>;
  permissions?: string[];
}

export {}
