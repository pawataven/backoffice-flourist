<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Copy } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import { useToast } from '../composables/useToast'
import Skeleton from './Skeleton.vue'

// Card at the top of a person's detail page: a large round picture, the UUID (copy) and the name.
const props = defineProps<{
  name: string
  id?: string
  image?: string | null
  loading?: boolean
}>()

const { t } = useI18n()
const toast = useToast()
const initial = computed(() => props.name.trim().slice(0, 1))

async function copyId() {
  if (!props.id) return
  await navigator.clipboard.writeText(props.id)
  toast.success(t('common.copied'))
}
</script>

<template>
  <section class="flex items-center gap-5 rounded-md border border-border bg-surface p-5">
    <img
      v-if="image"
      :src="image"
      alt=""
      class="size-20 shrink-0 rounded-full border border-border object-cover"
    />
    <span
      v-else
      class="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-brand/20 bg-nav-active font-brand text-3xl font-bold text-brand uppercase"
      aria-hidden="true"
    >
      {{ initial }}
    </span>
    <div class="min-w-0">
      <p v-if="id" class="flex items-center gap-1 text-sm text-muted">
        <span class="sr-only">{{ t('detail.uuid') }}</span>
        <code class="truncate font-mono">{{ id }}</code>
        <button
          type="button"
          :aria-label="`${t('common.copy')} ${t('detail.uuid')}`"
          class="relative flex size-7 shrink-0 items-center justify-center rounded-[6px] before:absolute before:-inset-1.5 hover:bg-surface-sunken hover:text-text"
          @click="copyId"
        >
          <Copy class="size-3.5" :stroke-width="ICON_STROKE" aria-hidden="true" />
        </button>
      </p>
      <Skeleton v-if="loading" class="mt-1 h-7 w-48" />
      <h1 v-else class="truncate text-2xl font-bold">{{ name }}</h1>
    </div>
  </section>
</template>
