import * as yup from 'yup';
import { flattenFields } from './flattenFields';
import { evaluateRule } from './evaluateDependencies';

/**
 * Builds a Yup validation schema from the form schema definition.
 *
 * @param {import('../types/schema').FormComponent[]} components
 * @param {Object.<string, (value: *, values: Object) => string|undefined>} [customValidation]
 * @returns {yup.ObjectSchema}
 */
export function buildYupSchema(components, customValidation = {}) {
  const fields = flattenFields(components);
  const shape = {};

  for (const { name, component } of fields) {
    let fieldSchema;

    if (component.type === 'checkbox') {
      fieldSchema = yup.boolean();
    } else {
      fieldSchema = yup.string();
    }

    // Static required
    if (component.isRequired) {
      if (component.type === 'checkbox') {
        fieldSchema = fieldSchema.oneOf([true], `${component.label || name} is required`);
      } else {
        fieldSchema = fieldSchema.required(`${component.label || name} is required`);
      }
    }

    // Validation rules
    if (component.validation) {
      const { min, max, pattern, message } = component.validation;
      if (component.type !== 'checkbox') {
        if (min != null) {
          fieldSchema = fieldSchema.min(min, message || `Minimum ${min} characters`);
        }
        if (max != null) {
          fieldSchema = fieldSchema.max(max, message || `Maximum ${max} characters`);
        }
        if (pattern) {
          fieldSchema = fieldSchema.matches(
            new RegExp(pattern),
            message || 'Invalid format'
          );
        }
      }
    }

    // Email validation
    if (component.type === 'email') {
      fieldSchema = fieldSchema.email('Invalid email address');
    }

    // Dependency-based required via Yup .when()
    if (component.dependencies?.required) {
      const rule = component.dependencies.required;
      const depFields = rule.conditions.map((c) => c.field);

      fieldSchema = fieldSchema.when(depFields, {
        is: (...values) => {
          const valuesMap = {};
          depFields.forEach((f, i) => {
            valuesMap[f] = values[i];
          });
          return evaluateRule(rule, valuesMap);
        },
        then: (schema) =>
          component.type === 'checkbox'
            ? schema.oneOf([true], `${component.label || name} is required`)
            : schema.required(`${component.label || name} is required`),
      });
    }

    // Custom validation
    if (customValidation[name]) {
      fieldSchema = fieldSchema.test(
        `custom-${name}`,
        'Validation failed',
        function (value) {
          const errorMsg = customValidation[name](value, this.parent);
          if (errorMsg) {
            return this.createError({ message: errorMsg });
          }
          return true;
        }
      );
    }

    // Make field optional/nullable by default so empty values don't fail type checks
    if (component.type !== 'checkbox') {
      fieldSchema = fieldSchema.nullable().transform((value, original) =>
        original === '' ? null : value
      );
    }

    shape[name] = fieldSchema;
  }

  return yup.object().shape(shape);
}
