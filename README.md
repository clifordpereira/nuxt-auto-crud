# Nuxt Auto CRUD

> **Note:** This module is production-ready and actively maintained. The core CRUD API is stable. Minor breaking changes may occasionally occur in advanced features or configuration. We recommend version pinning for production deployments.

Auto-expose RESTful CRUD APIs for your **Nuxt** application based solely on your database schema. Minimal configuration required.

**Core Philosophy:**
The main objective of this module is to **expose CRUD APIs without the need for writing code**. You define your database schema, and `nuxt-auto-crud` handles the rest.

You don't need to setup an extra server or database to create an MVP of an application. The Nuxt (Nitro) server and SQLite can save you time and money.
And you don't need a separate Strapi or Supabase setup to automate your CRUD process. `nuxt-auto-crud` will help you with that and accelerate your development exponentially.

While this module exposes CRUD APIs, you are expected to build your own frontend application to consume them.

- [✨ Release Notes](/CHANGELOG.md)
- [🗺️ Roadmap](/ROADMAP.md)
- [🎮 Try the Playground](/playground)

## 🚀 CRUD APIs are ready to use without code

Once installed, your database tables' CRUD APIs are exposed in a controlled manner:

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

1.  **Fullstack App**: The template includes the `nuxt-auto-crud` module, providing both the backend APIs and the frontend UI. [Watch Demo](https://youtu.be/M9-koXmhB9k)
2.  **Frontend Only**: You can use the template just for the frontend. In this case, you don't need to install the module in the frontend app. Instead, you would install `nuxt-auto-crud` in a separate backend setup (e.g., another Nuxt project acting as the API).

Detailed instructions can be found in [https://auto-crud.clifland.in/docs/auto-crud](https://auto-crud.clifland.in/docs/auto-crud)

### 2. Manual Setup (Existing Project)

If you want to add `nuxt-auto-crud` to an existing project, follow these steps:

> **Note:** These instructions have been simplified for NuxtHub.

#### Install dependencies

```bash
npm install nuxt-auto-crud @nuxthub/core@^0.10.0 drizzle-orm
npm install nuxt-auth-utils nuxt-authorization  # Optional: for authentication
npm install --save-dev wrangler drizzle-kit
```

> You can also use `bun` or `pnpm` instead of `npm`.

#### Configure Nuxt

Add the modules to your `nuxt.config.ts`:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxthub/core', 'nuxt-auto-crud'],

  hub: {
    db: 'sqlite',
  },

  autoCrud: {
    schemaPath: 'server/db/schema',
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
    "db:generate": "nuxt db generate"
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
  schema: './server/db/schema/index.ts', // Point to your schema index file
  out: './server/db/migrations'
})
```



#### Define your database schema

Create your schema files in `server/db/schema/`. For example, `server/db/schema/users.ts`:

```typescript
// server/db/schema/users.ts
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
#### Run the project

```bash
cd <project-name>
bun db:generate
bun run dev
```

That's it! 🎉 Your CRUD APIs are now available at `/api/users`. 


#### Adding New Schemas

To add a new table (e.g., `posts`), simply create a new file in your schema directory:

```typescript
// server/db/schema/posts.ts
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

Then, ensure it is exported in your `server/db/schema/index.ts` (if you are using an index file) or that your `drizzle.config.ts` is pointing to the correct location.

```typescript
// server/db/schema/index.ts
export * from './users'
export * from './posts'
```

After adding the file, run the generation script:

```bash
bun db:generate
```

The new API endpoints (e.g., `/api/posts`) will be automatically available. [Watch Demo](https://youtu.be/7gW0KW1KtN0)


> **Note:** The `organization.ts` and `cms.ts` files you might see in the playground are just examples and are commented out by default. You should implement a robust schema tailored to your production needs.

### 3. Backend-only App (API Mode)

If you are using Nuxt as a backend for a separate client application (e.g., mobile app, SPA), you can use this module to quickly expose REST APIs.

In this case, you might handle authentication differently (e.g., validating tokens in middleware) or disable the built-in auth checks if you have a global auth middleware.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['nuxt-auto-crud'],
  autoCrud: {
    schemaPath: 'server/db/schema',
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
  schema: './server/db/schema/index.ts',
  out: './server/db/migrations',
  tablesFilter: ['!_hub_migrations'],
})
```

## 🔐 Authentication

Authentication is enabled by default using **Session Auth** (requires `nuxt-auth-utils` and `nuxt-authorization`).

To disable auth for testing:
```typescript
autoCrud: { auth: false }
```

For **JWT Auth** (backend-only apps) or advanced configuration, see the [Authentication docs](https://auto-crud.clifland.in/docs/configuration/authentication).



## 🛡️ Public View Configuration (Field Visibility)

You can define which fields are visible to unauthenticated (guest) users in your `nuxt.config.ts`.
> **Note:** Access control (RBAC) - determining *who* can access *what* - is expected to be handled by your database/permissions system (using `nuxt-authorization`). This configuration only controls the *serialization* of the response for guests.

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  autoCrud: {
    resources: {
      // Guest View: Only these columns are visible to unauthenticated users.
      // Access control (who can list/read) is managed by your DB permissions.
      users: ['id', 'name', 'avatar'], 
    },
  },
})
```


## 👤 Owner-based Permissions (RBAC)

In addition to standard `create`, `read`, `update`, and `delete` permissions, you can assign **Ownership Permissions**:

- `list`: Allows a user to view a list of active records (status='active').
- `list_all`: Allows a user to view **all** records, including inactive ones (e.g., status='inactive', 'draft').
- `update_own`: Allows a user to update a record **only if they created it**.
- `delete_own`: Allows a user to delete a record **only if they created it**.

**How it works:**
The module checks for ownership using the following logic:
1.  **Standard Tables:** Checks if the record has a `createdBy` (or `userId`) column that matches the logged-in user's ID.
2.  **Users Table:** Checks if the record being accessed is the user's own profile (`id` matches).

**Prerequisites:**
Ensure your schema includes a `createdBy` field for resources where you want this behavior:

```typescript
export const posts = sqliteTable('posts', {
  // ...
  createdBy: integer('created_by'), // Recommended
})
```

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
});
```

> **Note:** If authentication is enabled (default):
> - **Fullstack App:** The module integrates with `nuxt-auth-utils`, so session cookies are handled automatically.
> - **Backend-only App:** You must include the `Authorization: Bearer <token>` header in your requests.



## 🔧 Requirements

- Nuxt 3 or 4
- Drizzle ORM (SQLite)
- NuxtHub >= 0.10.0

## 🔗 Links

- **📚 Documentation:** [auto-crud.clifland.in](https://auto-crud.clifland.in/docs/auto-crud)
- **🎬 Video Tutorials:** [YouTube Channel](https://www.youtube.com/@ClifordPereira)
- **💬 Community:** [Discord](https://discord.gg/FBkQQfRFJM) • [GitHub Discussions](https://github.com/clifordpereira/nuxt-auto-crud/discussions/1)
- **📦 npm:** [nuxt-auto-crud](https://www.npmjs.com/package/nuxt-auto-crud)

## 🤝 Contributing

Contributions are welcome! Please check out the [contribution guide](/CONTRIBUTING.md).

## 📝 License

[MIT License](./LICENSE)

## 👨‍💻 Author

Made with ❤️ by [Cliford Pereira](https://github.com/clifordpereira)
