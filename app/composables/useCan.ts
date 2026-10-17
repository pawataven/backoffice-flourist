import { can } from '~/lib/core'
import type { Action, Resource } from '~/lib/core'

/** §5: `can(action, entity)` for the signed-in operator. The same rule will guard RLS / the api. */
export function useCan() {
  const auth = useAuthStore()
  return (action: Action, resource: Resource) => can(auth.operator?.role, action, resource)
}

/** `useCan` for one entity's pages: a `readonly` entity allows nothing but read, for every role. */
export function useEntityCan(config: { readonly?: boolean }) {
  const can = useCan()
  return (action: Action, resource: Resource) =>
    (!config.readonly || action === 'read') && can(action, resource)
}
