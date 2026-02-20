import { FormComposer } from '../lib';

export default function FormBuilderDemo() {
  return (
    <div>
      <p className="app-subtitle" style={{ marginBottom: '1rem' }}>
        Build a form visually. The live preview updates in real time.
      </p>
      <FormComposer />
    </div>
  );
}
