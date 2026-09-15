import type { ReactNode } from 'react'

export function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode
  onClick?: () => void
  secondary?: boolean
  disabled?: boolean
}) {
  return (
    <button
      disabled={disabled}
      className={secondary ? 'button secondary' : 'button'}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
