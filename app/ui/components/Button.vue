<script setup lang="ts">
import { computed } from 'vue'
import { LoaderCircle } from '@lucide/vue'
import { ICON_STROKE } from '../icons'

export type ButtonVariant = 'primary' | 'secondary' | 'danger'

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant
    type?: 'button' | 'submit' | 'reset'
    loading?: boolean
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', loading: false, disabled: false },
)

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-on-primary hover:bg-brand-hover',
  secondary: 'border border-border bg-surface text-text hover:bg-surface-muted',
  danger: 'bg-danger text-on-primary hover:brightness-95',
}

// While loading the button is disabled, so a second click cannot fire the action twice.
const inactive = computed(() => props.disabled || props.loading)
</script>

<template>
  <button
    :type="type"
    :disabled="inactive"
    :aria-busy="loading || undefined"
    class="inline-flex min-h-hit min-w-hit items-center justify-center gap-2 rounded-sm px-4 font-brand font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50"
    :class="variantClass[variant]"
  >
    <LoaderCircle
      v-if="loading"
      class="size-4 shrink-0 animate-spin"
      :stroke-width="ICON_STROKE"
      aria-hidden="true"
    />
    <slot v-else name="icon" />
    <slot />
  </button>
</template>
