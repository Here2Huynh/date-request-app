import { useState } from 'react'

export function PreviewBar({
  onBack,
  onSend,
}: {
  onBack?: () => void | Promise<void>
  onSend?: () => void | Promise<void>
}) {
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const send = async () => {
    if (!onSend) return
    setSending(true)
    setError(false)
    try {
      await onSend()
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="previewbar">
      PREVIEW MODE <button onClick={onBack}>back to editing</button>
      {onSend && (
        <button disabled={sending} onClick={() => void send()}>
          {sending ? 'sending...' : 'send this request'}
        </button>
      )}
      {error && <span role="alert">Could not save the request. Check the local server and try again.</span>}
    </div>
  )
}
