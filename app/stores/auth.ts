import { defineStore } from 'pinia'
import type { AuthSession } from '~/lib/api'

// §12.1: Pinia only for auth + operator prefs; page data lives in composables.
export const useAuthStore = defineStore('auth', () => {
  const session = ref<AuthSession | null>(null)
  const ready = ref(false)
  const operator = computed(() => session.value?.operator ?? null)

  async function init() {
    if (ready.value) return
    session.value = await useRepos().auth.getSession()
    ready.value = true
  }

  async function signIn(email: string, password: string, remember: boolean) {
    session.value = await useRepos().auth.signIn(email, password, remember)
  }

  async function signOut() {
    await useRepos().auth.signOut()
    session.value = null
  }

  return { session, operator, ready, init, signIn, signOut }
})
