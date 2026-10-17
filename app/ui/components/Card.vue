<script setup lang="ts">
defineProps<{ title?: string }>()
</script>

<template>
  <section class="rounded-md border border-border bg-surface p-4">
    <h3 v-if="title || $slots.title" class="mb-3 text-base font-semibold">
      <slot name="title">{{ title }}</slot>
    </h3>
    <slot />
  </section>
</template>
