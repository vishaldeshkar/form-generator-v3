import { useDependency } from '../hooks/useDependency';
import { useFormGeneratorContext } from '../context/FormGeneratorContext';
import TextField from './fields/TextField';
import TextareaField from './fields/TextareaField';
import CheckboxField from './fields/CheckboxField';
import RadioField from './fields/RadioField';
import SelectField from './fields/SelectField';
import DateField from './fields/DateField';
import CustomField from './fields/CustomField';
import GroupLayout from './layout/GroupLayout';
import ColumnLayout from './layout/ColumnLayout';

const FIELD_COMPONENTS = {
  text: TextField,
  email: TextField,
  textarea: TextareaField,
  checkbox: CheckboxField,
  radio: RadioField,
  select: SelectField,
  date: DateField,
  custom: CustomField,
};

export default function ComponentRenderer({ component, visibleGroupIndex }) {
  const isLayoutType = component.type === 'group' || component.type === 'column';
  const fieldName = isLayoutType ? null : component.name;

  const { isVisible, isRequired, isDisabled } = useDependency(
    fieldName,
    component.dependencies
  );

  const { disabledFields } = useFormGeneratorContext();
  const runtimeDisabled = !isLayoutType && disabledFields.includes(component.name);

  if (!isVisible) return null;

  if (component.type === 'group') {
    return <GroupLayout component={component} visibleGroupIndex={visibleGroupIndex} />;
  }

  if (component.type === 'column') {
    return <ColumnLayout component={component} />;
  }

  const FieldComponent = FIELD_COMPONENTS[component.type];
  if (!FieldComponent) {
    return <div className="fg-error">Unknown type: {component.type}</div>;
  }

  return (
    <FieldComponent
      component={component}
      isRequired={isRequired || component.isRequired}
      isDisabled={isDisabled || component.isDisabled || runtimeDisabled}
    />
  );
}
