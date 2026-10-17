import { Clock, Info, Store } from '@lucide/vue'
import { BRANCH_KEYS, BRANCH_STATUSES } from '~/lib/types'
import type { Branch } from '~/lib/types'
import { defineEntity } from '../types'

// Shops. Today's orders / revenue and the staff count come from the other tables (read only).
export default defineEntity<Branch>({
  key: 'branches',
  icon: Store,
  displayField: 'name_th',
  keywords: ['สาขา', 'ร้าน', 'เวลาเปิด', 'branches', 'branch', 'stores', 'shops', 'locations'],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'open', filter: { status: 'open' } },
      { key: 'closed', filter: { status: 'closed' } },
      { key: 'soon', filter: { status: 'soon' } },
      { key: 'large', filter: (r) => r.seats >= 50 },
    ],
    columns: [
      { key: 'name_th', filter: 'values', primary: true },
      { key: 'district', filter: 'values' },
      { key: 'manager' },
      { key: 'opens_at', mono: true },
      { key: 'closes_at', mono: true },
      { key: 'seats', filter: 'numberRange', format: 'number' },
      { key: 'today_orders', format: 'number' },
      { key: 'today_revenue', format: 'number' },
      { key: 'status', filter: 'values', format: 'enum', enumI18n: 'branchStatus' },
    ],
    searchFields: ['name_th', 'name_en', 'district', 'manager'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'info',
        icon: Info,
        fields: [
          { key: 'name_th', type: 'text', required: true, rules: { maxLength: 60 } },
          { key: 'name_en', type: 'text', required: true, rules: { maxLength: 60 } },
          {
            key: 'slug',
            type: 'enum',
            required: true,
            options: BRANCH_KEYS,
            optionsI18n: 'branch',
          },
          {
            key: 'status',
            type: 'enum',
            required: true,
            options: BRANCH_STATUSES,
            optionsI18n: 'branchStatus',
          },
          { key: 'district', type: 'text', required: true, rules: { maxLength: 60 } },
          { key: 'phone', type: 'phoneTH' },
          { key: 'manager', type: 'personName' },
        ],
      },
      {
        key: 'hours',
        icon: Clock,
        fields: [
          { key: 'opens_at', type: 'text', required: true, rules: { maxLength: 5 } },
          { key: 'closes_at', type: 'text', required: true, rules: { maxLength: 5 } },
          {
            key: 'seats',
            type: 'number',
            required: true,
            rules: { integer: true, min: 0, max: 500 },
          },
        ],
      },
    ],
  },
})
