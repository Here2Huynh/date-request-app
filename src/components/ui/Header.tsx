export function Header({ step, title, accent }: { step?: string; title: string; accent?: string }) {
  return (
    <>
      <p className="step">{step}</p>
      <h1>
        {title} {accent && <em>{accent}</em>}
      </h1>
    </>
  )
}
