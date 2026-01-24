declare module '@nuxthub/kv' {
  interface Storage {
    get<T = any>(key: string): Promise<T | null>
    set(key: string, value: any, options?: { ttl?: number }): Promise<void>
  }
  export const kv: Storage
}
