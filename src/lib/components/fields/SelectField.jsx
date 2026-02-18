import { useFormContext, Controller } from 'react-hook-form';
import { normalizeOptions } from '../../utils/normalizeOptions';

export default function SelectField({ component, isRequired, isDisabled }) {
  const { control } = useFormContext();
  const { name, label, placeholder, helpText, options } = component;
  const normalizedOptions = normalizeOptions(options);

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
          <select
            {...field}
            id={name}
            disabled={isDisabled}
            className="fg-select"
            value={field.value ?? ''}
          >
            <option value="">{placeholder || 'Select...'}</option>
            {normalizedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {helpText && <p className="fg-help">{helpText}</p>}
          {error && <p className="fg-error">{error.message}</p>}
        </div>
      )}
    />
  );
}
