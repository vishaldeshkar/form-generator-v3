import ComponentRenderer from '../ComponentRenderer';

export default function GroupLayout({ component }) {
  const { title, description, components } = component;

  return (
    <fieldset className="fg-group">
      {title && <legend className="fg-group-title">{title}</legend>}
      {description && <p className="fg-group-description">{description}</p>}
      {components.map((child) => (
        <ComponentRenderer key={child.name} component={child} />
      ))}
    </fieldset>
  );
}
