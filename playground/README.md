# Nuxt Auto CRUD Playground

This is the playground for [nuxt-auto-crud](https://github.com/clifordpereira/nuxt-auto-crud). It demonstrates how to use the module in a fullstack Nuxt application.

## Features

- **Auto-generated APIs**: CRUD endpoints for `users`, `posts`, etc.
- **Authentication**: Session-based auth using `nuxt-auth-utils`.
- **Authorization**: Role-based access control (RBAC) using `nuxt-authorization`.
- **UI**: A dashboard built with Nuxt UI to interact with the APIs.

## Setup

1. Install dependencies:

```bash
bun install
```

2. Generate the database schema:

```bash
bun db:generate
```

3. Start the development server:

```bash
bun run dev
```

4. Seed the database:

   - Open **Nuxt DevTools** (`Shift + Alt + D`).
   - Navigate to the **NuxtHub** tab.
   - Click on **Tasks** in the sidebar.
   - Run the `db:seed` task to populate the database with test data (Admin, Manager, Moderator, Customer).

## Authentication

The playground is configured with **Session Authentication**.

- **Login**: Use the login page to sign in.
- **Credentials**: You can use any email/password for the demo (or check `server/api/auth/login.post.ts` if implemented).

## Authorization

The playground uses `nuxt-authorization` to manage permissions.

- **Admin**: Has full access.
- **Manager**: Can list, read, create, update, delete.
- **Moderator**: Can list and read.
- **Public**: Limited access.

Check `autocrud.config.ts` and `app/config/auth/users.json` to see the permission rules.

## Viewing the Database

You can view and manage your database directly using **Nuxt DevTools**.

1.  Start the development server (`bun run dev`).
2.  Open the application in your browser (`http://localhost:3000`).
3.  Open Nuxt DevTools (`Shift + Alt + D`).
4.  Navigate to the **NuxtHub** tab to explore your tables and data.

## Testing

To run the tests for the playground:

```bash
npm run test
```
