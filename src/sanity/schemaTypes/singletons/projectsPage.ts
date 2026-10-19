import { defineArrayMember, defineField, defineType } from 'sanity'

import {
  MAX_VIDEO_SIZE_BYTES,
  maxAssetSize,
  requireWebSafeVideo,
} from '../lib/maxAssetSize'

export const projectsPage = defineType({
  name: 'projectsPage',
  title: 'Projects page',
  type: 'document',
  fields: [
    defineField({
      name: 'dehiwala',
      title: 'Recent Project',
      type: 'object',
      fields: [
        defineField({
          name: 'show',
          title: 'Show this section',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'body',
          title: 'Body',
          type: 'array',
          of: [defineArrayMember({ type: 'block' })],
        }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'imageWithAlt',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'highlightsLabel',
          title: 'Highlights link label',
          type: 'string',
        }),
        defineField({
          name: 'highlightsUrl',
          title: 'Highlights link URL',
          type: 'url',
          validation: (Rule) =>
            Rule.uri({ scheme: ['http', 'https'], allowRelative: true }),
        }),
        defineField({
          name: 'video',
          title: 'Video',
          description:
            'Shown at the end of the Recent Project section (.mp4 or .webm only — .mov/QuickTime won’t play outside Safari).',
          type: 'file',
          options: { accept: 'video/mp4,video/webm' },
          validation: (Rule) =>
            Rule.custom(maxAssetSize(MAX_VIDEO_SIZE_BYTES, 'Video')).custom(
              requireWebSafeVideo(),
            ),
        }),
        defineField({
          name: 'videoPoster',
          title: 'Video thumbnail',
          description:
            'Shown as the preview image before the video above is played. Leave empty to use the first video frame.',
          type: 'imageWithAlt',
          hidden: ({ parent }) => !parent?.video?.asset,
        }),
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'droneVideo',
      title: 'Drone video',
      description:
        "Ilma International Girls' School drone video (.mp4 or .webm only — .mov/QuickTime won't play outside Safari). Leave empty to show a “Video coming soon” placeholder.",
      type: 'file',
      options: { accept: 'video/mp4,video/webm' },
      validation: (Rule) =>
        Rule.custom(maxAssetSize(MAX_VIDEO_SIZE_BYTES, 'Video')).custom(
          requireWebSafeVideo(),
        ),
    }),
    defineField({
      name: 'droneVideoPoster',
      title: 'Drone video thumbnail',
      description:
        'Shown as the preview image before the drone video above is played. Leave empty to use the first video frame.',
      type: 'imageWithAlt',
      hidden: ({ document }) =>
        !(document as { droneVideo?: { asset?: unknown } } | undefined)
          ?.droneVideo?.asset,
    }),
  ],
  preview: {
    prepare: () => ({ title: 'Projects page' }),
  },
})
