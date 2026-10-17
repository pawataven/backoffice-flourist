import { Info, Languages, LayoutGrid } from '@lucide/vue'
import { CATEGORY_KEYS, CATEGORY_KINDS } from '~/lib/types'
import type { Category } from '~/lib/types'
import { defineEntity } from '../types'

// Menu groups, in the order the POS and the delivery apps show them. Menu items point at the
// slug, so it is chosen from a fixed list.
export default defineEntity<Category>({
  key: 'categories',
  icon: LayoutGrid,
  displayField: 'name_th',
  keywords: ['หมวด', 'หมวดเมนู', 'ประเภท', 'categories', 'category', 'groups'],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'drink', filter: { kind: 'drink' } },
      { key: 'food', filter: { kind: 'food' } },
      { key: 'empty', filter: { item_count: 0 } },
      { key: 'noEmoji', filter: (r) => !r.emoji },
    ],
    columns: [
      { key: 'order', format: 'number' },
      { key: 'emoji' },
      { key: 'name_th', filter: 'values', primary: true },
      { key: 'name_en' },
      { key: 'slug', mono: true },
      { key: 'kind', filter: 'values', format: 'enum', enumI18n: 'categoryKind' },
      { key: 'item_count', filter: 'numberRange', format: 'number' },
    ],
    searchFields: ['name_th', 'name_en', 'slug'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'info',
        icon: Info,
        fields: [
          {
            key: 'slug',
            type: 'enum',
            required: true,
            options: CATEGORY_KEYS,
            optionsI18n: 'category',
          },
          {
            key: 'kind',
            type: 'enum',
            required: true,
            options: CATEGORY_KINDS,
            optionsI18n: 'categoryKind',
          },
          {
            key: 'order',
            type: 'number',
            required: true,
            rules: { integer: true, min: 1, max: 99 },
          },
          { key: 'emoji', type: 'text', rules: { maxLength: 8 } },
        ],
      },
      {
        key: 'content',
        icon: Languages,
        fields: [
          { key: 'name_th', type: 'text', required: true, rules: { maxLength: 40 } },
          { key: 'name_en', type: 'text', required: true, rules: { maxLength: 40 } },
        ],
      },
    ],
  },
})
