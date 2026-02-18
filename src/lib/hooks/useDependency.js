import { useMemo, useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { evaluateRule } from '../utils/evaluateDependencies';

/**
 * Extracts all field names referenced in dependency conditions.
 */
function getWatchedFields(dependencies) {
  if (!dependencies) return [];
  const fields = new Set();
  for (const rule of Object.values(dependencies)) {
    if (rule?.conditions) {
      for (const cond of rule.conditions) {
        fields.add(cond.field);
      }
    }
  }
  return [...fields];
}

/**
 * Evaluates dependency rules and returns visibility/required/disabled state.
 * Clears field values when visibility changes to false.
 *
 * @param {string} fieldName - The field's registered name (for clearing on hide)
 * @param {import('../types/schema').Dependencies} [dependencies]
 * @returns {{ isVisible: boolean, isRequired: boolean, isDisabled: boolean }}
 */
export function useDependency(fieldName, dependencies) {
  const { setValue } = useFormContext();
  const watchedFields = useMemo(() => getWatchedFields(dependencies), [dependencies]);

  const watchedValues = useWatch({ name: watchedFields });

  const result = useMemo(() => {
    if (!dependencies) {
      return { isVisible: true, isRequired: false, isDisabled: false };
    }

    const values = {};
    watchedFields.forEach((f, i) => {
      values[f] = watchedValues[i];
    });

    return {
      isVisible: dependencies.visibility
        ? evaluateRule(dependencies.visibility, values)
        : true,
      isRequired: dependencies.required
        ? evaluateRule(dependencies.required, values)
        : false,
      isDisabled: dependencies.disabled
        ? evaluateRule(dependencies.disabled, values)
        : false,
    };
  }, [dependencies, watchedFields, watchedValues]);

  const prevVisible = useRef(result.isVisible);
  useEffect(() => {
    if (prevVisible.current && !result.isVisible && fieldName) {
      setValue(fieldName, undefined);
    }
    prevVisible.current = result.isVisible;
  }, [result.isVisible, fieldName, setValue]);

  return result;
}
