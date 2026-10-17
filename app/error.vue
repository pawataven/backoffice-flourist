<script setup lang="ts">
import type { NuxtError } from '#app'
import { Button, FloatingLogo } from '~/ui'

// 404 / 403 page (§0: a place for the mascot).
const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()
const forbidden = computed(() => props.error.statusCode === 403)
useHead({ title: () => t(forbidden.value ? 'error.forbiddenTitle' : 'error.notFoundTitle') })
</script>

<template>
  <main
    class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-surface-muted px-4 text-center"
  >
    <FloatingLogo :size="140" :pose="forbidden ? 'sleep' : 'search'" />
    <p class="font-mono text-sm text-muted">{{ error.statusCode }}</p>
    <h1 class="text-3xl font-bold text-brand">
      {{ t(forbidden ? 'error.forbiddenTitle' : 'error.notFoundTitle') }}
    </h1>
    <p class="max-w-sm text-muted">
      {{ t(forbidden ? 'error.forbiddenBody' : 'error.notFoundBody') }}
    </p>
    <Button @click="clearError({ redirect: '/' })">{{ t('error.goHome') }}</Button>
  </main>
</template>
