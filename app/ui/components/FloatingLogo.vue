<script setup lang="ts">
import Mascot from './Mascot.vue'

// §2: floats up and down slowly (~3 s per cycle). Reused on 404 / loading.
withDefaults(defineProps<{ size?: number; pose?: 'happy' | 'wave' | 'search' | 'sleep' }>(), {
  size: 160,
  pose: 'wave',
})
</script>

<template>
  <div class="relative inline-flex flex-col items-center" aria-hidden="true">
    <div class="pr-float">
      <Mascot :size="size" :pose="pose" />
    </div>
    <!-- shadow shrinks as the mascot rises -->
    <div
      class="pr-float-shadow mt-2 h-3 rounded-[50%] bg-brand/15"
      :style="{ width: `${size * 0.55}px` }"
    />
  </div>
</template>
