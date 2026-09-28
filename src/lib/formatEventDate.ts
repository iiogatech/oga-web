import type { Event } from '@/sanity/lib/content'

export function formatEventDate(event: Pick<Event, 'date' | 'datePrecision'>) {
  const d = new Date(event.date)
  const month = d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const year = d.getFullYear()

  if (event.datePrecision === 'full') {
    return { label: `${month} ${d.getDate()}`, year }
  }

  return { label: month, year }
}
