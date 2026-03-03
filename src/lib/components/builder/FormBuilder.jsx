import { useFormBuilderStore } from '../../store/FormBuilderStoreContext';
import FieldPalette from './FieldPalette';
import BuilderCanvas from './BuilderCanvas';
import FieldEditorPanel from './FieldEditorPanel';

function SchemaMetaEditor() {
  const title = useFormBuilderStore((s) => s.schema.title);
  const description = useFormBuilderStore((s) => s.schema.description);
  const setTitle = useFormBuilderStore((s) => s.setTitle);
  const setDescription = useFormBuilderStore((s) => s.setDescription);

  return (
    <div className="fbc-meta-editor">
      <input
        type="text"
        className="fbc-meta-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Form title"
      />
      <input
        type="text"
        className="fbc-meta-description"
        value={description || ''}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Form description (optional)"
      />
    </div>
  );
}

export default function FormBuilder() {
  const selectedComponentPath = useFormBuilderStore((s) => s.selectedComponentPath);

  return (
    <div className="fbc-builder">
      <SchemaMetaEditor />
      <FieldPalette />
      <BuilderCanvas />
      {selectedComponentPath && <FieldEditorPanel />}
    </div>
  );
}
