<script setup lang="ts">
import { SettingsGrid } from '~/ui'
import { NuxtLink } from '#components'
import { settingsCategories } from '~/config/settings'

// §4.5: platform settings, admin only.
definePageMeta({ middleware: 'admin' })
const { t } = useI18n()
setBreadcrumb(() => [{ label: t('nav.settings') }])
useHead({ title: () => t('settings.title') })

const groups = computed(() => [
  {
    key: 'platform',
    label: t('settings.title'),
    items: settingsCategories.map((c) => ({
      key: c.key,
      title: t(`settings.categories.${c.key}.title`),
      description: t(`settings.categories.${c.key}.description`),
      icon: c.icon,
      href: `/settings/${c.key}`,
    })),
  },
])
</script>

<template>
  <!-- Just the card grid, like the wireframe; the breadcrumb says where we are. -->
  <div class="mx-auto max-w-7xl">
    <h1 class="sr-only">{{ t('settings.title') }}</h1>
    <SettingsGrid :groups="groups" :link-component="NuxtLink" />
  </div>
</template>
