import {
  Award,
  Cake,
  Coins,
  Gift,
  Percent,
  ReceiptText,
  Store,
  TicketCheck,
  Wifi,
} from '@lucide/vue'
import type { SettingsCategoryConfig } from './types'

// Shop-wide settings, admin only. A category with more than 4 sections uses tabs, edited one tab
// at a time.
export const settingsCategories: SettingsCategoryConfig[] = [
  {
    key: 'store',
    icon: Store,
    group: 'platform',
    settingKey: 'store',
    tabs: [
      {
        key: 'general',
        sections: [
          {
            key: 'business',
            icon: Store,
            fields: [
              { key: 'store_name', type: 'text', required: true, rules: { maxLength: 60 } },
              { key: 'tax_id', type: 'text', required: true, rules: { maxLength: 13 } },
              { key: 'phone', type: 'phoneTH', required: true },
              { key: 'email', type: 'email', required: true },
            ],
          },
          {
            key: 'tax',
            icon: Percent,
            fields: [
              { key: 'vat_percent', type: 'number', required: true, rules: { min: 0, max: 30 } },
              {
                key: 'service_charge_percent',
                type: 'number',
                required: true,
                rules: { min: 0, max: 30 },
              },
            ],
          },
        ],
      },
      {
        key: 'receipt',
        sections: [
          {
            key: 'receipt',
            icon: ReceiptText,
            fields: [
              { key: 'receipt_header', type: 'text', span: 2, rules: { maxLength: 80 } },
              {
                key: 'receipt_footer',
                type: 'text',
                span: 2,
                multiline: true,
                rules: { maxLength: 200 },
              },
            ],
          },
          {
            key: 'wifi',
            icon: Wifi,
            fields: [{ key: 'wifi_password', type: 'text', rules: { maxLength: 40 } }],
          },
        ],
      },
    ],
  },
  {
    key: 'loyalty',
    icon: Award,
    group: 'platform',
    settingKey: 'loyalty',
    tabs: [
      {
        key: 'points',
        sections: [
          {
            key: 'earn',
            icon: Coins,
            fields: [
              {
                key: 'baht_per_point',
                type: 'number',
                required: true,
                rules: { integer: true, min: 1, max: 1000 },
              },
              {
                key: 'point_expiry_months',
                type: 'number',
                required: true,
                rules: { integer: true, min: 1, max: 60 },
              },
            ],
          },
          {
            key: 'redeem',
            icon: Gift,
            fields: [
              {
                key: 'points_per_reward',
                type: 'number',
                required: true,
                rules: { integer: true, min: 1, max: 10000 },
              },
              {
                key: 'reward_value_baht',
                type: 'number',
                required: true,
                rules: { min: 0, max: 1000 },
              },
            ],
          },
        ],
      },
      {
        key: 'tiers',
        sections: [
          {
            key: 'thresholds',
            icon: TicketCheck,
            fields: [
              {
                key: 'silver_min_spend',
                type: 'number',
                required: true,
                rules: { min: 0, max: 1000000 },
              },
              {
                key: 'gold_min_spend',
                type: 'number',
                required: true,
                rules: { min: 0, max: 1000000 },
              },
            ],
          },
          {
            key: 'perks',
            icon: Cake,
            fields: [
              {
                key: 'birthday_points',
                type: 'number',
                required: true,
                rules: { integer: true, min: 0, max: 10000 },
              },
            ],
          },
        ],
      },
    ],
  },
]

export function findSettingsCategory(key: string): SettingsCategoryConfig | undefined {
  return settingsCategories.find((c) => c.key === key)
}
