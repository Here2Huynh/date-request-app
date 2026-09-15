import { useState } from 'react'
import EmojiPicker, { type EmojiClickData } from 'emoji-picker-react'

export function ChoiceEditor({
  title,
  values,
  selected,
  onToggle,
  format = (value: string) => value,
  allowCustom = false,
  onAddCustom,
  customEmojis = {},
}: {
  title: string
  values: string[]
  selected: string[]
  onToggle: (value: string) => void
  format?: (value: string) => string
  allowCustom?: boolean
  onAddCustom?: (value: string, emoji: string) => void
  customEmojis?: Record<string, string>
}) {
  const [customValue, setCustomValue] = useState('')
  const [customEmoji, setCustomEmoji] = useState('✨')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const addCustom = () => {
    const value = customValue.trim()
    if (!value || values.includes(value) || selected.includes(value)) return
    onAddCustom?.(value, customEmoji)
    setCustomValue('')
  }

  const chooseEmoji = (emoji: EmojiClickData) => {
    setCustomEmoji(emoji.emoji)
    setShowEmojiPicker(false)
  }

  return (
    <div className="editor">
      <label>
        {title}
        <small>select at least one</small>
      </label>
      <div className="chips">
        {values.map((value) => (
          <button
            type="button"
            key={value}
            className={selected.includes(value) ? 'chip chosen' : 'chip'}
            onClick={() => onToggle(value)}
          >
            {customEmojis[value] || '♡'} {format(value)}
          </button>
        ))}
        {selected
          .filter((value) => !values.includes(value))
          .map((value) => (
            <button
              type="button"
              key={value}
              className="chip chosen"
              onClick={() => onToggle(value)}
            >
              {customEmojis[value] || '✨'} {format(value)}
            </button>
          ))}
      </div>
      {allowCustom && (
        <div className="custom-option">
          <button
            type="button"
            className="emoji-button"
            onClick={() => setShowEmojiPicker((open) => !open)}
            aria-label="Choose emoji"
          >
            {customEmoji}
          </button>
          <input
            value={customValue}
            onChange={(event) => setCustomValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                addCustom()
              }
            }}
            placeholder={`Add a custom ${title.toLowerCase().replace('pick ', '')}`}
          />
          <button type="button" className="add-button" onClick={addCustom}>
            Add
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker">
              <EmojiPicker onEmojiClick={chooseEmoji} width="100%" height={350} lazyLoadEmojis />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
