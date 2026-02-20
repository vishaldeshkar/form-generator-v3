import { flattenFields } from './flattenFields';

/**
 * Extracts default values from a schema's component definitions.
 * Useful when the parent manages useForm() externally.
 *
 * @param {import('../types/schema').FormComponent[]} components
 * @returns {Object.<string, *>}
 */
export function buildDefaultValues(components) {
  const fields = flattenFields(components);
  const defaults = {};

  for (const { name, component } of fields) {
    if (component.defaultValue !== undefined) {
      defaults[name] = component.defaultValue;
    } else if (component.type === 'checkbox') {
      defaults[name] = false;
    } else {
      defaults[name] = '';
    }
  }

  return defaults;
}
