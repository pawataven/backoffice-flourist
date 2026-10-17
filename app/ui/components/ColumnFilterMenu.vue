<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { ArrowDownAZ, ArrowUpZA, ChevronDown, ListFilter } from '@lucide/vue'
import type { ColumnFilter, ColumnFilterKind, SortDir } from '../../lib/core'
import { ICON_STROKE } from '../icons'
import Checkbox from './Checkbox.vue'
import Button from './Button.vue'

// §4.3 Excel-style header menu: sort A→Z / Z→A, search inside the values, a checkbox per
// distinct value with "select all", and Clear. Number / date columns get a from–to range.
// `undefined` filter = everything selected (no filter).
const props = defineProps<{
  label: string
  kind: ColumnFilterKind
  /** Distinct values with counts (values kind). */
  options?: Array<{ value: string; count: number; label?: string }>
  sortDir?: SortDir
}>()
const emit = defineEmits<{ sort: [dir: SortDir] }>()
const filter = defineModel<ColumnFilter | undefined>()

const { t } = useI18n()
const search = ref('')
const active = computed(() => !!filter.value || !!props.sortDir)

const labelOf = (o: { value: string; label?: string }) => o.label ?? (o.value || t('common.blank'))
const visible = computed(() => {
  const q = search.value.trim().toLocaleLowerCase()
  return (props.options ?? []).filter((o) => !q || labelOf(o).toLocaleLowerCase().includes(q))
})

const selected = computed<string[]>(() =>
  filter.value?.kind === 'values' ? filter.value.values : (props.options ?? []).map((o) => o.value),
)
function setSelected(values: string[]) {
  const all = props.options ?? []
  filter.value = values.length === all.length ? undefined : { kind: 'values', values }
}
function toggle(value: string, on: boolean | 'indeterminate') {
  const set = new Set(selected.value)
  if (on === true) set.add(value)
  else set.delete(value)
  setSelected((props.options ?? []).map((o) => o.value).filter((v) => set.has(v)))
}
const allState = computed<boolean | 'indeterminate'>(() => {
  const n = visible.value.filter((o) => selected.value.includes(o.value)).length
  return n === 0 ? false : n === visible.value.length ? true : 'indeterminate'
})
function toggleAll(on: boolean | 'indeterminate') {
  const set = new Set(selected.value)
  for (const o of visible.value) {
    if (on === true) set.add(o.value)
    else set.delete(o.value)
  }
  setSelected((props.options ?? []).map((o) => o.value).filter((v) => set.has(v)))
}

const range = computed(() => (filter.value?.kind === 'range' ? filter.value : { from: '', to: '' }))
function setRange(part: 'from' | 'to', value: string) {
  const next = {
    kind: 'range' as const,
    from: range.value.from || undefined,
    to: range.value.to || undefined,
  }
  next[part] = value || undefined
  filter.value = next.from || next.to ? next : undefined
}

const inputClass =
  'block min-h-hit w-full rounded-sm border border-border bg-surface px-2 outline-none focus:border-brand focus:ring-2 focus:ring-brand/20'
</script>

<template>
  <PopoverRoot @update:open="(o: boolean) => !o && (search = '')">
    <PopoverTrigger
      :aria-label="t('ui.filterBy', { label })"
      class="-mx-2 inline-flex min-h-hit items-center gap-1 rounded-sm px-2 font-brand font-semibold hover:bg-sidebar-hover data-[state=open]:bg-sidebar-active"
      :class="active ? 'text-accent' : ''"
    >
      {{ label }}
      <ListFilter v-if="active" class="size-3.5" :stroke-width="2.25" aria-hidden="true" />
      <ChevronDown
        v-else
        class="size-3.5 text-sidebar-muted"
        :stroke-width="2.25"
        aria-hidden="true"
      />
      <span v-if="active" class="sr-only">({{ t('ui.filterActive') }})</span>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        align="start"
        :side-offset="4"
        class="z-[60] w-64 rounded-md border border-border bg-surface p-2 font-normal shadow-lg"
      >
        <div class="flex flex-col">
          <button
            v-for="dir in ['asc', 'desc'] as const"
            :key="dir"
            type="button"
            class="flex min-h-10 items-center gap-2 rounded-[6px] px-2 text-left font-brand hover:bg-nav-active"
            :class="sortDir === dir ? 'text-brand' : ''"
            :aria-pressed="sortDir === dir"
            @click="emit('sort', dir)"
          >
            <component
              :is="dir === 'asc' ? ArrowDownAZ : ArrowUpZA"
              class="size-4"
              :stroke-width="ICON_STROKE"
              aria-hidden="true"
            />
            {{ t(dir === 'asc' ? 'ui.sortAsc' : 'ui.sortDesc') }}
          </button>
        </div>
        <hr class="my-2 border-border" />

        <template v-if="kind === 'values'">
          <input
            v-model="search"
            type="search"
            :placeholder="t('ui.searchValues')"
            :aria-label="t('ui.searchValues')"
            :class="inputClass"
          />
          <div class="mt-1 border-b border-border px-1">
            <Checkbox
              :model-value="allState"
              :label="t('common.selectAll')"
              @update:model-value="toggleAll"
            />
          </div>
          <ul class="max-h-56 overflow-y-auto px-1">
            <li v-for="o in visible" :key="o.value" class="flex items-center justify-between gap-2">
              <Checkbox
                :model-value="selected.includes(o.value)"
                :label="labelOf(o)"
                class="min-w-0"
                @update:model-value="(v: boolean | 'indeterminate') => toggle(o.value, v)"
              />
              <span class="text-xs text-muted tabular-nums">{{ o.count }}</span>
            </li>
            <li v-if="!visible.length" class="py-2 text-sm text-muted">{{ t('ui.noValues') }}</li>
          </ul>
        </template>

        <div v-else class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1 font-brand text-sm">
            {{ t('common.from') }}
            <input
              :type="kind === 'dateRange' ? 'date' : 'number'"
              :value="range.from ?? ''"
              :class="[inputClass, 'font-body tabular-nums']"
              @change="setRange('from', ($event.target as HTMLInputElement).value)"
            />
          </label>
          <label class="flex flex-col gap-1 font-brand text-sm">
            {{ t('common.to') }}
            <input
              :type="kind === 'dateRange' ? 'date' : 'number'"
              :value="range.to ?? ''"
              :class="[inputClass, 'font-body tabular-nums']"
              @change="setRange('to', ($event.target as HTMLInputElement).value)"
            />
          </label>
        </div>

        <div class="mt-2 flex justify-end">
          <Button variant="secondary" :disabled="!filter" @click="filter = undefined">
            {{ t('common.clear') }}
          </Button>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
