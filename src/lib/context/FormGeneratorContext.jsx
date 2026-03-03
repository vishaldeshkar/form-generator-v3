import { createContext, useContext } from 'react';

const FormGeneratorContext = createContext({
  customComponents: {},
  optionLoaders: {},
  imperativeOptions: {},
  emitFieldChange: null,
  disabledFields: [],
});

export function FormGeneratorProvider({
  customComponents = {},
  optionLoaders = {},
  imperativeOptions = {},
  emitFieldChange = null,
  disabledFields = [],
  children,
}) {
  return (
    <FormGeneratorContext.Provider
      value={{ customComponents, optionLoaders, imperativeOptions, emitFieldChange, disabledFields }}
    >
      {children}
    </FormGeneratorContext.Provider>
  );
}

export function useFormGeneratorContext() {
  return useContext(FormGeneratorContext);
}
