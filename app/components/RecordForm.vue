<script setup lang="ts">
import { EditableSection, FormGrid, SectionNav } from '~/ui'
import type { SectionDef } from '~/config/types'
import type { RecordForm } from '~/composables/useRecordForm'
import FieldInput from './FieldInput.vue'

// One frame holding SectionNav (left panel) and the config sections (right), like a tab page.
// Used by DetailPage and settings tabs; `attached` squares the top-left corner under folder Tabs.
// The `actions` slot (Edit / Cancel / Save) sits at the top right of the sections, on the same
// line as the first section title — no bar across the frame (design). It stays in view while
// editing so Save is always reachable.
const props = defineProps<{
  sections: SectionDef[]
  form: RecordForm
  labelBase: string
  /** Prefix for section ids, so two forms on a page do not clash. */
  idPrefix?: string
  attached?: boolean
  /** Letter for `image` fields without a picture (e.g. the first letter of the name). */
  imageFallback?: string
}>()
const { t } = useI18n()

const sectionId = (key: string) => `${props.idPrefix ?? ''}${key}`
const navItems = computed(() =>
  props.sections.map((s) => ({
    key: sectionId(s.key),
    label: t(`${props.labelBase}.sections.${s.key}`),
    icon: s.icon,
    status: props.form.sectionStatus(s),
  })),
)

const inputs: Record<string, { focus: () => void } | null> = {}
defineExpose({
  /** §6.3: scroll to the first invalid field's label and focus it. */
  focusFirstError() {
    const key = props.form.firstErrorKey()
    if (key) inputs[key]?.focus()
  },
})
</script>

<template>
  <div
    class="rounded-md border border-border bg-surface"
    :class="attached ? 'rounded-tl-none' : ''"
  >
    <div class="lg:grid lg:grid-cols-[14rem_minmax(0,1fr)]">
      <div
        class="border-b border-border bg-surface-muted/60 p-3 lg:rounded-bl-md lg:border-r lg:border-b-0"
        :class="attached ? '' : 'lg:rounded-tl-md'"
      >
        <SectionNav :items="navItems" :style="{ '--section-nav-top': '4.5rem' }" />
      </div>
      <div class="min-w-0">
        <!-- Zero height: the buttons float over the first section's title row. -->
        <div
          v-if="$slots.actions"
          class="z-20 h-0"
          :class="form.editing.value ? 'sticky top-16' : ''"
        >
          <div class="flex justify-end px-6 pt-4">
            <div
              :class="form.editing.value ? 'rounded-sm bg-surface/95 shadow-sm backdrop-blur' : ''"
            >
              <slot name="actions" />
            </div>
          </div>
        </div>
        <div class="divide-y divide-border">
          <EditableSection
            v-for="s in sections"
            :id="sectionId(s.key)"
            :key="s.key"
            :title="t(`${labelBase}.sections.${s.key}`)"
            :icon="s.icon"
            plain
          >
            <FormGrid>
              <FieldInput
                v-for="f in s.fields"
                :key="f.key"
                :ref="(el) => (inputs[f.key] = el as { focus: () => void } | null)"
                v-model="form.draft[f.key]!"
                :field="f"
                :label-base="labelBase"
                :readonly="!form.editing.value"
                :error="form.visibleError(f.key)"
                :checking="form.checking[f.key]"
                :fallback="imageFallback"
                :class="f.span === 2 ? 'sm:col-span-2' : ''"
              />
            </FormGrid>
          </EditableSection>
        </div>
        <p v-if="form.editing.value" class="px-6 pb-5 text-sm text-muted">
          <span class="text-danger">*</span> {{ t('common.requiredHint') }}
        </p>
      </div>
    </div>
  </div>
</template>
