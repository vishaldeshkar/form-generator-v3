import { useState } from 'react';
import {
  GripVertical, ChevronUp, ChevronDown, Copy, Trash2, Plus, Minus,
  Type, AtSign, AlignLeft, CheckSquare, Circle, ChevronDown as SelectIcon,
  Calendar, Group, Columns,
} from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { useFormBuilderStore } from '../../store/FormBuilderStoreContext';
import { pathsEqual } from '../../store/formBuilderStore';
import FieldPalette from './FieldPalette';

const TYPE_ICONS = {
  text: Type, email: AtSign, textarea: AlignLeft, checkbox: CheckSquare,
  radio: Circle, select: SelectIcon, date: Calendar, group: Group, column: Columns,
};

export default function FieldCard({ component, path }) {
  const selectedComponentPath = useFormBuilderStore((s) => s.selectedComponentPath);
  const dragState = useFormBuilderStore((s) => s.dragState);
  const actions = useFormBuilderStore(useShallow((s) => ({
    selectComponent: s.selectComponent,
    moveComponentUp: s.moveComponentUp,
    moveComponentDown: s.moveComponentDown,
    duplicateComponent: s.duplicateComponent,
    removeComponent: s.removeComponent,
    setDragState: s.setDragState,
    clearDragState: s.clearDragState,
    moveComponentTo: s.moveComponentTo,
    addComponent: s.addComponent,
  })));

  const isSelected = pathsEqual(selectedComponentPath, path);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAddField, setShowAddField] = useState(false);

  const isDragging = dragState && pathsEqual(dragState.draggingPath, path);
  const isDragOver = dragState && pathsEqual(dragState.overPath, path);

  const handleDragStart = (e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', '');
    actions.setDragState({ draggingPath: path, overPath: null });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragState || pathsEqual(dragState.overPath, path)) return;
    actions.setDragState({ ...dragState, overPath: path });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dragState) {
      actions.moveComponentTo(dragState.draggingPath, path);
    }
  };

  const handleDragEnd = () => {
    actions.clearDragState();
  };

  const handleDelete = () => {
    if (confirmDelete) {
      actions.removeComponent(path);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 2000);
    }
  };

  const cardClass = [
    'fbc-field-card',
    isSelected && 'fbc-field-card--selected',
    isDragging && 'fbc-field-card--dragging',
    isDragOver && 'fbc-field-card--drag-over',
  ].filter(Boolean).join(' ');

  const TypeIcon = TYPE_ICONS[component.type];

  return (
    <div
      className={cardClass}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
    >
      <div className="fbc-card-header" onClick={() => actions.selectComponent(path)}>
        <span className="fbc-drag-handle" title="Drag to reorder">
          <GripVertical size={14} />
        </span>
        <span className="fbc-type-badge">
          {TypeIcon ? <TypeIcon size={12} /> : '?'}
        </span>
        <span className="fbc-card-name">{component.label || component.title || component.name}</span>
        <span className="fbc-card-field-name">{component.name}</span>

        <div className="fbc-card-actions" onClick={(e) => e.stopPropagation()}>
          <button type="button" className="fbc-card-btn" onClick={() => actions.moveComponentUp(path)} title="Move up">
            <ChevronUp size={14} />
          </button>
          <button type="button" className="fbc-card-btn" onClick={() => actions.moveComponentDown(path)} title="Move down">
            <ChevronDown size={14} />
          </button>
          <button type="button" className="fbc-card-btn" onClick={() => actions.duplicateComponent(path)} title="Duplicate">
            <Copy size={14} />
          </button>
          <button
            type="button"
            className={`fbc-card-btn fbc-card-btn--delete ${confirmDelete ? 'fbc-card-btn--confirm' : ''}`}
            onClick={handleDelete}
            title="Delete"
          >
            {confirmDelete ? 'Sure?' : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      {/* Nested fields for Group */}
      {component.type === 'group' && (
        <div className="fbc-card-nested">
          {component.components.map((child, j) => (
            <FieldCard key={child.name} component={child} path={[...path, 'group', j]} />
          ))}
          <div className="fbc-card-add-field">
            <button
              type="button"
              className="fbc-add-field-btn"
              onClick={() => setShowAddField((v) => !v)}
            >
              {showAddField
                ? <><Minus size={12} /> Close</>
                : <><Plus size={12} /> Add Field</>}
            </button>
            {showAddField && <FieldPalette parentPath={path} />}
          </div>
        </div>
      )}

      {/* Nested fields for Column */}
      {component.type === 'column' && (
        <div className="fbc-card-columns">
          {component.columns.map((col, c) => (
            <div key={c} className="fbc-card-column" style={{ flex: `0 0 ${(col.width / 12) * 100}%` }}>
              <div className="fbc-column-header">
                <span className="fbc-column-label">Col {c + 1} ({col.width}/12)</span>
              </div>
              {col.components.map((child, j) => (
                <FieldCard key={child.name} component={child} path={[...path, 'column', c, j]} />
              ))}
              <div className="fbc-card-add-field">
                <button
                  type="button"
                  className="fbc-add-field-btn"
                  onClick={() => actions.addComponent('text', [...path, 'column', c])}
                >
                  <Plus size={12} /> Add
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
