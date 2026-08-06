import type { Direction } from '@/shared/types'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useSegmentNavigation } from './useSegmentNavigation'

function setup({ dir = 'ltr', focused = null }: { dir?: Direction, focused?: number | null } = {}) {
  const segments = ['day', 'month', 'year'].map((part) => {
    const el = document.createElement('div')
    el.setAttribute('data-reka-date-field-segment', part)
    return el
  })

  const navigation = useSegmentNavigation({
    segmentElements: ref(new Set(segments)),
    currentFocusedElement: ref(focused === null ? null : segments[focused]),
    dir: ref(dir),
    segmentAttributes: ['data-reka-date-field-segment'],
  })

  return { segments, navigation }
}

describe('useSegmentNavigation', () => {
  it('resolves next/prev in DOM order in ltr', () => {
    const { segments, navigation } = setup({ focused: 1 })
    expect(navigation.nextFocusableSegment.value).toBe(segments[2])
    expect(navigation.prevFocusableSegment.value).toBe(segments[0])
  })

  it('resolves next/prev against DOM order in rtl', () => {
    const { segments, navigation } = setup({ dir: 'rtl', focused: 1 })
    expect(navigation.nextFocusableSegment.value).toBe(segments[0])
    expect(navigation.prevFocusableSegment.value).toBe(segments[2])
  })

  it('returns null past either end', () => {
    expect(setup({ focused: 2 }).navigation.nextFocusableSegment.value).toBeNull()
    expect(setup({ focused: 0 }).navigation.prevFocusableSegment.value).toBeNull()
    expect(setup({ dir: 'rtl', focused: 0 }).navigation.nextFocusableSegment.value).toBeNull()
    expect(setup({ dir: 'rtl', focused: 2 }).navigation.prevFocusableSegment.value).toBeNull()
  })

  it('returns null when no segment is focused, in both directions', () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const { navigation } = setup({ dir })
      expect(navigation.currentSegmentIndex.value).toBe(-1)
      expect(navigation.nextFocusableSegment.value).toBeNull()
      expect(navigation.prevFocusableSegment.value).toBeNull()
    }
  })

  it('focusNext advances in DOM order regardless of direction', () => {
    for (const dir of ['ltr', 'rtl'] as const) {
      const { segments, navigation } = setup({ dir, focused: 0 })
      const focus = vi.spyOn(segments[1], 'focus')
      navigation.focusNext()
      expect(focus).toHaveBeenCalledTimes(1)
    }
  })

  it('focusNext does nothing when no segment is focused', () => {
    const { segments, navigation } = setup()
    const spies = segments.map(el => vi.spyOn(el, 'focus'))
    navigation.focusNext()
    for (const spy of spies)
      expect(spy).not.toHaveBeenCalled()
  })
})
