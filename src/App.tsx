import { useEffect, useState } from 'react'
import { CreatePage } from './features/create/CreatePage'
import { ManagePage } from './features/manage/ManagePage'
import { PreviewPage } from './features/preview/PreviewPage'
import { RecipientPage } from './features/recipient/RecipientView'
import { modeFromHash } from './lib/navigation'

export function App() {
  const [route, setRoute] = useState(modeFromHash())

  useEffect(() => {
    const handleHashChange = () => setRoute(modeFromHash())
    addEventListener('hashchange', handleHashChange)
    return () => removeEventListener('hashchange', handleHashChange)
  }, [])

  if (route.mode === 'recipient') return <RecipientPage id={route.id || ''} />
  if (route.mode === 'manage') return <ManagePage id={route.id || ''} />
  if (route.mode === 'preview') return <PreviewPage />
  return <CreatePage />
}
