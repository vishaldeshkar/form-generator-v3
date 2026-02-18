export const complexSchema = {
  title: 'Employee Registration',
  description: 'Complete all sections to register.',
  components: [
    {
      type: 'group',
      name: 'personalInfo',
      title: 'Personal Information',
      description: 'Basic details about the employee.',
      components: [
        {
          type: 'column',
          name: 'nameRow',
          columns: [
            {
              width: 6,
              components: [
                {
                  type: 'text',
                  name: 'firstName',
                  label: 'First Name',
                  isRequired: true,
                },
              ],
            },
            {
              width: 6,
              components: [
                {
                  type: 'text',
                  name: 'lastName',
                  label: 'Last Name',
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          type: 'email',
          name: 'email',
          label: 'Email',
          isRequired: true,
        },
        {
          type: 'date',
          name: 'dateOfBirth',
          label: 'Date of Birth',
        },
      ],
    },
    {
      type: 'group',
      name: 'workInfo',
      title: 'Work Information',
      components: [
        {
          type: 'select',
          name: 'department',
          label: 'Department',
          isRequired: true,
          options: [
            { label: 'Engineering', value: 'engineering' },
            { label: 'Marketing', value: 'marketing' },
            { label: 'Sales', value: 'sales' },
            { label: 'HR', value: 'hr' },
          ],
        },
        {
          type: 'column',
          name: 'roleRow',
          columns: [
            {
              width: 8,
              components: [
                {
                  type: 'text',
                  name: 'jobTitle',
                  label: 'Job Title',
                  isRequired: true,
                },
              ],
            },
            {
              width: 4,
              components: [
                {
                  type: 'date',
                  name: 'startDate',
                  label: 'Start Date',
                  isRequired: true,
                },
              ],
            },
          ],
        },
        {
          type: 'radio',
          name: 'employmentType',
          label: 'Employment Type',
          options: ['Full-time', 'Part-time', 'Contract'],
        },
      ],
    },
    {
      type: 'checkbox',
      name: 'agreeToTerms',
      label: 'I agree to the terms and conditions',
      isRequired: true,
    },
  ],
};
