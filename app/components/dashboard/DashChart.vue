<script setup lang="ts">
import type { ChartDatum, ChartKind } from './chart'
import { SERIES_COLORS } from './chart'

// Draws one dataset as a donut, bars, columns, a line or a table. Plain HTML + SVG, no chart
// library. Marks follow the dataviz specs: ≤ 24px thick, 4px rounded data end, 2px line, ≥ 8px
// dots with a 2px surface ring, hairline grid. Every mark has a hover / focus tooltip.
const props = withDefaults(
  defineProps<{
    kind: ChartKind
    data: ChartDatum[]
    /** `percent` values are 0–100 and the axis is fixed to 100. */
    unit?: 'count' | 'percent'
    /** Show each value's share of the total (off for per-day series). Default on. */
    showShare?: boolean
    /** Column header for the table view. */
    labelHeader: string
    valueHeader: string
  }>(),
  { showShare: true },
)

const { t } = useI18n()
const { number } = useFormat()
const fmt = (v: number) => (props.unit === 'percent' ? `${v}%` : number(v))

const total = computed(() => props.data.reduce((n, d) => n + d.value, 0))
const max = computed(() =>
  props.unit === 'percent' ? 100 : Math.max(1, ...props.data.map((d) => d.value)),
)
const share = (v: number) => (total.value ? Math.round((v / total.value) * 100) : 0)
const withShare = computed(() => props.unit !== 'percent' && props.showShare)
const pct = (v: number) => (v / max.value) * 100

// ── Tooltip: value first (strong), label second ──
const root = ref<HTMLElement>()
const tip = ref<{ d: ChartDatum; x: number; y: number } | null>(null)
function showAt(d: ChartDatum, x: number, y: number) {
  const box = root.value?.getBoundingClientRect()
  if (!box) return
  tip.value = { d, x: x - box.left, y: y - box.top }
}
const onMove = (d: ChartDatum, e: PointerEvent) => showAt(d, e.clientX, e.clientY)
function onFocus(d: ChartDatum, e: FocusEvent) {
  const r = (e.target as HTMLElement).getBoundingClientRect()
  showAt(d, r.left + r.width / 2, r.top)
}
const hide = () => (tip.value = null)
const tipText = (d: ChartDatum) =>
  props.kind === 'donut' || props.unit !== 'percent'
    ? `${fmt(d.value)}${total.value && withShare.value ? ` · ${share(d.value)}%` : ''}`
    : fmt(d.value)
const open = (d: ChartDatum) => d.href && navigateTo(d.href)

// ── Donut: one circle per slice, dash-offset to its start, 2px surface gap between slices ──
const R = 60
const C = 2 * Math.PI * R
const GAP = 2
const slices = computed(() => {
  let start = 0
  const shown = props.data.filter((d) => d.value > 0)
  return shown.map((d, i) => {
    const len = total.value ? (d.value / total.value) * C : 0
    const slice = {
      d,
      color: SERIES_COLORS[props.data.indexOf(d) % SERIES_COLORS.length]!,
      dash: `${Math.max(len - (shown.length > 1 ? GAP : 0), 0.5)} ${C}`,
      offset: -start,
      i,
    }
    start += len
    return slice
  })
})
const colorOf = (d: ChartDatum) => SERIES_COLORS[props.data.indexOf(d) % SERIES_COLORS.length]

// ── Line: points in a 0–100 box; the svg stretches, dots are HTML so they stay round ──
const points = computed(() =>
  props.data.map((d, i) => ({
    d,
    x: props.data.length > 1 ? (i / (props.data.length - 1)) * 100 : 50,
    y: 100 - pct(d.value),
  })),
)
const linePath = computed(() =>
  points.value.map((p, i) => `${i ? 'L' : 'M'}${p.x},${p.y}`).join(' '),
)
const ticks = computed(() =>
  props.unit === 'percent'
    ? [0, 50, 100]
    : [0, Math.round(max.value / 2), max.value].filter((v, i, a) => a.indexOf(v) === i),
)
// Many marks (e.g. 15 stages, 30 days): label the axis every few marks and no column caps (a cap
// label is wider than a thin column); the line labels only its lowest point. Tooltip and table
// carry every value.
const dense = computed(() => props.data.length > 8)
const axisStep = computed(() => Math.ceil(props.data.length / 5))
const showAxis = (i: number) => !dense.value || i % axisStep.value === 0
// The extreme is the one value worth labelling on a line (never every point).
const lowest = computed(() =>
  props.data.reduce<ChartDatum | undefined>((m, d) => (!m || d.value < m.value ? d : m), undefined),
)
</script>

<template>
  <div ref="root" class="relative h-64" @pointerleave="hide">
    <!-- Donut + legend (legend carries label, value and share, so colour is never needed) -->
    <div v-if="kind === 'donut'" class="flex h-full items-center gap-5">
      <div class="relative shrink-0">
        <svg width="152" height="152" viewBox="0 0 152 152" role="img" :aria-label="labelHeader">
          <circle
            cx="76"
            cy="76"
            :r="R"
            fill="none"
            class="stroke-surface-sunken"
            stroke-width="22"
          />
          <circle
            v-for="s in slices"
            :key="s.d.key"
            cx="76"
            cy="76"
            :r="R"
            fill="none"
            :stroke="s.color"
            stroke-width="22"
            :stroke-dasharray="s.dash"
            :stroke-dashoffset="s.offset"
            transform="rotate(-90 76 76)"
            tabindex="0"
            class="cursor-pointer outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
            :aria-label="`${s.d.label}: ${fmt(s.d.value)}`"
            @pointermove="onMove(s.d, $event)"
            @focus="onFocus(s.d, $event)"
            @blur="hide"
            @click="open(s.d)"
          />
        </svg>
        <div class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xl font-semibold tabular-nums">{{ number(total) }}</span>
          <span class="text-xs text-muted">{{ t('dashboard.total') }}</span>
        </div>
      </div>
      <ul class="min-w-0 flex-1 space-y-1.5 text-sm">
        <li v-for="d in data" :key="d.key" class="flex items-center gap-2">
          <span class="size-2.5 shrink-0 rounded-[2px]" :style="{ background: colorOf(d) }" />
          <span class="min-w-0 flex-1 truncate">{{ d.label }}</span>
          <span class="tabular-nums font-medium">{{ fmt(d.value) }}</span>
          <span class="w-10 text-right tabular-nums text-muted">{{ share(d.value) }}%</span>
        </li>
      </ul>
    </div>

    <!-- Horizontal bars: label, bar from one baseline, value at the tip -->
    <ul v-else-if="kind === 'bar'" class="h-full space-y-2 overflow-y-auto pr-1 text-sm">
      <li v-for="d in data" :key="d.key" class="grid grid-cols-[7rem_1fr] items-center gap-3">
        <span class="truncate" :title="d.label">{{ d.label }}</span>
        <div class="flex items-center gap-2">
          <div
            tabindex="0"
            class="h-4 min-w-1 cursor-pointer rounded-r-[4px] bg-brand outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
            :style="{ width: `calc(${pct(d.value)}% - 3rem)` }"
            :aria-label="`${d.label}: ${fmt(d.value)}`"
            @pointermove="onMove(d, $event)"
            @focus="onFocus(d, $event)"
            @blur="hide"
            @click="open(d)"
          />
          <span class="shrink-0 tabular-nums text-muted">{{ fmt(d.value) }}</span>
        </div>
      </li>
    </ul>

    <!-- Columns: value on the cap, label under; hairline baseline -->
    <div v-else-if="kind === 'column'" class="flex h-full flex-col">
      <div class="flex min-h-0 flex-1 items-end gap-1 border-b border-border">
        <div
          v-for="d in data"
          :key="d.key"
          class="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
        >
          <span class="mb-1 text-[11px] tabular-nums text-muted" :class="dense ? 'invisible' : ''">
            {{ fmt(d.value) }}
          </span>
          <div
            tabindex="0"
            class="w-full max-w-6 cursor-pointer rounded-t-[4px] bg-brand outline-none transition-opacity hover:opacity-80 focus-visible:opacity-80"
            :style="{
              height: `calc(${pct(d.value)}% - 1.25rem)`,
              minHeight: d.value ? '2px' : '0',
            }"
            :aria-label="`${d.label}: ${fmt(d.value)}`"
            @pointermove="onMove(d, $event)"
            @focus="onFocus(d, $event)"
            @blur="hide"
            @click="open(d)"
          />
        </div>
      </div>
      <div class="mt-1 flex gap-1">
        <span
          v-for="(d, i) in data"
          :key="d.key"
          class="min-w-0 flex-1 text-center text-[11px] text-muted"
          :class="dense ? 'overflow-visible whitespace-nowrap' : 'truncate'"
          :title="d.label"
        >
          {{ showAxis(i) ? (d.short ?? d.label) : '' }}
        </span>
      </div>
    </div>

    <!-- Line: hairline grid with tick labels, 2px line, 8px dots, lowest value labelled -->
    <div v-else-if="kind === 'line'" class="flex h-full flex-col">
      <div class="relative ml-9 mr-2 mt-3 min-h-0 flex-1">
        <div
          v-for="tk in ticks"
          :key="tk"
          class="absolute inset-x-0 border-t border-border"
          :style="{ top: `${100 - pct(tk)}%` }"
        >
          <span class="absolute -left-9 -translate-y-1/2 text-[11px] tabular-nums text-muted">
            {{ fmt(tk) }}
          </span>
        </div>
        <svg
          class="absolute inset-0 size-full overflow-visible"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            :d="linePath"
            fill="none"
            class="stroke-brand"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
        </svg>
        <button
          v-for="p in points"
          :key="p.d.key"
          type="button"
          class="absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center outline-none"
          :style="{ left: `${p.x}%`, top: `${p.y}%` }"
          :aria-label="`${p.d.label}: ${fmt(p.d.value)}`"
          @pointermove="onMove(p.d, $event)"
          @focus="onFocus(p.d, $event)"
          @blur="hide"
          @click="open(p.d)"
        >
          <span class="size-3 rounded-full border-2 border-surface bg-brand" />
          <span
            v-if="p.d === lowest"
            class="absolute top-5 text-[11px] font-medium whitespace-nowrap tabular-nums"
          >
            {{ fmt(p.d.value) }}
          </span>
        </button>
      </div>
      <div class="ml-9 mr-2 mt-4 flex justify-between">
        <span
          v-for="(d, i) in data"
          :key="d.key"
          class="w-0 text-center text-[11px] whitespace-nowrap text-muted"
          :title="d.label"
        >
          <span v-if="showAxis(i)" class="inline-block -translate-x-1/2">
            {{ d.short ?? d.label }}
          </span>
        </span>
      </div>
    </div>

    <!-- Table: every value, no hover needed -->
    <div v-else class="h-full overflow-y-auto">
      <table class="w-full text-sm">
        <thead class="sticky top-0 bg-surface text-left text-muted">
          <tr>
            <th class="py-1 font-medium">{{ labelHeader }}</th>
            <th class="py-1 text-right font-medium">{{ valueHeader }}</th>
            <th v-if="withShare" class="w-14 py-1 text-right font-medium">%</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="d in data" :key="d.key" class="border-t border-border">
            <td class="py-1.5">
              <NuxtLink v-if="d.href" :to="d.href" class="hover:underline">{{ d.label }}</NuxtLink>
              <template v-else>{{ d.label }}</template>
            </td>
            <td class="py-1.5 text-right tabular-nums">{{ fmt(d.value) }}</td>
            <td v-if="withShare" class="py-1.5 text-right tabular-nums text-muted">
              {{ share(d.value) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="tip && kind !== 'table'"
      class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+10px)] rounded-sm border border-border bg-surface px-2.5 py-1.5 text-sm whitespace-nowrap shadow-md"
      :style="{ left: `${tip.x}px`, top: `${tip.y}px` }"
      role="status"
    >
      <div class="flex items-center gap-2">
        <span
          class="h-0.5 w-3 rounded-full"
          :style="{ background: kind === 'donut' ? colorOf(tip.d) : 'var(--color-brand)' }"
        />
        <strong class="tabular-nums">{{ tipText(tip.d) }}</strong>
      </div>
      <div class="text-xs text-muted">{{ tip.d.label }}</div>
    </div>
  </div>
</template>
