// tests/fixtures/crud/server/middleware/auth.ts
export default defineEventHandler((event) => {
  // Simulate nuxt-auth-utils session for testing
  if (event.headers.get('Authorization') === 'Bearer test-session') {
    event.context.user = { id: 1, email: 'admin@clifland.in' };
  }
});