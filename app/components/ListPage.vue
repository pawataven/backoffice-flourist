<script setup lang="ts">
import {
  BulkActionBar,
  Button,
  ColumnFilterMenu,
  DataTable,
  EmptyState,
  FilterChips,
  Pagination,
  SearchInput,
  StatCard,
  useToast,
} from '~/ui'
import type { DataColumn } from '~/ui'
import {
  PAGE_SIZES,
  applyListQuery,
  distinctValues,
  parseListQuery,
  statCounts,
  toUrlQuery,
} from '~/lib/core'
import type { ColumnFilter, ListQuery, ListSpec, SortDir } from '~/lib/core'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from '@lucide/vue'
import type { EntityConfig } from '~/config/types'

// §4.2 ListPage, driven entirely by the entity config:
// StatCards → search + New → FilterChips → DataTable → Pagination.
// Stat card, search and column filters combine with AND and live in the URL query.
const props = defineProps<{ config: EntityConfig }>()

const { t } = useI18n()
const { date, number, locale } = useFormat()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const can = useEntityCan(props.config)
const { refresh: refreshBadges } = useNavBadges()
const repo = useEntityRepo(props.config.key)

const base = computed(() => `entities.${props.config.key}`)
const title = computed(() => t(`${base.value}.title`))
const spec = computed(() => props.config.list)
// The core query helpers take any row; the config's stat predicates are typed for this entity's
// rows, which is what the repo returns.
const listSpec = computed(() => spec.value as unknown as ListSpec)

// The entity crumb always leads to its list (on the list itself it clears the filters).
setBreadcrumb(() => [
  { label: title.value, href: `/${props.config.key}` },
  { label: t('list.list') },
])
useHead({ title: () => title.value })

// ── Data ──
type Row = Record<string, unknown> & { id: string }
const rows = ref<Row[]>([])
const loading = ref(true)
const failed = ref(false)

async function load() {
  loading.value = true
  failed.value = false
  try {
    rows.value = (await repo.list()) as Row[]
  } catch {
    failed.value = true
  } finally {
    loading.value = false
  }
}
onMounted(load)

// ── URL ⇄ query ──
const query = computed(() => parseListQuery(route.query as Record<string, string>, listSpec.value))
function setQuery(patch: Partial<ListQuery>, keepPage = false) {
  const next = { ...query.value, ...patch }
  if (!keepPage) next.page = 1
  router.replace({ query: toUrlQuery(next) })
}

const result = computed(() => applyListQuery(rows.value, listSpec.value, query.value, locale.value))
const counts = computed(() => statCounts(rows.value, listSpec.value))
// The operator can drag the stat cards into their own order (kept per browser).
const cardOrder = useCardOrder(props.config.key, () => spec.value.statCards.map((c) => c.key))
const orderedStatCards = computed(() =>
  cardOrder.keys.value.map((k) => spec.value.statCards.find((c) => c.key === k)!),
)
const activeStat = computed(() => query.value.stat ?? spec.value.statCards[0]?.key)

function clickStat(key: string) {
  // The first card is "all"; clicking the active card again clears it (§2).
  const isFirst = key === spec.value.statCards[0]?.key
  setQuery({ stat: isFirst || key === query.value.stat ? undefined : key })
}

// Search: local state so typing stays smooth, written to the URL after a short pause.
const search = ref(query.value.q)
let searchTimer: ReturnType<typeof setTimeout> | undefined
watch(search, (q) => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => setQuery({ q }), 200)
})
watch(
  () => query.value.q,
  (q) => {
    if (q !== search.value) search.value = q
  },
)

function setFilter(key: string, filter: ColumnFilter | undefined) {
  const filters = { ...query.value.filters }
  if (filter) filters[key] = filter
  else delete filters[key]
  setQuery({ filters })
}
function setSort(key: string, dir: SortDir) {
  const same = query.value.sort?.key === key && query.value.sort.dir === dir
  setQuery({ sort: same ? undefined : { key, dir } }, true)
}
function clearAll() {
  search.value = ''
  setQuery({ q: '', filters: {}, stat: undefined })
}

// ── Labels ──
const columnLabel = (key: string) => t(`${base.value}.fields.${key}`)
function valueLabel(key: string, value: string): string {
  const col = spec.value.columns.find((c) => c.key === key)
  if (!value) return t('common.blank')
  if (col?.format === 'status') return t(`status.${value}`)
  if (col?.format === 'enum' && col.enumI18n) return t(`${col.enumI18n}.${value}`)
  return value
}

const chips = computed(() => {
  const out: Array<{ key: string; label: string }> = []
  if (query.value.q) out.push({ key: 'q', label: `${t('common.search')}: “${query.value.q}”` })
  for (const [key, f] of Object.entries(query.value.filters)) {
    const col = spec.value.columns.find((c) => c.key === key)
    const label = columnLabel(key)
    if (f.kind === 'values') {
      const values = f.values.map((v) => valueLabel(key, v)).join(', ') || t('common.blank')
      out.push({ key, label: t('list.filterValue', { label, values }) })
    } else {
      const fmt = (v?: string) =>
        !v ? '…' : col?.filter === 'dateRange' ? date(v) : number(Number(v))
      out.push({ key, label: t('list.filterRange', { label, from: fmt(f.from), to: fmt(f.to) }) })
    }
  }
  return out
})
function removeChip(key: string) {
  if (key === 'q') {
    search.value = ''
    setQuery({ q: '' })
  } else setFilter(key, undefined)
}

const columns = computed<DataColumn[]>(() =>
  spec.value.columns.map((c) => ({
    key: c.key,
    label: columnLabel(c.key),
    mono: c.mono,
    class: c.format === 'image' ? 'w-16' : undefined,
    numeric: c.format === 'number' || c.format === 'date',
    align: c.format === 'number' ? 'end' : 'start',
  })),
)
const filterOptions = (key: string) =>
  distinctValues(rows.value, listSpec.value, query.value, key, locale.value).map((o) => ({
    ...o,
    label: valueLabel(key, o.value),
  }))

const detailHref = (row: Row) => `/${props.config.key}/${row.id}`
/** Opens the record already in edit mode (DetailPage reads ?edit=1). */
const editHref = (row: Row) => `${detailHref(row)}?edit=1`
const hasFilters = computed(
  () => !!query.value.q || !!query.value.stat || Object.keys(query.value.filters).length > 0,
)

// ── Selection & bulk actions ──
const selected = ref<string[]>([])
const busy = ref<string>()
const bulkActions = computed(() =>
  spec.value.bulkActions
    .filter((a) => can(a === 'delete' ? 'delete' : 'publish', props.config.key))
    .map((a) => ({
      key: a,
      label: t(a === 'delete' ? 'common.delete' : `common.${a}`),
      icon: a === 'publish' ? Eye : a === 'unpublish' ? EyeOff : Trash2,
      variant: a === 'delete' ? ('danger' as const) : ('secondary' as const),
    })),
)

async function runBulk(action: string) {
  const ids = [...selected.value]
  const n = ids.length
  if (action === 'delete') {
    const ok = await confirm({
      title: t('list.bulkDeleteTitle', { n }),
      description: t('confirm.deleteBody'),
      confirmLabel: t('common.delete'),
      variant: 'danger',
    })
    if (!ok) return
  }
  busy.value = action
  try {
    if (action === 'delete') await repo.remove(ids)
    else await repo.updateMany(ids, { status: action === 'publish' ? 'published' : 'draft' })
    toast.success(
      t(
        action === 'delete'
          ? 'list.bulkDeleted'
          : action === 'publish'
            ? 'list.bulkPublished'
            : 'list.bulkUnpublished',
        { n },
      ),
    )
    selected.value = []
    await load()
    refreshBadges()
  } catch {
    toast.error(t('toast.saveFailed'))
  } finally {
    busy.value = undefined
  }
}

// Delete one row from its trash icon — always confirmed first.
async function deleteRow(row: Row) {
  const name = String(row[props.config.displayField] ?? '')
  const ok = await confirm({
    title: t('confirm.deleteTitle'),
    description: `“${name}” · ${t('confirm.deleteBody')}`,
    confirmLabel: t('common.delete'),
    variant: 'danger',
  })
  if (!ok) return
  try {
    await repo.remove([row.id])
    selected.value = selected.value.filter((id) => id !== row.id)
    toast.success(t('detail.deleted'))
    await load()
    refreshBadges()
  } catch {
    toast.error(t('toast.saveFailed'))
  }
}

const page = computed({
  get: () => result.value.page,
  set: (p: number) => setQuery({ page: p }, true),
})
const pageSize = computed({
  get: () => query.value.pageSize,
  set: (s: number) => setQuery({ pageSize: s }),
})
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-5">
    <!-- No visible heading (design): the breadcrumb says where we are. -->
    <h1 class="sr-only">{{ title }}</h1>

    <div
      v-if="spec.statCards.length"
      class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
      role="group"
      :aria-label="title"
    >
      <StatCard
        v-for="card in orderedStatCards"
        :key="card.key"
        v-bind="cardOrder.bind(card.key)"
        :label="t(`${base}.stat.${card.key}`)"
        :value="number(counts[card.key] ?? 0)"
        :active="activeStat === card.key"
        :loading="loading"
        @click="clickStat(card.key)"
      />
    </div>

    <div class="flex flex-wrap items-center gap-3">
      <SearchInput
        v-model="search"
        :label="t('list.searchIn', { title })"
        class="w-full max-w-md flex-1"
      />
      <div class="ml-auto">
        <Button v-if="can('create', config.key)" @click="navigateTo(`/${config.key}/new`)">
          <template #icon><Plus class="size-4" :stroke-width="1.75" aria-hidden="true" /></template>
          {{ t('list.new') }}
        </Button>
      </div>
    </div>

    <FilterChips :chips="chips" @remove="removeChip" @clear="clearAll" />

    <div
      v-if="failed"
      class="rounded-md border border-danger/40 bg-surface p-6 text-center"
      role="alert"
    >
      <p class="font-brand font-semibold">{{ t('common.loadError') }}</p>
      <Button variant="secondary" class="mt-3" @click="load">{{ t('common.retry') }}</Button>
    </div>

    <DataTable
      v-else
      v-model:selected="selected"
      :columns="columns"
      :rows="result.rows"
      :loading="loading"
      :selectable="bulkActions.length > 0"
      :actions-label="t('common.actions')"
      :caption="title"
      clickable-rows
      @row-click="(row: Row) => navigateTo(detailHref(row))"
    >
      <template v-for="col in spec.columns" :key="col.key" #[`header-${col.key}`]>
        <ColumnFilterMenu
          v-if="col.filter"
          :label="columnLabel(col.key)"
          :kind="col.filter"
          :options="col.filter === 'values' ? filterOptions(col.key) : undefined"
          :sort-dir="query.sort?.key === col.key ? query.sort.dir : undefined"
          :model-value="query.filters[col.key]"
          @update:model-value="(f: ColumnFilter | undefined) => setFilter(col.key, f)"
          @sort="(dir: SortDir) => setSort(col.key, dir)"
        />
        <span v-else>{{ columnLabel(col.key) }}</span>
      </template>

      <template v-for="col in spec.columns" :key="col.key" #[`cell-${col.key}`]="{ row, value }">
        <template v-if="col.format === 'image'">
          <img
            v-if="value"
            :src="String(value)"
            alt=""
            class="size-9 border border-border object-cover"
            :class="config.profile ? 'rounded-full' : 'rounded-sm'"
          />
          <!-- people get circles, everything else a rounded square -->
          <span
            v-else
            class="flex size-9 items-center justify-center bg-nav-active font-brand font-bold text-brand uppercase"
            :class="config.profile ? 'rounded-full' : 'rounded-sm'"
            aria-hidden="true"
          >
            {{ String((row as Row)[config.displayField] ?? '').slice(0, 1) }}
          </span>
        </template>
        <NuxtLink
          v-else-if="col.primary"
          :to="detailHref(row as Row)"
          class="font-semibold text-text hover:text-brand hover:underline"
        >
          {{ value }}
        </NuxtLink>
        <span
          v-else-if="col.format === 'status'"
          class="inline-flex items-center gap-1.5 rounded-full whitespace-nowrap px-2.5 py-0.5 text-xs font-semibold"
          :class="
            value === 'published' ? 'bg-success/10 text-[#1F7A44]' : 'bg-surface-sunken text-muted'
          "
        >
          <span
            class="size-1.5 rounded-full"
            :class="value === 'published' ? 'bg-success' : 'bg-muted'"
          />
          {{ t(`status.${value}`) }}
        </span>
        <span v-else-if="col.format === 'date'" class="whitespace-nowrap">{{ date(value) }}</span>
        <template v-else-if="col.format === 'number'">{{ number(value) }}</template>
        <template v-else-if="col.format === 'enum' && col.enumI18n">{{
          value ? t(`${col.enumI18n}.${value}`) : '—'
        }}</template>
        <template v-else>{{ value ?? '—' }}</template>
      </template>

      <template #actions="{ row }">
        <NuxtLink
          :to="can('update', config.key) ? editHref(row as Row) : detailHref(row as Row)"
          class="inline-flex min-h-hit items-center gap-1.5 rounded-sm px-3 font-brand font-medium text-brand hover:bg-nav-active"
        >
          <Pencil
            v-if="can('update', config.key)"
            class="size-4"
            :stroke-width="1.75"
            aria-hidden="true"
          />
          {{ can('update', config.key) ? t('list.edit') : t('list.view') }}
        </NuxtLink>
        <button
          v-if="can('delete', config.key)"
          type="button"
          :aria-label="`${t('common.delete')} ${(row as Row)[config.displayField]}`"
          class="inline-flex size-hit items-center justify-center rounded-sm align-middle text-muted hover:bg-danger/10 hover:text-danger"
          @click="deleteRow(row as Row)"
        >
          <Trash2 class="size-4" :stroke-width="1.75" aria-hidden="true" />
        </button>
      </template>

      <template #empty>
        <EmptyState v-if="hasFilters" variant="no-result" @action="clearAll" />
        <EmptyState
          v-else
          variant="no-data"
          :hide-action="!can('create', config.key)"
          @action="navigateTo(`/${config.key}/new`)"
        />
      </template>
    </DataTable>

    <Pagination
      v-if="!loading && !failed && result.total > 0"
      v-model:page="page"
      v-model:page-size="pageSize"
      :total="result.total"
      :page-count="result.pageCount"
      :page-sizes="PAGE_SIZES"
      :locale="locale"
    />

    <BulkActionBar
      :count="selected.length"
      :actions="bulkActions"
      :busy="busy"
      @action="runBulk"
      @clear="selected = []"
    />
  </div>
</template>
