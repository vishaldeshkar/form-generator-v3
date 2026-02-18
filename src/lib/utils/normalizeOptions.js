/**
 * Normalizes options to { label, value } format.
 * Accepts string[] or { label, value }[].
 *
 * @param {(string|{ label: string, value: string })[]} options
 * @returns {{ label: string, value: string }[]}
 */
export function normalizeOptions(options) {
  if (!options) return [];
  return options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );
}
