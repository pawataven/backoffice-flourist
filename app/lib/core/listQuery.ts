// §4.2: a list page has three filter systems that combine with AND — stat card, search, column
// filters — plus sort and pagination. All of it lives in the URL. This module is pure, so the same
// query can later be sent to the server instead of being applied on the client.

export type ColumnFilterKind = 'values' | 'dateRange' | 'numberRange'

export type ColumnFilter =
  { kind: 'values'; values: string[] } | { kind: 'range'; from?: string; to?: string }

export type SortDir = 'asc' | 'desc'

export interface ListQuery {
  /** Active stat card key; undefined = the first card ("all"). */
  stat?: string
  q: string
  filters: Record<string, ColumnFilter>
  sort?: { key: string; dir: SortDir }
  page: number
  pageSize: number
}

/**
 * Which rows a stat card shows: field → value (an array = any of these values), or a predicate
 * for what values cannot say (ranges, "has a value", …).
 */
export type StatFilter = Record<string, unknown> | ((row: Row) => boolean)

export interface ListSpec {
  statCards: ReadonlyArray<{ key: string; filter?: StatFilter }>
  columns: ReadonlyArray<{ key: string; filter?: ColumnFilterKind }>
  searchFields: readonly string[]
}

export const PAGE_SIZES = [10, 20, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 20

/** The value a filter menu uses for null / empty cells. */
export const EMPTY_VALUE = ''

type Row = Record<string, unknown>
type UrlQuery = Record<string, string | null | undefined | ReadonlyArray<string | null>>

const first = (v: UrlQuery[string]): string | undefined =>
  (Array.isArray(v) ? v[0] : (v as string | null | undefined)) ?? undefined
const all = (v: UrlQuery[string]): string[] =>
  (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === 'string')

/** Reads `?stat=&q=&sort=word:asc&page=&size=&f.level=B1&f.level=B2&r.updated_at=2026-01-01..` */
export function parseListQuery(url: UrlQuery, spec: ListSpec): ListQuery {
  const stat = first(url.stat)
  const [sortKey, sortDir] = (first(url.sort) ?? '').split(':')
  const size = Number(first(url.size))
  const page = Number(first(url.page))
  const filters: Record<string, ColumnFilter> = {}
  for (const col of spec.columns) {
    if (col.filter === 'values' && url[`f.${col.key}`] !== undefined) {
      filters[col.key] = { kind: 'values', values: all(url[`f.${col.key}`]) }
    } else if (col.filter && col.filter !== 'values') {
      const raw = first(url[`r.${col.key}`])
      if (raw) {
        const [from, to] = raw.split('..')
        filters[col.key] = { kind: 'range', from: from || undefined, to: to || undefined }
      }
    }
  }
  return {
    stat: spec.statCards.some((c) => c.key === stat) ? stat : undefined,
    q: first(url.q) ?? '',
    filters,
    sort:
      sortKey && spec.columns.some((c) => c.key === sortKey)
        ? { key: sortKey, dir: sortDir === 'desc' ? 'desc' : 'asc' }
        : undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
    pageSize: (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE,
  }
}

/** Inverse of parseListQuery; default values are left out to keep URLs short. */
export function toUrlQuery(query: ListQuery): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  if (query.stat) out.stat = query.stat
  if (query.q) out.q = query.q
  if (query.sort) out.sort = `${query.sort.key}:${query.sort.dir}`
  if (query.page > 1) out.page = String(query.page)
  if (query.pageSize !== DEFAULT_PAGE_SIZE) out.size = String(query.pageSize)
  for (const [key, f] of Object.entries(query.filters)) {
    if (f.kind === 'values') out[`f.${key}`] = f.values
    else if (f.from || f.to) out[`r.${key}`] = `${f.from ?? ''}..${f.to ?? ''}`
  }
  return out
}

export function cellText(value: unknown): string {
  if (value === null || value === undefined) return EMPTY_VALUE
  return String(value)
}

function matchesPreset(row: Row, preset: StatFilter | undefined): boolean {
  if (!preset) return true
  if (typeof preset === 'function') return preset(row)
  return Object.entries(preset).every(([key, expected]) =>
    Array.isArray(expected) ? expected.includes(row[key]) : row[key] === expected,
  )
}

function matchesSearch(row: Row, fields: readonly string[], q: string): boolean {
  const needle = q.trim().toLocaleLowerCase()
  if (!needle) return true
  return fields.some((f) => cellText(row[f]).toLocaleLowerCase().includes(needle))
}

function matchesFilter(row: Row, key: string, filter: ColumnFilter): boolean {
  const value = row[key]
  if (filter.kind === 'values') return filter.values.includes(cellText(value))
  if (value === null || value === undefined) return false
  if (typeof value === 'number') {
    if (filter.from !== undefined && value < Number(filter.from)) return false
    if (filter.to !== undefined && value > Number(filter.to)) return false
    return true
  }
  // Dates: compare the YYYY-MM-DD prefix so `to` includes that whole day.
  const day = String(value).slice(0, 10)
  if (filter.from && day < filter.from) return false
  if (filter.to && day > filter.to) return false
  return true
}

/** Rows that pass the stat card, search and every column filter except `skipColumn`. */
function filterRows<T extends Row>(
  rows: readonly T[],
  spec: ListSpec,
  query: ListQuery,
  skipColumn?: string,
): T[] {
  const preset = spec.statCards.find((c) => c.key === query.stat)?.filter
  return rows.filter(
    (row) =>
      matchesPreset(row, preset) &&
      matchesSearch(row, spec.searchFields, query.q) &&
      Object.entries(query.filters).every(
        ([key, f]) => key === skipColumn || matchesFilter(row, key, f),
      ),
  )
}

export function compareCells(a: unknown, b: unknown, locale: string): number {
  if (a === b) return 0
  if (a === null || a === undefined) return 1
  if (b === null || b === undefined) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: 'base' })
}

export interface ListResult<T> {
  /** Rows of the current page. */
  rows: T[]
  /** Rows after filtering, before pagination. */
  total: number
  /** The page actually shown (clamped when filters shrink the list). */
  page: number
  pageCount: number
}

export function applyListQuery<T extends Row>(
  rows: readonly T[],
  spec: ListSpec,
  query: ListQuery,
  locale: string,
): ListResult<T> {
  const filtered = filterRows(rows, spec, query)
  if (query.sort) {
    const { key, dir } = query.sort
    const sign = dir === 'asc' ? 1 : -1
    filtered.sort((a, b) => sign * compareCells(a[key], b[key], locale))
  }
  const pageCount = Math.max(1, Math.ceil(filtered.length / query.pageSize))
  const page = Math.min(query.page, pageCount)
  const start = (page - 1) * query.pageSize
  return {
    rows: filtered.slice(start, start + query.pageSize),
    total: filtered.length,
    page,
    pageCount,
  }
}

/** Number of rows each stat card would show (its own preset only, like a tab count). */
export function statCounts(rows: readonly Row[], spec: ListSpec): Record<string, number> {
  return Object.fromEntries(
    spec.statCards.map((c) => [c.key, rows.filter((r) => matchesPreset(r, c.filter)).length]),
  )
}

/**
 * Distinct values for a column's filter menu, Excel-style: counted over the rows the other
 * filters leave, so the menu never offers a value that would empty the table.
 */
export function distinctValues(
  rows: readonly Row[],
  spec: ListSpec,
  query: ListQuery,
  key: string,
  locale: string,
): Array<{ value: string; count: number }> {
  const counts = new Map<string, number>()
  for (const row of filterRows(rows, spec, query, key)) {
    const v = cellText(row[key])
    counts.set(v, (counts.get(v) ?? 0) + 1)
  }
  // Keep values that are currently selected even if the other filters hide them.
  const current = query.filters[key]
  if (current?.kind === 'values')
    for (const v of current.values) if (!counts.has(v)) counts.set(v, 0)
  return [...counts]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => compareCells(a.value || null, b.value || null, locale))
}
