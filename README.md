# Nuxt Auto-CRUD Engine 🚀

A high-performance, **Zero-Codegen CRUD Engine** for Nuxt 4. This module dynamically exposes RESTful APIs by treating your Drizzle ORM schema as the Single Source of Truth (SSOT).

| Feature | Specification |
| :--- | :--- |
| **Framework** | Nuxt 4 (`app/` directory ready) |
| **Persistence** | SQLite / libSQL (via NuxtHub) |
| **ORM** | Drizzle ORM |
| **Validation** | `drizzle-zod` (Dynamic derivation) |
| **AI Ready** | `.ai-context.md` included for Agentic workflows |

## 🛠 Core Philosophy: SSOT

Nuxt Auto-CRUD eliminates boilerplate. It scans your database migration/schema files and automatically mounts Nitro event handlers.

- **No Code-Gen**: No per-entity controllers or repositories required.
- **Dynamic Routing**: Automatic mounting of `GET|POST|PATCH|DELETE` handlers for all exported tables.
- **Type Safety**: Validation schemas are derived at runtime using `getZodSchema()` from `drizzle-zod`.

## ⚙️ Architecture: Drizzle-Zod Integration

The engine leverages `modelMapper.ts` to transform Drizzle table definitions into runtime validation logic.

- **Validation**: Replaced legacy manual filtering with comprehensive `drizzle-zod` schemas.
- **`getZodSchema(model, type)`**: Generates strict `insert` (POST) or `partial` (PATCH) schemas.
- **Protected Fields**: Automatically omits manage-identity fields (`id`, `createdAt`, `createdBy`, etc.) from creation payloads.

## 🚀 Quick Start (Existing Project)

### 1. Install Dependencies
```bash
bun add nuxt-auto-crud drizzle-orm drizzle-zod
bun add -d drizzle-kit
```

### 2. Configure `nuxt.config.ts`
```typescript
export default defineNuxtConfig({
  modules: ['@nuxthub/core', 'nuxt-auto-crud'],
  autoCrud: {
    schemaPath: 'server/db/schema',
    auth: {
      type: 'session',
      authentication: true,
      authorization: true,
    }
  }
})
```

## 🔐 Permission System (RBAC)

The engine supports database-driven RBAC via `nuxt-authorization`. 

- `list`: View active records.
- `list_all`: View all records (including drafts).
- `update_own` / `delete_own`: Ownership-based logic using `createdBy` or `userId` columns.

## 🌐 Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/:model` | List with filtering/paging |
| `POST` | `/api/:model` | Validated creation |
| `GET` | `/api/:model/:id` | Single record retrieval |
| `PATCH` | `/api/:model/:id` | Partial validated update |
| `DELETE` | `/api/:model/:id` | Soft/Hard deletion |

---

## 👨‍💻 Reference Implementation
See the [Playground](./playground) for a full Nuxt 4 + Nuxt UI 4 implementation including a database-driven seeding strategy.

## 🔗 Links
- [📚 Documentation](https://auto-crud.clifland.in/docs/auto-crud)
- [✨ Release Notes](./CHANGELOG.md)
- [🗺️ Roadmap](./ROADMAP.md)
