# Nuxt Ghost API - Playground

This is the playground/demo application for the **nuxt-auto-crud** module.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
bun install
```

### 2. Run the Development Server

```bash
bun run dev
```

The playground will be available at `http://localhost:3000`

## 📋 What's Included

This playground demonstrates the **nuxt-auto-crud** module with:

- **Sample Database Schema** (`server/database/schema.ts`)

  - Users table
  - Posts table
  - Comments table

- **Auto-Generated CRUD APIs**

  - `GET /api/users` - List all users
  - `POST /api/users` - Create a new user
  - `GET /api/users/:id` - Get user by ID
  - `PATCH /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user
  - _(Same endpoints for posts and comments)_

- **Interactive Demo UI**
  - Visual documentation of all endpoints
  - Code examples for each operation
  - Feature showcase

## 🧪 Testing the APIs

### Using cURL

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","bio":"Developer"}'

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1

# Update a user
curl -X PATCH http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"bio":"Updated bio"}'

# Delete a user
curl -X DELETE http://localhost:3000/api/users/1
```

### Using JavaScript/TypeScript

```typescript
// Create a user
const user = await $fetch("/api/users", {
  method: "POST",
  body: {
    name: "Jane Doe",
    email: "jane@example.com",
    bio: "Designer",
  },
});

// Get all users
const users = await $fetch("/api/users");

// Get user by ID
const user = await $fetch("/api/users/1");

// Update a user
const updated = await $fetch("/api/users/1", {
  method: "PATCH",
  body: { bio: "Updated bio" },
});

// Delete a user
await $fetch("/api/users/1", { method: "DELETE" });
```

## 🔧 Customization

### Adding Your Own Tables

1. Edit `server/database/schema.ts`
2. Add your table definitions using Drizzle ORM
3. Restart the dev server
4. Your new APIs will be automatically available!

Example:

```typescript
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
});
```

This will automatically create:

- `GET /api/products`
- `POST /api/products`
- `GET /api/products/:id`
- `PATCH /api/products/:id`
- `DELETE /api/products/:id`

## 🗄️ Database Management

The playground includes Drizzle Kit for advanced database management:

### Available Commands

```bash
# Generate migration files from schema changes
bun run db:generate

# Push schema changes directly to the database (for development)
bun run db:push

# Open Drizzle Studio - a visual database browser
bun run db:studio
```

### Using Drizzle Studio

Drizzle Studio provides a visual interface to browse and edit your database:

1. Run `bun run db:studio`
2. Open the URL shown in your terminal (usually `https://local.drizzle.studio`)
3. Browse your tables, view data, and run queries visually

### Migration Workflow

For production-ready schema changes:

1. Modify your schema in `server/database/schema.ts`
2. Generate migrations: `bun run db:generate`
3. Review the generated SQL in `server/database/migrations/`
4. Apply migrations (handled automatically by NuxtHub in development)

For quick development iterations, use `bun run db:push` to sync schema changes directly without generating migration files.

## 📚 Learn More

- [Nuxt Ghost API Documentation](https://github.com/clifordpereira/nuxt-auto-crud)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [NuxtHub Documentation](https://hub.nuxt.com/)

## 💡 Tips

- Protected fields (id, createdAt) cannot be updated via PATCH
- All timestamps are automatically managed
- Model names are automatically pluralized (user → users)
- TypeScript types are automatically inferred from your schema

## 🐛 Issues?

If you encounter any issues, please report them on the [GitHub repository](https://github.com/clifordpereira/nuxt-auto-crud/issues).
