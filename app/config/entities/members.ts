import { Award, UserRound, Users } from '@lucide/vue'
import { TIERS } from '~/lib/types'
import type { Member } from '~/lib/types'
import { defineEntity } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000
const thisMonth = () => String(new Date().getMonth() + 1).padStart(2, '0')

// Loyalty members (LINE OA / phone number at the counter). A person, so the detail page starts
// with the profile card. Tier follows total spend (Settings → Loyalty).
export default defineEntity<Member>({
  key: 'members',
  icon: Users,
  displayField: 'name',
  imageField: 'avatar_url',
  profile: true,
  keywords: ['สมาชิก', 'ลูกค้า', 'แต้ม', 'สะสมแต้ม', 'members', 'customers', 'loyalty', 'points'],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'gold', filter: { tier: 'gold' } },
      { key: 'silver', filter: { tier: 'silver' } },
      { key: 'newMembers', filter: (r) => Date.now() - Date.parse(r.joined_on) < 30 * DAY_MS },
      { key: 'birthday', filter: (r) => r.birthday?.slice(5, 7) === thisMonth() },
    ],
    columns: [
      { key: 'avatar_url', format: 'image' },
      { key: 'name', filter: 'values', primary: true },
      { key: 'phone', mono: true },
      { key: 'tier', filter: 'values', format: 'enum', enumI18n: 'tier' },
      { key: 'points', filter: 'numberRange', format: 'number' },
      { key: 'visits', filter: 'numberRange', format: 'number' },
      { key: 'total_spent', filter: 'numberRange', format: 'number' },
      { key: 'favorite_menu', filter: 'values' },
      { key: 'last_visit_at', filter: 'dateRange', format: 'date' },
    ],
    searchFields: ['name', 'phone', 'email'],
    bulkActions: [],
  },
  detail: {
    sections: [
      {
        key: 'profile',
        icon: UserRound,
        fields: [
          { key: 'avatar_url', type: 'image', round: true, span: 2 },
          { key: 'name', type: 'personName', required: true },
          { key: 'phone', type: 'phoneTH', required: true, unique: true },
          { key: 'email', type: 'email' },
          { key: 'birthday', type: 'date' },
        ],
      },
      {
        key: 'loyalty',
        icon: Award,
        fields: [
          { key: 'tier', type: 'enum', required: true, options: TIERS, optionsI18n: 'tier' },
          {
            key: 'points',
            type: 'number',
            required: true,
            rules: { integer: true, min: 0, max: 999999 },
          },
          {
            key: 'visits',
            type: 'number',
            required: true,
            rules: { integer: true, min: 0, max: 99999 },
          },
          {
            key: 'total_spent',
            type: 'number',
            required: true,
            rules: { min: 0, max: 9999999 },
          },
          { key: 'favorite_menu', type: 'text', rules: { maxLength: 60 } },
          { key: 'joined_on', type: 'date', required: true },
        ],
      },
    ],
  },
})
