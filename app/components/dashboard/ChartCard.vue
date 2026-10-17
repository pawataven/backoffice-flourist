<script setup lang="ts">
import { Skeleton } from '~/ui'
import { ICON_STROKE } from '~/ui'
import DashChart from './DashChart.vue'
import { CHART_ICONS } from './chart'
import type { ChartDatum, ChartKind } from './chart'

// One dashboard card: title, a switch between the chart forms that fit this data, and the chart.
// The chosen form is remembered per operator browser (a convenience, so localStorage is enough).
const props = withDefaults(
  defineProps<{
    /** Storage key and i18n key under `${i18nBase}.charts`. */
    chartKey: string
    /** Page whose strings this card uses: 'dashboard' (default) or 'analytics'. */
    i18nBase?: string
    kinds: ChartKind[]
    data: ChartDatum[]
    unit?: 'count' | 'percent'
    /** Off for per-day series, where a day's share of the total means nothing. */
    showShare?: boolean
    loading?: boolean
  }>(),
  { showShare: true },
)

const { t } = useI18n()
const base = props.i18nBase ?? 'dashboard'
const storageKey = `${base}:chart:${props.chartKey}`

function readKind(): ChartKind {
  try {
    const saved = localStorage.getItem(storageKey) as ChartKind | null
    if (saved && props.kinds.includes(saved)) return saved
  } catch {
    // Private mode / blocked storage: just use the default.
  }
  return props.kinds[0]!
}
const kind = ref<ChartKind>(readKind())
watch(kind, (k) => {
  try {
    localStorage.setItem(storageKey, k)
  } catch {
    // Not remembered; still switched.
  }
})

const title = computed(() => t(`${base}.charts.${props.chartKey}.title`))
</script>

<template>
  <section class="flex min-w-0 flex-col rounded-md border border-border bg-surface p-4">
    <div class="mb-3 flex items-start justify-between gap-2">
      <div class="min-w-0">
        <h2 class="text-base font-semibold">{{ title }}</h2>
        <p class="text-xs text-muted">{{ t(`${base}.charts.${chartKey}.note`) }}</p>
      </div>
      <div
        class="flex shrink-0 rounded-sm border border-border p-0.5"
        role="group"
        :aria-label="t('dashboard.chartType')"
      >
        <button
          v-for="k in kinds"
          :key="k"
          type="button"
          class="flex size-8 items-center justify-center rounded-[6px] transition-colors"
          :class="
            kind === k
              ? 'bg-nav-active text-brand'
              : 'text-muted hover:bg-surface-sunken hover:text-text'
          "
          :aria-pressed="kind === k"
          :aria-label="t(`dashboard.kinds.${k}`)"
          :title="t(`dashboard.kinds.${k}`)"
          @click="kind = k"
        >
          <component
            :is="CHART_ICONS[k]"
            class="size-4"
            :stroke-width="ICON_STROKE"
            aria-hidden="true"
          />
        </button>
      </div>
    </div>
    <Skeleton v-if="loading" class="h-64" />
    <DashChart
      v-else
      :kind="kind"
      :data="data"
      :unit="unit"
      :show-share="showShare"
      :label-header="t(`${base}.charts.${chartKey}.label`)"
      :value-header="t(`${base}.charts.${chartKey}.value`)"
    />
  </section>
</template>
