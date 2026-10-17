<script setup lang="ts">
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from 'reka-ui'
import { useI18n } from 'vue-i18n'
import Button from './Button.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
    variant?: 'default' | 'danger'
    /** Shows a spinner on the confirm button while the parent runs the action. */
    loading?: boolean
  }>(),
  { variant: 'default', loading: false },
)
// Confirm does not close the dialog by itself: the parent sets `open` to false when its action is done.
const emit = defineEmits<{ confirm: [] }>()
const open = defineModel<boolean>('open', { default: false })

const { t } = useI18n()
</script>

<template>
  <AlertDialogRoot v-model:open="open">
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-40 bg-text/40" />
      <AlertDialogContent
        class="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-md bg-surface p-6 shadow-xl"
      >
        <AlertDialogTitle class="text-lg font-bold">{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description || $slots.default" class="mt-2 text-muted">
          <slot>{{ description }}</slot>
        </AlertDialogDescription>
        <div class="mt-6 flex justify-end gap-2">
          <AlertDialogCancel as-child>
            <Button variant="secondary" :disabled="loading">
              {{ cancelLabel ?? t('common.cancel') }}
            </Button>
          </AlertDialogCancel>
          <Button
            :variant="variant === 'danger' ? 'danger' : 'primary'"
            :loading="loading"
            @click="emit('confirm')"
          >
            {{ confirmLabel ?? t('common.confirm') }}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
