import { useState } from 'react'

function formatTime(value: string) {
  return new Date(`2026-01-01T${value}`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function TimeEditor({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (times: string[]) => void
}) {
  const [time, setTime] = useState('')

  const addTime = () => {
    if (!time || selected.includes(time)) return
    onChange([...selected, time].sort())
    setTime('')
  }

  return (
    <div className="editor time-editor">
      <label htmlFor="offer-time">
        Offer times
        <small>add every time that could work</small>
      </label>
      <div className="time-add">
        <div className="time-input-wrap">
          <span aria-hidden="true">◷</span>
          <input
            id="offer-time"
            type="time"
            value={time}
            onChange={(event) => setTime(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addTime()
              }
            }}
            aria-label="Choose an offer time"
          />
        </div>
        <button
          type="button"
          className="add-button time-add-button"
          onClick={addTime}
          disabled={!time}
        >
          Add time
        </button>
      </div>
      {/* TODO:  Make the time chips highlight darker like the other selected chips */}
      {selected.length > 0 && (
        <div className="time-chips" aria-label="Selected offer times">
          {selected.map((value) => (
            <div className="time-chip" key={value}>
              <span>{formatTime(value)}</span>
              <button
                type="button"
                onClick={() => onChange(selected.filter((item) => item !== value))}
                aria-label={`Remove ${formatTime(value)}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
