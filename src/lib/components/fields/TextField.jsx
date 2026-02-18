import { useFormContext, Controller } from 'react-hook-form';

export default function TextField({ component, isRequired, isDisabled }) {
  const { control } = useFormContext();
  const { name, label, placeholder, helpText, type } = component;

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
          <input
            {...field}
            id={name}
            type={type === 'email' ? 'email' : 'text'}
            placeholder={placeholder}
            disabled={isDisabled}
            className="fg-input"
            value={field.value ?? ''}
          />
          {helpText && <p className="fg-help">{helpText}</p>}
          {error && <p className="fg-error">{error.message}</p>}
        </div>
      )}
    />
  );
}
