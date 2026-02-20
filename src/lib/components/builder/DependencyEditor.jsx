import { X, Plus } from 'lucide-react';
import { useFormBuilderContext } from '../../context/FormBuilderContext';
import { flattenFields } from '../../utils/flattenFields';

const OPERATORS = [
  { value: 'equals', label: '=' },
  { value: 'notEquals', label: '\u2260' },
  { value: 'contains', label: 'contains' },
  { value: 'greaterThan', label: '>' },
  { value: 'lessThan', label: '<' },
  { value: 'in', label: 'in' },
];

const DEP_TYPES = [
  { key: 'visibility', label: 'Visibility', description: 'Show this field when...' },
  { key: 'required', label: 'Required', description: 'Make required when...' },
  { key: 'disabled', label: 'Disabled', description: 'Disable when...' },
];

function ConditionRow({ condition, allFields, fieldOptionsMap, onChange, onRemove }) {
  const targetField = allFields.find((f) => f.name === condition.field);
  const targetOptions = fieldOptionsMap[condition.field];
  const isCheckbox = targetField?.component.type === 'checkbox';
  const isInOperator = condition.operator === 'in';

  return (
    <div className="fbc-dep-condition-row">
      <select
        className="fbc-form-input fbc-dep-field-select"
        value={condition.field || ''}
        onChange={(e) => onChange({ ...condition, field: e.target.value, value: '' })}
      >
        <option value="">Select field...</option>
        {allFields.map((f) => (
          <option key={f.name} value={f.name}>
            {f.component.label || f.name}
          </option>
        ))}
      </select>

      <select
        className="fbc-form-input fbc-dep-op-select"
        value={condition.operator || 'equals'}
        onChange={(e) => onChange({ ...condition, operator: e.target.value })}
      >
        {OPERATORS.map((op) => (
          <option key={op.value} value={op.value}>{op.label}</option>
        ))}
      </select>

      {isCheckbox ? (
        <select
          className="fbc-form-input fbc-dep-value-input"
          value={String(condition.value ?? '')}
          onChange={(e) => onChange({ ...condition, value: e.target.value === 'true' })}
        >
          <option value="">Select...</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      ) : targetOptions && !isInOperator ? (
        <select
          className="fbc-form-input fbc-dep-value-input"
          value={condition.value ?? ''}
          onChange={(e) => onChange({ ...condition, value: e.target.value })}
        >
          <option value="">Select...</option>
          {targetOptions.map((opt) => (
            <option key={typeof opt === 'string' ? opt : opt.value} value={typeof opt === 'string' ? opt : opt.value}>
              {typeof opt === 'string' ? opt : opt.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={['greaterThan', 'lessThan'].includes(condition.operator) ? 'number' : 'text'}
          className="fbc-form-input fbc-dep-value-input"
          placeholder={isInOperator ? 'val1, val2, ...' : 'Value'}
          value={isInOperator && Array.isArray(condition.value)
            ? condition.value.join(', ')
            : (condition.value ?? '')}
          onChange={(e) => {
            const val = isInOperator
              ? e.target.value.split(',').map((s) => s.trim())
              : e.target.value;
            onChange({ ...condition, value: val });
          }}
        />
      )}

      <button type="button" className="fbc-card-btn fbc-card-btn--delete" onClick={onRemove}><X size={14} /></button>
    </div>
  );
}

function DependencySection({ depType, rule, component, path, allFields, fieldOptionsMap }) {
  const { actions } = useFormBuilderContext();
  const isEnabled = !!rule;

  const handleToggle = () => {
    if (isEnabled) {
      actions.removeDependencyRule(path, depType.key);
    } else {
      actions.setDependencyRule(path, depType.key, {
        conditions: [{ field: '', operator: 'equals', value: '' }],
        logic: 'AND',
      });
    }
  };

  const updateCondition = (index, newCondition) => {
    const conditions = [...rule.conditions];
    conditions[index] = newCondition;
    actions.setDependencyRule(path, depType.key, { ...rule, conditions });
  };

  const removeCondition = (index) => {
    const conditions = rule.conditions.filter((_, i) => i !== index);
    if (conditions.length === 0) {
      actions.removeDependencyRule(path, depType.key);
    } else {
      actions.setDependencyRule(path, depType.key, { ...rule, conditions });
    }
  };

  const addCondition = () => {
    actions.setDependencyRule(path, depType.key, {
      ...rule,
      conditions: [...rule.conditions, { field: '', operator: 'equals', value: '' }],
    });
  };

  const toggleLogic = () => {
    actions.setDependencyRule(path, depType.key, {
      ...rule,
      logic: rule.logic === 'OR' ? 'AND' : 'OR',
    });
  };

  return (
    <div className="fbc-dep-section">
      <div className="fbc-dep-header">
        <label className="fbc-toggle-label">
          <input type="checkbox" checked={isEnabled} onChange={handleToggle} />
          {depType.label}
        </label>
      </div>

      {isEnabled && (
        <div className="fbc-dep-body">
          <div className="fbc-dep-description">{depType.description}</div>

          {rule.conditions.length > 1 && (
            <div className="fbc-logic-toggle">
              <button
                type="button"
                className={`fbc-logic-btn ${rule.logic !== 'OR' ? 'fbc-logic-btn--active' : ''}`}
                onClick={() => rule.logic === 'OR' && toggleLogic()}
              >
                AND
              </button>
              <button
                type="button"
                className={`fbc-logic-btn ${rule.logic === 'OR' ? 'fbc-logic-btn--active' : ''}`}
                onClick={() => rule.logic !== 'OR' && toggleLogic()}
              >
                OR
              </button>
            </div>
          )}

          {rule.conditions.map((cond, i) => (
            <ConditionRow
              key={i}
              condition={cond}
              allFields={allFields}
              fieldOptionsMap={fieldOptionsMap}
              onChange={(newCond) => updateCondition(i, newCond)}
              onRemove={() => removeCondition(i)}
            />
          ))}

          <button type="button" className="fbc-add-option-btn" onClick={addCondition}>
            <Plus size={12} /> Add Condition
          </button>
        </div>
      )}
    </div>
  );
}

export default function DependencyEditor({ component, path }) {
  const { state } = useFormBuilderContext();
  const deps = component.dependencies || {};

  // Get all other fields for the field selector
  const allLeafFields = flattenFields(state.schema.components)
    .filter((f) => f.name !== component.name);

  // Build options map for fields that have options (radio/select)
  const fieldOptionsMap = {};
  for (const f of allLeafFields) {
    if (f.component.options) {
      fieldOptionsMap[f.name] = f.component.options;
    }
  }

  return (
    <div className="fbc-dependency-editor">
      {DEP_TYPES.map((depType) => (
        <DependencySection
          key={depType.key}
          depType={depType}
          rule={deps[depType.key]}
          component={component}
          path={path}
          allFields={allLeafFields}
          fieldOptionsMap={fieldOptionsMap}
        />
      ))}
    </div>
  );
}
