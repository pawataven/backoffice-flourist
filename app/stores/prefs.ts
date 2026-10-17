import { defineStore } from 'pinia'
import { DEFAULT_OPERATOR_PREFERENCES } from '~/lib/types'
import type { OperatorPreferences } from '~/lib/types'

// §3.2 / §9: pins, nav sort, sidebar lock and language follow the operator to every device
// (operator_preferences). Changes save after a short pause.
export const usePrefsStore = defineStore('prefs', () => {
  const prefs = ref<OperatorPreferences>({ ...DEFAULT_OPERATOR_PREFERENCES })
  const loadedFor = ref<string | null>(null)
  let timer: ReturnType<typeof setTimeout> | undefined

  async function load(operatorId: string) {
    if (loadedFor.value === operatorId) return
    prefs.value = await useRepos().preferences.get(operatorId)
    loadedFor.value = operatorId
  }

  function update(patch: Partial<OperatorPreferences>) {
    prefs.value = { ...prefs.value, ...patch }
    const id = loadedFor.value
    if (!id) return
    clearTimeout(timer)
    // Send a plain copy, not the reactive proxy.
    timer = setTimeout(() => useRepos().preferences.save(id, toRaw(prefs.value)), 300)
  }

  function reset() {
    loadedFor.value = null
    prefs.value = { ...DEFAULT_OPERATOR_PREFERENCES }
  }

  return { prefs, load, update, reset }
})
