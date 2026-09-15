import { demoRequest } from '../../constants'
import { RecipientView } from '../recipient/RecipientView'
import { go } from '../../lib/navigation'
import { newId, saveRequest, type RequestData } from '../../store'

export function PreviewPage() {
  const data: RequestData = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('yeah-maybe-draft') || '')
    } catch {
      return { ...demoRequest, id: newId() }
    }
  })()
  return (
    <RecipientView
      data={data}
      preview
      onBack={() => go('create')}
      onSend={() => {
        saveRequest(data)
        sessionStorage.removeItem('yeah-maybe-draft')
        go(`manage/${data.id}`)
      }}
    />
  )
}
