export const dynamicOptionsSchema = {
  title: 'Dynamic Options Demo',
  description: 'Demonstrates async option loading and chained dropdowns',
  components: [
    {
      type: 'select',
      name: 'country',
      label: 'Country',
      placeholder: 'Select a country...',
      isRequired: true,
    },
    {
      type: 'select',
      name: 'city',
      label: 'City',
      placeholder: 'Select a city...',
      optionsDependsOn: 'country',
      isRequired: true,
    },
  ],
};

// Mock data for the demo loaders
const COUNTRIES = [
  { label: 'United States', value: 'us' },
  { label: 'India', value: 'in' },
  { label: 'Germany', value: 'de' },
];

const CITIES = {
  us: ['New York', 'San Francisco', 'Chicago', 'Austin'],
  in: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai'],
  de: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'],
};

// Simulate async API calls
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const dynamicOptionLoaders = {
  country: async () => {
    await delay(500);
    return COUNTRIES;
  },
  city: async (countryValue) => {
    await delay(400);
    return CITIES[countryValue] || [];
  },
};
