import { useEffect, useState } from 'react'
import { Header } from '../../components/ui/Header'
import { Button } from '../../components/ui/button'
import { Shell } from '../../components/layout/Shell'
import { Summary } from '../../components/Summary'
import { getNetworkOrigin, getRequest, type RequestData } from '../../store'
import { go } from '../../lib/navigation'

export function ManagePage({ id }: { id: string }) {
  const [data, setData] = useState<RequestData | null | undefined>(undefined)
  const [error, setError] = useState(false)
  const [shareOrigin, setShareOrigin] = useState(() => location.origin)

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const value = await getRequest(id)
        if (active) {
          setData(value)
          setError(false)
        }
      } catch {
        if (active) setError(true)
      }
    }

    void load()
    const refresh = window.setInterval(load, 5000)
    const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])
    if (localHosts.has(location.hostname)) {
      getNetworkOrigin()
        .then((origin) => {
          if (active) setShareOrigin(origin)
        })
        .catch(() => undefined)
    }

    return () => {
      active = false
      window.clearInterval(refresh)
    }
  }, [id])

  if (error)
    return (
      <Shell>
        <Header title="The date server is" accent="taking a nap." />
        <p className="lead">Start the local server or check the shared network connection, then refresh this page.</p>
      </Shell>
    )
  if (data === undefined)
    return (
      <Shell>
        <Header title="Loading your" accent="date status." />
        <p className="lead">Checking the local date server...</p>
      </Shell>
    )
  if (!data)
    return (
      <Shell>
        <Header title="Private page" accent="not found." />
        <Button onClick={() => go('create')}>Create a request</Button>
      </Shell>
    )

  const recipient = `${shareOrigin}#recipient/${id}`
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
