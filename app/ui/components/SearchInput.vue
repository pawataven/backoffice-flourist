<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Search, X } from '@lucide/vue'
import { ICON_STROKE } from '../icons'

// Used on list pages and inside NavSearch.
defineProps<{
  label: string
  placeholder?: string
  /** Keyboard hint shown at the end, e.g. "⌘K". */
  shortcut?: string
}>()
const model = defineModel<string>({ default: '' })
const { t } = useI18n()
const input = ref<HTMLInputElement>()

defineExpose({ focus: () => input.value?.focus(), input })
</script>

<template>
  <div class="relative flex min-w-0 items-center">
    <Search
      class="pointer-events-none absolute left-3 size-4 text-muted"
      :stroke-width="ICON_STROKE"
      aria-hidden="true"
    />
    <input
      ref="input"
      v-model="model"
      type="search"
      :aria-label="label"
      :placeholder="placeholder ?? label"
      class="block min-h-hit w-full min-w-0 rounded-sm border border-border bg-surface py-2 text-text pr-10 pl-9 outline-none placeholder:text-muted/80 focus:border-brand focus:ring-2 focus:ring-brand/20 [&::-webkit-search-cancel-button]:hidden"
    />
    <button
      v-if="model"
      type="button"
      :aria-label="t('common.clear')"
      class="absolute right-0 flex size-hit items-center justify-center text-muted hover:text-text"
      @click="((model = ''), input?.focus())"
    >
      <X class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
    </button>
    <kbd
      v-else-if="shortcut"
      class="pointer-events-none absolute right-2.5 rounded-[4px] border border-border bg-surface-muted px-1.5 font-mono text-[11px] text-muted"
    >
      {{ shortcut }}
    </kbd>
  </div>
</template>
