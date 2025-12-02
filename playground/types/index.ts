import type { InferSelectModel } from 'drizzle-orm'
import type * as schema from '../server/database/schema'

export type Customer = InferSelectModel<typeof schema.customers>
export type Product = InferSelectModel<typeof schema.products>
export type Order = InferSelectModel<typeof schema.orders>
