<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Plus } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import Button from './Button.vue'
import Mascot from './Mascot.vue'

// no-data: nothing exists yet → invite to create. no-result: filters hid everything → offer to clear.
const props = defineProps<{
  variant: 'no-data' | 'no-result'
  title?: string
  description?: string
  actionLabel?: string
  /** Hide the button, e.g. for a viewer who cannot create. */
  hideAction?: boolean
}>()
const emit = defineEmits<{ action: [] }>()

const { t } = useI18n()
const isNoData = computed(() => props.variant === 'no-data')
</script>

<template>
  <div class="flex flex-col items-center px-4 py-12 text-center">
    <slot name="illustration">
      <div class="mb-4 flex size-28 items-center justify-center rounded-full bg-nav-active">
        <Mascot :size="88" :pose="isNoData ? 'wave' : 'search'" />
      </div>
    </slot>
    <h3 class="text-lg font-bold">
      {{ title ?? t(isNoData ? 'emptyState.noDataTitle' : 'emptyState.noResultTitle') }}
    </h3>
    <p class="mt-1 max-w-sm text-muted">
      {{ description ?? t(isNoData ? 'emptyState.noDataBody' : 'emptyState.noResultBody') }}
    </p>
    <Button
      v-if="!hideAction"
      class="mt-5"
      :variant="isNoData ? 'primary' : 'secondary'"
      @click="emit('action')"
    >
      <template v-if="isNoData" #icon>
        <Plus class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
      </template>
      {{ actionLabel ?? t(isNoData ? 'common.create' : 'common.clearFilters') }}
    </Button>
  </div>
</template>
