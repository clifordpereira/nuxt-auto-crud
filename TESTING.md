# Automated API Testing

## Automated Tests

We use `vitest` for automated API testing. The tests are dynamically executed against the Drizzle schema defined in `playground/server/database/schema.ts`.

### Test Scenarios

1.  **Backend-only (No Auth)**:
    *   Starts `playground-backendonly` on port 3001.
    *   Verifies LCRUD (List, Create, Read, Update, Delete) operations for the `users` model.
    *   Ensures APIs work without authentication.

2.  **Full-stack (With Auth)**:
    *   Starts `playground` on port 3000.
    *   Verifies that APIs return `401 Unauthorized` when accessed without a session.
    *   (Future) Verify authenticated access with mocked sessions.

### Running Tests

To run the API integration tests:

```bash
npm run test:api
```

To run unit tests:

```bash
npm run test
```

### Dynamic Test Execution

The tests in `test/api.test.ts` import the schema and constructs test cases for each supported model (currently `users`). This ensures that tests stay in sync with the schema.

1.  **Backend-only (No Auth)**
    - Verifies that APIs are accessible without authentication.
    - Performs LCRUD operations on all defined models.

2.  **Full-stack (With Auth)**
    - Verifies that APIs are protected and return `401 Unauthorized` when no session is present.
    - Verifies that APIs work correctly when a valid session is provided (mocked).
    - Tests authorization rules (if configured).

## Running Tests

To run the API tests, use the following command:

```bash
npm run test:api
```

This script will:
1.  Start the `playground-backendonly` server.
2.  Run the "No Auth" test suite.
3.  Stop the server.
4.  Start the `playground` server.
5.  Run the "Auth" test suite.
6.  Stop the server.

## Test File Structure

- `test/api.test.ts`: Main test file containing the logic for both scenarios.
- `scripts/test-api.mjs`: Orchestrator script to manage server processes and run tests.
