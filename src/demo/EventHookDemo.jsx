import { useRef, useEffect, useState } from 'react';
import { FormGenerator } from '../lib';

const schema = {
  title: 'Event Hook Demo',
  description: 'Cascading dropdowns powered by the imperative event hook API',
  components: [
    {
      type: 'select',
      name: 'country',
      label: 'Country',
      options: ['US', 'Canada', 'UK'],
    },
    {
      type: 'select',
      name: 'state',
      label: 'State / Province',
      options: [],
    },
  ],
};

const STATES = {
  US: ['California', 'Texas', 'New York', 'Florida'],
  Canada: ['Ontario', 'Quebec', 'British Columbia', 'Alberta'],
  UK: ['England', 'Scotland', 'Wales', 'Northern Ireland'],
};

export default function EventHookDemo({ onSubmit }) {
  const formRef = useRef(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsub = formRef.current.on('fieldChange', (fieldId, value) => {
      setEvents((prev) => [...prev.slice(-4), `${fieldId} → ${JSON.stringify(value)}`]);

      if (fieldId === 'country') {
        // Simulate an async API call
        setTimeout(() => {
          const options = STATES[value] || [];
          formRef.current.setFieldOptions('state', options);
          formRef.current.resetField('state');
        }, 300);
      }
    });

    return unsub;
  }, []);

  return (
    <div>
      <FormGenerator ref={formRef} schema={schema} onSubmit={onSubmit} />
      {events.length > 0 && (
        <div className="output" style={{ marginTop: '1rem' }}>
          <h3>Field Change Events</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {events.map((e, i) => (
              <li key={i} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                {e}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
