import type { BreadcrumbItem } from '~/ui'

/** Pages set their trail; the layout's Topbar renders it. */
export function useBreadcrumb() {
  return useState<BreadcrumbItem[]>('breadcrumb', () => [])
}

export function setBreadcrumb(items: BreadcrumbItem[] | (() => BreadcrumbItem[])) {
  const crumbs = useBreadcrumb()
  if (typeof items === 'function') watchEffect(() => (crumbs.value = items()))
  else crumbs.value = items
}
