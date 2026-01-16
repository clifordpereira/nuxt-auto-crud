# Nuxt Auto-CRUD Template ⚡️

This is the official **Reference Implementation** for [`nuxt-auto-crud`](https://github.com/clifordpereira/nuxt-auto-crud). It demonstrates a high-end, production-ready admin interface built with Nuxt UI 4.

| Component | Technology |
| :--- | :--- |
| **Framework** | Nuxt 4 (`app/` directory) |
| **UI Library** | Nuxt UI 4 (Tailwind 4) |
| **Engine** | `nuxt-auto-crud` |
| **Auth** | `nuxt-auth-utils` + `nuxt-authorization` |
| **Database** | SQLite / NuxtHub |

## 🛡️ Database-Driven RBAC

Unlike static configuration systems, this template uses a fully dynamic, database-stored permission system.

- **Storage**: Roles and permissions are persisted in `roles`, `permissions`, and `role_resource_permissions` tables.
- **Source of Truth**: `server/tasks/seed.ts` manages the initial bootstrap.
- **Dynamic UI**: Components hydrate their state and action visibility (Edit/Delete) based on these runtime permissions.

## 🚀 Setup & Initialization

### 1. Install Dependencies
```bash
bun install
```

### 2. Database Schema & Seeding
```bash
# Generate migrations
bun db:generate

# Execute seeding task (Source of Truth for Roles/Users)
npx nuxi task run db:seed
```

### 3. Development
```bash
bun dev
```

## 🎨 UI & UX Logic

- **Dynamic Hydration**: Tables and Forms are generated on-the-fly using the metadata provided by the Core Engine.
- **Custom Flair**: High-end styling applied via Nuxt UI 4's `ui` prop system.
- **Micro-Animations**: Subtle transitions for form submissions and navigation.

## 👤 Default Credentials

Validated users created during `db:seed` (Password: `$1Password`):

| Role | Email | access |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | Root Access |
| **Manager** | `manager@example.com` | Full CRUD |
| **Customer** | `customer@example.com` | Own Records |

---

## 🔗 Project Links
- [Documentation](https://auto-crud.clifland.in/docs/auto-crud)
- [Core Engine Repo](https://github.com/clifordpereira/nuxt-auto-crud)
- [Creator](https://www.clifland.in/)
