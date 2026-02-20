import { createContext, useContext } from 'react';

const FormBuilderContext = createContext(null);

export function FormBuilderProvider({ value, children }) {
  return (
    <FormBuilderContext.Provider value={value}>
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilderContext() {
  const ctx = useContext(FormBuilderContext);
  if (!ctx) {
    throw new Error('useFormBuilderContext must be used within a FormBuilderProvider');
  }
  return ctx;
}

export default FormBuilderContext;
