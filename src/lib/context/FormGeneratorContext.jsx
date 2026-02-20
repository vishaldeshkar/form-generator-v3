import { createContext, useContext } from 'react';

const FormGeneratorContext = createContext({
  customComponents: {},
  optionLoaders: {},
  imperativeOptions: {},
  emitFieldChange: null,
});

export function FormGeneratorProvider({
  customComponents = {},
  optionLoaders = {},
  imperativeOptions = {},
  emitFieldChange = null,
  children,
}) {
  return (
    <FormGeneratorContext.Provider
      value={{ customComponents, optionLoaders, imperativeOptions, emitFieldChange }}
    >
      {children}
    </FormGeneratorContext.Provider>
  );
}

export function useFormGeneratorContext() {
  return useContext(FormGeneratorContext);
}
