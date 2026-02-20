import { useFormContext, Controller } from 'react-hook-form';
import { normalizeOptions } from '../../utils/normalizeOptions';
import { useFormGeneratorContext } from '../../context/FormGeneratorContext';

export default function RadioField({ component, isRequired, isDisabled }) {
  const { control } = useFormContext();
  const { name, label, helpText, options } = component;
  const { emitFieldChange } = useFormGeneratorContext();
  const normalizedOptions = normalizeOptions(options);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <div className="fg-field">
          {label && (
            <span className="fg-label">
              {label}
              {isRequired && <span className="fg-required">*</span>}
            </span>
          )}
          <div className="fg-radio-group">
            {normalizedOptions.map((opt) => (
              <label key={opt.value} className="fg-radio-label">
                <input
                  type="radio"
                  name={name}
                  value={opt.value}
                  checked={field.value === opt.value}
                  onChange={() => {
                    field.onChange(opt.value);
                    if (emitFieldChange) emitFieldChange(name, opt.value);
                  }}
                  onBlur={field.onBlur}
                  disabled={isDisabled}
                  className="fg-radio"
                />
                {opt.label}
              </label>
            ))}
          </div>
          {helpText && <p className="fg-help">{helpText}</p>}
          {error && <p className="fg-error">{error.message}</p>}
        </div>
      )}
    />
  );
}
