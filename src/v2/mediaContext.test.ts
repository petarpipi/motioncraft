import { describe, expect, it, vi } from 'vitest'
import { mediaContext } from './mediaContext'

describe('mediaContext (L6 regression)', () => {
  it('removes every MediaQueryList listener it added and runs the setup cleanup', () => {
    const lists: { add: ReturnType<typeof vi.fn>; remove: ReturnType<typeof vi.fn> }[] = []
    vi.spyOn(window, 'matchMedia').mockImplementation((query: string) => {
      const add = vi.fn(),
        remove = vi.fn()
      lists.push({ add, remove })
      return {
        matches: query.includes('min-width'),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: add,
        removeEventListener: remove,
        dispatchEvent: vi.fn(),
      } as unknown as MediaQueryList
    })
    const cleanup = vi.fn()
    const setup = vi.fn(() => cleanup)
    const dispose = mediaContext(
      { wide: '(min-width: 768px)', narrow: '(max-width: 767px)' },
      setup,
    )
    expect(setup).toHaveBeenCalledWith({ wide: true, narrow: false })
    expect(lists).toHaveLength(2)
    dispose()
    expect(cleanup).toHaveBeenCalledTimes(1)
    lists.forEach(({ add, remove }) => {
      expect(add).toHaveBeenCalledTimes(1)
      expect(remove).toHaveBeenCalledWith('change', add.mock.calls[0][1])
    })
  })
})
