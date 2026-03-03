import ComponentList from '../ComponentList';

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
          <ComponentList components={col.components} />
        </div>
      ))}
    </div>
  );
}
