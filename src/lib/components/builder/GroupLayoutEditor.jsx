import { useFormBuilderStore } from '../../store/FormBuilderStoreContext';

export default function GroupLayoutEditor({ component, path }) {
  const updateComponent = useFormBuilderStore((s) => s.updateComponent);

  return (
    <div className="fbc-layout-editor">
      <div className="fbc-editor-section-title">Group Settings</div>
      <div className="fbc-form-row">
        <label className="fbc-form-label">Title</label>
        <input
          type="text"
          className="fbc-form-input"
          value={component.title || ''}
          onChange={(e) => updateComponent(path, { title: e.target.value })}
        />
      </div>
      <div className="fbc-form-row">
        <label className="fbc-form-label">Title Template</label>
        <input
          type="text"
          className="fbc-form-input"
          placeholder="e.g. Step {n} - Personal Info"
          value={component.titleTemplate || ''}
          onChange={(e) => updateComponent(path, { titleTemplate: e.target.value })}
        />
        <span className="fbc-form-hint">
          Use {'{n}'} for auto-numbered visible group index. Leave empty to use static title.
        </span>
      </div>
      <div className="fbc-form-row">
        <label className="fbc-form-label">Description</label>
        <input
          type="text"
          className="fbc-form-input"
          value={component.description || ''}
          onChange={(e) => updateComponent(path, { description: e.target.value })}
        />
      </div>
    </div>
  );
}
