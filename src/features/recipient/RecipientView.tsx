import { useState } from 'react'
import {
  datesBetween,
  dateLabel,
  getRequest,
  makeCalendarUrl,
  makeIcs,
  updateRequest,
  type RequestData,
} from '../../store'
import { emojiFor } from '../../constants'
import { PreviewBar } from '../../components/PreviewBar'
import { Summary } from '../../components/Summary'
import { Button } from '../../components/ui/Button'
import { Header } from '../../components/ui/Header'
import { Shell } from '../../components/layout/Shell'

export function RecipientPage({ id }: { id: string }) {
  const request = getRequest(id)
  if (!request)
    return (
      <Shell>
        <Header title="Hmm, this link" accent="wandered off." />
        <p className="lead">
          This request is not in this browser yet. Create one here first, or ask the sender for a
          fresh link.
        </p>
        <Button onClick={() => (location.hash = 'create')}>Make a request</Button>
      </Shell>
    )
  return <RecipientView data={request} />
}

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
  const [noCount, setNoCount] = useState(0)
  const next = () => setStep((current) => current + 1)
  const submit = () => {
    if (!preview) {
      updateRequest({ ...data, response: { ...selection, declined } })
      setStep(5)
    } else setStep(5)
  }
  if (step === 5) {
    if (declined)
      return (
        <Shell>
          <div className="success-icon">🫡</div>
          <h1>Respectfully noted.</h1>
          <p className="lead">No hard feelings. The sender has been notified.</p>
          <PreviewBar onBack={onBack} onSend={onSend} />
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
  if (step === 4 && data.cancellationWarning)
    return (
      <Shell>
        <div className="warning-icon">⚠️</div>
        <Header step="OPTIONAL FINE PRINT" title="Before you" accent="commit..." />
        <p className="lead">
          By proceeding, you acknowledge that cancelling after this point may result in a totally
          fictional <strong>$300 cancellation fee</strong>.
        </p>
        <p className="muted">
          This is a joke. There is no fee, no invoice, and no tiny lawyer hiding nearby.
        </p>
        <div className="actions">
          <Button onClick={submit}>I accept the imaginary terms</Button>
          <Button secondary onClick={() => setStep(3)}>
            Let me reconsider
          </Button>
        </div>
        {preview && <PreviewBar onBack={onBack} onSend={onSend} />}
      </Shell>
    )
  if (step === 4)
    return (
      <Shell>
        <Header step="LAST LOOK" title="Ready to" accent="lock it in?" />
        <Summary data={data} selection={selection} />
        <div className="actions">
          <Button onClick={submit}>Submit my answer ♥</Button>
          <Button secondary onClick={() => setStep(3)}>
            Change something
          </Button>
        </div>
        {preview && <PreviewBar onBack={onBack} onSend={onSend} />}
      </Shell>
    )
  if (step === 0)
    return (
      <Shell>
        <div className="frog">🐸</div>
        <Header step="A VERY IMPORTANT QUESTION" title="Will you go on a" accent="date with me?" />
        <p className="lead">{data.intro || 'I have a very important question for you...'}</p>
        <div className="yesno">
          <Button onClick={next}>YES, obviously</Button>
          <button
            className="no-button"
            style={{
              transform: `translate(${noCount ? (noCount % 2 ? 24 : -16) : 0}px, ${noCount ? -8 : 0}px)`,
            }}
            onMouseEnter={() => setNoCount((current) => current + 1)}
            onClick={() => {
              setDeclined(true)
              next()
            }}
          >
            {noCount < 3 ? 'no' : 'okay, no pressure'}
          </button>
        </div>
        <p className="hint">{noCount ? 'the button has boundaries.' : 'choose wisely'}</p>
        {preview && <PreviewBar onBack={onBack} />}
      </Shell>
    )
  const titles = [
    ['So... when are you', 'free?'],
    ['What are we', 'doing?'],
    ['And what are we', 'eating?'],
    ['One last thing...', ''],
  ][step - 1]
  const options =
    step === 1
      ? data.dateRange
        ? datesBetween(data.dateRange.start, data.dateRange.end)
        : data.dates
      : step === 2
        ? data.activities
        : data.foods
  const key = step === 1 ? 'date' : step === 2 ? 'activity' : 'food'
  return (
    <Shell>
      <Header step={`STEP ${step} OF 4`} title={titles[0]} accent={titles[1]} />
      <div className="option-grid">
        {options.map((value) => (
          <button
            className={selection[key] === value ? 'option selected' : 'option'}
            key={value}
            onClick={() => setSelection({ ...selection, [key]: value })}
          >
            <span>{step === 1 ? '♡' : emojiFor(data, value)}</span>
            {step === 1 ? dateLabel(value) : value}
          </button>
        ))}
      </div>
      <Button disabled={!selection[key]} onClick={next}>
        {step === 3 ? 'Continue' : 'Lock it in ♥'}
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
