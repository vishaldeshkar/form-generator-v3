import { createStore } from 'zustand';
import { generateFieldName, collectFieldNames } from '../utils/generateFieldName';

// ── Default field templates ────────────────────────────────────────────

const FIELD_DEFAULTS = {
  text: (name) => ({ type: 'text', name, label: 'Text Field' }),
  email: (name) => ({ type: 'email', name, label: 'Email' }),
  textarea: (name) => ({ type: 'textarea', name, label: 'Textarea', rows: 4 }),
  checkbox: (name) => ({ type: 'checkbox', name, label: 'Checkbox' }),
  radio: (name) => ({
    type: 'radio', name, label: 'Radio Group',
    options: [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }],
  }),
  select: (name) => ({
    type: 'select', name, label: 'Select',
    options: [{ label: 'Option 1', value: 'option1' }, { label: 'Option 2', value: 'option2' }],
  }),
  date: (name) => ({ type: 'date', name, label: 'Date' }),
  group: (name) => ({ type: 'group', name, title: 'Group', titleTemplate: '', description: '', components: [] }),
  column: (name) => ({
    type: 'column', name,
    columns: [
      { width: 6, components: [] },
      { width: 6, components: [] },
    ],
  }),
};

// ── Path resolution helpers ────────────────────────────────────────────

function resolvePath(schema, path) {
  if (!path || path.length === 0) return null;

  if (path.length === 1) {
    const [i] = path;
    return { parentArray: schema.components, index: i, component: schema.components[i] };
  }

  if (path.length === 3 && path[1] === 'group') {
    const [i, , j] = path;
    const group = schema.components[i];
    return { parentArray: group.components, index: j, component: group.components[j] };
  }

  if (path.length === 4 && path[1] === 'column') {
    const [i, , c, j] = path;
    const col = schema.components[i].columns[c];
    return { parentArray: col.components, index: j, component: col.components[j] };
  }

  return null;
}

export function resolveComponent(schema, path) {
  const resolved = resolvePath(schema, path);
  return resolved ? resolved.component : null;
}

export function pathsEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

// ── Immutable array helpers ────────────────────────────────────────────

function arrayWith(arr, index, value) {
  const next = [...arr];
  next[index] = value;
  return next;
}

function arrayInsert(arr, index, value) {
  const next = [...arr];
  next.splice(index, 0, value);
  return next;
}

function arrayRemove(arr, index) {
  return arr.filter((_, i) => i !== index);
}

function arraySwap(arr, a, b) {
  if (a < 0 || b < 0 || a >= arr.length || b >= arr.length) return arr;
  const next = [...arr];
  [next[a], next[b]] = [next[b], next[a]];
  return next;
}

// ── Update helpers ─────────────────────────────────────────────────────

function updateComponentAtPath(schema, path, updater) {
  if (path.length === 1) {
    const [i] = path;
    return {
      ...schema,
      components: arrayWith(schema.components, i, updater(schema.components[i])),
    };
  }

  if (path.length === 3 && path[1] === 'group') {
    const [i, , j] = path;
    const group = schema.components[i];
    return {
      ...schema,
      components: arrayWith(schema.components, i, {
        ...group,
        components: arrayWith(group.components, j, updater(group.components[j])),
      }),
    };
  }

  if (path.length === 4 && path[1] === 'column') {
    const [i, , c, j] = path;
    const colLayout = schema.components[i];
    const col = colLayout.columns[c];
    return {
      ...schema,
      components: arrayWith(schema.components, i, {
        ...colLayout,
        columns: arrayWith(colLayout.columns, c, {
          ...col,
          components: arrayWith(col.components, j, updater(col.components[j])),
        }),
      }),
    };
  }

  return schema;
}

function updateParentArrayAtPath(schema, path, updater) {
  if (path.length === 1) {
    return { ...schema, components: updater(schema.components) };
  }

  if (path.length === 3 && path[1] === 'group') {
    const [i] = path;
    const group = schema.components[i];
    return {
      ...schema,
      components: arrayWith(schema.components, i, {
        ...group,
        components: updater(group.components),
      }),
    };
  }

  if (path.length === 4 && path[1] === 'column') {
    const [i, , c] = path;
    const colLayout = schema.components[i];
    const col = colLayout.columns[c];
    return {
      ...schema,
      components: arrayWith(schema.components, i, {
        ...colLayout,
        columns: arrayWith(colLayout.columns, c, {
          ...col,
          components: updater(col.components),
        }),
      }),
    };
  }

  return schema;
}

// ── Store factory ──────────────────────────────────────────────────────

export function createFormBuilderStore(initialSchema) {
  return createStore((set, get) => ({
    // ── State ──
    schema: initialSchema || { title: 'Untitled Form', description: '', components: [] },
    selectedComponentPath: null,
    dragState: null,

    // ── Actions ──

    setTitle: (title) => set((s) => ({
      schema: { ...s.schema, title },
    })),

    setDescription: (description) => set((s) => ({
      schema: { ...s.schema, description },
    })),

    addComponent: (componentType, parentPath) => set((s) => {
      const { schema } = s;
      const existingNames = collectFieldNames(schema.components);
      const name = generateFieldName(componentType, existingNames);
      const newComp = FIELD_DEFAULTS[componentType](name);

      if (!parentPath) {
        return { schema: { ...schema, components: [...schema.components, newComp] } };
      }

      if (parentPath.length === 1) {
        const [i] = parentPath;
        const parent = schema.components[i];
        if (parent.type === 'group') {
          return {
            schema: {
              ...schema,
              components: arrayWith(schema.components, i, {
                ...parent,
                components: [...parent.components, newComp],
              }),
            },
          };
        }
      }

      if (parentPath.length === 3 && parentPath[1] === 'column') {
        const [i, , c] = parentPath;
        const colLayout = schema.components[i];
        const col = colLayout.columns[c];
        return {
          schema: {
            ...schema,
            components: arrayWith(schema.components, i, {
              ...colLayout,
              columns: arrayWith(colLayout.columns, c, {
                ...col,
                components: [...col.components, newComp],
              }),
            }),
          },
        };
      }

      return s;
    }),

    removeComponent: (path) => set((s) => {
      const { schema } = s;
      const resolved = resolvePath(schema, path);
      if (!resolved) return s;

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arrayRemove(arr, resolved.index)
      );

      let selectedPath = s.selectedComponentPath;
      if (selectedPath && pathsEqual(selectedPath, path)) {
        selectedPath = null;
      }

      return { schema: newSchema, selectedComponentPath: selectedPath };
    }),

    moveComponentUp: (path) => set((s) => {
      const { schema } = s;
      const resolved = resolvePath(schema, path);
      if (!resolved || resolved.index === 0) return s;

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arraySwap(arr, resolved.index, resolved.index - 1)
      );

      const newPath = [...path];
      newPath[newPath.length - 1] = resolved.index - 1;

      return {
        schema: newSchema,
        selectedComponentPath: s.selectedComponentPath && pathsEqual(s.selectedComponentPath, path)
          ? newPath : s.selectedComponentPath,
      };
    }),

    moveComponentDown: (path) => set((s) => {
      const { schema } = s;
      const resolved = resolvePath(schema, path);
      if (!resolved || resolved.index >= resolved.parentArray.length - 1) return s;

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arraySwap(arr, resolved.index, resolved.index + 1)
      );

      const newPath = [...path];
      newPath[newPath.length - 1] = resolved.index + 1;

      return {
        schema: newSchema,
        selectedComponentPath: s.selectedComponentPath && pathsEqual(s.selectedComponentPath, path)
          ? newPath : s.selectedComponentPath,
      };
    }),

    duplicateComponent: (path) => set((s) => {
      const { schema } = s;
      const resolved = resolvePath(schema, path);
      if (!resolved) return s;

      const existingNames = collectFieldNames(schema.components);
      const clone = JSON.parse(JSON.stringify(resolved.component));
      clone.name = generateFieldName(clone.type, existingNames);
      if (clone.label) clone.label = clone.label + ' (copy)';

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arrayInsert(arr, resolved.index + 1, clone)
      );

      return { schema: newSchema };
    }),

    updateComponent: (path, changes) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        ...changes,
      }));
      return { schema: newSchema };
    }),

    selectComponent: (path) => set({ selectedComponentPath: path }),

    deselectComponent: () => set({ selectedComponentPath: null }),

    addOption: (path) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        options: [...(comp.options || []), { label: '', value: '' }],
      }));
      return { schema: newSchema };
    }),

    updateOption: (path, optionIndex, changes) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        options: arrayWith(comp.options, optionIndex, {
          ...comp.options[optionIndex],
          ...changes,
        }),
      }));
      return { schema: newSchema };
    }),

    removeOption: (path, optionIndex) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        options: arrayRemove(comp.options, optionIndex),
      }));
      return { schema: newSchema };
    }),

    moveOptionUp: (path, optionIndex) => set((s) => {
      if (optionIndex === 0) return s;
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        options: arraySwap(comp.options, optionIndex, optionIndex - 1),
      }));
      return { schema: newSchema };
    }),

    moveOptionDown: (path, optionIndex) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => {
        if (optionIndex >= (comp.options || []).length - 1) return comp;
        return { ...comp, options: arraySwap(comp.options, optionIndex, optionIndex + 1) };
      });
      return { schema: newSchema };
    }),

    addColumn: (path) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        columns: [...comp.columns, { width: 6, components: [] }],
      }));
      return { schema: newSchema };
    }),

    removeColumn: (path, columnIndex) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        columns: arrayRemove(comp.columns, columnIndex),
      }));
      return { schema: newSchema };
    }),

    updateColumnWidth: (path, columnIndex, width) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        columns: arrayWith(comp.columns, columnIndex, {
          ...comp.columns[columnIndex],
          width,
        }),
      }));
      return { schema: newSchema };
    }),

    setDependencyRule: (path, dependencyType, rule) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => ({
        ...comp,
        dependencies: {
          ...comp.dependencies,
          [dependencyType]: rule,
        },
      }));
      return { schema: newSchema };
    }),

    removeDependencyRule: (path, dependencyType) => set((s) => {
      const newSchema = updateComponentAtPath(s.schema, path, (comp) => {
        const deps = { ...comp.dependencies };
        delete deps[dependencyType];
        const hasDeps = Object.keys(deps).length > 0;
        const updated = { ...comp };
        if (hasDeps) {
          updated.dependencies = deps;
        } else {
          delete updated.dependencies;
        }
        return updated;
      });
      return { schema: newSchema };
    }),

    setDragState: (dragState) => set({ dragState }),

    clearDragState: () => set({ dragState: null }),

    moveComponentTo: (fromPath, toPath) => set((s) => {
      const { schema } = s;
      if (pathsEqual(fromPath, toPath)) return { dragState: null };

      if (fromPath.length !== toPath.length) return { dragState: null };
      const fromPrefix = fromPath.slice(0, -1);
      const toPrefix = toPath.slice(0, -1);
      if (fromPrefix.join(',') !== toPrefix.join(',')) return { dragState: null };

      const fromResolved = resolvePath(schema, fromPath);
      const toResolved = resolvePath(schema, toPath);
      if (!fromResolved || !toResolved) return { dragState: null };

      const fromIdx = fromResolved.index;
      const toIdx = toResolved.index;

      const newSchema = updateParentArrayAtPath(schema, fromPath, (arr) => {
        const next = [...arr];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });

      return { schema: newSchema, dragState: null };
    }),

    loadSchema: (schema) => set({ schema, selectedComponentPath: null }),

    resetSchema: () => set({
      schema: { title: 'Untitled Form', description: '', components: [] },
      selectedComponentPath: null,
    }),
  }));
}
