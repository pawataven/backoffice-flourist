<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Menu } from '@lucide/vue'
import { ICON_STROKE } from '../icons'

// §3.1: Sidebar + Topbar (breadcrumb left, user menu right) + content.
// The sidebar is fixed; the content column reserves the collapsed rail (64px), or the full
// width when the sidebar is locked open. Touch devices get a ☰ button instead.
defineProps<{ sidebarLocked?: boolean }>()
const emit = defineEmits<{ openDrawer: [] }>()
const { t } = useI18n()
</script>

<template>
  <div class="min-h-dvh bg-surface-muted">
    <slot name="sidebar" />
    <div
      class="flex min-h-dvh flex-col transition-[padding] duration-150 [@media(hover:none)]:pl-0"
      :class="sidebarLocked ? 'pl-[var(--sidebar-expanded)]' : 'pl-[var(--sidebar-collapsed)]'"
    >
      <header
        class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-surface/95 px-4 backdrop-blur"
      >
        <button
          type="button"
          :aria-label="t('common.openMenu')"
          class="-ml-2 hidden size-hit items-center justify-center rounded-sm hover:bg-surface-muted [@media(hover:none)]:flex"
          @click="emit('openDrawer')"
        >
          <Menu class="size-5" :stroke-width="ICON_STROKE" aria-hidden="true" />
        </button>
        <div class="min-w-0 flex-1"><slot name="topbar" /></div>
        <slot name="topbar-end" />
      </header>
      <main id="main" class="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>
