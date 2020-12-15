import { nanoid } from 'nanoid';
import { v4 as uuid } from 'uuid';

export function domUid(prefix = 'u') {
  return prefix + nanoid();
}

// Single entry point for convenience to all UI package clients.
export { uuid };
