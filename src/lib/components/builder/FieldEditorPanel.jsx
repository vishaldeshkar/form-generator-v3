import { useState } from 'react';
import { X } from 'lucide-react';
import { useFormBuilderContext } from '../../context/FormBuilderContext';
import { resolveComponent } from '../../hooks/useFormBuilder';
import OptionsEditor from './OptionsEditor';
import DependencyEditor from './DependencyEditor';
import GroupLayoutEditor from './GroupLayoutEditor';
import ColumnLayoutEditor from './ColumnLayoutEditor';

function PropertiesTab({ component, path }) {
  const { actions } = useFormBuilderContext();
  const isLayout = component.type === 'group' || component.type === 'column';

  const update = (changes) => actions.updateComponent(path, changes);

  return (
    <div className="fbc-properties-tab">
      {/* Name */}
      <div className="fbc-form-row">
        <label className="fbc-form-label">Name</label>
        <input
          type="text"
          className="fbc-form-input"
          value={component.name}
          onBlur={(e) => update({ name: e.target.value.trim() || component.name })}
          onChange={(e) => update({ name: e.target.value })}
        />
      </div>

      {/* Label (leaf fields only) */}
      {!isLayout && component.type !== 'column' && (
        <div className="fbc-form-row">
          <label className="fbc-form-label">Label</label>
          <input
            type="text"
            className="fbc-form-input"
            value={component.label || ''}
            onChange={(e) => update({ label: e.target.value })}
          />
        </div>
      )}

      {/* Placeholder (text-like fields) */}
      {['text', 'email', 'textarea', 'select'].includes(component.type) && (
        <div className="fbc-form-row">
          <label className="fbc-form-label">Placeholder</label>
          <input
            type="text"
            className="fbc-form-input"
            value={component.placeholder || ''}
            onChange={(e) => update({ placeholder: e.target.value })}
          />
        </div>
      )}

      {/* Help text */}
      {!isLayout && (
        <div className="fbc-form-row">
          <label className="fbc-form-label">Help text</label>
          <input
            type="text"
            className="fbc-form-input"
            value={component.helpText || ''}
            onChange={(e) => update({ helpText: e.target.value })}
          />
        </div>
      )}

      {/* Required / Disabled toggles */}
      {!isLayout && (
        <div className="fbc-form-row fbc-form-row--inline">
          <label className="fbc-toggle-label">
            <input
              type="checkbox"
              checked={!!component.isRequired}
              onChange={(e) => update({ isRequired: e.target.checked })}
            />
            Required
          </label>
          <label className="fbc-toggle-label">
            <input
              type="checkbox"
              checked={!!component.isDisabled}
              onChange={(e) => update({ isDisabled: e.target.checked })}
            />
            Disabled
          </label>
        </div>
      )}

      {/* Default value */}
      {!isLayout && component.type !== 'checkbox' && (
        <div className="fbc-form-row">
          <label className="fbc-form-label">Default value</label>
          <input
            type="text"
            className="fbc-form-input"
            value={component.defaultValue ?? ''}
            onChange={(e) => update({ defaultValue: e.target.value })}
          />
        </div>
      )}

      {/* Checkbox default */}
      {component.type === 'checkbox' && (
        <div className="fbc-form-row">
          <label className="fbc-toggle-label">
            <input
              type="checkbox"
              checked={!!component.defaultValue}
              onChange={(e) => update({ defaultValue: e.target.checked })}
            />
            Default checked
          </label>
        </div>
      )}

      {/* Textarea rows */}
      {component.type === 'textarea' && (
        <div className="fbc-form-row">
          <label className="fbc-form-label">Rows</label>
          <input
            type="number"
            className="fbc-form-input"
            min={1}
            max={20}
            value={component.rows ?? 4}
            onChange={(e) => update({ rows: parseInt(e.target.value, 10) || 4 })}
          />
        </div>
      )}

      {/* Options for radio/select */}
      {(component.type === 'radio' || component.type === 'select') && (
        <OptionsEditor path={path} options={component.options} />
      )}

      {/* Group-specific */}
      {component.type === 'group' && (
        <GroupLayoutEditor component={component} path={path} />
      )}

      {/* Column-specific */}
      {component.type === 'column' && (
        <ColumnLayoutEditor component={component} path={path} />
      )}
    </div>
  );
}

function ValidationTab({ component, path }) {
  const { actions } = useFormBuilderContext();
  const validation = component.validation || {};
  const isLayout = component.type === 'group' || component.type === 'column';

  if (isLayout) {
    return <div className="fbc-empty-state">Layout components don't have validation.</div>;
  }

  const updateValidation = (changes) => {
    const newValidation = { ...validation, ...changes };
    // Clean up empty values
    Object.keys(newValidation).forEach((k) => {
      if (newValidation[k] === '' || newValidation[k] === undefined) delete newValidation[k];
    });
    const hasValues = Object.keys(newValidation).length > 0;
    actions.updateComponent(path, { validation: hasValues ? newValidation : undefined });
  };

  return (
    <div className="fbc-validation-tab">
      {['text', 'email', 'textarea'].includes(component.type) && (
        <>
          <div className="fbc-form-row">
            <label className="fbc-form-label">Min length</label>
            <input
              type="number"
              className="fbc-form-input"
              min={0}
              value={validation.min ?? ''}
              onChange={(e) => updateValidation({ min: e.target.value ? parseInt(e.target.value, 10) : undefined })}
            />
          </div>
          <div className="fbc-form-row">
            <label className="fbc-form-label">Max length</label>
            <input
              type="number"
              className="fbc-form-input"
              min={0}
              value={validation.max ?? ''}
              onChange={(e) => updateValidation({ max: e.target.value ? parseInt(e.target.value, 10) : undefined })}
            />
          </div>
          <div className="fbc-form-row">
            <label className="fbc-form-label">Pattern (regex)</label>
            <input
              type="text"
              className="fbc-form-input"
              value={validation.pattern || ''}
              onChange={(e) => updateValidation({ pattern: e.target.value || undefined })}
            />
          </div>
        </>
      )}
      <div className="fbc-form-row">
        <label className="fbc-form-label">Error message</label>
        <input
          type="text"
          className="fbc-form-input"
          value={validation.message || ''}
          onChange={(e) => updateValidation({ message: e.target.value || undefined })}
        />
      </div>
    </div>
  );
}

export default function FieldEditorPanel() {
  const { state, actions } = useFormBuilderContext();
  const { selectedComponentPath } = state;
  const [activeTab, setActiveTab] = useState('properties');

  if (!selectedComponentPath) return null;

  const component = resolveComponent(state.schema, selectedComponentPath);
  if (!component) return null;

  const isLayout = component.type === 'group' || component.type === 'column';
  const tabs = [
    { id: 'properties', label: 'Properties' },
    { id: 'validation', label: 'Validation' },
    ...(!isLayout ? [{ id: 'dependencies', label: 'Dependencies' }] : []),
  ];

  return (
    <div className="fbc-editor-panel">
      <div className="fbc-editor-header">
        <span className="fbc-type-badge fbc-type-badge--large">{component.type}</span>
        <span className="fbc-editor-title">{component.label || component.title || component.name}</span>
        <button type="button" className="fbc-editor-close" onClick={actions.deselectComponent}><X size={16} /></button>
      </div>

      <div className="fbc-editor-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`fbc-editor-tab ${activeTab === tab.id ? 'fbc-editor-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="fbc-editor-body">
        {activeTab === 'properties' && (
          <PropertiesTab component={component} path={selectedComponentPath} />
        )}
        {activeTab === 'validation' && (
          <ValidationTab component={component} path={selectedComponentPath} />
        )}
        {activeTab === 'dependencies' && (
          <DependencyEditor component={component} path={selectedComponentPath} />
        )}
      </div>
    </div>
  );
}
