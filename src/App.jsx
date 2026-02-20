import { useState } from 'react';
import { FormGenerator } from './lib';
import { basicSchema } from './demo/schemas/basicSchema';
import { complexSchema } from './demo/schemas/complexSchema';
import { customComponentsSchema } from './demo/schemas/customComponentsSchema';
import { dependenciesSchema } from './demo/schemas/dependenciesSchema';
import { dynamicOptionsSchema, dynamicOptionLoaders } from './demo/schemas/dynamicOptionsSchema';
import { controlledSchema } from './demo/schemas/controlledSchema';
import ControlledDemo from './demo/ControlledDemo';
import EventHookDemo from './demo/EventHookDemo';
import StarRating from './demo/customComponents/StarRating';
import FileUploader from './demo/customComponents/FileUploader';
import './App.css';

const TABS = [
  { id: 'basic', label: 'Basic', schema: basicSchema },
  { id: 'complex', label: 'Complex', schema: complexSchema },
  { id: 'custom', label: 'Custom Components', schema: customComponentsSchema },
  { id: 'deps', label: 'Dependencies', schema: dependenciesSchema },
  { id: 'dynamic', label: 'Dynamic Options', schema: dynamicOptionsSchema },
  { id: 'controlled', label: 'Controlled', schema: controlledSchema },
  { id: 'events', label: 'Event Hooks' },
];

const customComponents = {
  StarRating,
  FileUploader,
};

const customValidation = {
  rating: (value) => {
    if (!value || value < 1) return 'Please select a rating';
  },
};

export default function App() {
  const [activeTab, setActiveTab] = useState('basic');
  const [submittedData, setSubmittedData] = useState(null);

  const currentTab = TABS.find((t) => t.id === activeTab);

  const handleSubmit = (data) => {
    setSubmittedData(data);
  };

  return (
    <div className="app">
      <h1>Form Generator</h1>
      <p className="app-subtitle">Schema-driven forms, beautifully rendered</p>
      <nav className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab--active' : ''}`}
            onClick={() => {
              setActiveTab(tab.id);
              setSubmittedData(null);
            }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="form-container">
        {activeTab === 'events' ? (
          <EventHookDemo key={activeTab} onSubmit={handleSubmit} />
        ) : activeTab === 'controlled' ? (
          <ControlledDemo
            key={activeTab}
            schema={currentTab.schema}
            onSubmit={handleSubmit}
          />
        ) : (
          <FormGenerator
            key={activeTab}
            schema={currentTab.schema}
            onSubmit={handleSubmit}
            customComponents={activeTab === 'custom' ? customComponents : {}}
            customValidation={activeTab === 'custom' ? customValidation : {}}
            optionLoaders={activeTab === 'dynamic' ? dynamicOptionLoaders : {}}
          />
        )}
      </div>

      {submittedData && (
        <div className="output">
          <h3>Submitted Data</h3>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
