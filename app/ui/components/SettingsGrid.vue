<script setup lang="ts">
import { computed } from 'vue'
import type { Component } from 'vue'
import SettingCard from './SettingCard.vue'
import type { LinkComponent } from '../types'

// §2: group headings only appear once there are more than 8 categories.
export interface SettingsGroup {
  key: string
  label: string
  items: Array<{
    key: string
    title: string
    description?: string
    icon: Component
    image?: string
    href: string
  }>
}

const props = withDefaults(
  defineProps<{ groups: SettingsGroup[]; linkComponent?: LinkComponent }>(),
  {
    linkComponent: 'a',
  },
)
const showHeadings = computed(() => props.groups.reduce((n, g) => n + g.items.length, 0) > 8)
</script>

<template>
  <div class="space-y-8">
    <section v-for="g in groups" :key="g.key">
      <h2
        v-if="showHeadings"
        class="mb-3 text-sm font-semibold tracking-wider text-muted uppercase"
      >
        {{ g.label }}
      </h2>
      <!-- at most 5 per row; cards stretch to fill it -->
      <ul class="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <li v-for="item in g.items" :key="item.key">
          <SettingCard v-bind="item" :link-component="linkComponent" />
        </li>
      </ul>
    </section>
  </div>
</template>
