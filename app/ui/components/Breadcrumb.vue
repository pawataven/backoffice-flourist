<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ChevronRight } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import Skeleton from './Skeleton.vue'
import type { BreadcrumbItem, LinkComponent } from '../types'

// §2: shows the record's displayField (never its uuid); a skeleton while it loads.
withDefaults(defineProps<{ items: BreadcrumbItem[]; linkComponent?: LinkComponent }>(), {
  linkComponent: 'a',
})
const { t } = useI18n()
</script>

<template>
  <nav :aria-label="t('ui.breadcrumb')" class="min-w-0">
    <ol class="flex min-w-0 items-center gap-1 font-brand">
      <li v-for="(item, i) in items" :key="i" class="flex min-w-0 items-center gap-1">
        <ChevronRight
          v-if="i > 0"
          class="size-4 shrink-0 text-muted"
          :stroke-width="ICON_STROKE"
          aria-hidden="true"
        />
        <Skeleton v-if="item.loading" class="h-4 w-24" />
        <component
          :is="linkComponent"
          v-else-if="item.href && i < items.length - 1"
          :href="item.href"
          class="truncate rounded-[4px] px-1 font-medium text-muted hover:text-brand"
        >
          {{ item.label }}
        </component>
        <span
          v-else
          class="truncate px-1 font-semibold"
          :aria-current="i === items.length - 1 ? 'page' : undefined"
        >
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>
