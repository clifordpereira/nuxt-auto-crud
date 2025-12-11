# Project Roadmap

## 🚀 Upcoming Features (v1.0 Goals)

### 1. Database-Native Field Level Security (FLS)
**Priority:** High
**Type:** Security / Performance

Currently, field visibility is binary (Guest vs Auth). We aim to implement strict, role-based field permissions directly in the database.

**Proposed Architecture:**
- **Schema:** Add `field_permissions` table (Role -> Resource -> Field -> Action).
- **Core:** Update query builder to dynamically select columns based on permissions:
  ```typescript
  // Before
  db.select().from(users)
  
  // After (Pseudo)
  const allowedFields = await getFieldPermissions(role, 'users', 'read')
  db.select(allowedFields).from(users)
  ```
- **UI:** Update Permission Matrix to allow expanding resources to toggle individual fields.

### 2. Audit Logging
**Priority:** Medium
**Type:** Compliance

Track who did what and when.
- Schema: `audit_logs`
- Middleware to intercept Write operations.

### 3. Relationships API (Expansion)
**Priority:** Medium
**Type:** Feature

Better handling of nested relations (e.g. `GET /api/users/1?include=posts`).
