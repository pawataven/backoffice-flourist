<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, X } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import BrandBadge from './BrandBadge.vue'
import NavItem from './NavItem.vue'
import NavSearch from './NavSearch.vue'
import SortMenu from './SortMenu.vue'
import type { LinkComponent, NavEntry, NavSort } from '../types'

// §3.2 Sidebar.
// - Collapsed (64px) by default; hover expands to 240px as an overlay after 150ms, collapses
//   300ms after the pointer leaves. It stays open while search is focused or keyboard
//   focus is inside (:focus-visible within).
// - `locked` keeps it expanded and the shell reserves 240px instead of overlaying.
// - Touch devices (hover: none): hidden; `drawerOpen` shows it as a drawer.
// - ⌘K / Ctrl K expands and focuses search (no badge in the field: it only crowded the placeholder).
const props = withDefaults(
  defineProps<{
    entries: NavEntry[]
    settings?: NavEntry
    activeKey?: string
    locale: string
    locked?: boolean
    version?: string
    subtitle?: string
    linkComponent?: LinkComponent
  }>(),
  { linkComponent: 'a', locked: false },
)
const emit = defineEmits<{ navigate: [entry: NavEntry] }>()
const pinned = defineModel<string[]>('pinned', { default: () => [] })
const sort = defineModel<NavSort>('sort', { default: 'default' })
const drawerOpen = defineModel<boolean>('drawerOpen', { default: false })

const { t } = useI18n()
const root = ref<HTMLElement>()
const search = ref<InstanceType<typeof NavSearch>>()
const query = ref('')
const results = ref<NavEntry[] | null>(null)
const highlighted = ref<string>()
const searchFocused = ref(false)
const hoverExpanded = ref(false)

// ── Touch detection ──
const isTouch = ref(false)
let media: MediaQueryList | undefined
const onMedia = () => (isTouch.value = !!media?.matches)

// ── Expand / collapse with delays ──
let timer: ReturnType<typeof setTimeout> | undefined
const keyboardFocusInside = () => !!root.value?.matches(':has(:focus-visible)')
const keepOpen = () => searchFocused.value || keyboardFocusInside()

function onEnter() {
  clearTimeout(timer)
  timer = setTimeout(() => (hoverExpanded.value = true), 150)
}
function onLeave() {
  clearTimeout(timer)
  timer = setTimeout(maybeCollapse, 300)
}
function maybeCollapse() {
  if (!keepOpen() && !root.value?.matches(':hover')) hoverExpanded.value = false
}
function onFocusIn() {
  if (keyboardFocusInside() || searchFocused.value) hoverExpanded.value = true
}
function onFocusOut() {
  // Wait for focus to land on its new target before deciding.
  setTimeout(maybeCollapse, 0)
}
watch(searchFocused, (s) => {
  if (s) hoverExpanded.value = true
  else onLeave()
})

const open = computed(() =>
  isTouch.value ? drawerOpen.value : props.locked || hoverExpanded.value,
)
const overlaying = computed(() => !isTouch.value && !props.locked && hoverExpanded.value)

// ── ⌘K ──
async function onGlobalKey(event: KeyboardEvent) {
  if (event.key.toLowerCase() !== 'k' || !(event.metaKey || event.ctrlKey)) return
  event.preventDefault()
  if (isTouch.value) drawerOpen.value = true
  hoverExpanded.value = true
  await nextTick()
  search.value?.focus()
}

onMounted(() => {
  media = window.matchMedia('(hover: none)')
  onMedia()
  media.addEventListener('change', onMedia)
  window.addEventListener('keydown', onGlobalKey)
})
onBeforeUnmount(() => {
  clearTimeout(timer)
  media?.removeEventListener('change', onMedia)
  window.removeEventListener('keydown', onGlobalKey)
})

// ── Pins and sorting: one flat list (no group headings — they cluttered the rail).
// Pinned items stay on top, above a divider; sort applies to each part, by locale.
const byLabel = (list: NavEntry[]) => {
  if (sort.value === 'default') return list
  const dir = sort.value === 'asc' ? 1 : -1
  return [...list].sort((a, b) => dir * a.label.localeCompare(b.label, props.locale))
}
const pinnedEntries = computed(() =>
  byLabel(props.entries.filter((e) => pinned.value.includes(e.key))),
)
const otherEntries = computed(() =>
  byLabel(props.entries.filter((e) => !pinned.value.includes(e.key))),
)
// A stable array: a new one on every render would re-run the search and loop.
const searchEntries = computed(() =>
  props.settings ? [...props.entries, props.settings] : props.entries,
)
async function openSearch() {
  hoverExpanded.value = true
  await nextTick()
  search.value?.focus()
}

function togglePin(key: string) {
  pinned.value = pinned.value.includes(key)
    ? pinned.value.filter((k) => k !== key)
    : [...pinned.value, key]
}

function afterNavigate() {
  query.value = ''
  drawerOpen.value = false
  ;(document.activeElement as HTMLElement | null)?.blur()
  hoverExpanded.value = false
}
function openEntry(entry: NavEntry) {
  emit('navigate', entry)
  afterNavigate()
}
</script>

<template>
  <!-- touch drawer backdrop -->
  <div
    v-if="isTouch && drawerOpen"
    class="fixed inset-0 z-40 bg-text/40"
    aria-hidden="true"
    @click="drawerOpen = false"
  />
  <aside
    ref="root"
    :aria-label="t('common.openMenu')"
    class="fixed top-0 left-0 z-50 flex h-dvh flex-col bg-sidebar text-sidebar-fg transition-[width,transform,box-shadow] duration-150 [&_:focus-visible]:outline-sidebar-fg"
    :class="[
      isTouch
        ? drawerOpen
          ? 'w-[280px] translate-x-0 shadow-xl'
          : 'w-[280px] -translate-x-full'
        : '',
      !isTouch && open ? 'w-[var(--sidebar-expanded)]' : '',
      !isTouch && !open ? 'w-[var(--sidebar-collapsed)]' : '',
      overlaying ? 'shadow-xl' : '',
    ]"
    @mouseenter="onEnter"
    @mouseleave="onLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @keydown.esc="isTouch && (drawerOpen = false)"
  >
    <div class="flex h-16 shrink-0 items-center gap-2 px-3">
      <BrandBadge :compact="!open" :subtitle="subtitle" :version="version" inverse class="flex-1" />
      <button
        v-if="isTouch"
        type="button"
        :aria-label="t('common.close')"
        class="flex size-hit items-center justify-center rounded-sm text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg"
        @click="drawerOpen = false"
      >
        <X class="size-5" :stroke-width="ICON_STROKE" aria-hidden="true" />
      </button>
    </div>

    <div class="flex shrink-0 items-center gap-1 px-3 pb-2">
      <!-- §3.2 collapsed: just the 🔍 icon, in the same spot as the field's icon; it expands and focuses search -->
      <button
        v-if="!open"
        type="button"
        :aria-label="t('common.searchMenu')"
        class="flex size-10 shrink-0 items-center justify-center rounded-sm text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg"
        @click="openSearch"
      >
        <Search class="size-5" :stroke-width="ICON_STROKE" aria-hidden="true" />
      </button>
      <div v-else class="min-w-0 flex-1">
        <NavSearch
          ref="search"
          v-model="query"
          :entries="searchEntries"
          @results="results = $event"
          @highlight="highlighted = $event"
          @open="openEntry"
          @focus-change="searchFocused = $event"
        />
      </div>
      <SortMenu v-if="open" v-model="sort" />
    </div>

    <!-- Still scrolls (wheel, touch, keyboard) but shows no scrollbar -->
    <nav
      class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <!-- search results replace the tree -->
      <template v-if="results">
        <ul v-if="results.length" class="space-y-0.5">
          <NavItem
            v-for="e in results"
            :key="e.key"
            :entry="e"
            :open="open"
            :active="e.key === activeKey"
            :highlighted="e.key === highlighted"
            :pinnable="false"
            :link-component="linkComponent"
            @navigate="afterNavigate"
          />
        </ul>
        <p v-else class="px-5 py-3 text-sm text-sidebar-muted" role="status">
          {{ t('ui.noMenuMatch', { q: query }) }}
        </p>
        <p v-if="open" class="px-5 pt-2 text-xs text-sidebar-muted">{{ t('ui.searchHint') }}</p>
      </template>

      <template v-else>
        <ul v-if="pinnedEntries.length" class="space-y-0.5 pt-1" :aria-label="t('ui.pinned')">
          <NavItem
            v-for="e in pinnedEntries"
            :key="e.key"
            :entry="e"
            :open="open"
            :active="e.key === activeKey"
            pinned
            :link-component="linkComponent"
            @toggle-pin="togglePin(e.key)"
            @navigate="afterNavigate"
          />
        </ul>
        <hr v-if="pinnedEntries.length" class="mx-5 my-2 border-sidebar-border" />
        <ul class="space-y-0.5" :class="pinnedEntries.length ? '' : 'pt-1'">
          <NavItem
            v-for="e in otherEntries"
            :key="e.key"
            :entry="e"
            :open="open"
            :active="e.key === activeKey"
            :link-component="linkComponent"
            @toggle-pin="togglePin(e.key)"
            @navigate="afterNavigate"
          />
        </ul>
      </template>
    </nav>

    <ul v-if="settings" class="shrink-0 border-t border-sidebar-border py-2">
      <NavItem
        :entry="settings"
        :open="open"
        :active="settings.key === activeKey"
        :pinnable="false"
        :link-component="linkComponent"
        @navigate="afterNavigate"
      />
    </ul>
  </aside>
</template>
