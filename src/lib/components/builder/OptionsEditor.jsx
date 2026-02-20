import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react';
import { useFormBuilderContext } from '../../context/FormBuilderContext';

export default function OptionsEditor({ path, options }) {
  const { actions } = useFormBuilderContext();
  const items = options || [];

  return (
    <div className="fbc-options-editor">
      <div className="fbc-editor-section-title">Options</div>
      {items.map((opt, i) => (
        <div key={i} className="fbc-option-row">
          <input
            type="text"
            className="fbc-form-input fbc-option-input"
            placeholder="Label"
            value={typeof opt === 'string' ? opt : opt.label}
            onChange={(e) => actions.updateOption(path, i, { label: e.target.value, value: typeof opt === 'string' ? e.target.value : opt.value })}
          />
          <input
            type="text"
            className="fbc-form-input fbc-option-input"
            placeholder="Value"
            value={typeof opt === 'string' ? opt : opt.value}
            onChange={(e) => actions.updateOption(path, i, { value: e.target.value, label: typeof opt === 'string' ? opt : opt.label })}
          />
          <button type="button" className="fbc-card-btn" onClick={() => actions.moveOptionUp(path, i)} title="Move up">
            <ChevronUp size={14} />
          </button>
          <button type="button" className="fbc-card-btn" onClick={() => actions.moveOptionDown(path, i)} title="Move down">
            <ChevronDown size={14} />
          </button>
          <button type="button" className="fbc-card-btn fbc-card-btn--delete" onClick={() => actions.removeOption(path, i)} title="Remove">
            <X size={14} />
          </button>
        </div>
      ))}
      <button type="button" className="fbc-add-option-btn" onClick={() => actions.addOption(path)}>
        <Plus size={12} /> Add Option
      </button>
    </div>
  );
}
