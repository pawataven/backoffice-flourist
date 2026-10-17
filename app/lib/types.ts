import { z } from 'zod'

// The data contract of ดอยดาว คาเฟ่ (Doi Dao Café): one Zod schema per table. The mock repos
// check every row against these, like DB constraints.

// ── Shared building blocks ──────────────────────────────────────────────

export const PublishStatusSchema = z.enum(['draft', 'published'])
export type PublishStatus = z.infer<typeof PublishStatusSchema>

/** Columns every editable record has. The database fills them (DEFAULT), forms never show them. */
export const RecordBase = {
  id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
}

const isoDate = z.iso.date()
const money = z.number().min(0)
const count = z.number().int().min(0)

// ── Value lists (also the options of enum fields) ───────────────────────

export const CATEGORY_KEYS = ['coffee', 'tea', 'non_coffee', 'frappe', 'bakery', 'food'] as const
export const CATEGORY_KINDS = ['drink', 'food'] as const
export const MENU_TAGS = ['new', 'best', 'signature'] as const
export const BRANCH_KEYS = ['ari', 'thonglor', 'siam', 'chiangmai', 'phuket'] as const
export const BRANCH_STATUSES = ['open', 'closed', 'soon'] as const
export const CHANNELS = ['dine_in', 'takeaway', 'grab', 'lineman', 'line_order'] as const
export const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const
export const PAYMENTS = ['cash', 'promptpay', 'card', 'wallet'] as const
export const TIERS = ['bronze', 'silver', 'gold'] as const
export const STAFF_ROLES = ['manager', 'barista', 'cashier', 'baker'] as const
export const SHIFTS = ['morning', 'afternoon', 'evening'] as const
export const STAFF_STATUSES = ['active', 'on_leave', 'resigned'] as const
export const STOCK_GROUPS = ['beans', 'dairy', 'syrup', 'tea', 'bakery', 'packaging'] as const
export const UNITS = ['kg', 'l', 'pcs', 'pack'] as const
export const PROMO_KINDS = ['percent', 'amount', 'bogo'] as const
export const REVIEW_SOURCES = ['google', 'wongnai', 'line', 'instore'] as const
export const VISIBILITIES = ['shown', 'hidden'] as const

// ── Operators ───────────────────────────────────────────────────────────

export const OperatorRoleSchema = z.enum(['admin', 'editor', 'viewer'])
export type OperatorRole = z.infer<typeof OperatorRoleSchema>

export const OperatorSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  display_name: z.string().min(1),
  role: OperatorRoleSchema,
  avatar_url: z.string().nullable(),
})
export type Operator = z.infer<typeof OperatorSchema>

export const OperatorPreferencesSchema = z.object({
  locale: z.enum(['th', 'en']),
  pinned_nav: z.array(z.string()),
  nav_sort: z.enum(['default', 'asc', 'desc']),
  sidebar_locked: z.boolean(),
})
export type OperatorPreferences = z.infer<typeof OperatorPreferencesSchema>

export const DEFAULT_OPERATOR_PREFERENCES: OperatorPreferences = {
  locale: 'th',
  pinned_nav: [],
  nav_sort: 'default',
  sidebar_locked: false,
}

// ── Menu ────────────────────────────────────────────────────────────────

export const MenuItemSchema = z.object({
  ...RecordBase,
  sku: z.string().min(1),
  name_th: z.string().min(1),
  name_en: z.string().min(1),
  category: z.enum(CATEGORY_KEYS),
  tag: z.enum(MENU_TAGS).nullable(),
  price: money,
  cost: money,
  description_th: z.string().nullable(),
  description_en: z.string().nullable(),
  image_url: z.string().nullable(),
  status: PublishStatusSchema,
  sold_7d: count,
  revenue_7d: money,
  rating: z.number().min(0).max(5),
})
export type MenuItem = z.infer<typeof MenuItemSchema>

export const CategorySchema = z.object({
  ...RecordBase,
  slug: z.enum(CATEGORY_KEYS),
  kind: z.enum(CATEGORY_KINDS),
  order: z.number().int().min(1),
  emoji: z.string().nullable(),
  name_th: z.string().min(1),
  name_en: z.string().min(1),
  item_count: count,
})
export type Category = z.infer<typeof CategorySchema>

// ── Sales ───────────────────────────────────────────────────────────────

export const OrderSchema = z.object({
  ...RecordBase,
  code: z.string().min(1),
  branch: z.enum(BRANCH_KEYS),
  channel: z.enum(CHANNELS),
  status: z.enum(ORDER_STATUSES),
  customer_name: z.string().nullable(),
  phone: z.string().nullable(),
  note: z.string().nullable(),
  items: z.number().int().min(1),
  subtotal: money,
  discount: money,
  total: money,
  payment: z.enum(PAYMENTS),
  ordered_at: z.iso.datetime(),
})
export type Order = z.infer<typeof OrderSchema>

export const PromotionSchema = z.object({
  ...RecordBase,
  code: z.string().min(1),
  title_th: z.string().min(1),
  title_en: z.string().nullable(),
  kind: z.enum(PROMO_KINDS),
  value: money,
  min_spend: money,
  starts_on: isoDate,
  ends_on: isoDate,
  usage_limit: count.nullable(),
  used_count: count,
  status: PublishStatusSchema,
})
export type Promotion = z.infer<typeof PromotionSchema>

// ── People ──────────────────────────────────────────────────────────────

export const MemberSchema = z.object({
  ...RecordBase,
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.email().nullable(),
  avatar_url: z.string().nullable(),
  tier: z.enum(TIERS),
  points: count,
  visits: count,
  total_spent: money,
  favorite_menu: z.string().nullable(),
  birthday: isoDate.nullable(),
  joined_on: isoDate,
  last_visit_at: z.iso.datetime().nullable(),
})
export type Member = z.infer<typeof MemberSchema>

export const StaffSchema = z.object({
  ...RecordBase,
  name: z.string().min(1),
  nickname: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: z.enum(STAFF_ROLES),
  branch: z.enum(BRANCH_KEYS),
  phone: z.string().nullable(),
  shift: z.enum(SHIFTS),
  hourly_rate: money,
  started_on: isoDate,
  status: z.enum(STAFF_STATUSES),
  hours_this_month: count,
})
export type Staff = z.infer<typeof StaffSchema>

export const ReviewSchema = z.object({
  ...RecordBase,
  name: z.string().min(1),
  branch: z.enum(BRANCH_KEYS),
  rating: z.number().int().min(1).max(5),
  source: z.enum(REVIEW_SOURCES),
  body: z.string().min(1),
  reply: z.string().nullable(),
  visibility: z.enum(VISIBILITIES),
  reviewed_on: isoDate,
})
export type Review = z.infer<typeof ReviewSchema>

// ── Operations ──────────────────────────────────────────────────────────

export const BranchSchema = z.object({
  ...RecordBase,
  slug: z.enum(BRANCH_KEYS),
  name_th: z.string().min(1),
  name_en: z.string().min(1),
  district: z.string().min(1),
  phone: z.string().nullable(),
  opens_at: z.string().min(1),
  closes_at: z.string().min(1),
  seats: count,
  manager: z.string().nullable(),
  status: z.enum(BRANCH_STATUSES),
  staff_count: count,
  today_orders: count,
  today_revenue: money,
  rating: z.number().min(0).max(5),
})
export type Branch = z.infer<typeof BranchSchema>

export const StockItemSchema = z.object({
  ...RecordBase,
  sku: z.string().min(1),
  name_th: z.string().min(1),
  name_en: z.string().nullable(),
  group: z.enum(STOCK_GROUPS),
  unit: z.enum(UNITS),
  branch: z.enum(BRANCH_KEYS),
  stock: z.number().min(0),
  reorder_level: z.number().min(0),
  cost_per_unit: money,
  supplier: z.string().nullable(),
  last_restock_on: isoDate.nullable(),
})
export type StockItem = z.infer<typeof StockItemSchema>

/** One day of the café, for /analytics (read only, no page of its own). */
export const DailyStatSchema = z.object({
  ...RecordBase,
  date: isoDate,
  revenue: money,
  orders: count,
  customers: count,
  new_members: count,
  dine_in: count,
  takeaway: count,
  delivery: count,
  cups_hot: count,
  cups_iced: count,
  cups_blended: count,
  bakery_items: count,
  promo_discount: money,
  waste_cost: money,
})
export type DailyStat = z.infer<typeof DailyStatSchema>
