export const basicSchema = {
  title: 'Contact Form',
  description: 'Please fill out your contact information.',
  components: [
    {
      type: 'text',
      name: 'firstName',
      label: 'First Name',
      placeholder: 'Enter your first name',
      isRequired: true,
      validation: { min: 2, message: 'Must be at least 2 characters' },
    },
    {
      type: 'text',
      name: 'lastName',
      label: 'Last Name',
      placeholder: 'Enter your last name',
      isRequired: true,
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'you@example.com',
      isRequired: true,
    },
    {
      type: 'textarea',
      name: 'message',
      label: 'Message',
      placeholder: 'Type your message here...',
      helpText: 'Maximum 500 characters',
      rows: 5,
      validation: { max: 500 },
    },
  ],
};
