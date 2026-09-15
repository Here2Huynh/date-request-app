import { emojiFor } from '../constants'
import { dateLabel } from '../store'
import type { RequestData } from '../store'

export function Summary({
  data,
  selection,
}: {
  data: RequestData
  selection: { date: string; time: string; activity: string; food: string }
}) {
  return (
    <div className="summary">
      <div>
        <span>DATE</span>
        <strong>{dateLabel(selection.date)}</strong>
      </div>
      <div>
        <span>TIME</span>
        <strong>
          {new Date(`2026-01-01T${selection.time}`).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </strong>
      </div>
      <div>
        <span>PLAN</span>
        <strong>
          {emojiFor(data, selection.activity)} {selection.activity} +{' '}
          {emojiFor(data, selection.food)} {selection.food}
        </strong>
      </div>
    </div>
  )
}
