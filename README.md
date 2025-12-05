# Nuxt Auto CRUD

> **Note:** This module is currently in its alpha stage. However, you can use it to accelerate MVP development. It has not been tested thoroughly enough for production use; only happy-path testing is performed for each release.

Auto-generate RESTful CRUD APIs for your **Nuxt** application based solely on your database schema. Minimal configuration required.

**Core Philosophy:**
The main objective of this module is to **expose CRUD APIs without the need for writing code**. You define your database schema, and `nuxt-auto-crud` handles the rest.

You don't need to setup an extra server or database to create an MVP of an application. The Nuxt (Nitro) server and SQLite can save you time and money.
And you don't need a separate Strapi or Supabase setup to automate your CRUD process. `nuxt-auto-crud` will help you with that and accelerate your development exponentially.

While we provide a playground with a CMS-like interface, this is primarily to demonstrate the capabilities. You are expected to build your own frontend application to consume these APIs.

- [✨ Release Notes](/CHANGELOG.md)
- [🎮 Try the Playground](/playground)

## 🚀 CRUD APIs are ready to use without code

Once installed, your database tables automatically become API endpoints:

- `GET /api/:model` - List all records
- `POST /api/:model` - Create a new record
- `GET /api/:model/:id` - Get record by ID
- `PATCH /api/:model/:id` - Update record
- `DELETE /api/:model/:id` - Delete record

## 📦 How to install

### 1. Fullstack Template (Recommended)

Start a new project with everything pre-configured using our template:

```bash
npx nuxi init -t gh:clifordpereira/nuxt-auto-crud_template <project-name>
cd <project-name>
bun install
bun db:generate
bun run dev
```

**Template Usage Modes:**

1.  **Fullstack App**: The template includes the `nuxt-auto-crud` module, providing both the backend APIs and the frontend UI.
2.  **Frontend Only**: You can use the template just for the frontend. In this case, you don't need to install the module in the frontend app. Instead, you would install `nuxt-auto-crud` in a separate backend setup (e.g., another Nuxt project acting as the API).

Detailed instructions can be found in [https://auto-crud.clifland.in/](https://auto-crud.clifland.in/)

### 2. Manual Setup (Existing Project)

If you want to add `nuxt-auto-crud` to an existing project, follow these steps:

> **Note:** These instructions assume you are using NuxtHub. If you are using a custom SQLite setup (e.g. better-sqlite3, Turso), please see [Custom Setup](./custom-setup.md).

#### Install dependencies

```bash
# Install module and required dependencies
npm install nuxt-auto-crud @nuxthub/core@latest drizzle-orm
npm install --save-dev wrangler drizzle-kit

# Or using bun
bun add nuxt-auto-crud @nuxthub/core@latest drizzle-orm
bun add --dev wrangler drizzle-kit
```

#### Configure Nuxt

Add the modules to your `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxthub/core', 'nuxt-auto-crud'],

  hub: {
    database: true,
  },

  autoCrud: {
    schemaPath: 'server/database/schema',
    // auth: false,
    auth: {
      type: 'session', // for Normal Authentication with nuxt-auth-utils
      authentication: true,
      authorization: true,
    },
  },
})
```

#### Configure Drizzle

Add the generation script to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate"
  }
  // ...
}
```

Create `drizzle.config.ts` in your project root:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema/index.ts', // Point to your schema index file
  out: './server/database/migrations'
})
```

#### Setup Database Connection

Create `server/utils/drizzle.ts` to export the database instance:

```typescript
// server/utils/drizzle.ts
import { drizzle } from 'drizzle-orm/d1'
export { sql, eq, and, or } from 'drizzle-orm'

import * as schema from '../database/schema'

export const tables = schema

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema })
}

export type User = typeof schema.users.$inferSelect
```

#### Define your database schema

Create your schema files in `server/database/schema/`. For example, `server/database/schema/users.ts`:

```typescript
// server/database/schema/users.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  avatar: text('avatar').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
```

> **Note:** The `organization.ts` and `cms.ts` files you might see in the playground are just examples and are commented out by default. You should implement a robust schema tailored to your production needs.

#### Adding New Schemas

To add a new table (e.g., `posts`), simply create a new file in your schema directory:

```typescript
// server/database/schema/posts.ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'
import { users } from './users'

export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorId: integer('author_id').references(() => users.id),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})
```

Then, ensure it is exported in your `server/database/schema/index.ts` (if you are using an index file) or that your `drizzle.config.ts` is pointing to the correct location.

```typescript
// server/database/schema/index.ts
export * from './users'
export * from './posts'
```

After adding the file, run the generation script:

```bash
bun db:generate
```

The new API endpoints (e.g., `/api/posts`) will be automatically available.

#### Run the project

```bash
cd <project-name>
bun db:generate
bun run dev
```

That's it! 🎉 Your CRUD APIs are now available at `/api/users`.

### 3. Backend-only App (API Mode)

If you are using Nuxt as a backend for a separate client application (e.g., mobile app, SPA), you can use this module to quickly generate REST APIs.

In this case, you might handle authentication differently (e.g., validating tokens in middleware) or disable the built-in auth checks if you have a global auth middleware.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-auto-crud'],
  autoCrud: {
    schemaPath: 'server/database/schema',
    // auth: false, // Uncomment this line for testing APIs without auth   
    auth: {
      type: 'jwt', // for app providing backend apis only
      authentication: true,
      authorization: true,
      jwtSecret: process.env.NUXT_JWT_SECRET || 'test-secret-key-123',
    },
  },
})
```

**Note:** Remember to add your `NUXT_JWT_SECRET` in `.env`.

You should also configure `drizzle.config.ts` correctly:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema/index.ts',
  out: './server/database/migrations',
  tablesFilter: ['!_hub_migrations'],
})
```

## 🔐 Authentication Configuration

The module enables authentication by default. To test APIs without authentication, you can set `auth: false`.

### Session Auth (Default)

Requires `nuxt-auth-utils` and `nuxt-authorization`.

```typescript
export default defineNuxtConfig({
  autoCrud: {
    auth: {
      type: 'session',
      authentication: true, // Enables requireUserSession() check
      authorization: true // Enables authorize(model, action) check
    }
  }
})
```

### JWT Auth

Useful for backend-only apps.

```typescript
export default defineNuxtConfig({
  autoCrud: {
    auth: {
      type: 'jwt',
      authentication: true,
      jwtSecret: process.env.JWT_SECRET,
      authorization: true
    }
  }
})
```

## 🛡️ Resource Configuration (RBAC)

You can define fine-grained access control and resource policies using `autocrud.config.ts` in your project root. This file is optional and useful when you need specific rules per resource.

```typescript
// autocrud.config.ts
export default {
  resources: {
    users: {
      // Access Control
      auth: {
        // Admin has full access
        admin: true,
        // Public (unauthenticated) users can only list and read
        public: ['list', 'read'],
      },
      // Field Visibility
      publicColumns: ['id', 'name', 'avatar'], // Only these columns are returned to public users
    },
  }
}
```

## ⚠️ Known Issues

- **Foreign Key Naming:** Currently, if you have multiple foreign keys referring to the same table (e.g., `customer_id` and `author_id` both referring to the `users` table), the automatic relation handling might assume `user_id` for both. This is a known limitation in the current alpha version.

## 🎮 Try the Playground

Want to see it in action? Clone this repo and try the playground:

```bash
# Clone the repository
git clone https://github.com/clifordpereira/nuxt-auto-crud.git
cd nuxt-auto-crud

# Install dependencies (parent folder)
bun install

# Run the playground (Fullstack)
cd playground
bun install
bun db:generate
bun run dev
```

## 📖 Usage Examples

### Create a Record

```typescript
const user = await $fetch("/api/users", {
  method: "POST",
  body: {
    name: "Cliford Pereira",
    email: "clifordpereira@gmail.com",
    bio: "Full-Stack Developer",
  },
});
```

### Get All Records

```typescript
const users = await $fetch("/api/users");
```

### Get Record by ID

```typescript
const user = await $fetch("/api/users/1");
```

### Update a Record

```typescript
const updated = await $fetch("/api/users/1", {
  method: "PATCH",
  body: {
    bio: "Updated bio",
  },
});
```

### Delete a Record

```typescript
await $fetch("/api/users/1", {
  method: "DELETE",
  headers: {
    // If auth is enabled
    Authorization: 'Bearer ...' 
  }
});
```

## Configuration

### Module Options

```typescript
export default defineNuxtConfig({
  autoCrud: {
    // Path to your database schema file (relative to project root)
    schemaPath: "server/database/schema", // default
  },
});
```

### Protected Fields

By default, the following fields are protected from updates:

- `id`
- `createdAt`
- `created_at`
- `updatedAt`
- `updated_at`

You can customize updatable fields in your schema by modifying the `modelMapper.ts` utility.

### Hidden Fields

By default, the following fields are hidden from API responses for security:

- `password`
- `secret`
- `token`

You can customize hidden fields by modifying the `modelMapper.ts` utility.

## 🔧 Requirements

- Nuxt 3 or 4
- Drizzle ORM (SQLite)
- NuxtHub (Recommended) or [Custom SQLite Setup](./custom-setup.md)

## 🤝 Contributing

Contributions are welcome! Please check out the [contribution guide](/CONTRIBUTING.md).

## 📝 License

[MIT License](./LICENSE)

## 👨‍💻 Author

Made with ❤️ by [Cliford Pereira](https://github.com/clifordpereira)
