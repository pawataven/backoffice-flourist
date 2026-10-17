// Every page needs a session except /login. Real protection is RLS / the api (§0); this is UX.
export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()
  await auth.init()

  if (to.path === '/login') {
    if (auth.operator) return navigateTo(String(to.query.redirect ?? '/'))
    return
  }
  if (!auth.operator) {
    return navigateTo({
      path: '/login',
      query: to.fullPath !== '/' ? { redirect: to.fullPath } : {},
    })
  }
  await usePrefsStore().load(auth.operator.id)
})
