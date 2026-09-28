/**
 * One-time migration: the `homePage.hero` object was changed from a single
 * flat slide (eyebrow/headline/image/ctaLabel/ctaUrl/secondaryCtaLabel/
 * secondaryCtaUrl) to `hero.slides`, an array of `heroSlide` objects
 * (see src/sanity/schemaTypes/objects/heroSlide.ts). This wraps the
 * existing flat fields into a single-element `slides` array and drops
 * the old flat fields, preserving all current content as slide 1.
 *
 * Note: the result has only 1 slide, below Studio's required minimum of 2 —
 * add a second slide in the Studio before the document can be republished.
 *
 * Run once with: pnpm migrate-hero-slides
 */
import { createClient } from 'next-sanity'

import { apiVersion, dataset, projectId } from '../src/sanity/env'

const token = process.env.SANITY_API_WRITE_TOKEN
if (!token) {
  throw new Error(
    'SANITY_API_WRITE_TOKEN is required to run this script (see .env.example).',
  )
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
})

function generateKey(): string {
  return Math.random().toString(36).slice(2, 12)
}

type OldHero = {
  eyebrow?: string
  headline: string
  image: unknown
  ctaLabel: string
  ctaUrl?: string
  secondaryCtaLabel?: string
  secondaryCtaUrl?: string
  slides?: unknown
}

async function main() {
  const doc = await client.fetch<{ _id: string; hero?: OldHero } | null>(
    `*[_type == "homePage"][0]{ _id, hero }`,
  )

  if (!doc) {
    console.log('No homePage document found — nothing to migrate.')
    return
  }
  if (!doc.hero) {
    console.log('homePage has no hero object — nothing to migrate.')
    return
  }
  if (Array.isArray(doc.hero.slides)) {
    console.log('hero.slides already exists — already migrated, nothing to do.')
    return
  }

  const {
    eyebrow,
    headline,
    image,
    ctaLabel,
    ctaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
  } = doc.hero

  const slide = {
    _type: 'heroSlide' as const,
    _key: generateKey(),
    eyebrow,
    headline,
    image,
    ctaLabel,
    ctaUrl,
    secondaryCtaLabel,
    secondaryCtaUrl,
  }

  await client
    .patch(doc._id)
    .set({ hero: { slides: [slide] } })
    .commit()

  console.log(
    `Migrated homePage.hero -> hero.slides (1 slide) for document "${doc._id}".`,
  )
  console.log(
    'NOTE: hero.slides has only 1 slide; Studio validation requires 2-6 — add a second slide in the Studio before publishing further changes.',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
