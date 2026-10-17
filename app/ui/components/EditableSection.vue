<script setup lang="ts">
import type { Component } from 'vue'
import { ICON_STROKE } from '../icons'

// §2: wraps one form section. `id` is what SectionNav / RelatedCard scroll to.
// `plain` drops the card border, for sections that sit together inside one form frame.
withDefaults(defineProps<{ id: string; title: string; icon?: Component; plain?: boolean }>(), {
  plain: false,
})
</script>

<template>
  <section
    :id="id"
    :aria-labelledby="`${id}-title`"
    class="scroll-mt-36"
    :class="plain ? 'p-6' : 'rounded-md border border-border bg-surface p-5'"
  >
    <h2 :id="`${id}-title`" class="mb-4 flex items-center gap-2 text-lg font-semibold">
      <component
        :is="icon"
        v-if="icon"
        class="size-5 text-brand"
        :stroke-width="ICON_STROKE"
        aria-hidden="true"
      />
      {{ title }}
    </h2>
    <slot />
  </section>
</template>
