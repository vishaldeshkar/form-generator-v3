import { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Code, Copy, Check } from 'lucide-react';
import { useFormBuilder } from '../../hooks/useFormBuilder';
import { FormBuilderProvider } from '../../context/FormBuilderContext';
import FormBuilder from '../builder/FormBuilder';
import FormGenerator from '../FormGenerator';
import '../../styles/formBuilder.css';

function highlightJSON(obj) {
  const json = JSON.stringify(obj, null, 2);
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"([^"]+)":/g, '<span class="fbc-json-key">"$1"</span>:')
    .replace(/: "([^"]*)"/g, ': <span class="fbc-json-string">"$1"</span>')
    .replace(/: (\d+(?:\.\d+)?)/g, ': <span class="fbc-json-number">$1</span>')
    .replace(/: (true|false)/g, ': <span class="fbc-json-bool">$1</span>')
    .replace(/: null/g, ': <span class="fbc-json-null">null</span>');
}

function cleanSchema(schema) {
  return JSON.parse(JSON.stringify(schema, (key, value) => {
    if (value === '' || value === undefined) return undefined;
    if (Array.isArray(value) && value.length === 0 && key !== 'components' && key !== 'columns') return undefined;
    return value;
  }));
}

export default function FormComposer({ initialSchema, onSchemaChange }) {
  const builderValue = useFormBuilder(initialSchema);
  const { state } = builderValue;
  const [activeTab, setActiveTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const debounceRef = useRef(null);

  // Debounced preview key update
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPreviewKey((k) => k + 1);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [state.schema]);

  // Notify parent of schema changes
  useEffect(() => {
    onSchemaChange?.(state.schema);
  }, [state.schema, onSchemaChange]);

  const handleCopy = useCallback(() => {
    const cleaned = cleanSchema(state.schema);
    navigator.clipboard.writeText(JSON.stringify(cleaned, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [state.schema]);

  const hasComponents = state.schema.components.length > 0;
  const cleaned = cleanSchema(state.schema);

  return (
    <FormBuilderProvider value={builderValue}>
      <div className="fbc-composer">
        <div className="fbc-builder-panel">
          <FormBuilder />
        </div>

        <div className="fbc-preview-panel">
          <div className="fbc-preview-tabs">
            <button
              type="button"
              className={`fbc-preview-tab ${activeTab === 'preview' ? 'fbc-preview-tab--active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <Eye size={14} /> Live Preview
            </button>
            <button
              type="button"
              className={`fbc-preview-tab ${activeTab === 'json' ? 'fbc-preview-tab--active' : ''}`}
              onClick={() => setActiveTab('json')}
            >
              <Code size={14} /> Generated JSON
            </button>
          </div>

          <div className="fbc-preview-content">
            {activeTab === 'preview' && (
              <div className="fbc-preview-form">
                {hasComponents ? (
                  <FormGenerator
                    key={previewKey}
                    schema={state.schema}
                    onSubmit={() => {}}
                  />
                ) : (
                  <div className="fbc-empty-state">
                    Add fields to see a live preview here.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'json' && (
              <div className="fbc-json-view">
                <div className="fbc-json-toolbar">
                  <button type="button" className="fbc-copy-btn" onClick={handleCopy}>
                    {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy JSON</>}
                  </button>
                </div>
                <pre className="fbc-json-pre">
                  <code dangerouslySetInnerHTML={{ __html: highlightJSON(cleaned) }} />
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormBuilderProvider>
  );
}
