<script setup lang="ts" generic="Row extends Record<string, unknown>">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { FlexRender, getCoreRowModel, useVueTable } from '@tanstack/vue-table'
import type { ColumnDef, RowSelectionState } from '@tanstack/vue-table'
import Checkbox from './Checkbox.vue'
import Skeleton from './Skeleton.vue'

// §2 DataTable: row selection + an actions column. Filtering / sorting / paging happen before the
// rows arrive (see core's applyListQuery), so the table only renders and tracks selection.
// Slots: `header-<key>` (e.g. a ColumnFilterMenu), `cell-<key>` ({ row, value }), `actions` ({ row }),
// `empty`.
export interface DataColumn {
  key: string
  label: string
  align?: 'start' | 'end'
  /** Monospace + tabular numbers (ids, slugs, numbers — §1.2). */
  mono?: boolean
  numeric?: boolean
  class?: string
}

const props = withDefaults(
  defineProps<{
    columns: DataColumn[]
    rows: Row[]
    rowKey?: string
    selectable?: boolean
    loading?: boolean
    skeletonRows?: number
    /** Label of the actions column; omit to hide it. */
    actionsLabel?: string
    caption?: string
    /** The whole row opens the record (rowClick); links and buttons inside keep their own click. */
    clickableRows?: boolean
  }>(),
  { rowKey: 'id', skeletonRows: 8 },
)
const selected = defineModel<string[]>('selected', { default: () => [] })
const emit = defineEmits<{ rowClick: [row: Row] }>()

function onRowClick(row: Row, event: MouseEvent) {
  if (!props.clickableRows) return
  // A click on a link, button or checkbox in the row does only that.
  if ((event.target as HTMLElement).closest('a, button, input, label, [role=checkbox]')) return
  // Selecting text is not a click.
  if (window.getSelection()?.toString()) return
  emit('rowClick', row)
}

const { t } = useI18n()
const idOf = (row: Row) => String(row[props.rowKey])

const table = useVueTable({
  get data() {
    return props.rows
  },
  get columns(): ColumnDef<Row>[] {
    return props.columns.map((c) => ({
      id: c.key,
      accessorFn: (r: Row) => r[c.key],
      header: c.label,
    }))
  },
  getRowId: (row) => idOf(row),
  getCoreRowModel: getCoreRowModel(),
  enableRowSelection: true,
  state: {
    get rowSelection(): RowSelectionState {
      return Object.fromEntries(selected.value.map((id) => [id, true]))
    },
  },
  onRowSelectionChange: (updater) => {
    const current = Object.fromEntries(selected.value.map((id) => [id, true]))
    const next = typeof updater === 'function' ? updater(current) : updater
    selected.value = Object.keys(next).filter((k) => next[k])
  },
})

// Header checkbox covers the rows on this page; selection on other pages is kept.
const pageIds = computed(() => props.rows.map(idOf))
const pageState = computed<boolean | 'indeterminate'>(() => {
  const n = pageIds.value.filter((id) => selected.value.includes(id)).length
  return n === 0 ? false : n === pageIds.value.length ? true : 'indeterminate'
})
function togglePage(on: boolean | 'indeterminate') {
  const rest = selected.value.filter((id) => !pageIds.value.includes(id))
  selected.value = on === true ? [...rest, ...pageIds.value] : rest
}
function toggleRow(id: string, on: boolean | 'indeterminate') {
  selected.value = on === true ? [...selected.value, id] : selected.value.filter((x) => x !== id)
}

const colClass = (c: DataColumn) => [
  c.align === 'end' ? 'text-right' : 'text-left',
  c.mono ? 'font-mono text-sm' : '',
  c.numeric || c.mono ? 'tabular-nums' : '',
  c.class ?? '',
]
</script>

<template>
  <div class="overflow-x-auto rounded-md border border-border bg-surface">
    <table class="w-full border-collapse text-sm">
      <caption v-if="caption" class="sr-only">
        {{
          caption
        }}
      </caption>
      <thead class="bg-sidebar text-sidebar-fg">
        <tr>
          <th v-if="selectable" scope="col" class="w-12 pl-4">
            <Checkbox
              :model-value="rows.length ? pageState : false"
              :disabled="!rows.length"
              :aria-label="t('ui.selectPage')"
              @update:model-value="togglePage"
            />
          </th>
          <th
            v-for="c in columns"
            :key="c.key"
            scope="col"
            class="px-4 py-1 font-brand font-semibold whitespace-nowrap"
            :class="c.align === 'end' ? 'text-right' : 'text-left'"
          >
            <slot :name="`header-${c.key}`" :column="c">{{ c.label }}</slot>
          </th>
          <th v-if="actionsLabel" scope="col" class="px-4 text-right font-brand font-semibold">
            <span class="sr-only">{{ actionsLabel }}</span>
          </th>
        </tr>
      </thead>

      <tbody v-if="loading">
        <tr v-for="i in skeletonRows" :key="i" class="border-b border-border last:border-0">
          <td v-if="selectable" class="h-12 pl-4"><Skeleton class="size-5" /></td>
          <td v-for="c in columns" :key="c.key" class="px-4">
            <Skeleton
              class="h-4"
              :style="{ width: `${40 + ((i * 37 + c.key.length * 13) % 50)}%` }"
            />
          </td>
          <td v-if="actionsLabel" class="px-4"><Skeleton class="ml-auto h-4 w-12" /></td>
        </tr>
      </tbody>

      <tbody v-else-if="rows.length">
        <tr
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          class="border-b border-border transition-colors last:border-0 hover:bg-surface-muted"
          :class="[
            selected.includes(row.id) ? 'bg-nav-active/60' : '',
            clickableRows ? 'cursor-pointer' : '',
          ]"
          @click="onRowClick(row.original, $event)"
        >
          <td v-if="selectable" class="pl-4">
            <Checkbox
              :model-value="selected.includes(row.id)"
              :aria-label="t('ui.selectRow')"
              @update:model-value="(v: boolean | 'indeterminate') => toggleRow(row.id, v)"
            />
          </td>
          <td
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            class="h-12 px-4 py-2"
            :class="colClass(columns.find((c) => c.key === cell.column.id)!)"
          >
            <slot :name="`cell-${cell.column.id}`" :row="row.original" :value="cell.getValue()">
              <FlexRender :render="() => cell.getValue() ?? t('common.empty')" />
            </slot>
          </td>
          <td v-if="actionsLabel" class="px-4 text-right whitespace-nowrap">
            <slot name="actions" :row="row.original" />
          </td>
        </tr>
      </tbody>

      <tbody v-else>
        <tr>
          <td :colspan="columns.length + (selectable ? 1 : 0) + (actionsLabel ? 1 : 0)">
            <slot name="empty" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
