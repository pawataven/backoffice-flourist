<script setup lang="ts">
import { AppShell, Breadcrumb, Sidebar, UserMenu } from '~/ui'
import type { NavEntry, NavSort } from '~/ui'
import { ChartNoAxesCombined, LayoutDashboard, Settings } from '@lucide/vue'
import { NuxtLink } from '#components'
import { entities } from '~/config/entities'

// §3.1 App shell: Sidebar + Topbar (Breadcrumb | UserMenu) + page.
const { t, locale, setLocale } = useI18n()
const route = useRoute()
const auth = useAuthStore()
const prefsStore = usePrefsStore()
const prefs = computed(() => prefsStore.prefs)
const can = useCan()
const crumbs = useBreadcrumb()
const { badges, refresh } = useNavBadges()
const config = useRuntimeConfig().public
const drawerOpen = ref(false)

onMounted(refresh)

// Operator's language comes from their preferences (§9).
watch(
  () => prefs.value.locale,
  (l) => l !== locale.value && setLocale(l),
  { immediate: true },
)

const entries = computed<NavEntry[]>(() => [
  {
    key: 'dashboard',
    label: t('nav.dashboard'),
    icon: LayoutDashboard,
    href: '/',
    keywords: ['ภาพรวม', 'แดชบอร์ด', 'dashboard', 'overview', 'home'],
  },
  {
    key: 'analytics',
    label: t('nav.analytics'),
    icon: ChartNoAxesCombined,
    href: '/analytics',
    keywords: ['วิเคราะห์', 'สถิติ', 'แนวโน้ม', 'analytics', 'stats', 'trends', 'economy'],
  },
  ...entities
    .filter((e) => can('read', e.key))
    .map((e) => ({
      key: e.key,
      label: t(`nav.${e.key}`),
      icon: e.icon,
      href: `/${e.key}`,
      badge: badges.value[e.key] || undefined,
      keywords: e.keywords,
    })),
])
// §4.5: other roles do not even see the Settings item.
const settingsEntry = computed<NavEntry | undefined>(() =>
  can('read', 'settings')
    ? {
        key: 'settings',
        label: t('nav.settings'),
        icon: Settings,
        href: '/settings',
        keywords: ['ตั้งค่า', 'การตั้งค่า', 'settings', 'setting', 'config'],
      }
    : undefined,
)
const activeKey = computed(() => route.path.split('/')[1] || 'dashboard')

const pinned = computed({
  get: () => prefs.value.pinned_nav,
  set: (v: string[]) => prefsStore.update({ pinned_nav: v }),
})
const sort = computed({
  get: () => prefs.value.nav_sort,
  set: (v: NavSort) => prefsStore.update({ nav_sort: v }),
})
const userLocale = computed({
  get: () => prefs.value.locale,
  set: (v: 'th' | 'en') => prefsStore.update({ locale: v }),
})

async function logout() {
  await auth.signOut()
  prefsStore.reset()
  await navigateTo('/login')
}
</script>

<template>
  <AppShell @open-drawer="drawerOpen = true">
    <template #sidebar>
      <Sidebar
        v-model:pinned="pinned"
        v-model:sort="sort"
        v-model:drawer-open="drawerOpen"
        :entries="entries"
        :settings="settingsEntry"
        :active-key="activeKey"
        :locale="locale"
        subtitle="Back Office"
        :version="String(config.appVersion)"
        :link-component="NuxtLink"
        @navigate="(e) => navigateTo(e.href)"
      />
    </template>
    <template #topbar>
      <Breadcrumb :items="crumbs" :link-component="NuxtLink" />
    </template>
    <template #topbar-end>
      <UserMenu
        v-if="auth.operator"
        v-model:locale="userLocale"
        :operator="auth.operator"
        @logout="logout"
      />
    </template>
    <slot />
  </AppShell>
</template>
