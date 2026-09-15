import { useState } from 'react'
import { dateLabel } from '../store'
import type { RequestData } from '../store'

export function DateAvailabilityEditor({
  data,
  rangeMode,
  onModeChange,
  onDatesChange,
  onRangeChange,
}: {
  data: RequestData
  rangeMode: boolean
  onModeChange: (mode: 'specific' | 'range') => void
  onDatesChange: (dates: string[]) => void
  onRangeChange: (range: { start: string; end: string }) => void
}) {
  const [dateToAdd, setDateToAdd] = useState('')
  const addDate = () => {
    if (dateToAdd && !data.dates.includes(dateToAdd)) onDatesChange([...data.dates, dateToAdd])
    setDateToAdd('')
  }

  return (
    <div className="editor availability-editor">
      <label>
        Availability
        <small>choose a range or select at least one available date</small>
      </label>
      <div className="mode-switch">
        <button
          type="button"
          className={!rangeMode ? 'mode active' : 'mode'}
          onClick={() => onModeChange('specific')}
        >
          Specific dates
        </button>
        <button
          type="button"
          className={rangeMode ? 'mode active' : 'mode'}
          onClick={() => onModeChange('range')}
        >
          Date range
        </button>
      </div>
      {rangeMode ? (
        <div className="range-fields">
          <label>
            From
            <input
              type="date"
              value={data.dateRange?.start || ''}
              onChange={(event) =>
                onRangeChange({ start: event.target.value, end: data.dateRange?.end || '' })
              }
            />
          </label>
          <label>
            To
            <input
              type="date"
              value={data.dateRange?.end || ''}
              min={data.dateRange?.start || undefined}
              onChange={(event) =>
                onRangeChange({ start: data.dateRange?.start || '', end: event.target.value })
              }
            />
          </label>
        </div>
      ) : (
        <>
          <div className="date-add">
            <input
              type="date"
              value={dateToAdd}
              onChange={(event) => setDateToAdd(event.target.value)}
            />
            <button type="button" className="add-button" disabled={!dateToAdd} onClick={addDate}>
              Add date
            </button>
          </div>
          {data.dates.length > 0 && (
            <div className="chips date-chips">
              {data.dates.map((value) => (
                <button
                  type="button"
                  key={value}
                  className="chip chosen"
                  onClick={() => onDatesChange(data.dates.filter((date) => date !== value))}
                >
                  ♡ {dateLabel(value)} ×
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
