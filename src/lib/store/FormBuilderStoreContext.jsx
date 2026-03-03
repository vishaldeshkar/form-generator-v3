import { createContext, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { createFormBuilderStore } from './formBuilderStore';

const FormBuilderStoreContext = createContext(null);

export function FormBuilderStoreProvider({ initialSchema, children }) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = createFormBuilderStore(initialSchema);
  }
  return (
    <FormBuilderStoreContext.Provider value={storeRef.current}>
      {children}
    </FormBuilderStoreContext.Provider>
  );
}

export function useFormBuilderStore(selector) {
  const store = useContext(FormBuilderStoreContext);
  if (!store) {
    throw new Error('useFormBuilderStore must be used within FormBuilderStoreProvider');
  }
  return useStore(store, selector);
}
