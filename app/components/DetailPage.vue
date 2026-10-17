<script setup lang="ts">
import { EmptyState, FormActions, ProfileCard, useToast } from '~/ui'
import { isRepoError } from '~/lib/api'
import type { EntityConfig } from '~/config/types'
import RecordForm from './RecordForm.vue'

// §4.4 / §5 DetailPage: one frame: SectionNav + FormGrid, with Edit at the
// top right of the sections (design: no header bar, no picture box). Whole-page edit: one save
// for everything.
// `id === 'new'` is Create: starts in edit mode with every field empty (DB defaults fill the rest).
const props = defineProps<{ config: EntityConfig; id: string }>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const can = useEntityCan(props.config)
const { refresh: refreshBadges } = useNavBadges()
const repo = useEntityRepo(props.config.key)

const base = computed(() => `entities.${props.config.key}`)
const isNew = computed(() => props.id === 'new')
const entityTitle = computed(() => t(`${base.value}.title`))

const form = useRecordForm(() => props.config.detail.sections, {
  isTaken: async (key, value) =>
    (await repo.list()).some((r) => r[key] === value && r.id !== props.id),
})
const record = ref<Record<string, unknown> | null>(null)
const loading = ref(!isNew.value)
const notFound = ref(false)
const saving = ref(false)
const formRef = ref<InstanceType<typeof RecordForm>>()

const displayName = computed(() => {
  if (isNew.value) return t('detail.new', { entity: t(`${base.value}.singular`) })
  return String(record.value?.[props.config.displayField] ?? '')
})
setBreadcrumb(() => [
  { label: entityTitle.value, href: `/${props.config.key}` },
  { label: t('list.list'), href: `/${props.config.key}` },
  { label: displayName.value, loading: loading.value },
])
useHead({ title: () => displayName.value || entityTitle.value })

async function load() {
  if (isNew.value) {
    form.load({})
    form.editing.value = true
    return
  }
  loading.value = true
  try {
    record.value = await repo.get(props.id)
    form.load(record.value)
    // The list's Edit link (?edit=1) opens straight into edit mode; a row click opens the view.
    if (route.query.edit === '1') {
      if (can('update', props.config.key)) form.editing.value = true
      router.replace({ query: { ...route.query, edit: undefined } })
    }
  } catch (error) {
    if (isRepoError(error) && error.code === 'NOT_FOUND') notFound.value = true
    else toast.error(t('common.loadError'))
  } finally {
    loading.value = false
  }
}
onMounted(load)

const originalImage = computed(() =>
  props.config.imageField
    ? ((record.value?.[props.config.imageField] as string | null) ?? null)
    : null,
)
const dirty = form.dirty
useLeaveGuard(dirty)

function edit() {
  form.reset()
  form.editing.value = true
}

async function cancel() {
  if (dirty.value) {
    const ok = await confirm({
      title: t('confirm.discardTitle'),
      description: t('confirm.discardBody'),
      confirmLabel: t('confirm.discardAction'),
      variant: 'danger',
    })
    if (!ok) return
  }
  if (isNew.value) {
    form.editing.value = false
    return navigateTo(`/${props.config.key}`)
  }
  form.reset()
  form.editing.value = false
}

async function save() {
  form.submitted.value = true
  if (form.errorCount.value > 0) {
    // §6.3: use the checks already done, jump to the first invalid field.
    formRef.value?.focusFirstError()
    return
  }
  saving.value = true
  try {
    const data = form.payload()
    if (isNew.value) {
      const created = await repo.create(data)
      form.editing.value = false
      toast.success(t('detail.created'))
      refreshBadges()
      // §5: after Create the URL becomes /:entity/:id
      return navigateTo(`/${props.config.key}/${created.id}`, { replace: true })
    }
    record.value = await repo.update(props.id, data)
    form.load(record.value)
    form.editing.value = false
    toast.success(t('toast.saved'))
    refreshBadges()
  } catch {
    toast.error(t('toast.saveFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <div v-if="notFound" class="rounded-md border border-border bg-surface">
      <EmptyState
        variant="no-result"
        :title="t('detail.notFoundTitle')"
        :description="t('detail.notFoundBody')"
        :action-label="t('common.back')"
        @action="navigateTo(`/${config.key}`)"
      />
    </div>

    <template v-else>
      <p
        v-if="form.submitted.value && form.errorCount.value > 0"
        class="mb-4 rounded-sm border border-danger/40 bg-danger/5 px-4 py-2 text-sm text-danger"
        role="alert"
      >
        {{ t('detail.fixErrors', { n: form.errorCount.value }) }}
      </p>

      <!-- People (config.profile): picture, UUID and name on top, as in the customer wireframe -->
      <ProfileCard
        v-if="config.profile && !isNew"
        :id="id"
        :name="displayName"
        :image="originalImage"
        :loading="loading"
        class="mb-4"
      />

      <!-- The record's name is in the breadcrumb (its uuid in the URL). Delete lives in the list
           (trash icon per row). -->
      <RecordForm
        ref="formRef"
        :sections="config.detail.sections"
        :form="form"
        :label-base="base"
        :image-fallback="
          String(form.draft[config.displayField] ?? '')
            .trim()
            .slice(0, 1)
        "
      >
        <template #actions>
          <FormActions
            :editing="form.editing.value"
            :loading="loading"
            :saving="saving"
            :can-edit="can('update', config.key)"
            @edit="edit"
            @cancel="cancel"
            @save="save"
          />
        </template>
      </RecordForm>
    </template>
  </div>
</template>
