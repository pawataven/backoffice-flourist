import type { Operator, OperatorPreferences } from '~/lib/types'

/** Anything with the Web Storage API (localStorage, sessionStorage, or a Map-backed fake in tests). */
export interface KeyValueStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export interface EntityRecord {
  id: string
  created_at: string
  updated_at: string
}

/**
 * CRUD for one table. List pages filter on the client (§4.2), so `list` returns every row;
 * a server-side version can add a query argument later without changing the UI contract.
 */
export interface EntityRepo<T extends EntityRecord> {
  list(): Promise<T[]>
  /** Throws `RepoError('NOT_FOUND')`. */
  get(id: string): Promise<T>
  /** Fields left out get the table's defaults (like a DB DEFAULT). */
  create(data: Partial<T>): Promise<T>
  update(id: string, patch: Partial<T>): Promise<T>
  updateMany(ids: string[], patch: Partial<T>): Promise<void>
  remove(ids: string[]): Promise<void>
}

export interface AuthSession {
  operator: Operator
}

export interface AuthRepo {
  /** Throws `RepoError('INVALID_CREDENTIALS')` with no hint about which part was wrong. */
  signIn(email: string, password: string, remember: boolean): Promise<AuthSession>
  signOut(): Promise<void>
  /** The stored session, or null when signed out. */
  getSession(): Promise<AuthSession | null>
}

export interface PreferencesRepo {
  get(operatorId: string): Promise<OperatorPreferences>
  save(operatorId: string, prefs: OperatorPreferences): Promise<OperatorPreferences>
}

export interface SettingsRepo {
  get<T>(key: string): Promise<T>
  save<T>(key: string, value: T): Promise<T>
}

/**
 * Where uploaded files (profile pictures, menu photos) go. Returns the public URL that the record
 * stores (e.g. `avatar_url`). Mock: a data URL in the browser. Later: S3 (or Supabase Storage)
 * behind the api — the UI does not change.
 */
export interface FileStorageRepo {
  upload(file: Blob, options: { folder: string }): Promise<string>
}
