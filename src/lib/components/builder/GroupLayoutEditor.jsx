import { useFormBuilderContext } from '../../context/FormBuilderContext';

export default function GroupLayoutEditor({ component, path }) {
  const { actions } = useFormBuilderContext();

  return (
    <div className="fbc-layout-editor">
      <div className="fbc-editor-section-title">Group Settings</div>
      <div className="fbc-form-row">
        <label className="fbc-form-label">Title</label>
        <input
          type="text"
          className="fbc-form-input"
          value={component.title || ''}
          onChange={(e) => actions.updateComponent(path, { title: e.target.value })}
        />
      </div>
      <div className="fbc-form-row">
        <label className="fbc-form-label">Description</label>
        <input
          type="text"
          className="fbc-form-input"
          value={component.description || ''}
          onChange={(e) => actions.updateComponent(path, { description: e.target.value })}
        />
      </div>
    </div>
  );
}
