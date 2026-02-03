import { vi } from 'vitest';

export const eq = vi.fn();
export const getTableColumns = vi.fn(() => ({
  id: { primary: true },
  userId: { name: "userId" },
  ownerId: { name: "ownerId" },
  createdBy: { name: "createdBy" },
}));