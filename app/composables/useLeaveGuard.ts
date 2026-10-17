/** §5: leaving with unsaved edits asks first — in-app navigation and closing the tab. */
export function useLeaveGuard(dirty: Ref<boolean> | ComputedRef<boolean>) {
  const confirm = useConfirm()
  const { t } = useI18n()

  onBeforeRouteLeave(async () => {
    if (!dirty.value) return true
    return confirm({
      title: t('detail.leaveTitle'),
      description: t('detail.leaveBody'),
      confirmLabel: t('detail.leaveAction'),
      variant: 'danger',
    })
  })

  const onBeforeUnload = (event: BeforeUnloadEvent) => {
    if (dirty.value) event.preventDefault()
  }
  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
}
