<script setup lang="ts">
import type { Component } from 'vue'
import { ICON_STROKE } from '../icons'
import Skeleton from './Skeleton.vue'

// §2: a summary number; clicking scrolls to the related section.
const props = defineProps<{
  label: string
  value?: string | number
  icon?: Component
  /** Id of the section to scroll to. */
  target?: string
  loading?: boolean
}>()

function go(event: MouseEvent) {
  if (!props.target) return
  const el = document.getElementById(props.target)
  if (!el) return
  event.preventDefault()
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${props.target}`)
}
</script>

<template>
  <a
    :href="target ? `#${target}` : undefined"
    class="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface px-4 py-3 transition-colors"
    :class="target ? 'hover:border-brand/40 hover:bg-surface-muted' : ''"
    @click="go"
  >
    <span
      v-if="icon"
      class="flex size-10 shrink-0 items-center justify-center rounded-sm bg-nav-active text-brand"
    >
      <component :is="icon" class="size-5" :stroke-width="ICON_STROKE" aria-hidden="true" />
    </span>
    <span class="min-w-0">
      <span class="block truncate font-brand text-sm font-semibold text-muted">{{ label }}</span>
      <Skeleton v-if="loading" class="mt-1 h-6 w-10" />
      <span v-else class="block text-xl font-semibold tabular-nums">{{ value }}</span>
    </span>
  </a>
</template>
