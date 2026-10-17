<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import type { TabItem } from '../types'

// §2 Tabs: the parent keeps `active` in `?tab=`. `beforeChange` lets it ask for confirmation
// (§5: switching tabs while editing must be confirmed) — return false to stay.
const props = defineProps<{
  items: TabItem[]
  beforeChange?: (next: string) => boolean | Promise<boolean>
}>()
const active = defineModel<string>({ required: true })
const { t } = useI18n()

async function change(next: string | number) {
  const key = String(next)
  if (key === active.value) return
  if (props.beforeChange && !(await props.beforeChange(key))) return
  active.value = key
}
</script>

<template>
  <TabsRoot :model-value="active" @update:model-value="change">
    <!-- Folder tabs: the active one opens into the frame right below it (e.g. RecordForm `attached`). -->
    <TabsList class="flex flex-wrap gap-1 pl-3">
      <TabsTrigger
        v-for="item in items"
        :key="item.key"
        :value="item.key"
        class="relative z-10 -mb-px flex min-h-hit items-center gap-2 rounded-t-md border border-border bg-surface-sunken px-5 font-brand font-medium whitespace-nowrap text-muted hover:text-text data-[state=active]:border-b-surface data-[state=active]:bg-surface data-[state=active]:text-brand"
      >
        {{ item.label }}
        <span
          v-if="item.status"
          class="size-2 rounded-full"
          :class="item.status === 'error' ? 'bg-danger' : 'bg-brand'"
          aria-hidden="true"
        />
        <span v-if="item.status" class="sr-only">
          ({{ t(item.status === 'error' ? 'ui.statusError' : 'ui.statusDirty') }})
        </span>
      </TabsTrigger>
    </TabsList>
    <TabsContent v-for="item in items" :key="item.key" :value="item.key" class="outline-none">
      <slot :name="item.key" />
    </TabsContent>
  </TabsRoot>
</template>
