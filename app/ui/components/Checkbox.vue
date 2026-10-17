<script setup lang="ts">
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { Check, Minus } from '@lucide/vue'
import { useId } from 'vue'

defineProps<{
  label?: string
  disabled?: boolean
  /** For a checkbox without a visible label (e.g. a table row). */
  ariaLabel?: string
}>()
const checked = defineModel<boolean | 'indeterminate'>({ default: false })

const id = useId()
</script>

<template>
  <div class="inline-flex min-h-hit items-center gap-2">
    <!-- The box is 20px; the invisible ::before grows the hit area to 40px (§1.3). -->
    <CheckboxRoot
      :id="id"
      v-model="checked"
      :disabled="disabled"
      :aria-label="ariaLabel"
      class="relative flex size-5 shrink-0 items-center justify-center rounded-[5px] border-2 border-muted bg-surface text-on-primary transition-colors before:absolute before:-inset-2.5 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=indeterminate]:border-brand data-[state=indeterminate]:bg-brand"
    >
      <CheckboxIndicator>
        <Minus v-if="checked === 'indeterminate'" class="size-3.5" :stroke-width="3" />
        <Check v-else class="size-3.5" :stroke-width="3" />
      </CheckboxIndicator>
    </CheckboxRoot>
    <label
      v-if="label || $slots.default"
      :for="id"
      class="font-brand font-medium select-none"
      :class="disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'"
    >
      <slot>{{ label }}</slot>
    </label>
  </div>
</template>
