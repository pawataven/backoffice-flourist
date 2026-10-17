<script setup lang="ts">
import { ToastHost } from '~/ui'

const { locale } = useI18n()
useHead({
  htmlAttrs: { lang: locale },
  titleTemplate: (title) => (title ? `${title} · ดอยดาว คาเฟ่` : 'ดอยดาว คาเฟ่ · Back Office'),
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <ToastHost />
  <ConfirmHost />
</template>
