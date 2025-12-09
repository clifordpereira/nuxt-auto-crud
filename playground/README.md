# Nuxt Auto CRUD Starter

A starter template for [Nuxt Auto CRUD](https://github.com/clifordpereira/nuxt-auto-crud) module.

- [Documentation](https://auto-crud.clifland.in/)
- [Module Repo](https://github.com/clifordpereira/nuxt-auto-crud)
- [Report Issue](https://github.com/clifordpereira/nuxt-auto-crud/issues)
- [Creator Website](https://www.clifland.in/)

## Setup

Make sure to install the dependencies:

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
```

Locally preview production build:

```bash
pnpm preview
```

## Usage Modes

This template comes pre-configured with `nuxt-auto-crud` for a fullstack experience.

### Fullstack (Default)

No extra steps needed. `nuxt-auto-crud` is installed and configured.

### Frontend Only

If you wish to use this template as a frontend-only application:

1. Uninstall the module:
   ```bash
   npm uninstall nuxt-auto-crud
   ```
2. Open `nuxt.config.ts` and remove `'nuxt-auto-crud'` from the `modules` list.
3. Remove the `autoCrud` configuration block from `nuxt.config.ts`.

## Permissions & Roles

This template uses a **Database-Driven Permissions System**. 

Unlike previous versions that used JSON configuration files, all roles and permissions are now stored in the database (`roles`, `resources`, `permissions`, `role_resource_permissions` tables).

### How it works:
1. **Roles**: Defined in the `roles` table (e.g., `admin`, `manager`, `public`).
2. **Resources**: Defined in the `resources` table (e.g., `users`, `posts`).
3. **Permissions**: Defined in the `permissions` table (e.g., `create`, `read`, `update`, `delete`, `list`).
4. **Assignment**: The `role_resource_permissions` table links them together.

### Managing Permissions:
- **Seeding**: Initial permissions are set up via `server/tasks/seed.ts`. You can modify this file to change default permissions.
- **Runtime**: You can build a UI to manage these records directly in the database, allowing for dynamic permission updates without redeploying.

For a detailed guide on managing permissions, see [PERMISSIONS.md](PERMISSIONS.md).

### Public Access:
Public (unauthenticated) access is controlled by the `public` role in the database. Assign permissions to the `public` role to allow access to resources for non-logged-in users.

## Database Reset & Seeding

If you want to delete all data and start fresh:

1. Delete the `.data` directory.
2. Run the database generation command:
   ```bash
   bun db:generate
   ```
3. Run the seed task (this will create default roles, permissions, and users):
   ```bash
   npx nuxi task run db:seed (or take tasks in dev tools)
   ```
4. Restart the server:
   ```bash
   bun run dev
   ```

**Default Users:**

The seed task creates the following users (Password: `$1Password`):
- **Admin:** `admin@example.com` (Full Access)
- **Manager:** `manager@example.com`
- **Moderator:** `moderator@example.com`
- **Customer:** `customer@example.com`

**Security Note:**
Log in with the admin credentials, create a new admin user, and then delete the default admin user.
