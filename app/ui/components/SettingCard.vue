<script setup lang="ts">
import type { Component } from 'vue'
import { ICON_STROKE } from '../icons'
import type { LinkComponent } from '../types'

// §2 SettingCard, portrait: a large picture area on top (an image when given, otherwise the
// icon), a divider, then a one-line title with at most two lines of description. Always 4:5, so
// every card in a row is the same size; the whole card is the link, with hover / focus states.
withDefaults(
  defineProps<{
    title: string
    description?: string
    icon: Component
    /** Picture for the top area instead of the icon. */
    image?: string
    href: string
    linkComponent?: LinkComponent
  }>(),
  { linkComponent: 'a' },
)
</script>

<template>
  <component
    :is="linkComponent"
    :href="href"
    class="group flex aspect-[4/5] flex-col overflow-hidden rounded-md border border-border bg-surface shadow-sm transition hover:-translate-y-0.5 hover:border-brand/50 hover:shadow-md"
  >
    <span
      class="flex min-h-0 flex-1 items-center justify-center bg-nav-active/60 text-brand transition-colors group-hover:bg-nav-active"
    >
      <img v-if="image" :src="image" alt="" class="size-full object-cover" />
      <component :is="icon" v-else class="size-16" :stroke-width="ICON_STROKE" aria-hidden="true" />
    </span>
    <span class="block border-t border-border px-5 py-4">
      <span class="block truncate font-brand text-lg font-semibold group-hover:text-brand">
        {{ title }}
      </span>
      <span v-if="description" class="line-clamp-2 min-h-[2lh] text-sm text-muted">
        {{ description }}
      </span>
    </span>
  </component>
</template>
