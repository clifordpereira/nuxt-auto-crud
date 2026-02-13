# NAC Template: Abstract Guide
UI/Scaffolding for the **Clifland Architectural Model**.

## 🤖 Agentic Discovery (CRITICAL)
**NO STATIC API ROUTES.** Agents must:
1. **Identify Path:** `nuxt.config.ts` -> `autoCrud.schemaPath`.
2. **Introspect SSOT:** Read `server/db/schema/*.ts` for all resource definitions.
3. **Visibility:** Respect `app.config.ts` (`crud.globalHide` and `crud.exports`).
4. **Logic:** Powered by `nuxt-auto-crud` npm module.

## 👨‍💻 Contributor Workflow
- **Scope:** UI Components (Nuxt UI 4), Schemas, and Middleware.
- **Setup:** `bun install` -> `bun run db:push` -> `bun run dev`.
- **RBAC:** Roles seeded via `app.config.ts` (`rolesToSeed`).