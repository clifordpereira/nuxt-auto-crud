import { vi } from 'vitest';

export const getHeader = vi.fn();
export const getQuery = vi.fn();
export const readBody = vi.fn().mockResolvedValue({});
export const createError = vi.fn((opts) => {
  const err = new Error(opts.message);
  (err as any).statusCode = opts.statusCode;
  return err;
});