/**
 * One-time migration: the `event.date` field was changed from `datetime`
 * to `date` (month + year only, see src/sanity/schemaTypes/documents/event.ts).
 * This patches existing event documents so their stored date drops the
 * day/time component, keeping only year and month (set to the 1st).
 *
 * Run once with: pnpm normalize-event-dates
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

function toMonthStart(date: string) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}-01`
}

async function main() {
  const events = await client.fetch<{ _id: string; date: string }[]>(
    `*[_type == "event"]{ _id, date }`,
  )

  const tx = client.transaction()
  let changed = 0
  for (const { _id, date } of events) {
    const normalized = toMonthStart(date)
    if (normalized !== date) {
      tx.patch(_id, { set: { date: normalized } })
      console.log(`${_id}: ${date} -> ${normalized}`)
      changed++
    }
  }

  if (changed === 0) {
    console.log('Nothing to change.')
    return
  }

  await tx.commit()
  console.log(`Done. Patched ${changed} event(s).`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
