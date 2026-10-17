<script setup lang="ts">
// §2: two columns; a field spans 1 or 2 (give it `class="sm:col-span-2"`). One column on narrow screens.
</script>

<template>
  <div class="grid gap-x-6 gap-y-4 sm:grid-cols-2">
    <slot />
  </div>
</template>
