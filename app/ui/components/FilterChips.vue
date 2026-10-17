<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { X } from '@lucide/vue'

// §2: the filters in use, each removable, plus "clear all".
defineProps<{ chips: Array<{ key: string; label: string }> }>()
defineEmits<{ remove: [key: string]; clear: [] }>()
const { t } = useI18n()
</script>

<template>
  <div
    v-if="chips.length"
    class="flex flex-wrap items-center gap-2"
    role="group"
    :aria-label="t('ui.filterActive')"
  >
    <span
      v-for="chip in chips"
      :key="chip.key"
      class="inline-flex items-center gap-1 rounded-full border border-brand/30 bg-nav-active py-0.5 pr-1 pl-3 text-sm text-brand"
    >
      {{ chip.label }}
      <button
        type="button"
        :aria-label="`${t('common.clear')} ${chip.label}`"
        class="relative flex size-6 items-center justify-center rounded-full before:absolute before:-inset-2 hover:bg-brand/10"
        @click="$emit('remove', chip.key)"
      >
        <X class="size-3.5" :stroke-width="2.25" aria-hidden="true" />
      </button>
    </span>
    <button
      type="button"
      class="min-h-8 rounded-sm px-2 font-brand text-sm font-medium text-brand hover:underline"
      @click="$emit('clear')"
    >
      {{ t('common.clearAll') }}
    </button>
  </div>
</template>
