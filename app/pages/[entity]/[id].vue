<script setup lang="ts">
import { findEntity } from '~/config/entities'

// `/:entity/:id` — detail / edit; `/:entity/new` — create (§4.4, §5).
const route = useRoute()
const config = computed(() => findEntity(String(route.params.entity)))
if (!config.value) throw createError({ statusCode: 404, fatal: true })
const id = computed(() => String(route.params.id))
// A view-only entity has no Create page, even by typing the URL.
if (config.value.readonly && id.value === 'new') {
  throw createError({ statusCode: 404, fatal: true })
}
</script>

<template>
  <DetailPage v-if="config" :id="id" :key="`${config.key}/${id}`" :config="config" />
</template>
