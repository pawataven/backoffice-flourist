<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight } from '@lucide/vue'
import { ICON_STROKE } from '../icons'

// §2: pages with ellipsis + adjustable rows per page.
const props = withDefaults(
  defineProps<{
    total: number
    pageCount: number
    pageSizes?: readonly number[]
    locale?: string
  }>(),
  { pageSizes: () => [10, 20, 50, 100] },
)
const page = defineModel<number>('page', { required: true })
const pageSize = defineModel<number>('pageSize', { required: true })
const { t } = useI18n()

const nf = computed(() => new Intl.NumberFormat(props.locale))
const from = computed(() => (props.total === 0 ? 0 : (page.value - 1) * pageSize.value + 1))
const to = computed(() => Math.min(page.value * pageSize.value, props.total))

/** 1 … 4 5 6 … 12 */
const pages = computed<Array<number | '…'>>(() => {
  const n = props.pageCount
  const p = page.value
  if (n <= 7) return Array.from({ length: n }, (_, i) => i + 1)
  const set = new Set([1, n, p - 1, p, p + 1].filter((x) => x >= 1 && x <= n))
  const sorted = [...set].sort((a, b) => a - b)
  const out: Array<number | '…'> = []
  sorted.forEach((x, i) => {
    if (i && x - sorted[i - 1]! > 1) out.push('…')
    out.push(x)
  })
  return out
})

const btn =
  'flex size-hit items-center justify-center rounded-sm font-medium tabular-nums hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-3 text-sm">
    <p class="text-muted tabular-nums">
      {{ t('ui.range', { from: nf.format(from), to: nf.format(to), total: nf.format(total) }) }}
    </p>
    <div class="flex flex-wrap items-center gap-3">
      <nav :aria-label="t('ui.page', { n: page })" class="flex items-center gap-0.5">
        <button
          type="button"
          :class="btn"
          :disabled="page <= 1"
          :aria-label="t('ui.prevPage')"
          @click="page--"
        >
          <ChevronLeft class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
        </button>
        <template v-for="(p, i) in pages" :key="i">
          <span v-if="p === '…'" class="w-6 text-center text-muted" aria-hidden="true">…</span>
          <button
            v-else
            type="button"
            :class="[btn, p === page ? 'bg-nav-active text-brand' : '']"
            :aria-current="p === page ? 'page' : undefined"
            :aria-label="t('ui.page', { n: p })"
            @click="page = p"
          >
            {{ p }}
          </button>
        </template>
        <button
          type="button"
          :class="btn"
          :disabled="page >= pageCount"
          :aria-label="t('ui.nextPage')"
          @click="page++"
        >
          <ChevronRight class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
        </button>
      </nav>
      <label class="flex items-center gap-2 text-muted">
        <span class="sr-only">{{ t('ui.rowsPerPage') }}</span>
        <select
          :value="pageSize"
          class="min-h-hit rounded-sm border border-border bg-surface px-2 text-text tabular-nums"
          @change="((pageSize = Number(($event.target as HTMLSelectElement).value)), (page = 1))"
        >
          <option v-for="s in pageSizes" :key="s" :value="s">
            {{ t('ui.perPage', { n: s }) }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>
