import { useFormContext, Controller } from 'react-hook-form';
import { useFormGeneratorContext } from '../../context/FormGeneratorContext';
import { useFieldChangeEmitter } from '../../hooks/useFieldChangeEmitter';

export default function CustomField({ component, isRequired, isDisabled }) {
  const { control } = useFormContext();
  const { customComponents } = useFormGeneratorContext();
  const { name, label, helpText, componentKey } = component;
  const { wrapOnChange } = useFieldChangeEmitter(name);

  const CustomComponent = customComponents[componentKey];

  if (!CustomComponent) {
    return (
      <div className="fg-field fg-error">
        Unknown custom component: {componentKey}
      </div>
    );
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="fg-field">
          <CustomComponent
            name={name}
            label={label}
            value={field.value}
            onChange={wrapOnChange(field.onChange)}
            onBlur={field.onBlur}
            error={error?.message}
            helpText={helpText}
            disabled={isDisabled}
          />
        </div>
      )}
    />
  );
}
