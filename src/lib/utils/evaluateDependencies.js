/**
 * Evaluates a single condition against form values.
 *
 * @param {import('../types/schema').Condition} condition
 * @param {Object} values - Current form values
 * @returns {boolean}
 */
export function evaluateCondition(condition, values) {
  const { field, operator, value } = condition;
  const fieldValue = values[field];

  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'notEquals':
      return fieldValue !== value;
    case 'contains':
      return typeof fieldValue === 'string' && fieldValue.includes(value);
    case 'greaterThan':
      return Number(fieldValue) > Number(value);
    case 'lessThan':
      return Number(fieldValue) < Number(value);
    case 'in':
      return Array.isArray(value) && value.includes(fieldValue);
    default:
      return false;
  }
}

/**
 * Evaluates a dependency rule (array of conditions with AND/OR logic).
 *
 * @param {import('../types/schema').DependencyRule} rule
 * @param {Object} values - Current form values
 * @returns {boolean}
 */
export function evaluateRule(rule, values) {
  if (!rule || !rule.conditions || rule.conditions.length === 0) return true;

  const logic = rule.logic || 'AND';
  const results = rule.conditions.map((c) => evaluateCondition(c, values));

  return logic === 'OR' ? results.some(Boolean) : results.every(Boolean);
}
