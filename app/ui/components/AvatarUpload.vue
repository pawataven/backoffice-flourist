<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ImagePlus, Settings, Trash2 } from '@lucide/vue'
import { ICON_STROKE } from '../icons'

// Record image. `upload` sends the file to storage and returns its URL; without it the image
// is kept as a data URL (enough for the mock data source). `round` is the profile-picture look:
// a circle with a gear at its top-right to change the picture.
const props = defineProps<{
  alt: string
  /** Letter(s) shown when there is no image. */
  fallback?: string
  readonly?: boolean
  size?: number
  round?: boolean
  upload?: (file: File) => Promise<string>
}>()
const model = defineModel<string | null>({ default: null })

const { t } = useI18n()
const input = ref<HTMLInputElement>()
const busy = ref(false)

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  busy.value = true
  try {
    model.value = await (props.upload ?? readAsDataUrl)(file)
  } finally {
    busy.value = false
    if (input.value) input.value.value = ''
  }
}
</script>

<template>
  <div class="relative shrink-0" :style="{ width: `${size ?? 64}px`, height: `${size ?? 64}px` }">
    <img
      v-if="model"
      :src="model"
      :alt="alt"
      class="size-full border border-border object-cover"
      :class="round ? 'rounded-full' : 'rounded-md'"
    />
    <span
      v-else
      class="flex size-full items-center justify-center bg-nav-active font-brand font-bold text-brand uppercase"
      :class="round ? 'rounded-full border-2 border-brand/20' : 'rounded-md'"
      :style="{ fontSize: `${Math.round((size ?? 64) * 0.4)}px` }"
      aria-hidden="true"
    >
      {{ fallback }}
    </span>

    <template v-if="!readonly">
      <input
        ref="input"
        type="file"
        accept="image/*"
        class="sr-only"
        tabindex="-1"
        @change="onFile"
      />
      <button
        type="button"
        :aria-label="model ? t('common.changeImage') : t('common.uploadImage')"
        :disabled="busy"
        class="absolute flex size-8 items-center justify-center rounded-full border border-border bg-surface text-brand shadow-sm before:absolute before:-inset-1 hover:bg-nav-active"
        :class="round ? '-top-1 -right-1' : '-right-2 -bottom-2'"
        @click="input?.click()"
      >
        <component
          :is="round ? Settings : ImagePlus"
          class="size-4"
          :stroke-width="ICON_STROKE"
          aria-hidden="true"
        />
      </button>
      <button
        v-if="model"
        type="button"
        :aria-label="t('common.removeImage')"
        class="absolute flex size-7 items-center justify-center rounded-full border border-border bg-surface text-danger shadow-sm before:absolute before:-inset-1.5 hover:bg-surface-muted"
        :class="round ? '-bottom-1 -right-1' : '-top-2 -right-2'"
        @click="model = null"
      >
        <Trash2 class="size-3.5" :stroke-width="ICON_STROKE" aria-hidden="true" />
      </button>
    </template>
  </div>
</template>
