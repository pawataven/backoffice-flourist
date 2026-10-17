import { BadgeDollarSign, Coffee, Info, Languages } from '@lucide/vue'
import { CATEGORY_KEYS, MENU_TAGS } from '~/lib/types'
import type { MenuItem } from '~/lib/types'
import { defineEntity } from '../types'

// What the café sells. Draft = not on the POS / delivery apps yet; publish puts it on sale.
// `lowMargin`: cost is over 35% of the price, the number the owner watches most.
export default defineEntity<MenuItem>({
  key: 'menu',
  icon: Coffee,
  displayField: 'name_th',
  imageField: 'image_url',
  keywords: ['เมนู', 'เครื่องดื่ม', 'กาแฟ', 'ขนม', 'ราคา', 'menu', 'drinks', 'products', 'price'],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'published', filter: { status: 'published' } },
      { key: 'draft', filter: { status: 'draft' } },
      { key: 'best', filter: { tag: ['best', 'signature'] } },
      { key: 'lowMargin', filter: (r) => r.price > 0 && r.cost / r.price > 0.35 },
    ],
    columns: [
      { key: 'image_url', format: 'image' },
      { key: 'name_th', filter: 'values', primary: true },
      { key: 'sku', mono: true },
      { key: 'category', filter: 'values', format: 'enum', enumI18n: 'category' },
      { key: 'tag', filter: 'values', format: 'enum', enumI18n: 'menuTag' },
      { key: 'price', filter: 'numberRange', format: 'number' },
      { key: 'cost', filter: 'numberRange', format: 'number' },
      { key: 'sold_7d', filter: 'numberRange', format: 'number' },
      { key: 'status', filter: 'values', format: 'status' },
    ],
    searchFields: ['name_th', 'name_en', 'sku'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'info',
        icon: Info,
        fields: [
          { key: 'image_url', type: 'image', span: 2 },
          { key: 'sku', type: 'text', required: true, unique: true, rules: { maxLength: 12 } },
          {
            key: 'category',
            type: 'enum',
            required: true,
            options: CATEGORY_KEYS,
            optionsI18n: 'category',
          },
          { key: 'tag', type: 'enum', options: MENU_TAGS, optionsI18n: 'menuTag' },
          {
            key: 'status',
            type: 'enum',
            required: true,
            options: ['draft', 'published'],
            optionsI18n: 'status',
          },
        ],
      },
      {
        key: 'content',
        icon: Languages,
        fields: [
          { key: 'name_th', type: 'text', required: true, rules: { maxLength: 60 } },
          { key: 'name_en', type: 'text', required: true, rules: { maxLength: 60 } },
          {
            key: 'description_th',
            type: 'text',
            span: 2,
            multiline: true,
            rules: { maxLength: 300 },
          },
          {
            key: 'description_en',
            type: 'text',
            span: 2,
            multiline: true,
            rules: { maxLength: 300 },
          },
        ],
      },
      {
        key: 'pricing',
        icon: BadgeDollarSign,
        fields: [
          { key: 'price', type: 'number', required: true, rules: { min: 0, max: 5000 } },
          { key: 'cost', type: 'number', required: true, rules: { min: 0, max: 5000 } },
        ],
      },
    ],
  },
})
