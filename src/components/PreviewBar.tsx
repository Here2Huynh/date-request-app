export function PreviewBar({ onBack, onSend }: { onBack?: () => void; onSend?: () => void }) {
  return (
    <div className="previewbar">
      PREVIEW MODE <button onClick={onBack}>back to editing</button>
      {onSend && <button onClick={onSend}>send this request</button>}
    </div>
  )
}
