// UI components (ported from pheuan-ui, Back Office design spec §2).
// Pages import them from '~/ui'; the tokens and base CSS live in assets/css.

// Basics
export { default as Button } from './components/Button.vue'
export type { ButtonVariant } from './components/Button.vue'
export { default as Card } from './components/Card.vue'
export { default as Checkbox } from './components/Checkbox.vue'
export { default as ConfirmDialog } from './components/ConfirmDialog.vue'
export { default as EmptyState } from './components/EmptyState.vue'
export { default as Skeleton } from './components/Skeleton.vue'
export { default as TextField } from './components/TextField.vue'
export type { TextFieldType } from './components/TextField.vue'
export { default as SelectField } from './components/SelectField.vue'
export type { SelectOption } from './components/SelectField.vue'
export { default as ToastHost } from './components/ToastHost.vue'
export { useToast } from './composables/useToast'
export type { ToastItem, ToastVariant } from './composables/useToast'

// Shell
export { default as AppShell } from './components/AppShell.vue'
export { default as Sidebar } from './components/Sidebar.vue'
export { default as NavSearch } from './components/NavSearch.vue'
export { default as NavItem } from './components/NavItem.vue'
export { default as SortMenu } from './components/SortMenu.vue'
export { default as Breadcrumb } from './components/Breadcrumb.vue'
export { default as UserMenu } from './components/UserMenu.vue'

// List
export { default as StatCard } from './components/StatCard.vue'
export { default as SearchInput } from './components/SearchInput.vue'
export { default as DataTable } from './components/DataTable.vue'
export type { DataColumn } from './components/DataTable.vue'
export { default as ColumnFilterMenu } from './components/ColumnFilterMenu.vue'
export { default as FilterChips } from './components/FilterChips.vue'
export { default as BulkActionBar } from './components/BulkActionBar.vue'
export { default as Pagination } from './components/Pagination.vue'

// Detail
export { default as FormActions } from './components/FormActions.vue'
export { default as ProfileCard } from './components/ProfileCard.vue'
export { default as RelatedCard } from './components/RelatedCard.vue'
export { default as SectionNav } from './components/SectionNav.vue'
export { default as EditableSection } from './components/EditableSection.vue'
export { default as FormGrid } from './components/FormGrid.vue'
export { default as Tabs } from './components/Tabs.vue'
export { default as AvatarUpload } from './components/AvatarUpload.vue'

// Settings
export { default as SettingCard } from './components/SettingCard.vue'
export { default as SettingsGrid } from './components/SettingsGrid.vue'
export type { SettingsGroup } from './components/SettingsGrid.vue'

// Brand
export { default as Mascot } from './components/Mascot.vue'
export { default as BrandBadge } from './components/BrandBadge.vue'
export { default as FloatingLogo } from './components/FloatingLogo.vue'

export { ICON_STROKE } from './icons'
export type {
  BreadcrumbItem,
  LinkComponent,
  NavEntry,
  NavSort,
  SectionNavItem,
  SectionStatus,
  TabItem,
  UserMenuOperator,
} from './types'
