<script setup lang="ts">
import { BrandBadge, Button, Checkbox, TextField } from '~/ui'
import { validateField } from '~/lib/core'
import { isRepoError } from '~/lib/api'

// /login: split screen — a café photo on the left half, the sign-in form on the right.
// Remember = localStorage vs sessionStorage, one combined error message.
definePageMeta({ layout: 'auth' })

const { t } = useI18n()
useHead({ title: () => t('auth.title') })
const route = useRoute()
const auth = useAuthStore()
const isMock = useRuntimeConfig().public.dataSource === 'mock'

// Mock data source only: the form starts filled with the demo admin, and one click signs in as
// any role. With a real backend (dataSource=http) none of this exists.
const DEMO_PASSWORD = 'cafe1234'
const DEMO_DOMAIN = 'doidao.cafe'
const demoRoles = ['admin', 'editor', 'viewer'] as const
const email = ref(isMock ? `admin@${DEMO_DOMAIN}` : '')
const password = ref(isMock ? DEMO_PASSWORD : '')
const remember = ref(true)
const submitted = ref(false)
const loading = ref(false)
const failed = ref(false)

const emailError = computed(() =>
  submitted.value ? validateField('email', email.value, { required: true }) : null,
)
const passwordError = computed(() =>
  submitted.value && !password.value ? { key: 'validation.required', params: {} } : null,
)

const emailField = ref<{ focus: () => void }>()
const passwordField = ref<{ focus: () => void }>()

async function submit() {
  submitted.value = true
  failed.value = false
  if (emailError.value) return emailField.value?.focus()
  if (passwordError.value) return passwordField.value?.focus()
  loading.value = true
  try {
    await auth.signIn(email.value, password.value, remember.value === true)
    await navigateTo(String(route.query.redirect ?? '/'), { replace: true })
  } catch (error) {
    // §4.1: one message, never which part was wrong.
    failed.value = true
    if (!isRepoError(error) || error.code !== 'INVALID_CREDENTIALS') console.error(error)
  } finally {
    loading.value = false
  }
}

function signInAs(role: (typeof demoRoles)[number]) {
  email.value = `${role}@${DEMO_DOMAIN}`
  password.value = DEMO_PASSWORD
  return submit()
}
</script>

<template>
  <!-- Split screen: the café photo on the left half, the sign-in form on the right half.
       Under lg there is no room for the photo: just the logo above the form. -->
  <div class="flex min-h-dvh flex-col bg-surface lg:flex-row">
    <section class="relative hidden overflow-hidden bg-[#3b2416] lg:block lg:w-1/2">
      <!-- Photo: Louis Hansel on Unsplash (Unsplash License) -->
      <img src="/login-cafe.jpg" alt="" class="absolute inset-0 size-full object-cover" />
      <div
        class="absolute inset-0 bg-gradient-to-t from-[#2c1a10]/85 via-[#2c1a10]/20 to-[#2c1a10]/45"
      />
      <div class="absolute top-6 left-8">
        <BrandBadge subtitle="Back Office" inverse />
      </div>
      <div class="absolute right-8 bottom-10 left-8 text-white">
        <p class="font-brand text-3xl font-semibold">{{ t('auth.tagline') }}</p>
        <p class="mt-2 max-w-md text-white/80">{{ t('auth.taglineBody') }}</p>
      </div>
    </section>

    <section class="flex flex-1 items-center justify-center px-4 py-10 sm:px-8 lg:w-1/2">
      <form novalidate class="flex w-full max-w-sm flex-col gap-4" @submit.prevent="submit">
        <BrandBadge subtitle="Back Office" class="mb-4 lg:hidden" />
        <div>
          <h1 class="text-3xl font-bold text-brand">{{ t('auth.title') }}</h1>
          <p class="font-brand text-muted">{{ t('auth.subtitle') }}</p>
        </div>

        <p
          v-if="failed"
          role="alert"
          class="rounded-sm border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger"
        >
          {{ t('auth.invalid') }}
        </p>

        <TextField
          ref="emailField"
          v-model="email"
          type="email"
          :label="t('auth.email')"
          required
          autocomplete="username"
          :error="emailError"
        />
        <TextField
          ref="passwordField"
          v-model="password"
          type="password"
          :label="t('auth.password')"
          required
          autocomplete="current-password"
          :error="passwordError"
        />
        <Checkbox v-model="remember" :label="t('auth.remember')" />
        <Button type="submit" :loading="loading" class="w-full">{{ t('auth.submit') }}</Button>

        <div v-if="isMock" class="mt-2 border-t border-dashed border-border pt-4 text-center">
          <p class="text-xs text-muted">
            {{ t('auth.demo', { email: `admin@${DEMO_DOMAIN}`, password: DEMO_PASSWORD }) }}
          </p>
          <div class="mt-2 flex justify-center gap-2">
            <Button
              v-for="role in demoRoles"
              :key="role"
              variant="secondary"
              :disabled="loading"
              class="min-w-0 flex-1 px-1 text-sm"
              @click="signInAs(role)"
            >
              {{ t(`ui.role.${role}`) }}
            </Button>
          </div>
        </div>
      </form>
    </section>
  </div>
</template>
