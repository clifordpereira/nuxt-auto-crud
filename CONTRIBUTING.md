# NAC Core: Interface Guide
Headless reflection engine for the **Clifland Architectural Model**.

## 🤖 Agentic Protocol
- **Routing:** Uses `pluralize` (v8.0.0). Table `user` -> `/api/_nac/users`.
- **Reflection:** Runtime introspection of `schemaPath` (default: `server/db/schema`).
- **Validation:** Dynamic `drizzle-zod` guards in `src/runtime/server/api/_nac/[model]`.
- **Protection:** Strips `id`, `createdAt`, `updatedAt`, `deletedAt` from `POST/PATCH`.

## 👨‍💻 Contributor Workflow
- **Scope:** Core logic, Nitro handlers, and server utils.
- **Setup:** `bun install` -> `bun run dev:prepare`. 
- **Test:** Use `playground/` via `bun run dev`. 
- **Commits:** Conventional format (`feat:`, `fix:`).

## 🏛 The Clifland Model
1. **Interface (This Repo):** Headless logic.
2. **Abstract Class (Template):** UI & Scaffolding.
3. **Concrete Class (The App):** Final implementation.