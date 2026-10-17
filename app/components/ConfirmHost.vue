<script setup lang="ts">
import { ConfirmDialog } from '~/ui'

const state = useConfirmState()

function close(ok: boolean) {
  state.value.resolve?.(ok)
  state.value = { ...state.value, open: false, resolve: undefined }
}
</script>

<template>
  <ConfirmDialog
    :open="state.open"
    :title="state.title"
    :description="state.description"
    :confirm-label="state.confirmLabel"
    :variant="state.variant"
    @update:open="(o: boolean) => !o && close(false)"
    @confirm="close(true)"
  />
</template>
