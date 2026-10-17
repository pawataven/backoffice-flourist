// §4.5: settings are admin only. Others get a 403 page (they never see the menu item either).
export default defineNuxtRouteMiddleware(() => {
  const can = useCan()
  if (!can('read', 'settings')) {
    return abortNavigation(createError({ statusCode: 403, statusMessage: 'Forbidden' }))
  }
})
