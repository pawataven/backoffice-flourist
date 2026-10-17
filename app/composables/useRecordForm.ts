import { validateField, fieldSchema } from '~/lib/core'
import type { I18nError } from '~/lib/core'
import type { SectionStatus } from '~/ui'
import type { FieldDef, SectionDef } from '~/config/types'

// §5 edit mode + §6 validation for one form (a detail page, or one settings tab).
// - Values are edited as strings; `payload()` converts them back (numbers, null for empty).
// - Every change is validated immediately, but errors only show after the first save attempt.
// - `unique` fields ask the server (debounced 400ms, spinner while checking).

type Values = Record<string, unknown>

export interface RecordFormOptions {
  /** Resolves true when `value` is already used by another record. */
  isTaken?: (key: string, value: string) => Promise<boolean>
}

const toForm = (v: unknown): string => (v === null || v === undefined ? '' : String(v))

export function useRecordForm(sections: () => SectionDef[], options: RecordFormOptions = {}) {
  const fields = computed<FieldDef[]>(() => sections().flatMap((s) => s.fields))
  const original = ref<Values>({})
  const draft = reactive<Record<string, string>>({})
  const editing = ref(false)
  const submitted = ref(false)
  const taken = reactive<Record<string, boolean>>({})
  const checking = reactive<Record<string, boolean>>({})

  function load(record: Values) {
    original.value = record
    reset()
  }
  function reset() {
    for (const f of fields.value) draft[f.key] = toForm(original.value[f.key])
    submitted.value = false
    for (const k of Object.keys(taken)) delete taken[k]
  }

  const dirtyKeys = computed(() =>
    fields.value.filter((f) => draft[f.key] !== toForm(original.value[f.key])).map((f) => f.key),
  )
  const dirty = computed(() => editing.value && dirtyKeys.value.length > 0)

  function check(f: FieldDef): I18nError | null {
    const value = draft[f.key] ?? ''
    if (f.type === 'enum' || f.type === 'image') {
      if (f.required && !value) return { key: 'validation.required', params: {} }
      return null
    }
    const error = validateField(f.type, value, { ...f.rules, required: f.required })
    if (error) return error
    if (f.unique && taken[f.key]) return { key: 'validation.duplicate', params: {} }
    return null
  }
  const errors = computed<Record<string, I18nError | null>>(() =>
    Object.fromEntries(fields.value.map((f) => [f.key, check(f)])),
  )
  const errorCount = computed(() => Object.values(errors.value).filter(Boolean).length)
  const visibleError = (key: string) => (submitted.value ? (errors.value[key] ?? null) : null)
  const firstErrorKey = () => fields.value.find((f) => errors.value[f.key])?.key

  function sectionStatus(section: SectionDef): SectionStatus {
    if (!editing.value) return undefined
    if (submitted.value && section.fields.some((f) => errors.value[f.key])) return 'error'
    if (section.fields.some((f) => dirtyKeys.value.includes(f.key))) return 'dirty'
    return undefined
  }

  // §6.5: duplicate checks, debounced.
  const timers: Record<string, ReturnType<typeof setTimeout>> = {}
  watch(
    () => fields.value.filter((f) => f.unique).map((f) => [f.key, draft[f.key]] as const),
    (pairs) => {
      if (!options.isTaken || !editing.value) return
      for (const [key, value] of pairs) {
        clearTimeout(timers[key])
        taken[key] = false
        if (!value || value === toForm(original.value[key])) {
          checking[key] = false
          continue
        }
        checking[key] = true
        timers[key] = setTimeout(async () => {
          taken[key] = await options.isTaken!(key, value!)
          checking[key] = false
        }, 400)
      }
    },
    { deep: true },
  )

  /** Typed values of every field (only call when there are no errors). */
  function payload(): Values {
    const out: Values = {}
    for (const f of fields.value) {
      const value = draft[f.key] ?? ''
      out[f.key] =
        f.type === 'enum' || f.type === 'image'
          ? value || null
          : fieldSchema(f.type, { ...f.rules, required: f.required }).parse(value)
    }
    return out
  }

  // Every field has a string from the start, so inputs never see undefined.
  reset()

  return {
    fields,
    original,
    draft,
    editing,
    submitted,
    dirty,
    dirtyKeys,
    errors,
    errorCount,
    checking,
    load,
    reset,
    visibleError,
    firstErrorKey,
    sectionStatus,
    payload,
  }
}

export type RecordForm = ReturnType<typeof useRecordForm>
