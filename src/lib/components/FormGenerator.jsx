import { useMemo, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormGeneratorProvider } from '../context/FormGeneratorContext';
import { buildYupSchema } from '../utils/buildYupSchema';
import { createEventEmitter } from '../utils/createEventEmitter';
import ComponentRenderer from './ComponentRenderer';
import '../styles/formGenerator.css';

function FormFields({ schema }) {
  return (
    <>
      {schema.title && <h2 className="fg-title">{schema.title}</h2>}
      {schema.description && (
        <p className="fg-description">{schema.description}</p>
      )}
      {schema.components.map((component) => (
        <ComponentRenderer key={component.name} component={component} />
      ))}
    </>
  );
}

const FormGenerator = forwardRef(function FormGenerator(
  {
    schema,
    onSubmit,
    customComponents = {},
    customValidation = {},
    defaultValues = {},
    optionLoaders = {},
  },
  ref
) {
  const externalMethods = useFormContext();
  const isControlled = !!externalMethods;

  // Event emitter — stable ref, no re-renders
  const emitterRef = useRef(null);
  if (!emitterRef.current) {
    emitterRef.current = createEventEmitter();
  }

  // Imperative options store
  const [imperativeOptions, setImperativeOptions] = useState({});

  const setFieldOptions = useCallback((fieldName, options) => {
    setImperativeOptions((prev) => ({ ...prev, [fieldName]: options }));
  }, []);

  // Validation & internal form (uncontrolled mode)
  const validationSchema = useMemo(
    () => (isControlled ? null : buildYupSchema(schema.components, customValidation)),
    [schema.components, customValidation, isControlled]
  );

  const internalMethods = useForm({
    resolver: isControlled ? undefined : yupResolver(validationSchema),
    defaultValues: isControlled ? undefined : defaultValues,
    mode: 'onBlur',
  });

  const activeMethods = isControlled ? externalMethods : internalMethods;

  // Expose imperative API via ref
  useImperativeHandle(
    ref,
    () => ({
      on: (event, callback) => emitterRef.current.on(event, callback),
      off: (event, callback) => emitterRef.current.off(event, callback),
      setFieldOptions,
      resetField: (fieldName, options) => activeMethods.resetField(fieldName, options),
      setValue: (fieldName, value, opts) => activeMethods.setValue(fieldName, value, opts),
      getValues: (fieldName) => activeMethods.getValues(fieldName),
    }),
    [setFieldOptions, activeMethods]
  );

  // Callback for fields to emit change events
  const emitFieldChange = useCallback(
    (fieldId, value) => {
      emitterRef.current.emit('fieldChange', fieldId, value);
    },
    []
  );

  const providerProps = {
    customComponents,
    optionLoaders,
    imperativeOptions,
    emitFieldChange,
  };

  if (isControlled) {
    return (
      <FormGeneratorProvider {...providerProps}>
        <FormFields schema={schema} />
      </FormGeneratorProvider>
    );
  }

  return (
    <FormGeneratorProvider {...providerProps}>
      <FormProvider {...internalMethods}>
        <form onSubmit={internalMethods.handleSubmit(onSubmit)} className="fg-form" noValidate>
          <FormFields schema={schema} />
          <button type="submit" className="fg-submit">
            Submit
          </button>
        </form>
      </FormProvider>
    </FormGeneratorProvider>
  );
});

export default FormGenerator;
