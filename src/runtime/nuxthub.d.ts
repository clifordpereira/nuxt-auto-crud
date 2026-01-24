declare module '@nuxthub/kv' {
  interface Storage {
    get<T = unknown>(key: string): Promise<T | null>
    set(key: string, value: unknown, options?: { ttl?: number }): Promise<void>
  }
  export const kv: Storage
}
