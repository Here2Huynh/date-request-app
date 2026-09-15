import { useState } from 'react'
import { activityOptions, demoRequest, foodOptions, timeOptions } from '../../constants'
import { DateAvailabilityEditor } from '../../components/DateAvailabilityEditor'
import { ChoiceEditor } from '../../components/ChoiceEditor'
import { Button } from '../../components/ui/Button'
import { Header } from '../../components/ui/Header'
import { Shell } from '../../components/layout/Shell'
import { newId, type RequestData } from '../../store'
import { go } from '../../lib/navigation'

export function CreatePage() {
  const [data, setData] = useState<RequestData>(() => {
    try {
      const draft = sessionStorage.getItem('yeah-maybe-draft')
      if (draft) return JSON.parse(draft) as RequestData
    } catch {
      // Fall back to a clean editor if draft storage is unavailable or malformed.
    }
    return { ...demoRequest, id: newId(), recipientName: '', intro: '' }
  })
  const rangeMode = Boolean(data.dateRange)
  const valid =
    data.recipientName.trim() &&
    (rangeMode
      ? data.dateRange?.start && data.dateRange?.end && data.dateRange.start <= data.dateRange.end
      : data.dates.length) &&
    data.times.length &&
    data.activities.length &&
    data.foods.length
  const set = (key: keyof RequestData, value: string) =>
    setData((current) => ({ ...current, [key]: value }))
  const toggle = (key: 'dates' | 'times' | 'activities' | 'foods', value: string) =>
    setData((current) => ({
      ...current,
      [key]: current[key].includes(value)
        ? current[key].filter((item) => item !== value)
        : [...current[key], value],
    }))
  const addCustom = (key: 'activities' | 'foods', value: string, emoji: string) =>
    setData((current) => ({
      ...current,
      [key]: [...current[key], value],
      customEmojis: { ...current.customEmojis, [value]: emoji },
    }))
  const setDateMode = (mode: 'specific' | 'range') =>
    setData((current) =>
      mode === 'range'
        ? { ...current, dates: [], dateRange: current.dateRange || { start: '', end: '' } }
        : { ...current, dateRange: undefined },
    )

  return (
    <Shell>
      <Header step="CREATE YOUR REQUEST" title="Plan a little" accent="something cute." />
      <p className="lead">
        Build a date request that is impossible to ignore (in a very charming way).
      </p>
      <label>
        Who is this for?
        <input
          value={data.recipientName}
          onChange={(event) => set('recipientName', event.target.value)}
          placeholder="Their name"
        />
      </label>
      <label>
        Set the mood
        <textarea
          value={data.intro}
          onChange={(event) => set('intro', event.target.value)}
          placeholder="A short, sweet message"
        />
      </label>
      <ChoiceEditor
        title="Pick activities"
        values={activityOptions}
        selected={data.activities}
        onToggle={(value) => toggle('activities', value)}
        allowCustom
        onAddCustom={(value, emoji) => addCustom('activities', value, emoji)}
        customEmojis={data.customEmojis}
      />
      <ChoiceEditor
        title="Pick foods"
        values={foodOptions}
        selected={data.foods}
        onToggle={(value) => toggle('foods', value)}
        allowCustom
        onAddCustom={(value, emoji) => addCustom('foods', value, emoji)}
        customEmojis={data.customEmojis}
      />
      <DateAvailabilityEditor
        data={data}
        rangeMode={rangeMode}
        onModeChange={setDateMode}
        onDatesChange={(dates) => setData((current) => ({ ...current, dates }))}
        onRangeChange={(dateRange) => setData((current) => ({ ...current, dateRange }))}
      />
      <ChoiceEditor
        title="Offer times"
        values={timeOptions}
        selected={data.times}
        onToggle={(value) => toggle('times', value)}
        format={(value) =>
          new Date(`2026-01-01T${value}`).toLocaleTimeString([], {
            hour: 'numeric',
            minute: '2-digit',
          })
        }
      />
      <label className="toggle">
        <input
          type="checkbox"
          checked={data.cancellationWarning}
          onChange={(event) => setData({ ...data, cancellationWarning: event.target.checked })}
        />{' '}
        Add the silly $300 cancellation warning
      </label>
      <div className="actions">
        <Button
          disabled={!valid}
          onClick={() => {
            const draft = { ...data, id: newId() }
            sessionStorage.setItem('yeah-maybe-draft', JSON.stringify(draft))
            go('preview')
          }}
        >
          Preview recipient view
        </Button>
      </div>
    </Shell>
  )
}
