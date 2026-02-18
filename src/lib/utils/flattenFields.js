/**
 * Recursively walks the component tree and extracts all leaf field components.
 * Groups and columns are layout-only — their children are flattened out.
 *
 * @param {import('../types/schema').FormComponent[]} components
 * @returns {{ name: string, component: import('../types/schema').FormComponent }[]}
 */
export function flattenFields(components) {
  const result = [];

  for (const component of components) {
    if (component.type === 'group') {
      result.push(...flattenFields(component.components));
    } else if (component.type === 'column') {
      for (const col of component.columns) {
        result.push(...flattenFields(col.components));
      }
    } else {
      result.push({ name: component.name, component });
    }
  }

  return result;
}
