<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDownAZ, ArrowDownUp, ArrowUpZA } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import type { NavSort } from '../types'

// §2 SortMenu: one button that applies the next order right away —
// default → A→Z → Z→A → default. The icon shows the order in use.
const sort = defineModel<NavSort>({ default: 'default' })
const { t } = useI18n()

const next: Record<NavSort, NavSort> = { default: 'asc', asc: 'desc', desc: 'default' }
const icon = computed(
  () => ({ default: ArrowDownUp, asc: ArrowDownAZ, desc: ArrowUpZA })[sort.value],
)
const label = (s: NavSort) =>
  t(s === 'asc' ? 'ui.sortAsc' : s === 'desc' ? 'ui.sortDesc' : 'ui.sortDefault')
</script>

<template>
  <button
    type="button"
    :aria-label="`${t('ui.sortMenu')}: ${label(sort)}`"
    :title="`${label(sort)} → ${label(next[sort])}`"
    class="flex size-hit shrink-0 items-center justify-center rounded-sm hover:bg-sidebar-hover"
    :class="
      sort === 'default'
        ? 'text-sidebar-muted hover:text-sidebar-fg'
        : 'bg-sidebar-active text-sidebar-fg'
    "
    @click="sort = next[sort]"
  >
    <component :is="icon" class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
  </button>
</template>
