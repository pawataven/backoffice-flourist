<script setup lang="ts">
import { StatCard } from '~/ui'
import type { Member, MenuItem, Order, StockItem } from '~/lib/types'
import { BRANCH_KEYS, CHANNELS, ORDER_STATUSES, TIERS } from '~/lib/types'
import ChartCard from '~/components/dashboard/ChartCard.vue'
import type { ChartDatum } from '~/components/dashboard/chart'

// `/` — the dashboard: the café today at a glance. 5 stat cards, then 2 rows of 3 chart cards.
// Each chart switches between the forms that fit its data (ChartCard), and every mark opens the
// matching list or record.
const { t } = useI18n()
const { number } = useFormat()
setBreadcrumb(() => [{ label: t('nav.dashboard') }])
useHead({ title: () => t('nav.dashboard') })

const orders = ref<Order[]>([])
const menu = ref<MenuItem[]>([])
const members = ref<Member[]>([])
const stock = ref<StockItem[]>([])
const loading = ref(true)
const failed = ref(false)

onMounted(async () => {
  try {
    const [o, m, mb, s] = await Promise.all([
      useEntityRepo('orders').list(),
      useEntityRepo('menu').list(),
      useEntityRepo('members').list(),
      useEntityRepo('stock').list(),
    ])
    orders.value = o as unknown as Order[]
    menu.value = m as unknown as MenuItem[]
    members.value = mb as unknown as Member[]
    stock.value = s as unknown as StockItem[]
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
})

// "Today" is the newest day in the orders (local time), so the mock never looks empty.
const localDay = (iso: string) => {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const today = computed(() =>
  orders.value.reduce(
    (max, o) => (localDay(o.ordered_at) > max ? localDay(o.ordered_at) : max),
    '',
  ),
)
const todays = computed(() =>
  orders.value.filter((o) => localDay(o.ordered_at) === today.value && o.status !== 'cancelled'),
)

// ── Stat cards: each opens the list it counts ──
const tiles = computed(() => {
  const revenue = todays.value.reduce((n, o) => n + o.total, 0)
  return [
    {
      key: 'ordersToday',
      value: todays.value.length,
      href: `/orders?r.ordered_at=${today.value}..`,
    },
    { key: 'revenueToday', value: revenue, href: `/orders?r.ordered_at=${today.value}..` },
    {
      key: 'avgTicket',
      value: todays.value.length ? Math.round(revenue / todays.value.length) : 0,
      href: `/orders?r.ordered_at=${today.value}..`,
    },
    {
      key: 'inProgress',
      value: orders.value.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status))
        .length,
      href: '/orders?stat=inProgress',
    },
    {
      key: 'lowStock',
      value: stock.value.filter((s) => s.stock <= s.reorder_level).length,
      href: '/stock?sort=stock:asc',
    },
  ]
})

// ── Charts ──
function countBy<K extends string>(
  keys: readonly K[],
  rows: Order[],
  value: (o: Order) => string,
  label: (k: K) => string,
  href?: (k: K) => string,
): ChartDatum[] {
  return keys.map((key) => ({
    key,
    label: label(key),
    value: rows.filter((o) => value(o) === key).length,
    href: href?.(key),
  }))
}

const byChannel = computed(() =>
  countBy(
    CHANNELS,
    todays.value,
    (o) => o.channel,
    (k) => t(`channel.${k}`),
    (k) => `/orders?f.channel=${k}`,
  ),
)

/** Revenue per open branch today. */
const byBranch = computed<ChartDatum[]>(() =>
  BRANCH_KEYS.map((k) => ({
    key: k,
    label: t(`branch.${k}`),
    value: todays.value.filter((o) => o.branch === k).reduce((n, o) => n + o.total, 0),
    href: `/orders?f.branch=${k}`,
  })).filter((d) => d.value > 0),
)

/** Orders per hour today, 07:00–20:00: when the rush is. */
const byHour = computed<ChartDatum[]>(() =>
  Array.from({ length: 14 }, (_, i) => {
    const h = i + 7
    return {
      key: String(h),
      label: `${String(h).padStart(2, '0')}:00`,
      short: String(h),
      value: todays.value.filter((o) => new Date(o.ordered_at).getHours() === h).length,
    }
  }),
)

const topMenu = computed<ChartDatum[]>(() =>
  [...menu.value]
    .filter((m) => m.status === 'published')
    .sort((a, b) => b.sold_7d - a.sold_7d)
    .slice(0, 8)
    .map((m) => ({
      key: m.id,
      label: m.name_th,
      short: m.sku,
      value: m.sold_7d,
      href: `/menu/${m.id}`,
    })),
)

const byTier = computed<ChartDatum[]>(() =>
  TIERS.map((k) => ({
    key: k,
    label: t(`tier.${k}`),
    value: members.value.filter((m) => m.tier === k).length,
    href: `/members?f.tier=${k}`,
  })),
)

const byStatus = computed(() =>
  countBy(
    ORDER_STATUSES,
    orders.value.filter((o) => localDay(o.ordered_at) === today.value),
    (o) => o.status,
    (k) => t(`orderStatus.${k}`),
    (k) => `/orders?f.status=${k}`,
  ),
)

// Drag the tiles into your own order (kept per browser).
const tileOrder = useCardOrder('dashboard', () => tiles.value.map((x) => x.key))
const orderedTiles = computed(() =>
  tileOrder.keys.value.map((k) => tiles.value.find((x) => x.key === k)!),
)
</script>

<template>
  <div class="mx-auto max-w-7xl">
    <!-- No visible heading (design): the breadcrumb says where we are. -->
    <h1 class="sr-only">{{ t('dashboard.title') }}</h1>

    <p
      v-if="failed"
      class="mb-4 rounded-sm border border-danger/40 bg-danger/5 px-4 py-2 text-sm text-danger"
      role="alert"
    >
      {{ t('common.loadError') }}
    </p>

    <div class="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard
        v-for="tile in orderedTiles"
        :key="tile.key"
        v-bind="tileOrder.bind(tile.key)"
        :label="t(`dashboard.tiles.${tile.key}`)"
        :value="number(tile.value)"
        :loading="loading"
        @click="navigateTo(tile.href)"
      />
    </div>

    <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ChartCard
        chart-key="byHour"
        :kinds="['column', 'line', 'table']"
        :data="byHour"
        :show-share="false"
        :loading="loading"
      />
      <ChartCard
        chart-key="channels"
        :kinds="['donut', 'bar', 'column', 'table']"
        :data="byChannel"
        :loading="loading"
      />
      <ChartCard
        chart-key="branches"
        :kinds="['bar', 'column', 'donut', 'table']"
        :data="byBranch"
        :loading="loading"
      />
      <ChartCard
        chart-key="topMenu"
        :kinds="['bar', 'column', 'table']"
        :data="topMenu"
        :loading="loading"
      />
      <ChartCard
        chart-key="orderStatus"
        :kinds="['column', 'bar', 'donut', 'table']"
        :data="byStatus"
        :loading="loading"
      />
      <ChartCard
        chart-key="tiers"
        :kinds="['donut', 'bar', 'column', 'table']"
        :data="byTier"
        :loading="loading"
      />
    </div>
  </div>
</template>
