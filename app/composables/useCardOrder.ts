/**
 * Drag-to-reorder for a row of cards (stat cards, dashboard tiles). The order is a per-browser
 * convenience, so it lives in localStorage; keys it does not know (a card added later) go last.
 *
 *   const order = useCardOrder('menu', () => cards.map((c) => c.key))
 *   <StatCard v-for="key in order.keys.value" v-bind="order.bind(key)" … />
 */
export function useCardOrder(name: string, keys: () => string[]) {
  const storageKey = `cardOrder:${name}`
  const saved = ref<string[]>(read())
  const dragging = ref<string | null>(null)

  function read(): string[] {
    try {
      return JSON.parse(localStorage.getItem(storageKey) ?? '[]') as string[]
    } catch {
      return []
    }
  }
  function write(order: string[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(order))
    } catch {
      // Private mode / blocked storage: the order holds until reload.
    }
  }

  const ordered = computed(() => {
    const all = keys()
    const known = saved.value.filter((k) => all.includes(k))
    return [...known, ...all.filter((k) => !known.includes(k))]
  })

  /** Moves the dragged card to `target`'s place while dragging, so the row shows the result. */
  function moveTo(target: string) {
    const from = dragging.value
    if (!from || from === target) return
    const next = ordered.value.filter((k) => k !== from)
    next.splice(ordered.value.indexOf(target), 0, from)
    saved.value = next
  }

  function bind(key: string) {
    return {
      draggable: true,
      class: dragging.value === key ? 'opacity-40' : '',
      onDragstart: (event: DragEvent) => {
        dragging.value = key
        event.dataTransfer?.setData('text/plain', key)
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move'
      },
      onDragenter: () => moveTo(key),
      onDragover: (event: DragEvent) => event.preventDefault(),
      onDrop: (event: DragEvent) => event.preventDefault(),
      onDragend: () => {
        dragging.value = null
        write(saved.value)
      },
    }
  }

  return { keys: ordered, bind, dragging }
}
