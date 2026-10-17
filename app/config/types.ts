import type { Component } from 'vue'
import type { ColumnFilterKind, FieldRules, FieldType } from '~/lib/core'
import type { EntityRecord } from '~/lib/api'

// Everything a list / detail page needs comes from one of these configs (§11.3):
// a new entity is a new config file, never a new page or component.
// Labels are i18n keys derived from the entity key, e.g. entities.words.fields.word.

/** `image`: a picture (URL, path or data URL), edited with AvatarUpload. */
export type FormFieldType = FieldType | 'enum' | 'image'

export interface FieldDef {
  key: string
  type: FormFieldType
  required?: boolean
  /** FormGrid columns: 2 = full width. */
  span?: 1 | 2
  rules?: Omit<FieldRules, 'required'>
  /** `enum`: allowed values. Labels come from `${optionsI18n}.${value}` when set. */
  options?: readonly string[]
  optionsI18n?: string
  multiline?: boolean
  /** `image`: round, like a profile picture. */
  round?: boolean
  /** Checked against the other records while typing (§6.5). */
  unique?: boolean
}

export interface SectionDef {
  key: string
  icon: Component
  fields: FieldDef[]
}

export interface TabDef {
  key: string
  sections: SectionDef[]
}

/** `image`: the value is a picture URL, shown as its own small round column. */
export type ColumnFormat = 'text' | 'date' | 'number' | 'status' | 'enum' | 'image'

export interface ColumnDef {
  key: string
  filter?: ColumnFilterKind
  format?: ColumnFormat
  /** `enum` columns: i18n prefix for values. */
  enumI18n?: string
  mono?: boolean
  /** Links to the detail page. */
  primary?: boolean
}

export interface StatCardDef<T = Record<string, unknown>> {
  key: string
  /**
   * Rows this card shows; omit for "all". Field → value (array = any of these values), or a
   * predicate for what values cannot say (ranges, "has a value", …).
   */
  filter?: Partial<Record<keyof T & string, unknown>> | ((row: T) => boolean)
}

export type BulkAction = 'publish' | 'unpublish' | 'delete'

export interface EntityConfig<T extends EntityRecord = EntityRecord> {
  key: string
  icon: Component
  /** Shown in the breadcrumb and the page title instead of the uuid (§4.4). */
  displayField: keyof T & string
  imageField?: keyof T & string
  /** A person: detail starts with a ProfileCard and the picture is round. */
  profile?: boolean
  /** View only for every role: no New, Edit or Delete (values that still live in the app code). */
  readonly?: boolean
  /** §9: search words in both languages. */
  keywords: string[]
  list: {
    /** Always 5 cards, the same on every page (design); the first one is "all" (§2). */
    statCards: [StatCardDef<T>, StatCardDef<T>, StatCardDef<T>, StatCardDef<T>, StatCardDef<T>]
    columns: ColumnDef[]
    searchFields: Array<keyof T & string>
    /** Empty = no row checkboxes at all. */
    bulkActions: BulkAction[]
    /** Sidebar badge, e.g. number of drafts. */
    badge?: (rows: T[]) => number
  }
  detail: {
    /** ≤ 4 sections (§3.5); more → use tabs instead. */
    sections: SectionDef[]
  }
}

export function defineEntity<T extends EntityRecord>(config: EntityConfig<T>): EntityConfig<T> {
  return config
}

export interface SettingsCategoryConfig {
  key: string
  icon: Component
  group: string
  /** Key in the settings repo. */
  settingKey: string
  tabs: TabDef[]
}
