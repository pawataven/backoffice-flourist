import { DEFAULT_OPERATOR_PREFERENCES, OperatorSchema } from '~/lib/types'
import type { Operator, OperatorPreferences } from '~/lib/types'
import type { ZodType } from 'zod'
import { RepoError } from './errors'
import type {
  AuthRepo,
  AuthSession,
  EntityRecord,
  EntityRepo,
  FileStorageRepo,
  KeyValueStorage,
  PreferencesRepo,
  SettingsRepo,
} from './repos'

export interface MockOptions {
  /** Where mock data survives a reload. Without it, data lives in memory only. */
  storage?: KeyValueStorage
  /** Milliseconds to wait before answering. Tests pass `() => 0`. */
  delayMs?: () => number
  /** Every call throws `MOCK_FAILURE`, to exercise error states. */
  failing?: boolean
}

const randomDelayMs = (): number => 150 + Math.random() * 350
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function makeGate(options: MockOptions) {
  const delay = options.delayMs ?? randomDelayMs
  return async () => {
    await sleep(delay())
    if (options.failing) throw new RepoError('MOCK_FAILURE', 'Mock error mode is on')
  }
}

function readJson<T>(storage: KeyValueStorage | undefined, key: string): T | undefined {
  const raw = storage?.getItem(key)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

// JSON round-trip, not structuredClone: callers may pass Vue reactive proxies, which
// structuredClone rejects. All mock data is plain JSON anyway.
const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T

// ── Entities ────────────────────────────────────────────────────────────

export interface MockEntityOptions<T extends EntityRecord> extends MockOptions {
  /** Storage key, e.g. 'mock:vocabulary'. */
  key: string
  seed: unknown
  schema: ZodType<T>
  /** Values the "database" fills in on create. */
  defaults: () => Omit<T, keyof EntityRecord>
}

export function createMockEntityRepo<T extends EntityRecord>(
  options: MockEntityOptions<T>,
): EntityRepo<T> {
  const gate = makeGate(options)
  const stored = readJson<unknown[]>(options.storage, options.key)
  const parsed = options.schema.array().safeParse(stored ?? options.seed)
  if (!parsed.success) {
    throw new RepoError('INVALID_DATA', `Mock ${options.key} data does not match the schema`, {
      cause: parsed.error,
    })
  }
  let rows: T[] = parsed.data

  const persist = () => options.storage?.setItem(options.key, JSON.stringify(rows))
  const find = (id: string) => {
    const row = rows.find((r) => r.id === id)
    if (!row) throw new RepoError('NOT_FOUND', `No ${options.key} row with id ${id}`)
    return row
  }
  const now = () => new Date().toISOString()
  // Like a DB constraint: a row that does not match the schema is never stored, so one bad save
  // cannot break the table on the next load.
  const checked = (row: unknown): T => {
    const result = options.schema.safeParse(row)
    if (!result.success) {
      throw new RepoError('INVALID_DATA', `Row does not match the ${options.key} schema`, {
        cause: result.error,
      })
    }
    return result.data
  }

  return {
    async list() {
      await gate()
      return clone(rows)
    },
    async get(id) {
      await gate()
      return clone(find(id))
    },
    async create(data) {
      await gate()
      const stamp = now()
      const row = checked({
        ...options.defaults(),
        ...data,
        id: crypto.randomUUID(),
        created_at: stamp,
        updated_at: stamp,
      })
      rows = [row, ...rows]
      persist()
      return clone(row)
    },
    async update(id, patch) {
      await gate()
      const row = checked({ ...find(id), ...patch, id, updated_at: now() })
      rows = rows.map((r) => (r.id === id ? row : r))
      persist()
      return clone(row)
    },
    async updateMany(ids, patch) {
      await gate()
      const set = new Set(ids)
      const stamp = now()
      rows = rows.map((r) =>
        set.has(r.id) ? checked({ ...r, ...patch, id: r.id, updated_at: stamp }) : r,
      )
      persist()
    },
    async remove(ids) {
      await gate()
      const set = new Set(ids)
      rows = rows.filter((r) => !set.has(r.id))
      persist()
    },
  }
}

// ── Auth ────────────────────────────────────────────────────────────────

export interface MockAccount {
  password: string
  operator: Operator
}

export interface MockAuthOptions extends MockOptions {
  accounts: MockAccount[]
  /** "Remember me" → this storage (localStorage). */
  persistentStorage?: KeyValueStorage
  /** No "remember me" → this storage (sessionStorage). */
  sessionStorage?: KeyValueStorage
}

const SESSION_KEY = 'mock:session'

export function createMockAuthRepo(options: MockAuthOptions): AuthRepo {
  const gate = makeGate(options)
  const stores = [options.persistentStorage, options.sessionStorage]

  return {
    async signIn(email, password, remember) {
      await gate()
      const account = options.accounts.find(
        (a) =>
          a.operator.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
      )
      if (!account) throw new RepoError('INVALID_CREDENTIALS', 'Wrong email or password')
      const session: AuthSession = { operator: OperatorSchema.parse(account.operator) }
      for (const s of stores) s?.removeItem(SESSION_KEY)
      const target = remember ? options.persistentStorage : options.sessionStorage
      target?.setItem(SESSION_KEY, JSON.stringify(session))
      return clone(session)
    },
    async signOut() {
      for (const s of stores) s?.removeItem(SESSION_KEY)
    },
    async getSession() {
      for (const s of stores) {
        const session = readJson<AuthSession>(s, SESSION_KEY)
        if (session && OperatorSchema.safeParse(session.operator).success) return session
      }
      return null
    },
  }
}

// ── Operator preferences ────────────────────────────────────────────────

export function createMockPreferencesRepo(options: MockOptions = {}): PreferencesRepo {
  const key = (id: string) => `mock:prefs:${id}`
  return {
    async get(operatorId) {
      const stored = readJson<Partial<OperatorPreferences>>(options.storage, key(operatorId))
      return { ...DEFAULT_OPERATOR_PREFERENCES, ...stored }
    },
    async save(operatorId, prefs) {
      options.storage?.setItem(key(operatorId), JSON.stringify(prefs))
      return clone(prefs)
    },
  }
}

// ── Platform settings ───────────────────────────────────────────────────

export interface MockSettingsOptions extends MockOptions {
  seed: Record<string, unknown>
}

export function createMockSettingsRepo(options: MockSettingsOptions): SettingsRepo {
  const gate = makeGate(options)
  const storageKey = (key: string) => `mock:settings:${key}`
  return {
    async get<T>(key: string) {
      await gate()
      const value = readJson<T>(options.storage, storageKey(key)) ?? options.seed[key]
      if (value === undefined) throw new RepoError('NOT_FOUND', `No setting "${key}"`)
      return clone(value as T)
    },
    async save<T>(key: string, value: T) {
      await gate()
      options.storage?.setItem(storageKey(key), JSON.stringify(value))
      return clone(value)
    },
  }
}

// ── File storage ────────────────────────────────────────────────────────

/** Keeps uploads as data URLs (they end up inside the mock records in localStorage). */
export function createMockFileStorageRepo(options: MockOptions = {}): FileStorageRepo {
  const gate = makeGate(options)
  return {
    async upload(file) {
      await gate()
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result))
        reader.onerror = () =>
          reject(new RepoError('NETWORK', 'Could not read the file', { cause: reader.error }))
        reader.readAsDataURL(file)
      })
    },
  }
}
