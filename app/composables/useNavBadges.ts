import { entities } from '~/config/entities'

/** Sidebar counts (e.g. drafts) per entity. Call `refresh()` after anything that changes them. */
export function useNavBadges() {
  const badges = useState<Record<string, number>>('navBadges', () => ({}))

  async function refresh() {
    const next: Record<string, number> = {}
    await Promise.all(
      entities
        .filter((e) => e.list.badge)
        .map(async (e) => {
          try {
            next[e.key] = e.list.badge!(await useEntityRepo(e.key).list())
          } catch {
            // A badge is a nicety; the page itself shows load errors.
          }
        }),
    )
    badges.value = next
  }

  return { badges, refresh }
}
