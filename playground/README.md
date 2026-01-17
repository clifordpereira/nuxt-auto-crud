# Nuxt Auto CRUD Template

**The Nuxt Auto CRUD Template is the production-ready Nuxt 4 + Nuxt UI 4 implementation of nuxt-auto-crud.** It serves as the blueprint for creating specialized apps with zero-rebuild core logic.

| Component | Technology Stack |
| :--- | :--- |
| **UI Framework** | Nuxt UI 4 (Tailwind 4) |
| **Core Engine** | `nuxt-auto-crud` |
| **Auth** | `nuxt-auth-utils` (Session-based) |
| **Authorization** | `nuxt-authorization` (RBAC) |

## Features
* **Automatic CRUD**: Fully dynamic logic without code generation.
* **Dynamic Forms & Tables**: Built-in search, pagination, and validation.
* **Relation Handling**: Seamlessly manage database relationships.
* **Admin Dashboard**: Centralized management interface.
* **Auth Ready**: Integrated Social Login and Password Reset.

## Seeding
* Seeding is triggered upon the first login of `NUXT_ADMIN_EMAIL` (defaults to `admin@example.com`).

## Demo Credentials
Default users initialized during the first-run seed (Password: `$1Password`):

| Role | Email | Permissions |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | Full System Access |
| **Manager** | `manager@example.com` | Global CRUD |
| **Customer** | `customer@example.com` | Resource Ownership Only |

## 🛠 Development Workflow
1.  **Define Schema**: Add your Drizzle table in `server/db/schema/`.
2.  **Generate**: Run `bun db:generate` to migrate the tables (schemas).
3.  **Roles**: (Optional) Configure `rolesToSeed` in `app.config.ts`.
4.  **Permissions**: (Optional) Configure necessary permissions for the resources (tables) in **Admin Dashboard -> Resource Permissions**.

## Quick Install
```bash
npx nuxi init -t gh:clifordpereira/nuxt-auto-crud_template <project-name>
bun db:generate
bun dev
```

For installing `nuxt-auto-crud` into an existing app, please see [Manual Installation](https://auto-crud.clifland.in/docs/manual-installation).

---
## 🔗 Project Links
- [Documentation](https://auto-crud.clifland.in/docs/auto-crud)
- [YouTube Walkthrough](https://www.youtube.com/watch?v=_o0cddJUU50&list=PLnbvxcojhIixqM1J08Tnm7vmMdx2wsy4B)
- [Core Engine Repo](https://github.com/clifordpereira/nuxt-auto-crud)
- [Creator](https://www.clifland.in/)