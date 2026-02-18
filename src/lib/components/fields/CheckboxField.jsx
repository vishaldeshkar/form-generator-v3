import { useFormContext, Controller } from 'react-hook-form';

export default function CheckboxField({ component, isRequired, isDisabled }) {
  const { control } = useFormContext();
  const { name, label, helpText } = component;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="fg-field fg-field--checkbox">
          <label className="fg-checkbox-label">
            <input
              type="checkbox"
              checked={!!field.value}
              onChange={(e) => field.onChange(e.target.checked)}
              onBlur={field.onBlur}
              disabled={isDisabled}
              className="fg-checkbox"
            />
            {label}
            {isRequired && <span className="fg-required">*</span>}
          </label>
          {helpText && <p className="fg-help">{helpText}</p>}
          {error && <p className="fg-error">{error.message}</p>}
        </div>
      )}
    />
  );
}
