<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuItemIndicator,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'reka-ui'
import { Check, ChevronDown, LogOut } from '@lucide/vue'
import { ICON_STROKE } from '../icons'
import type { UserMenuOperator } from '../types'

// §2 UserMenu: the operator's personal settings (language) + sign out.
// Platform settings live under /settings instead.
const props = defineProps<{ operator: UserMenuOperator }>()
const emit = defineEmits<{ logout: [] }>()
const locale = defineModel<'th' | 'en'>('locale', { required: true })

const { t } = useI18n()
const initial = computed(() => props.operator.display_name.slice(0, 1))

const item =
  'relative flex min-h-10 cursor-pointer items-center gap-2 rounded-[6px] pr-3 pl-8 font-brand outline-none select-none data-[highlighted]:bg-nav-active data-[disabled]:cursor-default data-[disabled]:opacity-50'
const label = 'px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-muted uppercase'
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      :aria-label="t('ui.userMenu')"
      class="flex min-h-hit items-center gap-2 rounded-sm py-1 pr-2 pl-1 hover:bg-surface-muted data-[state=open]:bg-nav-active"
    >
      <img
        v-if="operator.avatar_url"
        :src="operator.avatar_url"
        alt=""
        class="size-8 rounded-full object-cover"
      />
      <span
        v-else
        class="flex size-8 items-center justify-center rounded-full bg-brand font-brand font-bold text-on-primary"
        aria-hidden="true"
      >
        {{ initial }}
      </span>
      <span class="hidden font-brand font-medium sm:inline">{{ operator.display_name }}</span>
      <ChevronDown class="size-4 text-muted" :stroke-width="ICON_STROKE" aria-hidden="true" />
    </DropdownMenuTrigger>

    <DropdownMenuPortal>
      <DropdownMenuContent
        align="end"
        :side-offset="6"
        class="z-[70] w-64 rounded-md border border-border bg-surface p-1 shadow-lg"
      >
        <div class="px-3 py-2">
          <p class="truncate font-brand font-semibold">{{ operator.display_name }}</p>
          <p class="truncate text-sm text-muted">{{ operator.email }}</p>
          <p
            class="mt-1 inline-block rounded-full bg-nav-active px-2 text-xs font-medium text-brand"
          >
            {{ t(`ui.role.${operator.role}`) }}
          </p>
        </div>
        <DropdownMenuSeparator class="my-1 h-px bg-border" />

        <DropdownMenuLabel :class="label">{{ t('ui.language') }}</DropdownMenuLabel>
        <DropdownMenuRadioGroup v-model="locale">
          <DropdownMenuRadioItem
            v-for="code in ['th', 'en'] as const"
            :key="code"
            :value="code"
            :class="item"
          >
            <DropdownMenuItemIndicator class="absolute left-2">
              <Check class="size-4 text-brand" :stroke-width="ICON_STROKE" />
            </DropdownMenuItemIndicator>
            {{ t(`locale.${code}`) }}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator class="my-1 h-px bg-border" />
        <DropdownMenuItem :class="[item, 'text-danger']" @select="emit('logout')">
          <LogOut class="absolute left-2 size-4" :stroke-width="ICON_STROKE" aria-hidden="true" />
          {{ t('common.logout') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
