// The data layer (ported from pheuan-api-client). Implementations are not exported: go through
// createBackofficeRepos, the one place that decides mock vs http.
export { RepoError, isRepoError } from './errors'
export type { RepoErrorCode } from './errors'
export { createBackofficeRepos, toDataSource } from './factory'
export type { BackofficeRepoConfig, BackofficeRepos, DataSource } from './factory'
export type {
  AuthRepo,
  AuthSession,
  EntityRecord,
  EntityRepo,
  FileStorageRepo,
  KeyValueStorage,
  PreferencesRepo,
  SettingsRepo,
} from './repos'
