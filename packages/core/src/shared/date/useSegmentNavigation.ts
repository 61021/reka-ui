import type { Ref } from 'vue'
import type { Direction } from '@/shared/types'
import { computed } from 'vue'

export interface UseSegmentNavigationProps {
  /** The editable segment elements of the field, in DOM order */
  segmentElements: Ref<Set<HTMLElement>>
  /** The segment element that currently holds focus, if any */
  currentFocusedElement: Ref<HTMLElement | null>
  /** The writing direction of the field */
  dir: Ref<Direction>
  /** The data attributes that together identify a segment element within the field */
  segmentAttributes: string[]
}

export function useSegmentNavigation({ segmentElements, currentFocusedElement, dir, segmentAttributes }: UseSegmentNavigationProps) {
  const segments = computed(() => Array.from(segmentElements.value))

  const currentSegmentIndex = computed(() =>
    segments.value.findIndex(el =>
      segmentAttributes.every(attribute =>
        el.getAttribute(attribute) === currentFocusedElement.value?.getAttribute(attribute))))

  /** The segment `offset` positions away from the focused one, or `null` if there is none. */
  function segmentAt(offset: number) {
    if (currentSegmentIndex.value < 0)
      return null
    return segments.value[currentSegmentIndex.value + offset] ?? null
  }

  const nextFocusableSegment = computed(() => segmentAt(dir.value === 'rtl' ? -1 : 1))
  const prevFocusableSegment = computed(() => segmentAt(dir.value === 'rtl' ? 1 : -1))

  function focusNext() {
    // Auto-advance follows the segments' DOM order (the locale's format
    // order) regardless of writing direction; only arrow-key navigation is
    // direction-aware via nextFocusableSegment/prevFocusableSegment.
    segmentAt(1)?.focus()
  }

  return {
    currentSegmentIndex,
    nextFocusableSegment,
    prevFocusableSegment,
    focusNext,
  }
}
