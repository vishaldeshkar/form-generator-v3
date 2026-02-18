import { useMemo } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormGeneratorProvider } from '../context/FormGeneratorContext';
import { buildYupSchema } from '../utils/buildYupSchema';
import ComponentRenderer from './ComponentRenderer';
import '../styles/formGenerator.css';

export default function FormGenerator({
  schema,
  onSubmit,
  customComponents = {},
  customValidation = {},
  defaultValues = {},
}) {
  const validationSchema = useMemo(
    () => buildYupSchema(schema.components, customValidation),
    [schema.components, customValidation]
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: 'onBlur',
  });

  return (
    <FormGeneratorProvider customComponents={customComponents}>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="fg-form" noValidate>
          {schema.title && <h2 className="fg-title">{schema.title}</h2>}
          {schema.description && (
            <p className="fg-description">{schema.description}</p>
          )}
          {schema.components.map((component) => (
            <ComponentRenderer key={component.name} component={component} />
          ))}
          <button type="submit" className="fg-submit">
            Submit
          </button>
        </form>
      </FormProvider>
    </FormGeneratorProvider>
  );
}
