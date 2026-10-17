import type { Component } from 'vue'

/** A link component (NuxtLink, RouterLink) or plain 'a'. It receives `href`. */
export type LinkComponent = Component | string

export type NavSort = 'default' | 'asc' | 'desc'

export interface NavEntry {
  key: string
  label: string
  /** §3.2: every menu item has an icon. */
  icon: Component
  href: string
  /** Count shown at the end, e.g. drafts. */
  badge?: number
  /** Extra search words. §9: include both languages, so search works whatever the UI locale. */
  keywords?: string[]
}

export interface BreadcrumbItem {
  label?: string
  href?: string
  /** Shows a skeleton while the record's display name loads. */
  loading?: boolean
}

export type SectionStatus = 'dirty' | 'error' | undefined

export interface SectionNavItem {
  /** Also the id of the section element it scrolls to. */
  key: string
  label: string
  icon: Component
  status?: SectionStatus
}

export interface TabItem {
  key: string
  label: string
  status?: SectionStatus
}

export interface UserMenuOperator {
  display_name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
  avatar_url: string | null
}
