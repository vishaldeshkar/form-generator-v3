import ComponentList from '../ComponentList';

export default function GroupLayout({ component, visibleGroupIndex }) {
  const { title, titleTemplate, description, components } = component;

  let displayTitle = title;
  if (titleTemplate) {
    displayTitle = visibleGroupIndex != null
      ? titleTemplate.replace(/\{n\}/g, String(visibleGroupIndex))
      : titleTemplate.replace(/\{n\}/g, '');
  }

  return (
    <fieldset className="fg-group">
      {displayTitle && <legend className="fg-group-title">{displayTitle}</legend>}
      {description && <p className="fg-group-description">{description}</p>}
      <ComponentList components={components} />
    </fieldset>
  );
}
