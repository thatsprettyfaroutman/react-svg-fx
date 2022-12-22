import { ResizeObserver } from '@juggle/resize-observer'
import useMeasure from 'react-use-measure'

export const usePolyfilledMeasure = (
  options: Parameters<typeof useMeasure>[0] = {},
) =>
  useMeasure({
    polyfill: ResizeObserver,
    ...options,
  })
