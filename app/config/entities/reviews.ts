import { Eye, MessageSquareQuote, MessageSquareReply } from '@lucide/vue'
import { BRANCH_KEYS, REVIEW_SOURCES, VISIBILITIES } from '~/lib/types'
import type { Review } from '~/lib/types'
import { defineEntity } from '../types'

// Reviews from Google, Wongnai, LINE and the in-store QR. Shown ones appear on the website.
export default defineEntity<Review>({
  key: 'reviews',
  icon: MessageSquareQuote,
  displayField: 'name',
  keywords: ['รีวิว', 'ความเห็น', 'คะแนน', 'reviews', 'feedback', 'rating', 'google', 'wongnai'],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'fiveStar', filter: { rating: 5 } },
      { key: 'lowStar', filter: (r) => r.rating <= 3 },
      { key: 'unreplied', filter: (r) => !r.reply },
      { key: 'hidden', filter: { visibility: 'hidden' } },
    ],
    columns: [
      { key: 'name', filter: 'values', primary: true },
      { key: 'rating', filter: 'values', format: 'number' },
      { key: 'body' },
      { key: 'branch', filter: 'values', format: 'enum', enumI18n: 'branch' },
      { key: 'source', filter: 'values', format: 'enum', enumI18n: 'reviewSource' },
      { key: 'reviewed_on', filter: 'dateRange', format: 'date' },
      { key: 'visibility', filter: 'values', format: 'enum', enumI18n: 'visibility' },
    ],
    searchFields: ['name', 'body', 'reply'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'review',
        icon: MessageSquareQuote,
        fields: [
          { key: 'name', type: 'text', required: true, rules: { maxLength: 60 } },
          {
            key: 'rating',
            type: 'number',
            required: true,
            rules: { integer: true, min: 1, max: 5 },
          },
          {
            key: 'branch',
            type: 'enum',
            required: true,
            options: BRANCH_KEYS,
            optionsI18n: 'branch',
          },
          {
            key: 'source',
            type: 'enum',
            required: true,
            options: REVIEW_SOURCES,
            optionsI18n: 'reviewSource',
          },
          { key: 'reviewed_on', type: 'date', required: true },
          {
            key: 'body',
            type: 'text',
            required: true,
            span: 2,
            multiline: true,
            rules: { maxLength: 600 },
          },
        ],
      },
      {
        key: 'reply',
        icon: MessageSquareReply,
        fields: [
          { key: 'reply', type: 'text', span: 2, multiline: true, rules: { maxLength: 600 } },
        ],
      },
      {
        key: 'display',
        icon: Eye,
        fields: [
          {
            key: 'visibility',
            type: 'enum',
            required: true,
            options: VISIBILITIES,
            optionsI18n: 'visibility',
          },
        ],
      },
    ],
  },
})
