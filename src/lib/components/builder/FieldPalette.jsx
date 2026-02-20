import { Type, AtSign, AlignLeft, CheckSquare, Circle, ChevronDown, Calendar, Group, Columns } from 'lucide-react';
import { useFormBuilderContext } from '../../context/FormBuilderContext';

const PALETTE_ITEMS = [
  { type: 'text', label: 'Text', Icon: Type },
  { type: 'email', label: 'Email', Icon: AtSign },
  { type: 'textarea', label: 'Textarea', Icon: AlignLeft },
  { type: 'checkbox', label: 'Checkbox', Icon: CheckSquare },
  { type: 'radio', label: 'Radio', Icon: Circle },
  { type: 'select', label: 'Select', Icon: ChevronDown },
  { type: 'date', label: 'Date', Icon: Calendar },
  { type: 'group', label: 'Group', Icon: Group },
  { type: 'column', label: 'Columns', Icon: Columns },
];

export default function FieldPalette({ parentPath = null }) {
  const { actions } = useFormBuilderContext();

  return (
    <div className="fbc-palette">
      {!parentPath && <div className="fbc-palette-title">Add Field</div>}
      <div className="fbc-palette-grid">
        {PALETTE_ITEMS.map((item) => (
          <button
            key={item.type}
            type="button"
            className="fbc-palette-btn"
            onClick={() => actions.addComponent(item.type, parentPath)}
            title={`Add ${item.label}`}
          >
            <item.Icon size={14} className="fbc-palette-icon" />
            <span className="fbc-palette-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
