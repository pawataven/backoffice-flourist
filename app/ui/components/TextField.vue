<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye, EyeOff, LoaderCircle } from '@lucide/vue'
import { sanitizeFieldInput } from '../../lib/core'
import type { FieldType, I18nError } from '../../lib/core'
import { ICON_STROKE } from '../icons'

export type TextFieldType = FieldType | 'password'

const props = withDefaults(
  defineProps<{
    label: string
    type?: TextFieldType
    required?: boolean
    /** View mode: a grey box like a disabled input (design), text still selectable. */
    readonly?: boolean
    disabled?: boolean
    /** The form decides when to show it (§6: not before the first save). */
    error?: I18nError | null
    hint?: string
    placeholder?: string
    autocomplete?: string
    /** Server-side check in progress (e.g. duplicate value), shows a spinner at the end. */
    checking?: boolean
    /** Long text (`text` type only): a textarea that grows with `rows`. */
    multiline?: boolean
    rows?: number
  }>(),
  { type: 'text', error: null },
)
const model = defineModel<string>({ default: '' })

const { t } = useI18n()
const id = useId()
const labelId = `${id}-label`
const errorId = `${id}-error`
const hintId = `${id}-hint`

const input = ref<HTMLInputElement | HTMLTextAreaElement>()
const showPassword = ref(false)

const inputMode = computed(() => {
  switch (props.type) {
    case 'phoneTH':
      return 'tel'
    case 'email':
      return 'email'
    case 'url':
      return 'url'
    case 'number':
      return 'decimal'
    default:
      return 'text'
  }
})

const valueClass = computed(() => {
  if (props.type === 'slug') return 'font-mono'
  if (props.type === 'number' || props.type === 'phoneTH') return 'tabular-nums'
  return ''
})

// Matches the template: the error replaces the hint while there is one.
const describedBy = computed(() => (props.error ? errorId : props.hint ? hintId : undefined))

// §6.1: characters the type does not allow never appear — covers typing and paste alike,
// because both end in an `input` event with the full new value.
function onInput(event: Event) {
  const el = event.target as HTMLInputElement | HTMLTextAreaElement
  if (props.type === 'password' || (event as InputEvent).isComposing) {
    model.value = el.value
    return
  }
  const clean = sanitizeFieldInput(props.type, el.value)
  if (clean !== el.value) {
    const caret = sanitizeFieldInput(props.type, el.value.slice(0, el.selectionStart ?? 0)).length
    el.value = clean
    el.setSelectionRange(caret, caret)
  }
  model.value = clean
}

defineExpose({
  /** Scrolls the label into view (it has scroll-margin-top) and focuses the input. */
  focus() {
    document.getElementById(labelId)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    input.value?.focus({ preventScroll: true })
  },
})
</script>

<template>
  <div class="flex flex-col gap-1">
    <component
      :is="readonly ? 'span' : 'label'"
      :id="labelId"
      :for="readonly ? undefined : id"
      class="scroll-mt-32 font-brand font-medium"
    >
      {{ label }}
      <span v-if="required && !readonly" class="text-danger" aria-hidden="true">*</span>
    </component>

    <!-- Looks like the disabled input, same size, so switching view ↔ edit does not shift the
         layout (§2). A <p>, not a disabled input, so the text stays selectable and readable. -->
    <p
      v-if="readonly"
      :aria-labelledby="labelId"
      class="flex min-h-hit cursor-default rounded-sm border border-border bg-surface-sunken px-3 break-words whitespace-pre-wrap text-text/80"
      :class="[
        valueClass,
        multiline ? 'min-h-28 items-start py-2' : 'items-center',
        model ? '' : 'text-muted',
      ]"
    >
      {{ type === 'password' ? '••••••••' : model || t('common.empty') }}
    </p>

    <textarea
      v-else-if="multiline"
      :id="id"
      ref="input"
      :value="model"
      :rows="rows ?? 4"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-required="required || undefined"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="block w-full resize-y rounded-sm border bg-surface px-3 py-2 outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-sunken"
      :class="error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border'"
      @input="onInput"
    />

    <div v-else class="relative">
      <input
        :id="id"
        ref="input"
        :type="type === 'password' && !showPassword ? 'password' : 'text'"
        :inputmode="inputMode"
        :value="model"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-required="required || undefined"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        class="block min-h-hit w-full rounded-sm border bg-surface px-3 transition-colors outline-none placeholder:text-muted/70 focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-muted"
        :class="[
          valueClass,
          error ? 'border-danger focus:border-danger focus:ring-danger/20' : 'border-border',
          type === 'password' || checking ? 'pr-11' : '',
        ]"
        @input="onInput"
      />
      <LoaderCircle
        v-if="checking"
        class="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-muted"
        :stroke-width="ICON_STROKE"
        aria-hidden="true"
      />
      <button
        v-else-if="type === 'password'"
        type="button"
        :aria-label="t(showPassword ? 'common.hidePassword' : 'common.showPassword')"
        :aria-pressed="showPassword"
        class="absolute top-0 right-0 flex size-hit items-center justify-center rounded-sm text-muted hover:text-text"
        @click="showPassword = !showPassword"
      >
        <component
          :is="showPassword ? EyeOff : Eye"
          class="size-4"
          :stroke-width="ICON_STROKE"
          aria-hidden="true"
        />
      </button>
    </div>

    <p v-if="error && !readonly" :id="errorId" class="text-sm text-danger">
      {{ t(error.key, error.params) }}
    </p>
    <p v-else-if="hint && !readonly" :id="hintId" class="text-sm text-muted">{{ hint }}</p>
  </div>
</template>
