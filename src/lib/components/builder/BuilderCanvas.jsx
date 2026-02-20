import { useFormBuilderContext } from '../../context/FormBuilderContext';
import FieldCard from './FieldCard';

export default function BuilderCanvas() {
  const { state } = useFormBuilderContext();
  const { components } = state.schema;

  if (components.length === 0) {
    return (
      <div className="fbc-canvas fbc-canvas--empty">
        <p>No fields yet. Click a field type above to get started.</p>
      </div>
    );
  }

  return (
    <div className="fbc-canvas">
      {components.map((component, i) => (
        <FieldCard key={component.name} component={component} path={[i]} />
      ))}
    </div>
  );
}
