<script setup lang="ts">
import { StatCard } from '~/ui'
import type { DailyStat, MenuItem } from '~/lib/types'
import { CATEGORY_KEYS } from '~/lib/types'
import ChartCard from '~/components/dashboard/ChartCard.vue'
import type { ChartDatum } from '~/components/dashboard/chart'

// `/analytics` — the deeper look after the dashboard: sales trends, channels, what people drink
// and what it costs, over the last 7 / 30 / 90 days (mock daily history). Same layout as the
// dashboard: 5 stat cards, then switchable chart cards, 3 per row. The range lives in the URL.
const { t } = useI18n()
const { number, date, shortDate } = useFormat()
const route = useRoute()
const router = useRouter()
setBreadcrumb(() => [{ label: t('nav.analytics') }])
useHead({ title: () => t('nav.analytics') })

const RANGES = [7, 30, 90] as const
type Range = (typeof RANGES)[number]
const range = computed<Range>(() => {
  const n = Number(route.query.range)
  return (RANGES as readonly number[]).includes(n) ? (n as Range) : 30
})
const setRange = (n: Range) => router.replace({ query: { ...route.query, range: String(n) } })

const days = ref<DailyStat[]>([])
const menu = ref<MenuItem[]>([])
const loading = ref(true)
const failed = ref(false)

onMounted(async () => {
  try {
    const [d, m] = await Promise.all([
      useEntityRepo('dailystats').list(),
      useEntityRepo('menu').list(),
    ])
    days.value = (d as unknown as DailyStat[]).sort((a, b) => a.date.localeCompare(b.date))
    menu.value = m as unknown as MenuItem[]
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

// The last N days of the history (counted back from its newest day, so mock data never runs out).
const inRange = computed(() => days.value.slice(-range.value))
const sum = (key: keyof DailyStat) => inRange.value.reduce((n, d) => n + (Number(d[key]) || 0), 0)

const tiles = computed(() => {
  const revenue = sum('revenue')
  const orders = sum('orders')
  return [
    { key: 'revenue', value: revenue },
    { key: 'orders', value: orders },
    { key: 'avgTicket', value: orders ? Math.round(revenue / orders) : 0 },
    { key: 'newMembers', value: sum('new_members') },
    { key: 'wasteCost', value: sum('waste_cost') },
  ]
})

/** One value per day, labelled with the date. */
const perDay = (value: (d: DailyStat) => number) =>
  computed<ChartDatum[]>(() =>
    inRange.value.map((d) => ({
      key: d.date,
      label: date(d.date),
      short: shortDate(d.date),
      value: value(d),
    })),
  )
const revenue = perDay((d) => d.revenue)
const orders = perDay((d) => d.orders)
const avgTicket = perDay((d) => (d.orders ? Math.round(d.revenue / d.orders) : 0))
const newMembers = perDay((d) => d.new_members)
const waste = perDay((d) => d.waste_cost)
const promo = perDay((d) => d.promo_discount)

/** Totals over the range for a few columns, one bar / slice each. */
const totals = (keys: Array<keyof DailyStat>, group: string) =>
  computed<ChartDatum[]>(() =>
    keys.map((k) => ({ key: k, label: t(`analytics.${group}.${k}`), value: sum(k) })),
  )
const channels = totals(['dine_in', 'takeaway', 'delivery'], 'channels')
const cups = totals(['cups_hot', 'cups_iced', 'cups_blended'], 'cups')

// Not tied to the range: last 7 days of sales per menu category, from the menu table.
const byCategory = computed<ChartDatum[]>(() =>
  CATEGORY_KEYS.map((k) => ({
    key: k,
    label: t(`category.${k}`),
    value: menu.value.filter((m) => m.category === k).reduce((n, m) => n + m.revenue_7d, 0),
    href: `/menu?f.category=${k}`,
  })),
)

const timeKinds = ['line', 'column', 'table'] as const
const countKinds = ['column', 'line', 'table'] as const

// Drag the tiles into your own order (kept per browser).
const tileOrder = useCardOrder('analytics', () => tiles.value.map((x) => x.key))
const orderedTiles = computed(() =>
  tileOrder.keys.value.map((k) => tiles.value.find((x) => x.key === k)!),
)
</script>

<template>
  <div class="mx-auto max-w-7xl">
    <!-- No visible heading (design): the breadcrumb says where we are. -->
    <h1 class="sr-only">{{ t('nav.analytics') }}</h1>

    <p
      v-if="failed"
      class="mb-4 rounded-sm border border-danger/40 bg-danger/5 px-4 py-2 text-sm text-danger"
      role="alert"
    >
      {{ t('common.loadError') }}
    </p>

    <!-- One filter row above everything it filters -->
    <div class="mb-4 flex justify-end">
      <div
        class="flex rounded-sm border border-border bg-surface p-0.5"
        role="group"
        :aria-label="t('analytics.rangeLabel')"
      >
        <button
          v-for="n in RANGES"
          :key="n"
          type="button"
          class="rounded-[6px] px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            range === n
              ? 'bg-nav-active text-brand'
              : 'text-muted hover:bg-surface-sunken hover:text-text'
          "
          :aria-pressed="range === n"
          @click="setRange(n)"
        >
          {{ t('analytics.range', { n }) }}
        </button>
      </div>
    </div>

    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      <StatCard
        v-for="tile in orderedTiles"
        :key="tile.key"
        v-bind="tileOrder.bind(tile.key)"
        :label="t(`analytics.tiles.${tile.key}`)"
        :value="number(tile.value)"
        :loading="loading"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <!-- Sales -->
      <ChartCard
        i18n-base="analytics"
        chart-key="revenue"
        :kinds="[...timeKinds]"
        :data="revenue"
        :show-share="false"
        :loading="loading"
      />
      <ChartCard
        i18n-base="analytics"
        chart-key="orders"
        :kinds="[...countKinds]"
        :data="orders"
        :show-share="false"
        :loading="loading"
      />
      <ChartCard
        i18n-base="analytics"
        chart-key="avgTicket"
        :kinds="[...timeKinds]"
        :data="avgTicket"
        :show-share="false"
        :loading="loading"
      />
      <!-- Mix -->
      <ChartCard
        i18n-base="analytics"
        chart-key="channels"
        :kinds="['donut', 'bar', 'column', 'table']"
        :data="channels"
        :loading="loading"
      />
      <ChartCard
        i18n-base="analytics"
        chart-key="cups"
        :kinds="['donut', 'bar', 'column', 'table']"
        :data="cups"
        :loading="loading"
      />
      <ChartCard
        i18n-base="analytics"
        chart-key="categories"
        :kinds="['bar', 'donut', 'column', 'table']"
        :data="byCategory"
        :loading="loading"
      />
      <!-- Customers and costs -->
      <ChartCard
        i18n-base="analytics"
        chart-key="newMembers"
        :kinds="[...countKinds]"
        :data="newMembers"
        :show-share="false"
        :loading="loading"
      />
      <ChartCard
        i18n-base="analytics"
        chart-key="promo"
        :kinds="[...timeKinds]"
        :data="promo"
        :show-share="false"
        :loading="loading"
      />
      <ChartCard
        i18n-base="analytics"
        chart-key="waste"
        :kinds="[...countKinds]"
        :data="waste"
        :show-share="false"
        :loading="loading"
      />
    </div>
  </div>
</template>
