<script setup lang="ts">
import { ToastClose, ToastDescription, ToastProvider, ToastRoot, ToastViewport } from 'reka-ui'
import { CircleAlert, X } from '@lucide/vue'
import { useI18n } from 'vue-i18n'
import { ICON_STROKE } from '../icons'
import { useToast } from '../composables/useToast'
import Mascot from './Mascot.vue'

const { items, remove } = useToast()
const { t } = useI18n()
</script>

<template>
  <ToastProvider>
    <!-- Errors stay longer and are announced assertively; successes are polite. -->
    <ToastRoot
      v-for="item in items"
      :key="item.id"
      :type="item.variant === 'error' ? 'foreground' : 'background'"
      :duration="item.variant === 'error' ? 8000 : 4000"
      class="toast flex items-start gap-3 rounded-md border bg-surface p-3 pr-2 shadow-lg"
      :class="item.variant === 'error' ? 'border-danger' : 'border-success'"
      @update:open="(open: boolean) => !open && remove(item.id)"
    >
      <!-- §0: the mascot pops up on success -->
      <slot name="icon" :variant="item.variant">
        <Mascot v-if="item.variant === 'success'" :size="30" pose="happy" class="-my-1 shrink-0" />
        <CircleAlert
          v-else
          class="mt-0.5 size-5 shrink-0 text-danger"
          :stroke-width="ICON_STROKE"
          aria-hidden="true"
        />
      </slot>
      <ToastDescription class="flex-1 pt-px font-brand font-medium">
        {{ item.message }}
      </ToastDescription>
      <ToastClose
        :aria-label="t('common.dismiss')"
        class="-my-2 flex size-hit shrink-0 items-center justify-center rounded-sm text-muted hover:bg-surface-muted"
      >
        <X class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
      </ToastClose>
    </ToastRoot>
    <ToastViewport
      class="fixed right-0 bottom-0 z-[60] flex w-full max-w-sm flex-col gap-2 p-4 outline-none"
    />
  </ToastProvider>
</template>
