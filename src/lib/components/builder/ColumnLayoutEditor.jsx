import { X, Plus } from 'lucide-react';
import { useFormBuilderContext } from '../../context/FormBuilderContext';

const WIDTH_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 12];

export default function ColumnLayoutEditor({ component, path }) {
  const { actions } = useFormBuilderContext();
  const columns = component.columns || [];
  const totalWidth = columns.reduce((sum, col) => sum + col.width, 0);

  return (
    <div className="fbc-layout-editor">
      <div className="fbc-editor-section-title">Column Settings</div>

      <div className="fbc-column-summary">
        Total width: <strong className={totalWidth !== 12 ? 'fbc-warning-text' : ''}>{totalWidth}/12</strong>
        {totalWidth !== 12 && <span className="fbc-warning-text"> (should equal 12)</span>}
      </div>

      {columns.map((col, c) => (
        <div key={c} className="fbc-column-config-row">
          <span className="fbc-column-config-label">Column {c + 1}</span>
          <select
            className="fbc-form-input fbc-column-width-select"
            value={col.width}
            onChange={(e) => actions.updateColumnWidth(path, c, parseInt(e.target.value, 10))}
          >
            {WIDTH_OPTIONS.map((w) => (
              <option key={w} value={w}>{w}/12</option>
            ))}
          </select>
          {columns.length > 2 && (
            <button
              type="button"
              className="fbc-card-btn fbc-card-btn--delete"
              onClick={() => actions.removeColumn(path, c)}
              title="Remove column"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}

      {columns.length < 4 && (
        <button type="button" className="fbc-add-option-btn" onClick={() => actions.addColumn(path)}>
          <Plus size={12} /> Add Column
        </button>
      )}
    </div>
  );
}
