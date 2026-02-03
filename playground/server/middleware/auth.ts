import { guardEventAccess } from "../utils/auth";

export default defineEventHandler(async (event) => {
  const path = event.path;
  if (path.startsWith('/api/_nac/')) {
    await guardEventAccess(event);
  }
});
