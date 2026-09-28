import { orderRankField } from '@sanity/orderable-document-list'
import { defineArrayMember, defineField, defineType } from 'sanity'

export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Move the event between Upcoming and Past yourself.',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Past', value: 'past' },
        ],
        layout: 'radio',
      },
      initialValue: 'upcoming',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'datePrecision',
      title: 'Date precision',
      description:
        'Choose whether the site shows the exact day this event happened, or just the month and year.',
      type: 'string',
      options: {
        list: [
          { title: 'Year, Month & Day', value: 'full' },
          { title: 'Year & Month', value: 'monthYear' },
        ],
        layout: 'radio',
      },
      initialValue: 'monthYear',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description:
        'Pick the full date. Whether the day is shown on the site depends on the "Date precision" option above.',
      type: 'date',
      options: {
        dateFormat: 'D MMMM YYYY',
      },
      validation: (Rule) => Rule.required(),
    }),
    // defineField({
    //   name: 'description',
    //   title: 'Description',
    //   type: 'text',
    //   rows: 3,
    // }),
    defineField({
      name: 'images',
      title: 'Images',
      description: 'Only shown on the site for past events.',
      type: 'array',
      of: [defineArrayMember({ type: 'imageWithAlt' })],
      hidden: ({ parent }) => parent?.status !== 'past',
    }),
    defineField({
      name: 'links',
      title: 'Links',
      description:
        'Only shown on the site for past events. Limited to one link per event.',
      type: 'array',
      of: [defineArrayMember({ type: 'eventLink' })],
      hidden: ({ parent }) => parent?.status !== 'past',
      validation: (Rule) => Rule.max(1),
    }),
    orderRankField({ type: 'event' }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'status', media: 'images.0' },
  },
})
