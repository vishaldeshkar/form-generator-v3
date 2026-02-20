import { useFormBuilderContext } from '../../context/FormBuilderContext';
import FieldPalette from './FieldPalette';
import BuilderCanvas from './BuilderCanvas';
import FieldEditorPanel from './FieldEditorPanel';

function SchemaMetaEditor() {
  const { state, actions } = useFormBuilderContext();

  return (
    <div className="fbc-meta-editor">
      <input
        type="text"
        className="fbc-meta-title"
        value={state.schema.title}
        onChange={(e) => actions.setTitle(e.target.value)}
        placeholder="Form title"
      />
      <input
        type="text"
        className="fbc-meta-description"
        value={state.schema.description || ''}
        onChange={(e) => actions.setDescription(e.target.value)}
        placeholder="Form description (optional)"
      />
    </div>
  );
}

export default function FormBuilder() {
  const { state } = useFormBuilderContext();

  return (
    <div className="fbc-builder">
      <SchemaMetaEditor />
      <FieldPalette />
      <BuilderCanvas />
      {state.selectedComponentPath && <FieldEditorPanel />}
    </div>
  );
}
