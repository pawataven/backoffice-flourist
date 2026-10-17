<script setup lang="ts">
import { findEntity } from '~/config/entities'

// `/:entity` — every entity's list is this one page, configured by config/entities (§4.2).
const route = useRoute()
const config = computed(() => findEntity(String(route.params.entity)))
if (!config.value) throw createError({ statusCode: 404, fatal: true })
</script>

<template>
  <ListPage v-if="config" :key="config.key" :config="config" />
</template>
