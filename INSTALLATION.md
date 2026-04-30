# nuxt-auto-crud Installation Guide 

## (MySQL)
### Option A: Starter Template
Visit [nac-starter-mysql](https://github.com/clifordpereira/nac-starter-mysql) for instructions.

### Option B: Manual Installation

```bash
bun create nuxt@latest my-app
cd my-app
npx nuxi module add hub
bun add drizzle-orm@beta mysql2 nuxt-auto-crud
bun add -D drizzle-kit@beta typescript
```

#### Configuration

Update `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxthub/core',
    'nuxt-auto-crud'
  ],
  hub: {
    db: 'mysql'
  }
})

```

#### Schema Definition (MySQL)

Define your schema in `server/db/schema.ts`:

```typescript
import { mysqlTable, serial, timestamp, varchar } from 'drizzle-orm/mysql-core'

export const users = mysqlTable('users', {
  id: serial().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatar: varchar('avatar', { length: 512 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
})

```

#### Using Docker for MySQL

If Docker is installed, place the [docker-compose.yml](https://github.com/clifordpereira/nac-starter-mysql/docker-compose.yml) in your project root.

Execute the following to manage the MySQL service:

```bash
# Start service
docker compose up -d

# Stop service
# docker compose down

# Purge data
# docker compose down -v
```

Create a .env file with the following content:

```env
DATABASE_URL="mysql://root:root@127.0.0.1:3306/nac_db"
```

### Generate Migrations and Start Dev Server

```bash
nuxt db generate
nuxt dev

```
---

> Visit [README.md](https://github.com/clifordpereira/nuxt-auto-crud/README.md) for complete feature documentation.
