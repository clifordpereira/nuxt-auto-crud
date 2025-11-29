# Nuxt Auto CRUD



> **Note:** This module is currently in its alpha stage. However, you can use it to accelerate MVP development. It has not been tested thoroughly enough for production use; only happy-path testing is performed for each release.

Auto-generate RESTful CRUD APIs for your **Nuxt** application based solely on your database schema. No configuration needed!

- [✨ Release Notes](/CHANGELOG.md)
- [🎮 Try the Playground](/playground)

## 🚀 CRUD APIs are ready to use without code

- `GET /api/:model` - List all records
- `POST /api/:model` - Create a new record
- `GET /api/:model/:id` - Get record by ID
- `PATCH /api/:model/:id` - Update record
- `DELETE /api/:model/:id` - Delete record

## 📦 How to install

### New Project (Recommended)

Start a new project with everything pre-configured using our template:

```bash
npx nuxi init -t gh:clifordpereira/nuxt-auto-crud_template <project-name>
cd <project-name>
bun install
bun db:generate
bun run dev
```

Detailed instructions can be found in [https://auto-crud.clifland.in/](https://auto-crud.clifland.in/)

### Add User
Open Nuxt DevTools (bottom-middle icon) > `...` menu > **Database** icon to add users.
    > **Note:** If the users table doesn't appear, restart the server (`Ctrl + C` and `bun run dev`).

That's it! You can now access the APIs:

### Test API
Visit [http://localhost:3000/api/users](http://localhost:3000/api/users).

### Existing Project

If you want to add `nuxt-auto-crud` to an existing project, follow these steps:

> **Note:** These instructions assume you are using NuxtHub. If you are using a custom SQLite setup (e.g. better-sqlite3, Turso), please see [Custom Setup](./custom-setup.md).

### 1. Install dependencies

```bash
# Install module and required dependencies
bun add nuxt-auto-crud @nuxthub/core@latest drizzle-orm
bun add --dev wrangler drizzle-kit
```

### 2. Configure Nuxt

Add the modules to your `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxthub/core', 'nuxt-auto-crud'],

  hub: {
    database: true,
  },

  autoCrud: {
    schemaPath: 'server/database/schema', // default value
  },
})
```

### 3. Configure Drizzle

Add the generation script to your `package.json`:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate"
  }
}
```

Create `drizzle.config.ts` in your project root:

```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './server/database/schema.ts',
  out: './server/database/migrations'
})
```

### 4. Setup Database Connection

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

### 5. Define your database schema

Create `server/database/schema.ts`:

```typescript
// server/database/schema.ts
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

### 6. Run the project

```bash
cd <project-name>
bun db:generate
bun run dev
```

That's it! 🎉 Your CRUD APIs are now available:

- `GET /api/users` - List all users
- `POST /api/users` - Create a new user
- `GET /api/users/:id` - Get user by ID
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

_(Same endpoints for all your tables!)_

## 🎮 Try the Playground

Want to see it in action? Clone this repo and try the playground:

```bash
# Clone the repository
git clone https://github.com/clifordpereira/nuxt-auto-crud.git
cd nuxt-auto-crud

# Install dependencies (parent folder)
bun install

# Run the playground (fullstack with auth)
cd playground-fullstack
bun install
bun db:generate
bun run dev
```

The playground includes a sample schema with users, posts, and comments tables, plus an interactive UI to explore all the features.

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
});
```

## Use Cases

### 1. Full-stack App (with Auth)

If you are building a full-stack Nuxt application, you can easily integrate `nuxt-auth-utils` and `nuxt-authorization` to secure your auto-generated APIs.

First, install the modules:

```bash
npx nuxi@latest module add auth-utils
npm install nuxt-authorization
```

Then, configure `nuxt-auto-crud` in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    'nuxt-auto-crud',
    'nuxt-auth-utils'
  ],
  autoCrud: {
    auth: {
      enabled: true, // Enables requireUserSession() check
      authorization: true // Enables authorize(model, action) check
    }
  }
})
```

When `authorization` is enabled, the module will call `authorize(model, action)` where action is one of: `create`, `read`, `update`, `delete`.

### 2. Backend-only App (API Mode)

If you are using Nuxt as a backend for a separate client application (e.g., mobile app, SPA), you can use this module to quickly generate REST APIs.

In this case, you might handle authentication differently (e.g., validating tokens in middleware) or disable the built-in auth checks if you have a global auth middleware.

```ts
export default defineNuxtConfig({
  modules: ['nuxt-auto-crud'],
  autoCrud: {
    auth: {
      enabled: false, // Default
      authorization: false // Default
    }
  }
})
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


