// Promise-based ConfirmDialog: `if (await confirm({...})) ...`. One <ConfirmHost> in app.vue renders it.

export interface ConfirmRequest {
  title: string
  description?: string
  confirmLabel?: string
  variant?: 'default' | 'danger'
}

interface ConfirmState extends ConfirmRequest {
  open: boolean
  resolve?: (ok: boolean) => void
}

export function useConfirmState() {
  return useState<ConfirmState>('confirm', () => ({ open: false, title: '' }))
}

export function useConfirm() {
  const state = useConfirmState()
  return (request: ConfirmRequest) =>
    new Promise<boolean>((resolve) => {
      state.value.resolve?.(false)
      state.value = { ...request, open: true, resolve }
    })
}
