<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ICON_STROKE } from '../icons'
import type { SectionNavItem } from '../types'

// §3.4: same quiet style as the sidebar. Sticky, scroll-spy (highlights the section in view),
// writes the URL hash, icon required, and a status dot: edited (Indigo) / has errors (danger).
const props = defineProps<{ items: SectionNavItem[] }>()
const { t } = useI18n()
const active = ref(props.items[0]?.key)

let observer: IntersectionObserver | undefined
const visible = new Map<string, boolean>()

function observe() {
  observer?.disconnect()
  visible.clear()
  // The band just under the sticky headers counts as "in view".
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting)
      const first = props.items.find((i) => visible.get(i.key))
      if (first) active.value = first.key
    },
    { rootMargin: '-140px 0px -55% 0px' },
  )
  for (const item of props.items) {
    const el = document.getElementById(item.key)
    if (el) observer.observe(el)
  }
}

function go(key: string) {
  const el = document.getElementById(key)
  if (!el) return
  active.value = key
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  history.replaceState(history.state, '', `#${key}`)
}

onMounted(() => {
  observe()
  const hash = decodeURIComponent(location.hash.slice(1))
  if (props.items.some((i) => i.key === hash)) setTimeout(() => go(hash), 50)
})
watch(
  () => props.items.map((i) => i.key).join(),
  () => setTimeout(observe, 0),
)
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <nav :aria-label="t('ui.sectionNav')" class="lg:sticky lg:top-[var(--section-nav-top,9rem)]">
    <!-- Narrow screens: one scrolling row. Side panel (lg): a column whose long labels wrap. -->
    <ul class="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
      <li v-for="item in items" :key="item.key">
        <a
          :href="`#${item.key}`"
          :aria-current="active === item.key ? 'location' : undefined"
          class="flex min-h-10 items-center gap-3 rounded-sm px-3 py-1.5 font-brand leading-snug font-medium whitespace-nowrap transition-colors lg:whitespace-normal"
          :class="active === item.key ? 'bg-nav-active text-brand' : 'text-text hover:bg-surface'"
          @click.prevent="go(item.key)"
        >
          <component
            :is="item.icon"
            class="size-4 shrink-0"
            :stroke-width="ICON_STROKE"
            aria-hidden="true"
          />
          <span class="flex-1">{{ item.label }}</span>
          <span
            v-if="item.status"
            class="size-2 shrink-0 rounded-full"
            :class="item.status === 'error' ? 'bg-danger' : 'bg-brand'"
          />
          <span v-if="item.status" class="sr-only">
            ({{ t(item.status === 'error' ? 'ui.statusError' : 'ui.statusDirty') }})
          </span>
        </a>
      </li>
    </ul>
  </nav>
</template>
