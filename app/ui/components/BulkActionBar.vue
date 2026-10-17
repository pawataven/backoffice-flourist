<script setup lang="ts">
import type { Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { X } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import Button from './Button.vue'
import type { ButtonVariant } from './Button.vue'

// §2: appears while rows are selected — Publish / Unpublish / Delete (or whatever the page passes).
defineProps<{
  count: number
  actions: Array<{ key: string; label: string; icon?: Component; variant?: ButtonVariant }>
  busy?: string
}>()
defineEmits<{ action: [key: string]; clear: [] }>()
const { t } = useI18n()
</script>

<template>
  <Transition
    enter-from-class="translate-y-4 opacity-0"
    leave-to-class="translate-y-4 opacity-0"
    enter-active-class="transition duration-150"
    leave-active-class="transition duration-150"
  >
    <div
      v-if="count > 0"
      role="region"
      :aria-label="t('ui.selected', { n: count })"
      class="sticky bottom-4 z-20 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-md bg-text py-2 pr-2 pl-4 text-on-primary shadow-xl"
    >
      <span class="font-brand font-semibold tabular-nums" aria-live="polite">
        {{ t('ui.selected', { n: count }) }}
      </span>
      <span class="mx-1 h-6 w-px bg-on-primary/25" aria-hidden="true" />
      <Button
        v-for="a in actions"
        :key="a.key"
        :variant="a.variant ?? 'secondary'"
        :loading="busy === a.key"
        :disabled="!!busy"
        @click="$emit('action', a.key)"
      >
        <template v-if="a.icon" #icon>
          <component :is="a.icon" class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
        </template>
        {{ a.label }}
      </Button>
      <button
        type="button"
        :aria-label="t('ui.clearSelection')"
        class="flex size-hit items-center justify-center rounded-sm hover:bg-on-primary/10"
        @click="$emit('clear')"
      >
        <X class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
      </button>
    </div>
  </Transition>
</template>
