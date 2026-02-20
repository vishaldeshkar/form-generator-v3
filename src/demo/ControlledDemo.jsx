import { useEffect, useMemo } from 'react';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FormGenerator, buildYupSchema, buildDefaultValues } from '../lib';

const ROLE_DEPARTMENTS = {
  Admin: 'Engineering',
  Editor: 'Content',
  Viewer: 'Support',
};

function DepartmentAutoFill() {
  const role = useWatch({ name: 'role' });

  return (
    <div className="fg-field" style={{ padding: '8px 0', fontSize: '0.9em', color: '#666' }}>
      <strong>Parent watching role:</strong> {role || '(none selected)'}
      {role && <> → auto-fills department to "<em>{ROLE_DEPARTMENTS[role]}</em>"</>}
    </div>
  );
}

export default function ControlledDemo({ schema, onSubmit }) {
  const validationSchema = useMemo(
    () => buildYupSchema(schema.components),
    [schema.components]
  );

  const defaultValues = useMemo(
    () => buildDefaultValues(schema.components),
    [schema.components]
  );

  const methods = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: 'onBlur',
  });

  const role = methods.watch('role');

  useEffect(() => {
    if (role && ROLE_DEPARTMENTS[role]) {
      methods.setValue('department', ROLE_DEPARTMENTS[role]);
    }
  }, [role, methods]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="fg-form" noValidate>
        <FormGenerator schema={schema} />
        <DepartmentAutoFill />
        <button type="submit" className="fg-submit">
          Submit
        </button>
      </form>
    </FormProvider>
  );
}
