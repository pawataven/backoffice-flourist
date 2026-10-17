import { createBackofficeRepos, toDataSource } from '~/lib/api'
import type { BackofficeRepos, EntityRecord, EntityRepo } from '~/lib/api'

let repos: BackofficeRepos | undefined

/** The data layer. Mock or http is decided once, from runtime config (NUXT_PUBLIC_DATA_SOURCE). */
export function useRepos(): BackofficeRepos {
  if (!repos) {
    const config = useRuntimeConfig().public
    repos = createBackofficeRepos({
      dataSource: toDataSource(config.dataSource),
      apiBase: String(config.apiBase),
      mockError: String(config.mockError) === 'true',
      localStorage: window.localStorage,
      sessionStorage: window.sessionStorage,
    })
  }
  return repos
}

export function useEntityRepo(key: string): EntityRepo<EntityRecord & Record<string, unknown>> {
  const repo = (useRepos().entities as Record<string, EntityRepo<EntityRecord>>)[key]
  if (!repo) throw createError({ statusCode: 404, statusMessage: `Unknown entity ${key}` })
  return repo as EntityRepo<EntityRecord & Record<string, unknown>>
}
