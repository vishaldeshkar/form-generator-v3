import { createContext, useContext } from 'react';

const FormGeneratorContext = createContext({
  customComponents: {},
});

export function FormGeneratorProvider({ customComponents = {}, children }) {
  return (
    <FormGeneratorContext.Provider value={{ customComponents }}>
      {children}
    </FormGeneratorContext.Provider>
  );
}

export function useFormGeneratorContext() {
  return useContext(FormGeneratorContext);
}
