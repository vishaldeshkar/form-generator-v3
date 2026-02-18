export const dependenciesSchema = {
  title: 'Event Registration',
  description: 'Register for the upcoming company event.',
  components: [
    {
      type: 'text',
      name: 'fullName',
      label: 'Full Name',
      isRequired: true,
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email',
      isRequired: true,
    },
    {
      type: 'radio',
      name: 'eventFormat',
      label: 'Event Format',
      isRequired: true,
      options: [
        { label: 'In-person', value: 'in-person' },
        { label: 'Virtual', value: 'virtual' },
      ],
    },
    // Only visible when "In-person" is selected
    {
      type: 'select',
      name: 'shirtSize',
      label: 'T-Shirt Size',
      helpText: 'Required for in-person attendees',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      dependencies: {
        visibility: {
          conditions: [{ field: 'eventFormat', operator: 'equals', value: 'in-person' }],
        },
        required: {
          conditions: [{ field: 'eventFormat', operator: 'equals', value: 'in-person' }],
        },
      },
    },
    // Only visible when "In-person" is selected
    {
      type: 'select',
      name: 'dietaryRestriction',
      label: 'Dietary Restriction',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Vegetarian', value: 'vegetarian' },
        { label: 'Vegan', value: 'vegan' },
        { label: 'Gluten-free', value: 'gluten-free' },
        { label: 'Other', value: 'other' },
      ],
      dependencies: {
        visibility: {
          conditions: [{ field: 'eventFormat', operator: 'equals', value: 'in-person' }],
        },
      },
    },
    // Only visible when dietary restriction is "Other"
    {
      type: 'text',
      name: 'otherDietary',
      label: 'Please specify dietary restriction',
      dependencies: {
        visibility: {
          conditions: [{ field: 'dietaryRestriction', operator: 'equals', value: 'other' }],
        },
        required: {
          conditions: [{ field: 'dietaryRestriction', operator: 'equals', value: 'other' }],
        },
      },
    },
    // Only visible when "Virtual" is selected
    {
      type: 'select',
      name: 'timezone',
      label: 'Timezone',
      options: [
        { label: 'Eastern (ET)', value: 'ET' },
        { label: 'Central (CT)', value: 'CT' },
        { label: 'Mountain (MT)', value: 'MT' },
        { label: 'Pacific (PT)', value: 'PT' },
      ],
      dependencies: {
        visibility: {
          conditions: [{ field: 'eventFormat', operator: 'equals', value: 'virtual' }],
        },
      },
    },
    {
      type: 'checkbox',
      name: 'needsAccommodation',
      label: 'I need special accommodations',
    },
    // Only visible when accommodations checkbox is checked
    {
      type: 'textarea',
      name: 'accommodationDetails',
      label: 'Accommodation Details',
      placeholder: 'Please describe your needs...',
      rows: 3,
      dependencies: {
        visibility: {
          conditions: [{ field: 'needsAccommodation', operator: 'equals', value: true }],
        },
      },
    },
  ],
};
