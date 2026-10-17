<script setup lang="ts">
// Mascot "น้องดาว": a cup of coffee with a star on its sleeve (espresso line + latte fill).
// Decorative by default; pass `label` when it carries meaning.
withDefaults(
  defineProps<{
    size?: number
    pose?: 'happy' | 'wave' | 'search' | 'sleep'
    label?: string
  }>(),
  { size: 96, pose: 'happy' },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 120 120"
    fill="none"
    stroke="var(--brand-primary)"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
    :role="label ? 'img' : undefined"
    :aria-label="label"
    :aria-hidden="label ? undefined : 'true'"
  >
    <!-- steam (none while asleep) -->
    <g v-if="pose !== 'sleep'" class="pr-steam" stroke-width="2.5">
      <path d="M48 24 C44 18 52 14 48 6" />
      <path d="M62 22 C58 15 66 11 62 3" />
      <path d="M76 24 C72 18 80 14 76 6" />
    </g>
    <!-- handle -->
    <path d="M92 50 C108 48 110 74 92 76" stroke-width="6" />
    <path d="M92 50 C108 48 110 74 92 76" stroke="var(--brand-accent)" stroke-width="2" />
    <!-- cup body: slightly wobbly, like a hand-drawn line -->
    <path
      d="M24 34 C46 31 74 31 96 34 C95 60 92 86 84 100 C72 106 48 106 36 100 C28 86 25 60 24 34 Z"
      fill="var(--brand-accent)"
    />
    <!-- coffee surface -->
    <ellipse cx="60" cy="34" rx="36" ry="5" fill="var(--brand-primary)" />
    <!-- sleeve with a star -->
    <path d="M27 72 C48 76 72 76 94 72 L91 86 C70 90 50 90 30 86 Z" fill="#fff" />
    <path
      d="M60 74.5 L61.8 78.6 L66.2 79 L62.8 81.8 L63.9 86 L60 83.7 L56.1 86 L57.2 81.8 L53.8 79 L58.2 78.6 Z"
      fill="var(--brand-primary)"
      stroke="none"
    />
    <!-- cheeks -->
    <ellipse cx="38" cy="62" rx="5" ry="3" fill="#fff" stroke="none" opacity="0.6" />
    <ellipse cx="82" cy="62" rx="5" ry="3" fill="#fff" stroke="none" opacity="0.6" />
    <!-- eyes -->
    <template v-if="pose === 'sleep'">
      <path d="M40 52 Q46 56 52 52" />
      <path d="M68 52 Q74 56 80 52" />
    </template>
    <template v-else>
      <circle cx="46" cy="51" r="4.5" fill="var(--brand-primary)" stroke="none" />
      <circle cx="74" cy="51" r="4.5" fill="var(--brand-primary)" stroke="none" />
      <circle cx="47.5" cy="49.5" r="1.4" fill="#fff" stroke="none" />
      <circle cx="75.5" cy="49.5" r="1.4" fill="#fff" stroke="none" />
    </template>
    <!-- mouth -->
    <path v-if="pose === 'search'" d="M55 64 Q60 61 65 64" />
    <path v-else-if="pose === 'sleep'" d="M56 63 Q60 66 64 63" />
    <path v-else d="M51 61 Q60 70 69 61" />
    <!-- arms -->
    <path d="M25 58 C15 60 11 68 15 75" />
    <path v-if="pose === 'wave'" d="M25 50 C14 44 10 34 14 26" />
    <!-- magnifier for "no result" -->
    <g v-if="pose === 'search'">
      <circle cx="16" cy="92" r="10" fill="#fff" />
      <path d="M9 99 L3 106" stroke-width="4" />
    </g>
    <!-- zzz -->
    <text
      v-if="pose === 'sleep'"
      x="84"
      y="22"
      fill="var(--brand-primary)"
      stroke="none"
      font-family="var(--font-brand)"
      font-weight="700"
      font-size="16"
    >
      z z
    </text>
  </svg>
</template>
