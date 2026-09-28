import { defineArrayMember, defineField, defineType } from 'sanity'

export const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fields: [
    defineField({
      name: 'hero',
      title: 'Hero banner',
      type: 'object',
      fields: [
        defineField({
          name: 'slides',
          title: 'Slides',
          type: 'array',
          of: [defineArrayMember({ type: 'heroSlide' })],
          validation: (Rule) => Rule.required().min(2).max(6),
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'aboutImage',
      title: 'About summary image',
      description: 'Image shown next to the IIOGA introduction text.',
      type: 'imageWithAlt',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'milestones',
      title: 'Tracking progress & milestones',
      type: 'array',
      of: [defineArrayMember({ type: 'milestone' })],
    }),
  ],
  preview: {
    select: { title: 'hero.slides.0.headline' },
    prepare: ({ title }) => ({ title: title || 'Home page' }),
  },
})
