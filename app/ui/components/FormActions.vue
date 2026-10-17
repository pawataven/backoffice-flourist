<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Pencil, Save, Trash2 } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import Button from './Button.vue'

// §5: Edit ↔ Cancel / Save, always in the same spot. Detail pages and settings tabs put it at the
// top right of the form, on the same line as the first section title (design).
defineProps<{
  editing: boolean
  canEdit?: boolean
  /** Shows Delete (red) while editing. Pages that delete from the list leave it off. */
  canDelete?: boolean
  saving?: boolean
  loading?: boolean
}>()
defineEmits<{ edit: []; cancel: []; save: []; delete: [] }>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-wrap items-center justify-end gap-2">
    <slot name="extra" />
    <template v-if="editing">
      <Button v-if="canDelete" variant="danger" :disabled="saving" @click="$emit('delete')">
        <template #icon>
          <Trash2 class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
        </template>
        {{ t('common.delete') }}
      </Button>
      <Button variant="secondary" :disabled="saving" @click="$emit('cancel')">
        {{ t('common.cancel') }}
      </Button>
      <Button :loading="saving" @click="$emit('save')">
        <template #icon>
          <Save class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
        </template>
        {{ t('common.save') }}
      </Button>
    </template>
    <!-- §5: viewers do not see Edit at all (not disabled) -->
    <Button v-else-if="canEdit" :disabled="loading" @click="$emit('edit')">
      <template #icon>
        <Pencil class="size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
      </template>
      {{ t('common.edit') }}
    </Button>
  </div>
</template>
