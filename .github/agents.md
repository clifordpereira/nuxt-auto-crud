# Agentic System Context: NAC Core

## 🧩 Internal Logic
- **Primary Engine:** Nitro-based runtime reflection.
- **Reflection Target:** Iterates over `schemaPath` (default: `server/db/schema`) to register routes.
- **Pluralization:** Uses `ml-pluralize` to transform table names into RESTful path segments.
- **Validation Injection:** Dynamically generates Zod schemas from Drizzle table definitions.

## 🛠 Tool-Calling instructions
- When an agent needs to modify the "CRUD generation" logic, it must edit the Nitro plugins and server utilities within this repo.
- This repo is the **Interface**; it does not contain business schemas.