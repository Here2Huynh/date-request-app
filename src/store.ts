export type RequestData = {
  id: string
  recipientName: string
  intro: string
  dates: string[]
  dateRange?: { start: string; end: string }
  times: string[]
  activities: string[]
  foods: string[]
  customEmojis?: Record<string, string>
  cancellationWarning: boolean
  response?: { date: string; time: string; activity: string; food: string; declined?: boolean }
}

const KEY = 'yeah-maybe-requests'
const read = (): RequestData[] => JSON.parse(localStorage.getItem(KEY) || '[]')
const write = (items: RequestData[]) => localStorage.setItem(KEY, JSON.stringify(items))

export function saveRequest(data: RequestData) {
  write([...read().filter((item) => item.id !== data.id), data])
  return data
}
export function getRequest(id: string) {
  return read().find((item) => item.id === id)
}
export function updateRequest(data: RequestData) {
  return saveRequest(data)
}
export function newId() {
  return crypto.randomUUID
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)
}

export function dateLabel(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T12:00:00`))
}

export function datesBetween(start: string, end: string) {
  if (!start || !end || start > end) return []
  const result: string[] = []
  const cursor = new Date(`${start}T12:00:00`)
  const finish = new Date(`${end}T12:00:00`)
  while (cursor <= finish && result.length < 62) {
    result.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return result
}

export function makeCalendarUrl(request: RequestData) {
  const response = request.response
  if (!response || response.declined) return ''
  const start = new Date(`${response.date}T${response.time}:00`)
  const end = new Date(start.getTime() + 90 * 60 * 1000)
  const iso = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  const title = encodeURIComponent(`${response.activity} date with ${request.recipientName}`)
  const details = encodeURIComponent(`${response.food} • made with love by yeah, maybe`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${iso(start)}/${iso(end)}&details=${details}`
}

export function makeIcs(request: RequestData) {
  const response = request.response
  if (!response || response.declined) return ''
  const start = new Date(`${response.date}T${response.time}:00`)
  const end = new Date(start.getTime() + 90 * 60 * 1000)
  const iso = (d: Date) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '')
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//yeah maybe//date request//EN',
    'BEGIN:VEVENT',
    `UID:${request.id}@yeahmaybe`,
    `DTSTAMP:${iso(new Date())}`,
    `DTSTART:${iso(start)}`,
    `DTEND:${iso(end)}`,
    `SUMMARY:${response.activity} date with ${request.recipientName}`,
    `DESCRIPTION:${response.food} - made with love by yeah, maybe`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}
