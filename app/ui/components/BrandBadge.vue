<script setup lang="ts">
import Mascot from './Mascot.vue'

// Logo + name. Used on /login and at the top of the sidebar (where `compact` hides the text
// until the sidebar expands).
withDefaults(
  defineProps<{
    subtitle?: string
    version?: string
    /** Text fades out; the mark keeps its place. */
    compact?: boolean
    /** On a dark panel (the espresso sidebar): white text. */
    inverse?: boolean
  }>(),
  { compact: false, inverse: false },
)
</script>

<template>
  <div class="flex min-w-0 items-center gap-3">
    <span
      class="flex size-10 shrink-0 items-center justify-center rounded-md bg-nav-active"
      aria-hidden="true"
    >
      <Mascot :size="34" pose="happy" />
    </span>
    <span
      class="min-w-0 leading-tight transition-opacity duration-150"
      :class="compact ? 'pointer-events-none opacity-0' : 'opacity-100'"
    >
      <span
        class="block truncate font-brand text-base font-bold"
        :class="inverse ? 'text-sidebar-fg' : 'text-brand'"
        >ดอยดาว คาเฟ่</span
      >
      <span
        v-if="subtitle || version"
        class="block truncate font-brand text-xs"
        :class="inverse ? 'text-sidebar-muted' : 'text-muted'"
      >
        {{ subtitle }}<template v-if="subtitle && version"> · </template>
        <span v-if="version" class="font-mono">{{ version }}</span>
      </span>
    </span>
  </div>
</template>
