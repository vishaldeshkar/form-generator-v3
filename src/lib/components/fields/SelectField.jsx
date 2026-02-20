import { useFormContext, Controller } from 'react-hook-form';
import { useDynamicOptions } from '../../hooks/useDynamicOptions';
import { useFieldChangeEmitter } from '../../hooks/useFieldChangeEmitter';

export default function SelectField({ component, isRequired, isDisabled }) {
  const { control } = useFormContext();
  const { name, label, placeholder, helpText } = component;
  const { wrapOnChange } = useFieldChangeEmitter(name);
  const { normalizedOptions, loading, error: fetchError } = useDynamicOptions(component);

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
            onChange={wrapOnChange(field.onChange)}
            id={name}
            disabled={isDisabled || loading}
            className="fg-select"
            value={field.value ?? ''}
          >
            <option value="">{loading ? 'Loading...' : placeholder || 'Select...'}</option>
            {normalizedOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {helpText && <p className="fg-help">{helpText}</p>}
          {fetchError && <p className="fg-error">{fetchError}</p>}
          {error && <p className="fg-error">{error.message}</p>}
        </div>
      )}
    />
  );
}
