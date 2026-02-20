/**
 * Generates a unique field name based on the component type.
 *
 * @param {string} type - The component type (text, email, select, group, column, etc.)
 * @param {Set<string>} existingNames - Set of names already in use
 * @returns {string}
 */
export function generateFieldName(type, existingNames) {
  const base = type === 'email' ? 'emailField'
    : type === 'textarea' ? 'textareaField'
    : `${type}Field`;

  let candidate = base;
  let counter = 1;
  while (existingNames.has(candidate)) {
    candidate = `${base}${counter++}`;
  }
  return candidate;
}

/**
 * Collects all field names from a component tree into a Set.
 *
 * @param {import('../types/schema').FormComponent[]} components
 * @returns {Set<string>}
 */
export function collectFieldNames(components) {
  const names = new Set();
  for (const comp of components) {
    if (comp.name) names.add(comp.name);
    if (comp.type === 'group' && comp.components) {
      for (const n of collectFieldNames(comp.components)) names.add(n);
    }
    if (comp.type === 'column' && comp.columns) {
      for (const col of comp.columns) {
        for (const n of collectFieldNames(col.components)) names.add(n);
      }
    }
  }
  return names;
}
