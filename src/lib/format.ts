/** Shared display/format utilities — import instead of redefining locally. */

export type FieldValue = string | string[] | number | boolean | null | undefined;

const DATE_OPTS: Intl.DateTimeFormatOptions = {
  month: 'short', day: 'numeric', year: 'numeric',
};

/** Format an ISO date string as "May 6, 2026". Returns '—' for null/undefined. */
export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', DATE_OPTS);
}

/** Format a number with locale commas and optional unit suffix. Returns '—' for null. */
export function fmtNum(v: number | null | undefined, suffix = ''): string {
  if (v == null) return '—';
  return v.toLocaleString() + suffix;
}

/**
 * General-purpose value display helper.
 * - null / undefined / '' → '—'
 * - boolean → 'Yes' / 'No'
 * - string[] → comma-joined, or '—' if empty
 * - anything else → String(v)
 */
export function display(v: FieldValue): string {
  if (v == null || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.length ? v.join(', ') : '—';
  return String(v);
}

/** Display a string array as comma-joined. Returns '—' for null/empty. */
export function displayArr(a: string[] | null | undefined): string {
  return a?.length ? a.join(', ') : '—';
}

/** Display a boolean as 'Yes', 'No', or '—'. */
export function displayBool(v: boolean | null | undefined): string {
  if (v === true) return 'Yes';
  if (v === false) return 'No';
  return '—';
}
