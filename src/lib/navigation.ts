import type { Mode } from '../constants'

export function modeFromHash(): { mode: Mode; id?: string } {
  const [kind, id] = location.hash.replace(/^#\/?/, '').split('/')
  return {
    mode: (kind === 'recipient'
      ? 'recipient'
      : kind === 'manage'
        ? 'manage'
        : kind === 'preview'
          ? 'preview'
          : 'create') as Mode,
    id,
  }
}

export function go(hash: string) {
  location.hash = hash
}
