import { Receipt, UserRound, Wallet } from '@lucide/vue'
import { BRANCH_KEYS, CHANNELS, ORDER_STATUSES, PAYMENTS } from '~/lib/types'
import type { Order } from '~/lib/types'
import { defineEntity } from '../types'

const DELIVERY = ['grab', 'lineman']

// Every bill from the POS and the delivery apps (last 14 days in the mock).
export default defineEntity<Order>({
  key: 'orders',
  icon: Receipt,
  displayField: 'code',
  keywords: ['ออเดอร์', 'คำสั่งซื้อ', 'บิล', 'ยอดขาย', 'orders', 'sales', 'bills', 'pos'],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'inProgress', filter: { status: ['pending', 'preparing', 'ready'] } },
      { key: 'completed', filter: { status: 'completed' } },
      { key: 'cancelled', filter: { status: 'cancelled' } },
      { key: 'delivery', filter: (r) => DELIVERY.includes(r.channel) },
    ],
    columns: [
      { key: 'code', filter: 'values', primary: true, mono: true },
      { key: 'ordered_at', filter: 'dateRange', format: 'date' },
      { key: 'branch', filter: 'values', format: 'enum', enumI18n: 'branch' },
      { key: 'channel', filter: 'values', format: 'enum', enumI18n: 'channel' },
      { key: 'customer_name' },
      { key: 'items', filter: 'numberRange', format: 'number' },
      { key: 'total', filter: 'numberRange', format: 'number' },
      { key: 'payment', filter: 'values', format: 'enum', enumI18n: 'payment' },
      { key: 'status', filter: 'values', format: 'enum', enumI18n: 'orderStatus' },
    ],
    searchFields: ['code', 'customer_name', 'phone'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'order',
        icon: Receipt,
        fields: [
          { key: 'code', type: 'text', required: true, unique: true, rules: { maxLength: 16 } },
          {
            key: 'status',
            type: 'enum',
            required: true,
            options: ORDER_STATUSES,
            optionsI18n: 'orderStatus',
          },
          {
            key: 'branch',
            type: 'enum',
            required: true,
            options: BRANCH_KEYS,
            optionsI18n: 'branch',
          },
          {
            key: 'channel',
            type: 'enum',
            required: true,
            options: CHANNELS,
            optionsI18n: 'channel',
          },
        ],
      },
      {
        key: 'customer',
        icon: UserRound,
        fields: [
          { key: 'customer_name', type: 'text', rules: { maxLength: 60 } },
          { key: 'phone', type: 'phoneTH' },
          { key: 'note', type: 'text', span: 2, multiline: true, rules: { maxLength: 200 } },
        ],
      },
      {
        key: 'payment',
        icon: Wallet,
        fields: [
          {
            key: 'items',
            type: 'number',
            required: true,
            rules: { integer: true, min: 1, max: 99 },
          },
          {
            key: 'payment',
            type: 'enum',
            required: true,
            options: PAYMENTS,
            optionsI18n: 'payment',
          },
          { key: 'subtotal', type: 'number', required: true, rules: { min: 0, max: 100000 } },
          { key: 'discount', type: 'number', required: true, rules: { min: 0, max: 100000 } },
          { key: 'total', type: 'number', required: true, rules: { min: 0, max: 100000 } },
        ],
      },
    ],
  },
})
