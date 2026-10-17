<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import { Check, ChevronDown } from '@lucide/vue'
import type { I18nError } from '../../lib/core'
import { ICON_STROKE } from '../icons'

// The `enum` field type: same label / readonly / required / error behaviour as TextField.
export interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    label: string
    options: SelectOption[]
    required?: boolean
    readonly?: boolean
    disabled?: boolean
    error?: I18nError | null
    placeholder?: string
  }>(),
  { error: null },
)
const model = defineModel<string>({ default: '' })

const { t } = useI18n()
const id = useId()
const labelId = `${id}-label`
const errorId = `${id}-error`
const trigger = ref<{ $el: HTMLElement }>()

const selectedLabel = computed(() => props.options.find((o) => o.value === model.value)?.label)

defineExpose({
  focus() {
    document.getElementById(labelId)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    trigger.value?.$el.focus({ preventScroll: true })
  },
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <span :id="labelId" class="scroll-mt-32 font-brand font-medium">
      {{ label }}
      <span v-if="required && !readonly" class="text-danger" aria-hidden="true">*</span>
    </span>

    <p
      v-if="readonly"
      :aria-labelledby="labelId"
      class="flex min-h-hit cursor-default items-center rounded-sm border border-border bg-surface-sunken px-3 text-text/80"
      :class="selectedLabel ? '' : 'text-muted'"
    >
      {{ selectedLabel ?? t('common.empty') }}
    </p>

    <SelectRoot v-else v-model="model" :disabled="disabled">
      <SelectTrigger
        :id="id"
        ref="trigger"
        :aria-labelledby="labelId"
        :aria-required="required || undefined"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="error ? errorId : undefined"
        class="flex min-h-hit w-full items-center justify-between gap-2 rounded-sm border bg-surface px-3 text-left outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-sunken data-[placeholder]:text-muted/80"
        :class="error ? 'border-danger' : 'border-border'"
      >
        <SelectValue :placeholder="placeholder ?? t('ui.choose')" />
        <ChevronDown
          class="size-4 shrink-0 text-muted"
          :stroke-width="ICON_STROKE"
          aria-hidden="true"
        />
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="4"
          class="z-50 max-h-72 min-w-[var(--reka-select-trigger-width)] overflow-hidden rounded-sm border border-border bg-surface shadow-lg"
        >
          <SelectViewport class="p-1">
            <SelectItem
              v-for="o in options"
              :key="o.value"
              :value="o.value"
              class="relative flex min-h-hit cursor-pointer items-center rounded-[6px] pr-8 pl-3 outline-none select-none data-[highlighted]:bg-nav-active data-[state=checked]:font-medium data-[state=checked]:text-brand"
            >
              <SelectItemText>{{ o.label }}</SelectItemText>
              <SelectItemIndicator class="absolute right-2">
                <Check class="size-4" :stroke-width="ICON_STROKE" />
              </SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>

    <p v-if="error && !readonly" :id="errorId" class="text-sm text-danger">
      {{ t(error.key, error.params) }}
    </p>
  </div>
</template>
