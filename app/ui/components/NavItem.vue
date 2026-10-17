<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Pin } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import type { LinkComponent, NavEntry } from '../types'

// §3.3: active = soft rounded background, no border. Colours come from the --sidebar-* tokens. The icon sits in a fixed 40px box inside
// the 64px rail, so it does not move when the sidebar expands (§3.2).
// The pin is always shown while the sidebar is open: filled = pinned, faint outline = not yet.
withDefaults(
  defineProps<{
    entry: NavEntry
    active?: boolean
    /** Sidebar is expanded: label, badge and pin button are visible. */
    open?: boolean
    pinned?: boolean
    pinnable?: boolean
    /** Keyboard-highlighted search result. */
    highlighted?: boolean
    linkComponent?: LinkComponent
  }>(),
  { linkComponent: 'a', pinnable: true },
)
defineEmits<{ togglePin: []; navigate: [] }>()

const { t } = useI18n()
</script>

<template>
  <li class="group/nav relative mx-3">
    <component
      :is="linkComponent"
      :href="entry.href"
      :aria-current="active ? 'page' : undefined"
      class="flex h-10 items-center gap-3 rounded-sm font-brand font-medium transition-colors"
      :class="[
        pinnable && open ? 'pr-10' : 'pr-2',
        active
          ? 'bg-sidebar-active font-semibold text-sidebar-fg'
          : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-sidebar-fg',
        highlighted ? 'ring-2 ring-sidebar-fg/60' : '',
      ]"
      @click="$emit('navigate')"
    >
      <span class="relative flex size-10 shrink-0 items-center justify-center">
        <component :is="entry.icon" class="size-5" :stroke-width="ICON_STROKE" aria-hidden="true" />
        <span
          v-if="entry.badge && !open"
          class="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent"
          aria-hidden="true"
        />
      </span>
      <span
        class="min-w-0 flex-1 truncate transition-opacity duration-150"
        :class="open ? 'opacity-100' : 'opacity-0'"
      >
        {{ entry.label }}
      </span>
      <span
        v-if="entry.badge"
        class="rounded-full bg-sidebar-active px-2 text-xs font-semibold text-sidebar-fg tabular-nums transition-opacity"
        :class="open ? 'opacity-100' : 'opacity-0'"
      >
        {{ entry.badge }}
      </span>
    </component>
    <button
      v-if="pinnable && open"
      type="button"
      :aria-label="t(pinned ? 'ui.unpin' : 'ui.pin', { label: entry.label })"
      :aria-pressed="pinned"
      class="absolute top-0 right-0 flex size-10 items-center justify-center rounded-sm hover:bg-sidebar-hover hover:text-sidebar-fg"
      :class="pinned ? 'text-sidebar-fg' : 'text-sidebar-muted/60'"
      @click="$emit('togglePin')"
    >
      <component
        :is="Pin"
        class="size-4"
        :fill="pinned ? 'currentColor' : 'none'"
        :stroke-width="ICON_STROKE"
        aria-hidden="true"
      />
    </button>
  </li>
</template>
