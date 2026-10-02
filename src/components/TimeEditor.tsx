import { useState } from 'react'

function formatTime(value: string) {
  return new Date(`2026-01-01T${value}`).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatTimeOption(value: string) {
  const [start, end] = value.split('-')
  return end ? `${formatTime(start)} – ${formatTime(end)}` : formatTime(start)
}

export function TimeEditor({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (times: string[]) => void
}) {
  const [mode, setMode] = useState<'single' | 'range'>('single')
  const [time, setTime] = useState('')
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')

  const value = mode === 'single' ? time : `${rangeStart}-${rangeEnd}`
  const canAdd =
    mode === 'single' ? Boolean(time) : Boolean(rangeStart && rangeEnd && rangeStart < rangeEnd)

  const addTime = () => {
    if (!canAdd || selected.includes(value)) return
    onChange([...selected, value].sort())
    if (mode === 'single') setTime('')
    else {
      setRangeStart('')
      setRangeEnd('')
    }
  }

  return (
    <div className="editor time-editor">
      <label>
        Offer times
        <small>add every time or time window that could work</small>
      </label>
      <div className="mode-switch">
        <button
          type="button"
          className={mode === 'single' ? 'mode active' : 'mode'}
          onClick={() => setMode('single')}
        >
          Specific time
        </button>
        <button
          type="button"
          className={mode === 'range' ? 'mode active' : 'mode'}
          onClick={() => setMode('range')}
        >
          Time range
        </button>
      </div>
      {mode === 'single' ? (
        <div className="time-add">
          <div className="time-input-wrap">
            <span aria-hidden="true">&#x22C5;</span>
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
            disabled={!canAdd}
          >
            Add time
          </button>
        </div>
      ) : (
        <div className="time-range-add">
          <div className="range-fields">
            <label>
              From
              <input
                type="time"
                value={rangeStart}
                onChange={(event) => setRangeStart(event.target.value)}
              />
            </label>
            <label>
              To
              <input
                type="time"
                value={rangeEnd}
                min={rangeStart || undefined}
                onChange={(event) => setRangeEnd(event.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            className="add-button time-add-button"
            onClick={addTime}
            disabled={!canAdd}
          >
            Add range
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <div className="time-chips" aria-label="Selected offer times">
          {selected.map((value) => (
            <div className="time-chip" key={value}>
              <span>{formatTimeOption(value)}</span>
              <button
                type="button"
                onClick={() => onChange(selected.filter((item) => item !== value))}
                aria-label={`Remove ${formatTimeOption(value)}`}
              >
                &#xD7;
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
