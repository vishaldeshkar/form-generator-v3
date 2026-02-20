export const controlledSchema = {
  title: 'Controlled Mode Demo',
  description: 'Form state is managed by the parent component.',
  components: [
    {
      type: 'text',
      name: 'username',
      label: 'Username',
      placeholder: 'Enter a username',
      isRequired: true,
      validation: { min: 3, message: 'Must be at least 3 characters' },
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email Address',
      placeholder: 'you@example.com',
      isRequired: true,
    },
    {
      type: 'select',
      name: 'role',
      label: 'Role',
      isRequired: true,
      options: ['Admin', 'Editor', 'Viewer'],
    },
    {
      type: 'text',
      name: 'department',
      label: 'Department',
      placeholder: 'Auto-filled based on role',
    },
  ],
};
