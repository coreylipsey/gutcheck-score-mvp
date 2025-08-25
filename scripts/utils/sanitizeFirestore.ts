// scripts/utils/sanitizeFirestore.ts
import { Timestamp } from 'firebase-admin/firestore';

export function toTimestamp(d: Date | string | number): Timestamp {
  if (d instanceof Date) return Timestamp.fromDate(d);
  if (typeof d === 'number') return Timestamp.fromMillis(d);
  // ISO string
  return Timestamp.fromDate(new Date(d));
}

export function sanitizeFirestore(input: any): any {
  if (input === null) return null;
  if (input === undefined) return undefined; // we'll remove undefined keys next
  if (input instanceof Date) return toTimestamp(input);
  if (typeof input === 'number' && !Number.isFinite(input)) return null;

  if (Array.isArray(input)) {
    return input
      .map(sanitizeFirestore)
      .filter((v) => v !== undefined); // drop undefined entries
  }

  if (typeof input === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(input)) {
      if (v === undefined) continue; // drop undefined keys
      if (k.includes('.')) {
        // Firestore forbids '.' in field names unless using FieldPath
        out[k.replace(/\./g, '_')] = sanitizeFirestore(v);
      } else {
        out[k] = sanitizeFirestore(v);
      }
    }
    return out;
  }

  return input;
}
