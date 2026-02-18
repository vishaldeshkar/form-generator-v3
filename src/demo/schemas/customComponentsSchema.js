export const customComponentsSchema = {
  title: 'Product Review',
  description: 'Share your feedback on the product.',
  components: [
    {
      type: 'text',
      name: 'productName',
      label: 'Product Name',
      isRequired: true,
    },
    {
      type: 'custom',
      name: 'rating',
      label: 'Rating',
      componentKey: 'StarRating',
      isRequired: true,
    },
    {
      type: 'textarea',
      name: 'reviewText',
      label: 'Review',
      placeholder: 'Tell us what you think...',
      rows: 4,
    },
    {
      type: 'custom',
      name: 'attachment',
      label: 'Upload Photo',
      componentKey: 'FileUploader',
      helpText: 'Optional: attach a photo of the product',
    },
    {
      type: 'checkbox',
      name: 'recommend',
      label: 'I would recommend this product',
    },
  ],
};
