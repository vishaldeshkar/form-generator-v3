import { useState, useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormGeneratorContext } from '../context/FormGeneratorContext';
import { normalizeOptions } from '../utils/normalizeOptions';

export function useDynamicOptions(component) {
  const { name, options: staticOptions, optionsDependsOn } = component;
  const { optionLoaders, imperativeOptions } = useFormGeneratorContext();
  const { watch, setValue } = useFormContext();

  const loader = optionLoaders[name];
  const dependentValue = optionsDependsOn ? watch(optionsDependsOn) : undefined;

  const [state, setState] = useState({ options: [], loading: false, error: null });
  const prevDependent = useRef(dependentValue);

  useEffect(() => {
    if (!loader) return;

    // For chained dropdowns: skip fetch if parent has no value yet
    if (optionsDependsOn && !dependentValue) {
      setState({ options: [], loading: false, error: null });
      setValue(name, '');
      return;
    }

    // Reset own value when parent selection changes (not on initial mount)
    if (optionsDependsOn && prevDependent.current !== dependentValue) {
      setValue(name, '');
    }
    prevDependent.current = dependentValue;

    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    loader(dependentValue)
      .then((data) => {
        if (!cancelled) setState({ options: normalizeOptions(data), loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled) setState({ options: [], loading: false, error: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [dependentValue, loader]);

  // Imperative options take precedence when set
  const imperativeOpts = imperativeOptions[name];
  if (imperativeOpts != null) {
    return { normalizedOptions: normalizeOptions(imperativeOpts), loading: false, error: null };
  }

  // No loader → return static options; loader present → return dynamic state
  if (!loader) {
    return { normalizedOptions: normalizeOptions(staticOptions), loading: false, error: null };
  }
  return { normalizedOptions: state.options, loading: state.loading, error: state.error };
}
