import { useReducer, useMemo } from 'react';
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
  group: (name) => ({ type: 'group', name, title: 'Group', description: '', components: [] }),
  column: (name) => ({
    type: 'column', name,
    columns: [
      { width: 6, components: [] },
      { width: 6, components: [] },
    ],
  }),
};

// ── Path resolution helpers ────────────────────────────────────────────

/**
 * Resolves a path array to { parentArray, index, component }.
 * Path formats:
 *   [i]                   → schema.components[i]
 *   [i, 'group', j]      → schema.components[i].components[j]
 *   [i, 'column', c, j]  → schema.components[i].columns[c].components[j]
 */
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

// ── Update a component at a given path immutably ───────────────────────

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

// ── Replace parent array at a given path immutably ─────────────────────

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

// ── Reducer ────────────────────────────────────────────────────────────

function formBuilderReducer(state, action) {
  const { schema } = state;

  switch (action.type) {
    // ─── Schema meta ───
    case 'SET_SCHEMA_TITLE':
      return { ...state, schema: { ...schema, title: action.payload.title } };

    case 'SET_SCHEMA_DESCRIPTION':
      return { ...state, schema: { ...schema, description: action.payload.description } };

    // ─── Add component ───
    case 'ADD_COMPONENT': {
      const { componentType, parentPath } = action.payload;
      const existingNames = collectFieldNames(schema.components);
      const name = generateFieldName(componentType, existingNames);
      const newComp = FIELD_DEFAULTS[componentType](name);

      if (!parentPath) {
        // Add to top level
        return {
          ...state,
          schema: { ...schema, components: [...schema.components, newComp] },
        };
      }

      // Add into a group or column
      if (parentPath.length === 1) {
        const [i] = parentPath;
        const parent = schema.components[i];
        if (parent.type === 'group') {
          return {
            ...state,
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

      // Add into a specific column slot: parentPath = [i, 'column', c]
      if (parentPath.length === 3 && parentPath[1] === 'column') {
        const [i, , c] = parentPath;
        const colLayout = schema.components[i];
        const col = colLayout.columns[c];
        return {
          ...state,
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

      return state;
    }

    // ─── Remove component ───
    case 'REMOVE_COMPONENT': {
      const { path } = action.payload;
      const resolved = resolvePath(schema, path);
      if (!resolved) return state;

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arrayRemove(arr, resolved.index)
      );

      // Deselect if removing the selected component
      let selectedPath = state.selectedComponentPath;
      if (selectedPath && pathsEqual(selectedPath, path)) {
        selectedPath = null;
      }

      return { ...state, schema: newSchema, selectedComponentPath: selectedPath };
    }

    // ─── Move component up/down ───
    case 'MOVE_COMPONENT_UP': {
      const { path } = action.payload;
      const resolved = resolvePath(schema, path);
      if (!resolved || resolved.index === 0) return state;

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arraySwap(arr, resolved.index, resolved.index - 1)
      );

      // Update selected path
      const newPath = [...path];
      newPath[newPath.length - 1] = resolved.index - 1;

      return {
        ...state,
        schema: newSchema,
        selectedComponentPath: state.selectedComponentPath && pathsEqual(state.selectedComponentPath, path)
          ? newPath : state.selectedComponentPath,
      };
    }

    case 'MOVE_COMPONENT_DOWN': {
      const { path } = action.payload;
      const resolved = resolvePath(schema, path);
      if (!resolved || resolved.index >= resolved.parentArray.length - 1) return state;

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arraySwap(arr, resolved.index, resolved.index + 1)
      );

      const newPath = [...path];
      newPath[newPath.length - 1] = resolved.index + 1;

      return {
        ...state,
        schema: newSchema,
        selectedComponentPath: state.selectedComponentPath && pathsEqual(state.selectedComponentPath, path)
          ? newPath : state.selectedComponentPath,
      };
    }

    // ─── Duplicate component ───
    case 'DUPLICATE_COMPONENT': {
      const { path } = action.payload;
      const resolved = resolvePath(schema, path);
      if (!resolved) return state;

      const existingNames = collectFieldNames(schema.components);
      const clone = JSON.parse(JSON.stringify(resolved.component));
      clone.name = generateFieldName(clone.type, existingNames);
      if (clone.label) clone.label = clone.label + ' (copy)';

      const newSchema = updateParentArrayAtPath(schema, path, (arr) =>
        arrayInsert(arr, resolved.index + 1, clone)
      );

      return { ...state, schema: newSchema };
    }

    // ─── Update component properties ───
    case 'UPDATE_COMPONENT': {
      const { path, changes } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        ...changes,
      }));
      return { ...state, schema: newSchema };
    }

    // ─── Selection ───
    case 'SELECT_COMPONENT':
      return { ...state, selectedComponentPath: action.payload.path };

    case 'DESELECT_COMPONENT':
      return { ...state, selectedComponentPath: null };

    // ─── Options (radio/select) ───
    case 'ADD_OPTION': {
      const { path } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        options: [...(comp.options || []), { label: '', value: '' }],
      }));
      return { ...state, schema: newSchema };
    }

    case 'UPDATE_OPTION': {
      const { path, optionIndex, changes } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        options: arrayWith(comp.options, optionIndex, {
          ...comp.options[optionIndex],
          ...changes,
        }),
      }));
      return { ...state, schema: newSchema };
    }

    case 'REMOVE_OPTION': {
      const { path, optionIndex } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        options: arrayRemove(comp.options, optionIndex),
      }));
      return { ...state, schema: newSchema };
    }

    case 'MOVE_OPTION_UP': {
      const { path, optionIndex } = action.payload;
      if (optionIndex === 0) return state;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        options: arraySwap(comp.options, optionIndex, optionIndex - 1),
      }));
      return { ...state, schema: newSchema };
    }

    case 'MOVE_OPTION_DOWN': {
      const { path, optionIndex } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => {
        if (optionIndex >= (comp.options || []).length - 1) return comp;
        return { ...comp, options: arraySwap(comp.options, optionIndex, optionIndex + 1) };
      });
      return { ...state, schema: newSchema };
    }

    // ─── Column layout management ───
    case 'ADD_COLUMN': {
      const { path } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        columns: [...comp.columns, { width: 6, components: [] }],
      }));
      return { ...state, schema: newSchema };
    }

    case 'REMOVE_COLUMN': {
      const { path, columnIndex } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        columns: arrayRemove(comp.columns, columnIndex),
      }));
      return { ...state, schema: newSchema };
    }

    case 'UPDATE_COLUMN_WIDTH': {
      const { path, columnIndex, width } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        columns: arrayWith(comp.columns, columnIndex, {
          ...comp.columns[columnIndex],
          width,
        }),
      }));
      return { ...state, schema: newSchema };
    }

    // ─── Dependencies ───
    case 'SET_DEPENDENCY_RULE': {
      const { path, dependencyType, rule } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => ({
        ...comp,
        dependencies: {
          ...comp.dependencies,
          [dependencyType]: rule,
        },
      }));
      return { ...state, schema: newSchema };
    }

    case 'REMOVE_DEPENDENCY_RULE': {
      const { path, dependencyType } = action.payload;
      const newSchema = updateComponentAtPath(schema, path, (comp) => {
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
      return { ...state, schema: newSchema };
    }

    // ─── Drag and drop ───
    case 'SET_DRAG_STATE':
      return { ...state, dragState: action.payload };

    case 'CLEAR_DRAG_STATE':
      return { ...state, dragState: null };

    case 'MOVE_COMPONENT_TO': {
      const { fromPath, toPath } = action.payload;
      if (pathsEqual(fromPath, toPath)) return { ...state, dragState: null };

      // Only support same-container moves
      if (fromPath.length !== toPath.length) return { ...state, dragState: null };
      const fromPrefix = fromPath.slice(0, -1);
      const toPrefix = toPath.slice(0, -1);
      if (fromPrefix.join(',') !== toPrefix.join(',')) return { ...state, dragState: null };

      const fromResolved = resolvePath(schema, fromPath);
      const toResolved = resolvePath(schema, toPath);
      if (!fromResolved || !toResolved) return { ...state, dragState: null };

      const fromIdx = fromResolved.index;
      const toIdx = toResolved.index;

      const newSchema = updateParentArrayAtPath(schema, fromPath, (arr) => {
        const next = [...arr];
        const [moved] = next.splice(fromIdx, 1);
        next.splice(toIdx, 0, moved);
        return next;
      });

      return { ...state, schema: newSchema, dragState: null };
    }

    // ─── Import/Reset ───
    case 'LOAD_SCHEMA':
      return {
        ...state,
        schema: action.payload.schema,
        selectedComponentPath: null,
      };

    case 'RESET_SCHEMA':
      return {
        ...state,
        schema: { title: 'Untitled Form', description: '', components: [] },
        selectedComponentPath: null,
      };

    default:
      return state;
  }
}

// ── Path comparison ────────────────────────────────────────────────────

export function pathsEqual(a, b) {
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

// ── Hook ───────────────────────────────────────────────────────────────

function buildInitialState(initialSchema) {
  return {
    schema: initialSchema || { title: 'Untitled Form', description: '', components: [] },
    selectedComponentPath: null,
    dragState: null,
  };
}

export function useFormBuilder(initialSchema) {
  const [state, dispatch] = useReducer(formBuilderReducer, initialSchema, buildInitialState);

  const actions = useMemo(() => ({
    setTitle: (title) => dispatch({ type: 'SET_SCHEMA_TITLE', payload: { title } }),
    setDescription: (description) => dispatch({ type: 'SET_SCHEMA_DESCRIPTION', payload: { description } }),
    addComponent: (componentType, parentPath) => dispatch({ type: 'ADD_COMPONENT', payload: { componentType, parentPath } }),
    removeComponent: (path) => dispatch({ type: 'REMOVE_COMPONENT', payload: { path } }),
    moveComponentUp: (path) => dispatch({ type: 'MOVE_COMPONENT_UP', payload: { path } }),
    moveComponentDown: (path) => dispatch({ type: 'MOVE_COMPONENT_DOWN', payload: { path } }),
    duplicateComponent: (path) => dispatch({ type: 'DUPLICATE_COMPONENT', payload: { path } }),
    updateComponent: (path, changes) => dispatch({ type: 'UPDATE_COMPONENT', payload: { path, changes } }),
    selectComponent: (path) => dispatch({ type: 'SELECT_COMPONENT', payload: { path } }),
    deselectComponent: () => dispatch({ type: 'DESELECT_COMPONENT' }),
    addOption: (path) => dispatch({ type: 'ADD_OPTION', payload: { path } }),
    updateOption: (path, optionIndex, changes) => dispatch({ type: 'UPDATE_OPTION', payload: { path, optionIndex, changes } }),
    removeOption: (path, optionIndex) => dispatch({ type: 'REMOVE_OPTION', payload: { path, optionIndex } }),
    moveOptionUp: (path, optionIndex) => dispatch({ type: 'MOVE_OPTION_UP', payload: { path, optionIndex } }),
    moveOptionDown: (path, optionIndex) => dispatch({ type: 'MOVE_OPTION_DOWN', payload: { path, optionIndex } }),
    addColumn: (path) => dispatch({ type: 'ADD_COLUMN', payload: { path } }),
    removeColumn: (path, columnIndex) => dispatch({ type: 'REMOVE_COLUMN', payload: { path, columnIndex } }),
    updateColumnWidth: (path, columnIndex, width) => dispatch({ type: 'UPDATE_COLUMN_WIDTH', payload: { path, columnIndex, width } }),
    setDependencyRule: (path, dependencyType, rule) => dispatch({ type: 'SET_DEPENDENCY_RULE', payload: { path, dependencyType, rule } }),
    removeDependencyRule: (path, dependencyType) => dispatch({ type: 'REMOVE_DEPENDENCY_RULE', payload: { path, dependencyType } }),
    setDragState: (dragState) => dispatch({ type: 'SET_DRAG_STATE', payload: dragState }),
    clearDragState: () => dispatch({ type: 'CLEAR_DRAG_STATE' }),
    moveComponentTo: (fromPath, toPath) => dispatch({ type: 'MOVE_COMPONENT_TO', payload: { fromPath, toPath } }),
    loadSchema: (schema) => dispatch({ type: 'LOAD_SCHEMA', payload: { schema } }),
    resetSchema: () => dispatch({ type: 'RESET_SCHEMA' }),
  }), []);

  return { state, dispatch, actions };
}
