<script setup lang="ts">
import { FormActions, Skeleton, Tabs, useToast } from '~/ui'
import { findSettingsCategory } from '~/config/settings'
import type { SettingsCategoryConfig } from '~/config/types'
import RecordForm from '~/components/RecordForm.vue'

// §4.6: /settings/:category. More than 4 sections → Tabs, each with SectionNav + form.
// §5 exception: edited one tab at a time (Edit / Save at the top right of each tab); switching tabs
// while editing asks first. Every save goes through a ConfirmDialog because it applies to all
// users immediately.
definePageMeta({ middleware: 'admin' })

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const confirm = useConfirm()
const repos = useRepos()

const found = findSettingsCategory(String(route.params.category))
if (!found) throw createError({ statusCode: 404, fatal: true })
const category: SettingsCategoryConfig = found
const labelBase = `settings.${category.key}`

// ?tab= keeps the active tab (§2 Tabs).
const activeTab = computed({
  get: () => {
    const tab = String(route.query.tab ?? '')
    return category.tabs.some((x) => x.key === tab) ? tab : category.tabs[0]!.key
  },
  set: (tab: string) => router.replace({ query: { ...route.query, tab } }),
})
const tab = computed(() => category.tabs.find((x) => x.key === activeTab.value)!)

setBreadcrumb(() => [
  { label: t('nav.settings'), href: '/settings' },
  { label: t(`settings.categories.${category.key}.title`), href: `/settings/${category.key}` },
  { label: t(`${labelBase}.tabs.${activeTab.value}`) },
])
useHead({ title: () => t(`settings.categories.${category.key}.title`) })

const values = ref<Record<string, unknown>>({})
const loading = ref(true)
const saving = ref(false)
const form = useRecordForm(() => tab.value.sections)
const formRef = ref<InstanceType<typeof RecordForm>>()

onMounted(async () => {
  try {
    values.value = await repos.settings.get<Record<string, unknown>>(category.settingKey)
    form.load(values.value)
  } catch {
    toast.error(t('common.loadError'))
  } finally {
    loading.value = false
  }
})
watch(activeTab, () => form.load(values.value))
useLeaveGuard(form.dirty)

async function discardIfNeeded(): Promise<boolean> {
  if (!form.dirty.value) return true
  return confirm({
    title: t('detail.switchTabTitle'),
    description: t('confirm.discardBody'),
    confirmLabel: t('confirm.discardAction'),
    variant: 'danger',
  })
}
async function beforeTabChange() {
  if (!(await discardIfNeeded())) return false
  form.editing.value = false
  return true
}

function edit() {
  form.reset()
  form.editing.value = true
}
async function cancel() {
  if (!(await discardIfNeeded())) return
  form.reset()
  form.editing.value = false
}
async function save() {
  form.submitted.value = true
  if (form.errorCount.value > 0) return formRef.value?.focusFirstError()
  const ok = await confirm({
    title: t('settings.confirmTitle'),
    description: t('settings.confirmBody'),
    confirmLabel: t('common.save'),
  })
  if (!ok) return
  saving.value = true
  try {
    values.value = await repos.settings.save(category.settingKey, {
      ...values.value,
      ...form.payload(),
    })
    form.load(values.value)
    form.editing.value = false
    toast.success(t('toast.saved'))
  } catch {
    toast.error(t('toast.saveFailed'))
  } finally {
    saving.value = false
  }
}

const tabItems = computed(() =>
  category.tabs.map((x) => ({
    key: x.key,
    label: t(`${labelBase}.tabs.${x.key}`),
    status:
      x.key === activeTab.value && form.editing.value
        ? form.sectionStatus({ key: x.key, icon: category.icon, fields: form.fields.value })
        : undefined,
  })),
)
</script>

<template>
  <div class="mx-auto max-w-6xl">
    <!-- No visible heading (design): the breadcrumb says where we are. -->
    <h1 class="sr-only">{{ t(`settings.categories.${category.key}.title`) }}</h1>

    <Tabs v-model="activeTab" :items="tabItems" :before-change="beforeTabChange">
      <template v-for="x in category.tabs" :key="x.key" #[x.key]>
        <div
          v-if="loading"
          class="space-y-4 rounded-md rounded-tl-none border border-border bg-surface p-6"
        >
          <Skeleton class="h-10 w-1/3" />
          <Skeleton class="h-32" />
        </div>
        <RecordForm
          v-else-if="x.key === activeTab"
          ref="formRef"
          :sections="x.sections"
          :form="form"
          :label-base="labelBase"
          :id-prefix="`${x.key}-`"
          attached
        >
          <!-- §5: each tab has its own Edit / Cancel / Save, top right of its sections -->
          <template #actions>
            <FormActions
              :editing="form.editing.value"
              :saving="saving"
              can-edit
              @edit="edit"
              @cancel="cancel"
              @save="save"
            />
          </template>
        </RecordForm>
      </template>
    </Tabs>
  </div>
</template>
