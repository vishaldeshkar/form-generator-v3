import { useFormContext, Controller } from 'react-hook-form';

export default function TextareaField({ component, isRequired, isDisabled }) {
  const { control } = useFormContext();
  const { name, label, placeholder, helpText, rows = 4 } = component;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="fg-field">
          {label && (
            <label htmlFor={name} className="fg-label">
              {label}
              {isRequired && <span className="fg-required">*</span>}
            </label>
          )}
          <textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={placeholder}
            disabled={isDisabled}
            className="fg-textarea"
            value={field.value ?? ''}
          />
          {helpText && <p className="fg-help">{helpText}</p>}
          {error && <p className="fg-error">{error.message}</p>}
        </div>
      )}
    />
  );
}
