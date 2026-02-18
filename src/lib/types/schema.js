/**
 * Schema Types (documented via JSDoc)
 *
 * Component types: text, email, textarea, checkbox, radio, select, date, group, column, custom
 *
 * @typedef {'equals'|'notEquals'|'contains'|'greaterThan'|'lessThan'|'in'} ConditionOperator
 *
 * @typedef {Object} Condition
 * @property {string} field - Field name to watch
 * @property {ConditionOperator} operator
 * @property {*} value - Value to compare against
 *
 * @typedef {Object} DependencyRule
 * @property {Condition[]} conditions
 * @property {'AND'|'OR'} [logic='AND']
 *
 * @typedef {Object} Dependencies
 * @property {DependencyRule} [visibility]
 * @property {DependencyRule} [required]
 * @property {DependencyRule} [disabled]
 *
 * @typedef {Object} ValidationRules
 * @property {number} [min]
 * @property {number} [max]
 * @property {string} [pattern]
 * @property {string} [message]
 *
 * @typedef {Object} OptionItem
 * @property {string} label
 * @property {string} value
 *
 * @typedef {Object} BaseComponent
 * @property {string} name
 * @property {string} [label]
 * @property {string} [placeholder]
 * @property {string} [helpText]
 * @property {boolean} [isRequired]
 * @property {boolean} [isDisabled]
 * @property {*} [defaultValue]
 * @property {ValidationRules} [validation]
 * @property {Dependencies} [dependencies]
 *
 * @typedef {BaseComponent & { type: 'text'|'email' }} TextComponent
 * @typedef {BaseComponent & { type: 'textarea', rows?: number }} TextareaComponent
 * @typedef {BaseComponent & { type: 'checkbox' }} CheckboxComponent
 * @typedef {BaseComponent & { type: 'radio', options: (string|OptionItem)[] }} RadioComponent
 * @typedef {BaseComponent & { type: 'select', options: (string|OptionItem)[] }} SelectComponent
 * @typedef {BaseComponent & { type: 'date' }} DateComponent
 * @typedef {{ type: 'group', name: string, title?: string, description?: string, components: FormComponent[], dependencies?: Dependencies }} GroupComponent
 * @typedef {{ type: 'column', name: string, columns: { width: number, components: FormComponent[] }[], dependencies?: Dependencies }} ColumnComponent
 * @typedef {BaseComponent & { type: 'custom', componentKey: string }} CustomComponent
 *
 * @typedef {TextComponent|TextareaComponent|CheckboxComponent|RadioComponent|SelectComponent|DateComponent|GroupComponent|ColumnComponent|CustomComponent} FormComponent
 *
 * @typedef {Object} FormSchema
 * @property {string} title
 * @property {string} [description]
 * @property {FormComponent[]} components
 *
 * @typedef {Object} CustomComponentProps
 * @property {string} name
 * @property {string} [label]
 * @property {*} value
 * @property {(value: *) => void} onChange
 * @property {() => void} onBlur
 * @property {string} [error]
 * @property {string} [helpText]
 * @property {boolean} [disabled]
 *
 * @typedef {Object.<string, React.ComponentType<CustomComponentProps>>} CustomComponentMap
 *
 * @typedef {Object} FormGeneratorProps
 * @property {FormSchema} schema
 * @property {(data: Object) => void} onSubmit
 * @property {CustomComponentMap} [customComponents]
 * @property {Object.<string, (value: *, values: Object) => string|undefined>} [customValidation]
 * @property {Object} [defaultValues]
 */

export {};
