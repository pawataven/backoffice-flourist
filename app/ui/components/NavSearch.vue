<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SearchInput from './SearchInput.vue'
import type { NavEntry } from '../types'

// §2 NavSearch: matches the label and the Thai + English keywords, whatever the UI locale.
// Emits the filtered result list; ↑↓ move the highlight, Enter opens, Esc clears and blurs.
const props = defineProps<{ entries: NavEntry[]; shortcut?: string }>()
const emit = defineEmits<{
  results: [entries: NavEntry[] | null]
  highlight: [key: string | undefined]
  open: [entry: NavEntry]
  focusChange: [focused: boolean]
}>()
const query = defineModel<string>({ default: '' })

const { t } = useI18n()
const field = ref<InstanceType<typeof SearchInput>>()
const index = ref(0)

const normalize = (s: string) => s.toLocaleLowerCase().normalize('NFC').trim()

const results = computed(() => {
  const q = normalize(query.value)
  if (!q) return null
  return props.entries.filter((e) =>
    [e.label, ...(e.keywords ?? [])].some((text) => normalize(text).includes(q)),
  )
})

watch(results, (r) => {
  index.value = 0
  emit('results', r)
})
watch([results, index], ([r, i]) => emit('highlight', r?.[i]?.key), { immediate: true })

function onKeydown(event: KeyboardEvent) {
  const r = results.value
  if (event.key === 'Escape') {
    query.value = ''
    ;(event.target as HTMLElement).blur()
    return
  }
  if (!r?.length) return
  if (event.key === 'ArrowDown') index.value = (index.value + 1) % r.length
  else if (event.key === 'ArrowUp') index.value = (index.value - 1 + r.length) % r.length
  else if (event.key === 'Enter') emit('open', r[index.value]!)
  else return
  event.preventDefault()
}

defineExpose({ focus: () => field.value?.focus() })
</script>

<template>
  <SearchInput
    ref="field"
    v-model="query"
    :label="t('common.searchMenu')"
    :shortcut="shortcut"
    @keydown="onKeydown"
    @focusin="emit('focusChange', true)"
    @focusout="emit('focusChange', false)"
  />
</template>
