import type { ReactNode } from 'react'

export function Shell({
  children,
  eyebrow = 'yeah, maybe',
}: {
  children: ReactNode
  eyebrow?: string
}) {
  return (
    <main>
      <div className="brand">{eyebrow}</div>
      <section className="paper">{children}</section>
      <div className="dots">
        <i className="active" />
        <i />
        <i />
      </div>
    </main>
  )
}
