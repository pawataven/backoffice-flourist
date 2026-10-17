<script setup lang="ts">
import Skeleton from './Skeleton.vue'

// §2: a filter preset with its count. One active at a time; clicking the active card again
// clears it (the parent decides that — this only reports clicks).
defineProps<{ label: string; value?: number | string; active?: boolean; loading?: boolean }>()
defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    :aria-pressed="active"
    class="flex min-h-[76px] min-w-0 flex-col justify-between rounded-md border px-4 py-3 text-left transition-colors"
    :class="
      active
        ? 'border-brand bg-nav-active'
        : 'border-border bg-surface hover:border-brand/40 hover:bg-surface-muted'
    "
    @click="$emit('click')"
  >
    <span
      class="truncate font-brand text-sm font-semibold"
      :class="active ? 'text-brand' : 'text-muted'"
    >
      {{ label }}
    </span>
    <Skeleton v-if="loading" class="mt-1 h-7 w-12" />
    <span v-else class="text-2xl font-semibold tabular-nums" :class="active ? 'text-brand' : ''">
      {{ value }}
    </span>
  </button>
</template>
