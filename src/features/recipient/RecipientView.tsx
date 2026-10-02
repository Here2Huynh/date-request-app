import { useEffect, useRef, useState, type MouseEvent } from 'react'
import {
  datesBetween,
  dateLabel,
  getRequest,
  makeCalendarUrl,
  makeIcs,
  timeLabel,
  updateRequest,
  type RequestData,
} from '../../store'
import { emojiFor } from '../../constants'
import { PreviewBar } from '../../components/PreviewBar'
import { Summary } from '../../components/Summary'
import { Button } from '../../components/ui/button'
import { Header } from '../../components/ui/Header'
import { Shell } from '../../components/layout/Shell'

export function RecipientPage({ id }: { id: string }) {
  const [request, setRequest] = useState<RequestData | null | undefined>(undefined)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    setRequest(undefined)
    setError(false)
    getRequest(id)
      .then((value) => {
        if (active) setRequest(value)
      })
      .catch(() => {
        if (active) setError(true)
      })
    return () => {
      active = false
    }
  }, [id])

  if (error)
    return (
      <Shell>
        <Header title="This link is" accent="taking a nap." />
        <p className="lead">The local date server could not be reached. Check that it is running on the shared network.</p>
      </Shell>
    )
  if (request === undefined)
    return (
      <Shell>
        <Header title="Just a second" accent="loading your date." />
        <p className="lead">Getting the invite ready...</p>
      </Shell>
    )
  if (!request)
    return (
      <Shell>
        <Header title="Hmm, this link" accent="wandered off." />
        <p className="lead">
          This request could not be found. Ask the sender for a fresh link.
        </p>
        <Button onClick={() => (location.hash = 'create')}>Make a request</Button>
      </Shell>
    )
  return <RecipientView data={request} />
}

// TODO: Allow them to choose a few default meme faces for the portrait

const HINT_OPTIONS = ['Choose wisely', 'WOWWW', 'The button has boundaries.']

export function RecipientView({
  data,
  preview = false,
  onBack,
  onSend,
}: {
  data: RequestData
  preview?: boolean
  onBack?: () => void
  onSend?: () => void
}) {
  const [step, setStep] = useState(0)
  const [selection, setSelection] = useState({ date: '', time: '', activity: '', food: '' })
  const [declined, setDeclined] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [hintIndex, setHintIndex] = useState(0)
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 })
  const yesButtonRef = useRef<HTMLButtonElement>(null)
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const next = () => setStep((current) => current + 1)
  const dodgeNoButton = (event: MouseEvent<HTMLButtonElement>) => {
    const button = noButtonRef.current
    const yesButton = yesButtonRef.current
    if (!button || !yesButton) return

    const buttonRect = button.getBoundingClientRect()
    const { width, height } = buttonRect
    const yesRect = yesButton.getBoundingClientRect()
    const padding = 12
    const maxLeft = Math.max(0, window.innerWidth - width)
    const maxTop = Math.max(0, window.innerHeight - height)
    const minLeft = Math.min(padding, maxLeft)
    const minTop = Math.min(padding, maxTop)
    const baseLeft = buttonRect.left - noPosition.x
    const baseTop = buttonRect.top - noPosition.y
    const overlaps = (left: number, top: number, rect: DOMRect, margin = 0) =>
      left < rect.right + margin &&
      left + width > rect.left - margin &&
      top < rect.bottom + margin &&
      top + height > rect.top - margin

    const candidates = Array.from({ length: 24 }, () => ({
      left: Math.round(minLeft + Math.random() * (maxLeft - minLeft)),
      top: Math.round(minTop + Math.random() * (maxTop - minTop)),
    }))
    candidates.push(
      { left: minLeft, top: minTop },
      { left: maxLeft, top: minTop },
      { left: minLeft, top: maxTop },
      { left: maxLeft, top: maxTop },
    )
    const pointerRect = new DOMRect(event.clientX - 24, event.clientY - 24, 48, 48)
    const nextPosition = candidates.find(
      ({ left, top }) => !overlaps(left, top, yesRect, 12) && !overlaps(left, top, pointerRect),
    ) ?? { left: minLeft, top: minTop }

    setHintIndex((current) => Math.min(current + 1, HINT_OPTIONS.length - 1))
    setNoPosition({ x: nextPosition.left - baseLeft, y: nextPosition.top - baseTop })
  }
  const submit = async () => {
    setSubmitError('')
    try {
      if (!preview) await updateRequest({ ...data, response: { ...selection, declined } })
      setStep(7)
    } catch {
      setSubmitError('We could not save your answer. Please check the shared network and try again.')
    }
  }
  const decline = async () => {
    setSubmitError('')
    try {
      if (!preview) await updateRequest({ ...data, response: { ...selection, declined: true } })
      setDeclined(true)
      setStep(7)
    } catch {
      setSubmitError('We could not send your response. Please check the shared network and try again.')
    }
  }
  if (step === 8)
    return (
      <Shell>
        <div className="frog" role="img" aria-label="Happy frog">
          <span aria-hidden="true">&#x1F438;</span>
        </div>
        <Header step="Well, then." />
        <p className="lead">You're paying 😛</p>
        {preview && <PreviewBar onBack={onBack} onSend={onSend} />}
      </Shell>
    )
  if (step === 7) {
    if (declined)
      return (
        <Shell>
          <div className="success-icon">🫡</div>
          <h1>Respectfully noted.</h1>
          <p className="lead">No hard feelings. The sender has been notified.</p>
          {preview && <PreviewBar onBack={onBack} onSend={onSend} />}
        </Shell>
      )
    return (
      <Confirmation
        data={{ ...data, response: selection }}
        preview={preview}
        onBack={onBack}
        onSend={onSend}
      />
    )
  }
  if (step === 6 && data.cancellationWarning)
    return (
      <Shell>
        <div className="warning-icon">⚠️</div>
        <Header step="CANCELLATION FEE" />
        <p className="lead">
          By proceeding, you acknowledge that cancelling after this point will result in a <strong>$300 cancellation fee</strong>.
        </p>
        <div className="actions">
          <Button onClick={submit}>Accept terms & confirm</Button>
          <Button secondary onClick={() => setStep(8)}>
            Let me reconsider
          </Button>
        </div>
        {submitError && <p className="status">{submitError}</p>}
        {preview && <PreviewBar onBack={onBack} onSend={onSend} />}
      </Shell>
    )
  if (step === 6)
    return (
      <Shell>
        <Header step="LAST LOOK" title="Ready to" accent="lock it in?" />
        <Summary data={data} selection={selection} />
        <div className="actions">
          <Button onClick={submit}>Submit my answer ♥</Button>
          <Button secondary onClick={() => setStep(5)}>
            Change something
          </Button>
        </div>
        {submitError && <p className="status">{submitError}</p>}
        {preview && <PreviewBar onBack={onBack} onSend={onSend} />}
      </Shell>
    )
  if (step === 0)
    return (
      <Shell>
        <div className="frog">🐸</div>
        <p className="question-label">{data.intro}</p>
        <div className="yesno">
          <Button className="w-23.5" ref={yesButtonRef} onClick={next}>
            Yes
          </Button>
          <button
            ref={noButtonRef}
            className="no-button"
            style={{ transform: `translate(${noPosition.x}px, ${noPosition.y}px)` }}
            onMouseEnter={dodgeNoButton}
            onClick={decline}
          >
            no
          </button>
        </div>
        <p className="hint">{HINT_OPTIONS[hintIndex]}</p>
        {submitError && <p className="status">{submitError}</p>}
        {preview && <PreviewBar onBack={onBack} />}
      </Shell>
    )
  if (step === 1)
    return (
      <Shell>
        <p className="question-label">Waittt, you actually said yes?!</p>
        <p className="lead">I was so ready for you to say no 😂</p>
        <Button onClick={next}>Ok, cool!</Button>
        {preview && <PreviewBar onBack={onBack} />}
      </Shell>
    )
  const titles = [
    ['So... when are you', 'free?'],
    ['What time works', 'for you?'],
    ['What are we', 'doing?'],
    ['And what are we', 'eating?'],
  ][step - 2]
  const options =
    step === 2
      ? data.dateRange
        ? datesBetween(data.dateRange.start, data.dateRange.end)
        : data.dates
      : step === 3
        ? data.times
        : step === 4
          ? data.activities
          : data.foods
  const key = step === 2 ? 'date' : step === 3 ? 'time' : step === 4 ? 'activity' : 'food'
  return (
    <Shell>
      <Header step={`STEP ${step - 1} OF 4`} title={titles[0]} accent={titles[1]} />
      <div className="option-grid">
        {options.map((value) => (
          <button
            className={selection[key] === value ? 'option selected' : 'option'}
            key={value}
            onClick={() => setSelection({ ...selection, [key]: value })}
          >
            <span>{step === 2 ? '♡' : step === 3 ? '◷' : emojiFor(data, value)}</span>
            {step === 2 ? dateLabel(value) : step === 3 ? timeLabel(value) : value}
          </button>
        ))}
      </div>
      <Button disabled={!selection[key]} onClick={next}>
        {step === 5 ? 'Continue' : 'Lock it in ♥'}
      </Button>
      {preview && <PreviewBar onBack={onBack} onSend={onSend} />}
    </Shell>
  )
}

function Confirmation({
  data,
  preview,
  onBack,
  onSend,
}: {
  data: RequestData
  preview: boolean
  onBack?: () => void
  onSend?: () => void
}) {
  const calendar = makeCalendarUrl(data)
  const ics = makeIcs(data)
  const download = () => {
    const anchor = document.createElement('a')
    anchor.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }))
    anchor.download = 'yeah-maybe-date.ics'
    anchor.click()
  }
  return (
    <Shell>
      <div className="success-icon">💌</div>
      <h1>
        It’s a <em>date!</em>
      </h1>
      <p className="lead">
        {dateLabel(data.response!.date)}, {data.response!.activity}, and hopefully you show up on
        time.
      </p>
      <Summary data={data} selection={data.response!} />
      {preview ? (
        <>
          <p className="muted">The real version will offer calendar invite buttons here.</p>
          <PreviewBar onBack={onBack} onSend={onSend} />
        </>
      ) : (
        <div className="actions">
          <Button onClick={() => window.open(calendar, '_blank')}>Add to Google Calendar</Button>
          <Button secondary onClick={download}>
            Download .ics invite
          </Button>
        </div>
      )}
    </Shell>
  )
}
