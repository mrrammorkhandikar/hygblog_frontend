export default {
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    { name: 'title', title: 'Title', type: 'string' },
    {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: { source: 'title', maxLength: 96 },
    },
    { name: 'excerpt', title: 'Excerpt', type: 'text' },
    { name: 'content', title: 'Content', type: 'markdown' },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Dental Care', value: 'Dental Care' },
          { title: 'Cosmetic Dentistry', value: 'Cosmetic Dentistry' },
          { title: 'Pediatric Dentistry', value: 'Pediatric Dentistry' },
          { title: 'Oral Surgery', value: 'Oral Surgery' },
        ],
      },
    },
    {
      name: 'image',
      title: 'Featured Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'date',
      title: 'Publish Date',
      type: 'datetime',
    },
  ],
}
