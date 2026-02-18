import ComponentRenderer from '../ComponentRenderer';

export default function ColumnLayout({ component }) {
  const { columns } = component;

  return (
    <div className="fg-columns">
      {columns.map((col, idx) => (
        <div
          key={idx}
          className="fg-column"
          style={{ flex: `0 0 ${(col.width / 12) * 100}%` }}
        >
          {col.components.map((child) => (
            <ComponentRenderer key={child.name} component={child} />
          ))}
        </div>
      ))}
    </div>
  );
}
