<script setup lang="ts">
import { AvatarUpload, SelectField, TextField } from '~/ui'
import type { I18nError } from '~/lib/core'
import type { FieldDef } from '~/config/types'

// Renders one config field with the matching shared component.
const props = defineProps<{
  field: FieldDef
  /** i18n base, e.g. 'entities.vocabulary' → entities.vocabulary.fields.word */
  labelBase: string
  readonly: boolean
  error: I18nError | null
  checking?: boolean
  /** `image` fields: letter shown while there is no picture. */
  fallback?: string
}>()
const model = defineModel<string>({ required: true })
const { t } = useI18n()

const label = computed(() => t(`${props.labelBase}.fields.${props.field.key}`))
const options = computed(() =>
  (props.field.options ?? []).map((value) => ({
    value,
    label: props.field.optionsI18n ? t(`${props.field.optionsI18n}.${value}`) : value,
  })),
)

// The form edits strings; AvatarUpload works with string | null.
const image = computed({
  get: () => model.value || null,
  set: (v: string | null) => (model.value = v ?? ''),
})

/** Pictures are shrunk to at most 320px before upload, so the mock's localStorage stays small. */
const MAX_SIDE = 320
async function upload(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('resize failed'))), 'image/jpeg', 0.85),
  )
  return useRepos().storage.upload(blob, { folder: props.labelBase })
}

const input = ref<{ focus: () => void }>()
const imageBox = ref<HTMLElement>()
defineExpose({
  focus: () => (props.field.type === 'image' ? imageBox.value?.focus() : input.value?.focus()),
})
</script>

<template>
  <!-- A picture: centred above the other fields, like the profile wireframe. -->
  <div
    v-if="field.type === 'image'"
    ref="imageBox"
    tabindex="-1"
    class="flex flex-col items-center gap-2 py-2 outline-none"
  >
    <AvatarUpload
      v-model="image"
      :alt="label"
      :fallback="fallback"
      :readonly="readonly"
      :round="field.round"
      :size="112"
      :upload="upload"
    />
    <span class="font-brand text-sm font-semibold text-muted">{{ label }}</span>
  </div>
  <SelectField
    v-else-if="field.type === 'enum'"
    ref="input"
    v-model="model"
    :label="label"
    :options="options"
    :required="field.required"
    :readonly="readonly"
    :error="error"
  />
  <TextField
    v-else
    ref="input"
    v-model="model"
    :label="label"
    :type="field.type"
    :required="field.required"
    :readonly="readonly"
    :error="error"
    :multiline="field.multiline"
    :checking="checking"
  />
</template>
