# Form Generator Library - Implementation Plan

## Context

Build a React Form Generator Library from scratch that takes a JSON schema and renders dynamic forms. The project directory is empty (no existing code). The library needs to support nested layouts (groups/columns), conditional field visibility/required/disabled via dependencies, Yup-based validation, custom components, and integration with react-hook-form. UI uses plain HTML elements with basic CSS (the consumer will later swap in their own internal UI library).

## Tech Stack

- React 18 + JavaScript
- Vite (build tooling + dev server)
- react-hook-form (form state via Controller)
- Yup + @hookform/resolvers (validation)
- Plain HTML elements + CSS (no MUI — consumer has their own UI library)

## Project Structure

```
form-generator-v3/
├── package.json
├── tsconfig.json
├── vite.config.js
├── index.html
├── src/
│   ├── main.jsx                        # Entry point
│   ├── App.jsx                         # Demo app with tabs for each schema
│   ├── App.css                         # Demo styling
│   ├── lib/                            # The reusable library
│   │   ├── index.js                    # Barrel export
│   │   ├── types/
│   │   │   └── schema.js              # All JavaScript types
│   │   ├── components/
│   │   │   ├── FormGenerator.jsx       # Public API component
│   │   │   ├── ComponentRenderer.jsx   # Recursive type dispatcher
│   │   │   ├── fields/
│   │   │   │   ├── TextField.jsx       # text + email
│   │   │   │   ├── TextareaField.jsx
│   │   │   │   ├── CheckboxField.jsx
│   │   │   │   ├── RadioField.jsx
│   │   │   │   ├── SelectField.jsx
│   │   │   │   ├── DateField.jsx
│   │   │   │   └── CustomField.jsx
│   │   │   └── layout/
│   │   │       ├── GroupLayout.jsx
│   │   │       └── ColumnLayout.jsx
│   │   ├── hooks/
│   │   │   └── useDependency.js        # Evaluates dependency conditions
│   │   ├── utils/
│   │   │   ├── buildYupSchema.js       # JSON schema -> Yup object schema
│   │   │   ├── evaluateDependencies.js # Pure condition evaluation logic
│   │   │   ├── flattenFields.js        # Walk schema tree, extract leaf fields
│   │   │   └── normalizeOptions.js     # string[] | {label,value}[] -> uniform
│   │   ├── context/
│   │   │   └── FormGeneratorContext.jsx # Carries customComponents map
│   │   └── styles/
│   │       └── formGenerator.css       # Basic structural CSS for the library
│   └── demo/
│       ├── schemas/                    # 4 example schemas from requirements
│       └── customComponents/           # StarRating, FileUploader demos
```

## Implementation Steps

### Step 1: Project Scaffolding
- Initialize Vite React-TS project
- Install deps: `react-hook-form @hookform/resolvers yup`
- Configure `tsconfig.json` and `vite.config.js`

### Step 2: JavaScript Types (`src/lib/types/schema.js`)
- Discriminated union types for all component types (text, email, textarea, checkbox, radio, select, date, group, column, custom)
- `Condition`, `DependencyRule`, `Dependencies` types
- `FormSchema`, `ComponentMap`, `FormGeneratorProps`
- `CustomComponentProps` contract: `{ name, label, value, onChange, onBlur, error, helpText, disabled }`

### Step 3: Utility Functions
- **`flattenFields.js`**: Recursively walks `ComponentMap`, descends into groups/columns, returns `{name, component}[]` for all leaf fields
- **`normalizeOptions.js`**: Converts `string[]` to `{label, value}[]`, passes through objects unchanged
- **`evaluateDependencies.js`**: Pure functions `evaluateRule(rule, values)` and `evaluateCondition(cond, values)`. Operators: equals, notEquals, contains, greaterThan, lessThan, in. Rules support AND/OR (default AND)

### Step 4: Context (`src/lib/context/FormGeneratorContext.jsx`)
- React context carrying `CustomComponentMap`
- react-hook-form's `FormProvider` provides watch/control to children

### Step 5: Field Components (`src/lib/components/fields/`)
Each field component uses `useFormContext()` for `control` + errors, wraps HTML elements in react-hook-form `Controller`, displays label/placeholder/helpText/errors, accepts `isRequired` and `isDisabled` props.

- **TextField.jsx**: `<input type="text|email">` based on component type
- **TextareaField.jsx**: `<textarea>` with `rows` prop
- **CheckboxField.jsx**: `<input type="checkbox">` with label
- **RadioField.jsx**: `<input type="radio">` group, normalizes options
- **SelectField.jsx**: `<select>` + `<option>`, normalizes options
- **DateField.jsx**: `<input type="date">`
- **CustomField.jsx**: Looks up component from context by `componentKey`, passes `CustomComponentProps`

### Step 6: Layout Components (`src/lib/components/layout/`)
- **GroupLayout.jsx**: `<fieldset>` with `<legend>` for title, optional description, recursively renders nested components via `ComponentRenderer`
- **ColumnLayout.jsx**: CSS flexbox/grid container, maps `columns` array to flex items with proportional widths (width out of 12), renders nested components via `ComponentRenderer`

### Step 7: ComponentRenderer (`src/lib/components/ComponentRenderer.jsx`)
- Calls `useDependency(component.dependencies)` to get `{isVisible, isRequired, isDisabled}`
- Returns `null` if not visible
- Switch on `component.type` to dispatch to correct field/layout component
- Passes `isRequired` (merged with `component.isRequired`) and `isDisabled` to field components

### Step 8: Dependency Hook (`src/lib/hooks/useDependency.js`)
- Extracts watched field names from dependency conditions
- Uses `useWatch({ name: specificFields })` for targeted watching (minimizes re-renders)
- Returns memoized `{isVisible, isRequired, isDisabled}` using `evaluateRule`
- When visibility changes to false: clears hidden field values via `setValue`

### Step 9: Yup Schema Builder (`src/lib/utils/buildYupSchema.js`)
- Uses `flattenFields()` to get all leaf fields
- Creates appropriate Yup type per field (string, boolean)
- Applies `isRequired` -> `.required()`, `validation.min/max` -> `.min()/.max()`, email -> `.email()`
- Translates `dependencies.required` into Yup `.when()` clauses (no schema rebuild on value changes)
- Merges `customValidation` functions via Yup `.test()`

### Step 10: FormGenerator (`src/lib/components/FormGenerator.jsx`)
- Public API: `<FormGenerator schema onSubmit customComponents customValidation defaultValues />`
- Builds Yup schema with `useMemo`
- Calls `useForm({ resolver: yupResolver(schema), defaultValues, mode: 'onBlur' })`
- Wraps in `FormProvider` + `FormGeneratorContext.Provider`
- Renders title/description, iterates components with `ComponentRenderer`, renders submit button

### Step 11: Demo App
- 4 demo schemas (basic, complex/nested, custom components, dependencies)
- 2 demo custom components: StarRating (clickable stars), FileUploader (file input)
- App.jsx: Tab-based UI to switch schemas, displays submitted data as JSON

### Step 12: Basic CSS (`src/lib/styles/formGenerator.css`)
- Structural styles: form field wrapper spacing, column grid layout, group borders/padding
- Error message styling (red text)
- Minimal visual defaults — consumers will override with their own design system

## Key Design Decisions

1. **Plain HTML elements**: No UI framework dependency. Field components use native `<input>`, `<select>`, `<textarea>`, `<fieldset>`. Consumers swap these out for their internal UI library components.
2. **Flat field names**: Fields register with flat names (`firstName`, not `personalInfo.firstName`). Groups/columns are purely visual layout.
3. **Yup `.when()` for dynamic required**: Dependency-based required rules compile into Yup `.when()` at build time. No schema rebuilds on value changes.
4. **Visibility hides + clears**: Hidden fields unmount and their values clear to prevent stale data in submissions.
5. **Custom component contract**: Custom components receive `CustomComponentProps` — a clean interface, not raw react-hook-form internals.
6. **Targeted watching**: `useDependency` uses `useWatch` with specific field names to minimize re-renders.

## Verification

1. Run `npm run dev` to start the dev server
2. **Basic Schema** tab: fill out contact form, verify validation (required, min length), submit and check JSON output
3. **Complex Schema** tab: verify groups render as sections, columns create grid layouts, all field types work
4. **Custom Components** tab: verify StarRating and FileUploader render and submit correctly
5. **Dependencies** tab: select "In-person" vs "Virtual" — verify conditional fields appear/disappear, checkbox toggle shows/hides textarea, "Other" dietary restriction shows text input, dynamic required validation works (shirtSize required only when in-person)
