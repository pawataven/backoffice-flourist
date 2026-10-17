import { CalendarRange, Info, Languages, TicketPercent } from '@lucide/vue'
import { PROMO_KINDS } from '~/lib/types'
import type { Promotion } from '~/lib/types'
import { defineEntity } from '../types'

const today = () => new Date().toISOString().slice(0, 10)

// Discount codes for the POS and LINE OA. `running` = published and inside its dates today.
export default defineEntity<Promotion>({
  key: 'promotions',
  icon: TicketPercent,
  displayField: 'code',
  keywords: ['โปรโมชัน', 'โปร', 'ส่วนลด', 'คูปอง', 'promotions', 'promo', 'discount', 'coupon'],
  list: {
    statCards: [
      { key: 'all' },
      {
        key: 'running',
        filter: (r) => r.status === 'published' && r.starts_on <= today() && r.ends_on >= today(),
      },
      { key: 'upcoming', filter: (r) => r.starts_on > today() },
      { key: 'expired', filter: (r) => r.ends_on < today() },
      { key: 'draft', filter: { status: 'draft' } },
    ],
    columns: [
      { key: 'code', filter: 'values', primary: true, mono: true },
      { key: 'title_th' },
      { key: 'kind', filter: 'values', format: 'enum', enumI18n: 'promoKind' },
      { key: 'value', format: 'number' },
      { key: 'min_spend', filter: 'numberRange', format: 'number' },
      { key: 'starts_on', filter: 'dateRange', format: 'date' },
      { key: 'ends_on', filter: 'dateRange', format: 'date' },
      { key: 'used_count', filter: 'numberRange', format: 'number' },
      { key: 'status', filter: 'values', format: 'status' },
    ],
    searchFields: ['code', 'title_th', 'title_en'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'info',
        icon: Info,
        fields: [
          { key: 'code', type: 'text', required: true, unique: true, rules: { maxLength: 20 } },
          {
            key: 'status',
            type: 'enum',
            required: true,
            options: ['draft', 'published'],
            optionsI18n: 'status',
          },
          {
            key: 'kind',
            type: 'enum',
            required: true,
            options: PROMO_KINDS,
            optionsI18n: 'promoKind',
          },
          { key: 'value', type: 'number', required: true, rules: { min: 0, max: 10000 } },
          { key: 'min_spend', type: 'number', required: true, rules: { min: 0, max: 100000 } },
        ],
      },
      {
        key: 'content',
        icon: Languages,
        fields: [
          { key: 'title_th', type: 'text', required: true, span: 2, rules: { maxLength: 80 } },
          { key: 'title_en', type: 'text', span: 2, rules: { maxLength: 80 } },
        ],
      },
      {
        key: 'period',
        icon: CalendarRange,
        fields: [
          { key: 'starts_on', type: 'date', required: true },
          { key: 'ends_on', type: 'date', required: true },
          {
            key: 'usage_limit',
            type: 'number',
            rules: { integer: true, min: 1, max: 100000 },
          },
        ],
      },
    ],
  },
})
