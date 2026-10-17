import { BriefcaseBusiness, UserRound, UsersRound } from '@lucide/vue'
import { BRANCH_KEYS, SHIFTS, STAFF_ROLES, STAFF_STATUSES } from '~/lib/types'
import type { Staff } from '~/lib/types'
import { defineEntity } from '../types'

// The team at every branch: role, shift and hourly rate. A person, so the profile card is on top.
export default defineEntity<Staff>({
  key: 'staff',
  icon: UsersRound,
  displayField: 'name',
  imageField: 'avatar_url',
  profile: true,
  keywords: ['พนักงาน', 'บาริสต้า', 'กะ', 'ค่าแรง', 'staff', 'team', 'barista', 'shift'],
  list: {
    statCards: [
      { key: 'all' },
      { key: 'barista', filter: { role: 'barista' } },
      { key: 'manager', filter: { role: 'manager' } },
      { key: 'onLeave', filter: { status: 'on_leave' } },
      { key: 'morning', filter: { shift: 'morning', status: 'active' } },
    ],
    columns: [
      { key: 'avatar_url', format: 'image' },
      { key: 'name', filter: 'values', primary: true },
      { key: 'nickname' },
      { key: 'role', filter: 'values', format: 'enum', enumI18n: 'staffRole' },
      { key: 'branch', filter: 'values', format: 'enum', enumI18n: 'branch' },
      { key: 'shift', filter: 'values', format: 'enum', enumI18n: 'shift' },
      { key: 'hourly_rate', filter: 'numberRange', format: 'number' },
      { key: 'started_on', filter: 'dateRange', format: 'date' },
      { key: 'status', filter: 'values', format: 'enum', enumI18n: 'staffStatus' },
    ],
    searchFields: ['name', 'nickname', 'phone'],
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
          { key: 'nickname', type: 'text', rules: { maxLength: 20 } },
          { key: 'phone', type: 'phoneTH' },
          { key: 'started_on', type: 'date', required: true },
        ],
      },
      {
        key: 'work',
        icon: BriefcaseBusiness,
        fields: [
          {
            key: 'role',
            type: 'enum',
            required: true,
            options: STAFF_ROLES,
            optionsI18n: 'staffRole',
          },
          {
            key: 'branch',
            type: 'enum',
            required: true,
            options: BRANCH_KEYS,
            optionsI18n: 'branch',
          },
          { key: 'shift', type: 'enum', required: true, options: SHIFTS, optionsI18n: 'shift' },
          {
            key: 'status',
            type: 'enum',
            required: true,
            options: STAFF_STATUSES,
            optionsI18n: 'staffStatus',
          },
          { key: 'hourly_rate', type: 'number', required: true, rules: { min: 0, max: 1000 } },
        ],
      },
    ],
  },
})
