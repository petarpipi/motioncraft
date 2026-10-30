import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

type Setup<K extends string> = (conditions: Record<K, boolean>) => void | (() => void)

/**
 * A breakpoint-aware gsap.context. Same idea as gsap.matchMedia(), but it
 * removes its MediaQueryList listeners on cleanup — gsap.matchMedia().revert()
 * leaves one listener per query behind, which accumulated on every route visit.
 */
export function mediaContext<K extends string>(
  queries: Record<K, string>,
  setup: Setup<K>,
  scope?: Element | null,
) {
  const lists = (Object.entries(queries) as [K, string][]).map(
    ([key, query]) => [key, window.matchMedia(query)] as const,
  )
  let ctx: gsap.Context | undefined
  const build = (refresh: boolean) => {
    ctx?.revert()
    ctx = undefined
    const conditions = Object.fromEntries(
      lists.map(([key, list]) => [key, list.matches]),
    ) as Record<K, boolean>
    if (Object.values(conditions).some(Boolean))
      ctx = gsap.context(() => setup(conditions), scope ?? undefined)
    if (refresh) ScrollTrigger.refresh()
  }
  const onChange = () => build(true)
  build(false)
  lists.forEach(([, list]) => list.addEventListener('change', onChange))
  return () => {
    lists.forEach(([, list]) => list.removeEventListener('change', onChange))
    ctx?.revert()
  }
}
