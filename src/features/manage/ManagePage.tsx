import { Header } from '../../components/ui/Header'
import { Button } from '../../components/ui/button'
import { Shell } from '../../components/layout/Shell'
import { Summary } from '../../components/Summary'
import { getRequest } from '../../store'
import { go } from '../../lib/navigation'

export function ManagePage({ id }: { id: string }) {
  const data = getRequest(id)
  if (!data)
    return (
      <Shell>
        <Header title="Private page" accent="not found." />
        <Button onClick={() => go('create')}>Create a request</Button>
      </Shell>
    )
  const recipient = `${location.href.split('#')[0]}#recipient/${id}`
  return (
    <Shell>
      <Header step="PRIVATE RESPONSE PAGE" title="Your date request" accent="status" />
      <p className="lead">Share the recipient link, then come back here to see what happens.</p>
      <div className="linkbox">{recipient}</div>
      {data.response ? (
        <>
          <div className="status">
            {data.response.declined ? 'Declined — gracefully handled.' : 'Confirmed — it’s a date!'}
          </div>
          {!data.response.declined && <Summary data={data} selection={data.response} />}
        </>
      ) : (
        <div className="status waiting">Waiting for a response...</div>
      )}
      <div className="actions">
        <Button onClick={() => navigator.clipboard?.writeText(recipient)}>
          Copy recipient link
        </Button>
        <Button secondary onClick={() => go('create')}>
          Create another
        </Button>
      </div>
    </Shell>
  )
}
