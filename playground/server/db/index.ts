import { drizzle } from "drizzle-orm/libsql";
import { createClient } from '@libsql/client';
import * as schema from "./schema";
import { relations } from "./relations";

const client = createClient({ url: process.env.DB_FILE_NAME! });
const db = drizzle({ client, schema, relations });

export default db;