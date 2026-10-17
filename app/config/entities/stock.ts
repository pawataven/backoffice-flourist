import { Boxes, Info, Package, Truck } from '@lucide/vue'
import { BRANCH_KEYS, STOCK_GROUPS, UNITS } from '~/lib/types'
import type { StockItem } from '~/lib/types'
import { defineEntity } from '../types'

const isLow = (r: StockItem) => r.stock > 0 && r.stock <= r.reorder_level

// Ingredients and packaging per branch. At or under the reorder level = time to order.
export default defineEntity<StockItem>({
  key: 'stock',
  icon: Boxes,
  displayField: 'name_th',
  keywords: [
    'สต็อก',
    'วัตถุดิบ',
    'คลัง',
    'สั่งของ',
    'stock',
    'inventory',
    'ingredients',
    'supplies',
  ],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'low', filter: isLow },
      { key: 'out', filter: { stock: 0 } },
      { key: 'beans', filter: { group: 'beans' } },
      { key: 'dairy', filter: { group: 'dairy' } },
    ],
    columns: [
      { key: 'name_th', filter: 'values', primary: true },
      { key: 'sku', mono: true },
      { key: 'group', filter: 'values', format: 'enum', enumI18n: 'stockGroup' },
      { key: 'branch', filter: 'values', format: 'enum', enumI18n: 'branch' },
      { key: 'stock', filter: 'numberRange', format: 'number' },
      { key: 'reorder_level', format: 'number' },
      { key: 'unit', filter: 'values', format: 'enum', enumI18n: 'unit' },
      { key: 'supplier', filter: 'values' },
      { key: 'last_restock_on', filter: 'dateRange', format: 'date' },
    ],
    searchFields: ['name_th', 'name_en', 'sku', 'supplier'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'info',
        icon: Info,
        fields: [
          { key: 'name_th', type: 'text', required: true, rules: { maxLength: 60 } },
          { key: 'name_en', type: 'text', rules: { maxLength: 60 } },
          { key: 'sku', type: 'text', required: true, unique: true, rules: { maxLength: 16 } },
          {
            key: 'group',
            type: 'enum',
            required: true,
            options: STOCK_GROUPS,
            optionsI18n: 'stockGroup',
          },
          {
            key: 'branch',
            type: 'enum',
            required: true,
            options: BRANCH_KEYS,
            optionsI18n: 'branch',
          },
        ],
      },
      {
        key: 'level',
        icon: Package,
        fields: [
          { key: 'stock', type: 'number', required: true, rules: { min: 0, max: 100000 } },
          { key: 'unit', type: 'enum', required: true, options: UNITS, optionsI18n: 'unit' },
          {
            key: 'reorder_level',
            type: 'number',
            required: true,
            rules: { min: 0, max: 100000 },
          },
          { key: 'last_restock_on', type: 'date' },
        ],
      },
      {
        key: 'supplier',
        icon: Truck,
        fields: [
          { key: 'supplier', type: 'text', rules: { maxLength: 60 } },
          { key: 'cost_per_unit', type: 'number', required: true, rules: { min: 0, max: 100000 } },
        ],
      },
    ],
  },
})
