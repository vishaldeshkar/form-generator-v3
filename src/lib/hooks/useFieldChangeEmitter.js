import { useCallback } from 'react';
import { useFormGeneratorContext } from '../context/FormGeneratorContext';

export function useFieldChangeEmitter(fieldName) {
  const { emitFieldChange } = useFormGeneratorContext();

  const wrapOnChange = useCallback(
    (originalOnChange) => (eventOrValue) => {
      originalOnChange(eventOrValue);

      let value;
      if (eventOrValue?.target !== undefined) {
        value =
          eventOrValue.target.type === 'checkbox'
            ? eventOrValue.target.checked
            : eventOrValue.target.value;
      } else {
        value = eventOrValue;
      }

      if (emitFieldChange) {
        emitFieldChange(fieldName, value);
      }
    },
    [fieldName, emitFieldChange]
  );

  return { wrapOnChange };
}
