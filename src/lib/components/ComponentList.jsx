import { useMemo } from 'react';
import { useWatch } from 'react-hook-form';
import { evaluateRule } from '../utils/evaluateDependencies';
import ComponentRenderer from './ComponentRenderer';

/**
 * Collects all field names watched by group-type component visibility dependencies.
 */
function collectGroupWatchedFields(components) {
  const fields = new Set();
  for (const comp of components) {
    if (comp.type === 'group' && comp.dependencies?.visibility) {
      for (const cond of comp.dependencies.visibility.conditions) {
        if (cond.field) fields.add(cond.field);
      }
    }
  }
  return [...fields];
}

/**
 * Renders a list of components, computing visible group indices
 * for dynamic title templates that use {n}.
 */
export default function ComponentList({ components }) {
  const watchedFields = useMemo(
    () => collectGroupWatchedFields(components),
    [components]
  );

  const watchedValues = useWatch({ name: watchedFields.length > 0 ? watchedFields : ['__noop__'] });

  const valuesMap = useMemo(() => {
    if (watchedFields.length === 0) return {};
    const map = {};
    watchedFields.forEach((f, i) => {
      map[f] = watchedValues[i];
    });
    return map;
  }, [watchedFields, watchedValues]);

  const groupIndexMap = useMemo(() => {
    const map = {};
    let visibleGroupCount = 0;

    for (const comp of components) {
      if (comp.type === 'group') {
        const isVisible = comp.dependencies?.visibility
          ? evaluateRule(comp.dependencies.visibility, valuesMap)
          : true;

        if (isVisible) {
          visibleGroupCount++;
          map[comp.name] = visibleGroupCount;
        }
      }
    }

    return map;
  }, [components, valuesMap]);

  return (
    <>
      {components.map((component) => (
        <ComponentRenderer
          key={component.name}
          component={component}
          visibleGroupIndex={groupIndexMap[component.name] ?? null}
        />
      ))}
    </>
  );
}
