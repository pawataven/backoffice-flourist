import { readonly, ref } from 'vue'

export type ToastVariant = 'success' | 'error'

export interface ToastItem {
  id: number
  variant: ToastVariant
  message: string
}

// Module-level queue: any component can raise a toast; <ToastHost> renders them.
const items = ref<ToastItem[]>([])
let nextId = 1

function push(variant: ToastVariant, message: string) {
  items.value.push({ id: nextId++, variant, message })
}

function remove(id: number) {
  items.value = items.value.filter((item) => item.id !== id)
}

export function useToast() {
  return {
    items: readonly(items),
    /** `message` is already translated. */
    success: (message: string) => push('success', message),
    error: (message: string) => push('error', message),
    remove,
  }
}
