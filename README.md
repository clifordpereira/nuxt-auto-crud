# Nuxt Ghost API

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

Auto-generate RESTful CRUD APIs for your Nuxt app based solely on your database schema. No configuration needed!

- [✨ Release Notes](/CHANGELOG.md)
- [🎮 Try the Playground](/playground)

## ✨ Features

- 🔄 **Auto-Detection** - Automatically detects all tables from your Drizzle schema
- 🚀 **Zero Configuration** - Just define your schema, APIs are generated automatically
- 🛡️ **Protected Fields** - Automatically protects `id` and `createdAt` fields from updates
- 📝 **Full CRUD** - Complete Create, Read, Update, Delete operations out of the box
- 🎯 **Type-Safe** - Fully typed with TypeScript support
- 🔌 **Works with NuxtHub** - Seamlessly integrates with NuxtHub database

## 📦 Quick Setup

### 1. Install the module

```bash
bun add nuxt-auto-crud
# or
npm install nuxt-auto-crud
```

### 2. Add to your Nuxt config

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxthub/core", "nuxt-auto-crud"],

  hub: {
    database: true,
  },

  ghostApi: {
    schemaPath: "server/database/schema", // default value
  },
});
```

### 3. Define your database schema

```typescript
// server/database/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  published: integer("published", { mode: "boolean" }).default(false),
  authorId: integer("author_id").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});
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

# Install dependencies
bun install

# Run the playground
cd playground
bun install
bun run dev
```

The playground includes a sample schema with users, posts, and comments tables, plus an interactive UI to explore all the features.

## 📖 Usage Examples

### Create a Record

```typescript
const user = await $fetch("/api/users", {
  method: "POST",
  body: {
    name: "John Doe",
    email: "john@example.com",
    bio: "Software developer",
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

## ⚙️ Configuration

### Module Options

```typescript
export default defineNuxtConfig({
  ghostApi: {
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

## 🔧 Requirements

- Nuxt 3 or 4
- NuxtHub (for database functionality)
- Drizzle ORM

## 🤝 Contributing

Contributions are welcome! Please check out the [contribution guide](/CONTRIBUTING.md).

<details>
  <summary>Local development</summary>
  
  ```bash
  # Install dependencies
  bun install
  
  # Generate type stubs
  bun run dev:prepare
  
  # Develop with the playground
  bun run dev
  
  # Build the playground
  bun run dev:build
  
  # Run ESLint
  bun run lint
  
  # Run Vitest
  bun run test
  bun run test:watch
  
  # Release new version
  bun run release
  ```

</details>

## 📝 License

[MIT License](./LICENSE)

## 👨‍💻 Author

Made with ❤️ by [Cliford Pereira](https://github.com/clifordpereira)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/nuxt-auto-crud/latest.svg?style=flat&colorA=020420&colorB=00DC82
[npm-version-href]: https://npmjs.com/package/nuxt-auto-crud
[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-auto-crud.svg?style=flat&colorA=020420&colorB=00DC82
[npm-downloads-href]: https://npm.chart.dev/nuxt-auto-crud
[license-src]: https://img.shields.io/npm/l/nuxt-auto-crud.svg?style=flat&colorA=020420&colorB=00DC82
[license-href]: https://npmjs.com/package/nuxt-auto-crud
[nuxt-src]: https://img.shields.io/badge/Nuxt-020420?logo=nuxt.js
[nuxt-href]: https://nuxt.com
