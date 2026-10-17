import {
  BranchSchema,
  CategorySchema,
  DailyStatSchema,
  MemberSchema,
  MenuItemSchema,
  OrderSchema,
  PromotionSchema,
  ReviewSchema,
  StaffSchema,
  StockItemSchema,
} from '../types'
import type {
  Branch,
  Category,
  DailyStat,
  Member,
  MenuItem,
  Order,
  Promotion,
  Review,
  Staff,
  StockItem,
} from '../types'
import type { ZodType } from 'zod'
import menuSeed from '~/mocks/menu.json'
import categoriesSeed from '~/mocks/categories.json'
import ordersSeed from '~/mocks/orders.json'
import promotionsSeed from '~/mocks/promotions.json'
import membersSeed from '~/mocks/members.json'
import staffSeed from '~/mocks/staff.json'
import reviewsSeed from '~/mocks/reviews.json'
import branchesSeed from '~/mocks/branches.json'
import stockSeed from '~/mocks/stock.json'
import dailystatsSeed from '~/mocks/dailystats.json'
import accounts from '~/mocks/accounts.json'
import settingsSeed from '~/mocks/settings.json'
import { RepoError } from './errors'
import {
  createMockAuthRepo,
  createMockEntityRepo,
  createMockFileStorageRepo,
  createMockPreferencesRepo,
  createMockSettingsRepo,
} from './repos.mock'
import type { MockAccount, MockOptions } from './repos.mock'
import type {
  AuthRepo,
  EntityRecord,
  EntityRepo,
  FileStorageRepo,
  KeyValueStorage,
  PreferencesRepo,
  SettingsRepo,
} from './repos'

export type DataSource = 'mock' | 'http'

/** Validates the raw env value so a typo fails loudly instead of silently using mock. */
export function toDataSource(value: unknown): DataSource {
  if (value === 'mock' || value === 'http') return value
  throw new Error(`NUXT_PUBLIC_DATA_SOURCE must be "mock" or "http", got "${String(value)}"`)
}

export interface BackofficeRepos {
  auth: AuthRepo
  preferences: PreferencesRepo
  settings: SettingsRepo
  /** Uploaded files; swap the implementation for S3 later. */
  storage: FileStorageRepo
  entities: {
    menu: EntityRepo<MenuItem>
    categories: EntityRepo<Category>
    orders: EntityRepo<Order>
    promotions: EntityRepo<Promotion>
    members: EntityRepo<Member>
    reviews: EntityRepo<Review>
    branches: EntityRepo<Branch>
    staff: EntityRepo<Staff>
    stock: EntityRepo<StockItem>
    /** Read-only analytics history; no page of its own, read by /analytics. */
    dailystats: EntityRepo<DailyStat>
  }
}

export interface BackofficeRepoConfig {
  dataSource: DataSource
  apiBase: string
  /** Every mock call fails, to see the error states. */
  mockError: boolean
  /** Browser storages; the mock keeps its data and sessions there. */
  localStorage?: KeyValueStorage
  sessionStorage?: KeyValueStorage
}

/** Every method rejects with NOT_IMPLEMENTED — there is no real api behind this demo. */
function notImplemented<T extends object>(name: string): T {
  return new Proxy({} as T, {
    get: () => () =>
      Promise.reject(new RepoError('NOT_IMPLEMENTED', `${name} api is not built yet`)),
  })
}

// ── Entity tables ───────────────────────────────────────────────────────

interface Table<T extends EntityRecord> {
  seed: unknown
  schema: ZodType<T>
  /** What the "database" fills in on create. */
  defaults: () => Omit<T, keyof EntityRecord>
}
const table = <T extends EntityRecord>(t: Table<T>) => t
const today = () => new Date().toISOString().slice(0, 10)

const TABLES = {
  menu: table<MenuItem>({
    seed: menuSeed,
    schema: MenuItemSchema,
    defaults: () => ({
      sku: '',
      name_th: '',
      name_en: '',
      category: 'coffee',
      tag: null,
      price: 0,
      cost: 0,
      description_th: null,
      description_en: null,
      image_url: null,
      status: 'draft',
      sold_7d: 0,
      revenue_7d: 0,
      rating: 0,
    }),
  }),
  categories: table<Category>({
    seed: categoriesSeed,
    schema: CategorySchema,
    defaults: () => ({
      slug: 'coffee',
      kind: 'drink',
      order: 1,
      emoji: null,
      name_th: '',
      name_en: '',
      item_count: 0,
    }),
  }),
  orders: table<Order>({
    seed: ordersSeed,
    schema: OrderSchema,
    defaults: () => ({
      code: '',
      branch: 'ari',
      channel: 'dine_in',
      status: 'pending',
      customer_name: null,
      phone: null,
      note: null,
      items: 1,
      subtotal: 0,
      discount: 0,
      total: 0,
      payment: 'cash',
      ordered_at: new Date().toISOString(),
    }),
  }),
  promotions: table<Promotion>({
    seed: promotionsSeed,
    schema: PromotionSchema,
    defaults: () => ({
      code: '',
      title_th: '',
      title_en: null,
      kind: 'percent',
      value: 0,
      min_spend: 0,
      starts_on: today(),
      ends_on: today(),
      usage_limit: null,
      used_count: 0,
      status: 'draft',
    }),
  }),
  members: table<Member>({
    seed: membersSeed,
    schema: MemberSchema,
    defaults: () => ({
      name: '',
      phone: '',
      email: null,
      avatar_url: null,
      tier: 'bronze',
      points: 0,
      visits: 0,
      total_spent: 0,
      favorite_menu: null,
      birthday: null,
      joined_on: today(),
      last_visit_at: null,
    }),
  }),
  reviews: table<Review>({
    seed: reviewsSeed,
    schema: ReviewSchema,
    defaults: () => ({
      name: '',
      branch: 'ari',
      rating: 5,
      source: 'instore',
      body: '',
      reply: null,
      visibility: 'hidden',
      reviewed_on: today(),
    }),
  }),
  branches: table<Branch>({
    seed: branchesSeed,
    schema: BranchSchema,
    defaults: () => ({
      slug: 'ari',
      name_th: '',
      name_en: '',
      district: '',
      phone: null,
      opens_at: '07:00',
      closes_at: '19:00',
      seats: 0,
      manager: null,
      status: 'soon',
      staff_count: 0,
      today_orders: 0,
      today_revenue: 0,
      rating: 0,
    }),
  }),
  staff: table<Staff>({
    seed: staffSeed,
    schema: StaffSchema,
    defaults: () => ({
      name: '',
      nickname: null,
      avatar_url: null,
      role: 'barista',
      branch: 'ari',
      phone: null,
      shift: 'morning',
      hourly_rate: 60,
      started_on: today(),
      status: 'active',
      hours_this_month: 0,
    }),
  }),
  stock: table<StockItem>({
    seed: stockSeed,
    schema: StockItemSchema,
    defaults: () => ({
      sku: '',
      name_th: '',
      name_en: null,
      group: 'beans',
      unit: 'kg',
      branch: 'ari',
      stock: 0,
      reorder_level: 0,
      cost_per_unit: 0,
      supplier: null,
      last_restock_on: null,
    }),
  }),
  dailystats: table<DailyStat>({
    seed: dailystatsSeed,
    schema: DailyStatSchema,
    defaults: () => ({
      date: today(),
      revenue: 0,
      orders: 0,
      customers: 0,
      new_members: 0,
      dine_in: 0,
      takeaway: 0,
      delivery: 0,
      cups_hot: 0,
      cups_iced: 0,
      cups_blended: 0,
      bakery_items: 0,
      promo_discount: 0,
      waste_cost: 0,
    }),
  }),
}

const ENTITY_KEYS = Object.keys(TABLES) as Array<keyof BackofficeRepos['entities']>

function mockEntities(options: MockOptions): BackofficeRepos['entities'] {
  return Object.fromEntries(
    Object.entries(TABLES).map(([key, t]) => [
      key,
      createMockEntityRepo({ ...options, key: `cafe:${key}`, ...(t as Table<EntityRecord>) }),
    ]),
  ) as unknown as BackofficeRepos['entities']
}

/** The one place that decides mock vs http for the Back Office. */
export function createBackofficeRepos(config: BackofficeRepoConfig): BackofficeRepos {
  if (config.dataSource === 'http') {
    return {
      auth: notImplemented('auth'),
      preferences: notImplemented('preferences'),
      settings: notImplemented('settings'),
      storage: notImplemented('storage'),
      entities: Object.fromEntries(
        ENTITY_KEYS.map((key) => [key, notImplemented(key)]),
      ) as unknown as BackofficeRepos['entities'],
    }
  }

  const base = { storage: config.localStorage, failing: config.mockError }
  return {
    auth: createMockAuthRepo({
      accounts: accounts as MockAccount[],
      persistentStorage: config.localStorage,
      sessionStorage: config.sessionStorage,
      failing: config.mockError,
    }),
    preferences: createMockPreferencesRepo(base),
    settings: createMockSettingsRepo({ ...base, seed: settingsSeed }),
    storage: createMockFileStorageRepo({ failing: config.mockError }),
    entities: mockEntities(base),
  }
}
