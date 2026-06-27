/**
 * The schema path to make this import dynamic
 * @default 'server/db/schema'
 */
declare module '#nac/schema' {
  const schema: Record<string, unknown>
  export default schema
}

export {}
