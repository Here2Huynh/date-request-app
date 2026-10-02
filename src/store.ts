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

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!response.ok) {
    const error = new Error((await response.json().catch(() => null))?.error || 'Request failed') as Error & {
      status?: number
    }
    error.status = response.status
    throw error
  }
  return response.json() as Promise<T>
}

export async function getRequest(id: string) {
  try {
    return await apiRequest<RequestData>(`/api/requests/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 404) return null
    throw error
  }
}

export function saveRequest(data: RequestData) {
  return apiRequest<RequestData>(`/api/requests/${encodeURIComponent(data.id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function updateRequest(data: RequestData) {
  return saveRequest(data)
}

export async function getNetworkOrigin() {
  const value = await apiRequest<{ networkOrigin: string }>('/api/info')
  return value.networkOrigin
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

export function timeStart(value: string) {
  return value.split('-')[0]
}

export function timeLabel(value: string) {
  const [start, end] = value.split('-')
  const format = (time: string) =>
    new Date(`2026-01-01T${time}`).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    })
  return end ? `${format(start)} – ${format(end)}` : format(start)
}

export function makeCalendarUrl(request: RequestData) {
  const response = request.response
  if (!response || response.declined) return ''
  const start = new Date(`${response.date}T${timeStart(response.time)}:00`)
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
  const start = new Date(`${response.date}T${timeStart(response.time)}:00`)
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
