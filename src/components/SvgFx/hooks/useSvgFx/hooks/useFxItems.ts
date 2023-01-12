import { useLayoutEffect, useCallback, useState, MutableRefObject } from 'react'
import { flatten } from 'ramda'
import { TFx, TFxWithBox } from '../types'
import { uid } from '../lib'
import { DEFAULT_FX_PROPS_MAP } from './useTickHandlers'
import { useMounted } from '../../useMounted'

type TFxPropMap = typeof DEFAULT_FX_PROPS_MAP
type TFxPropKey = keyof TFxPropMap

const getBoxes = (svg: SVGSVGElement, items: TFx[]) => {
  // Get bounding boxes
  const viewBox = svg?.viewBox.baseVal
  return items.map((item) => {
    const element = item.element as SVGPathElement
    const box = element.getBBox()

    if (!element.isConnected || (box.width === 0 && box.height === 0)) {
      throw new Error('Element not connected')
    }

    return {
      ...item,
      box: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height,
        xMid: box.x + (box.width - viewBox.width) * 0.5,
        yMid: box.y + (box.height - viewBox.height) * 0.5,
      },
    }
  })
}

export const useFxItems = (
  svgRef: MutableRefObject<SVGSVGElement | undefined | null>,
  { loading = false } = {},
) => {
  const [items, setItems] = useState<TFxWithBox[]>([])
  const mounted = useMounted()

  const updateItems = useCallback(() => {
    const svg = svgRef?.current
    if (!svg || !mounted.current) {
      return
    }

    const nextItems = Array.from(svg.querySelectorAll('[data-fx]')).map(
      (el) => {
        const element = el as SVGGraphicsElement
        const fxAttribute = element.getAttribute('data-fx')
        if (!fxAttribute) {
          return
        }
        try {
          const entries = Object.entries(
            JSON.parse(fxAttribute) as TFxPropMap,
          ).map(
            ([name, props]) =>
              [
                name,
                {
                  ...DEFAULT_FX_PROPS_MAP[name as TFxPropKey],
                  ...props,
                },
              ] as [TFxPropKey, TFxPropMap[TFxPropKey]],
          )
          const props = new Map(entries)

          if (props.size) {
            // Transform from center
            element.setAttribute('transform-origin', '50% 50%')
            return {
              id: uid(),
              element,
              props,
            }
          }

          // undefined items are removed by filter (line 82)
          return undefined
        } catch (err) {
          // data-fx is not json
        }
      },
    )

    const flatItems = flatten(nextItems).filter(Boolean) as TFx[]

    try {
      const itemsWithBoxes = getBoxes(svg, flatItems)
      setItems(itemsWithBoxes)
    } catch (err) {
      console.log(err)
      requestAnimationFrame(updateItems)
    }
  }, [svgRef, mounted])

  useLayoutEffect(() => {
    if (!svgRef.current || loading) {
      return
    }
    updateItems()
  }, [svgRef, loading, updateItems])

  return { items, updateItems }
}
