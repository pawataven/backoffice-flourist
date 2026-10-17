import type { OperatorRole } from '~/lib/types'

// §5 Role: the same rule runs in the UI (hide what you cannot do) and, later, in RLS / the api.

export type Action = 'read' | 'create' | 'update' | 'delete' | 'publish'

/** An entity key ('vocabulary', 'games', …) or 'settings' for platform settings. */
export type Resource = string

export function can(
  role: OperatorRole | null | undefined,
  action: Action,
  resource: Resource,
): boolean {
  if (!role) return false
  // §4.5: platform settings affect every user at once, so only admins see them.
  if (resource === 'settings') return role === 'admin'
  switch (role) {
    case 'admin':
    case 'editor':
      return true
    case 'viewer':
      return action === 'read'
  }
}
