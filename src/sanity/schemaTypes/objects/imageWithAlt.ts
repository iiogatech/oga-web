import { defineType } from 'sanity'

import { MAX_IMAGE_SIZE_BYTES, maxAssetSize } from '../lib/maxAssetSize'

export const imageWithAlt = defineType({
  name: 'imageWithAlt',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  validation: (Rule) =>
    Rule.custom(maxAssetSize(MAX_IMAGE_SIZE_BYTES, 'Image')),
})
