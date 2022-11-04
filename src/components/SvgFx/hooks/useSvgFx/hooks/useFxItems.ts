import { useMemo, useLayoutEffect, useState, MutableRefObject } from 'react'
import { flatten } from 'ramda'
import { TFx, TFxWithBox } from '../types'
import { uid } from '../lib'
import { DEFAULT_FX_PROPS_MAP } from './useTickHandlers'

type TFxPropMap = typeof DEFAULT_FX_PROPS_MAP
type TFxPropKey = keyof TFxPropMap

export const useFxItems = (
  svgRef: MutableRefObject<SVGSVGElement | undefined | null>,
  { loading = false } = {},
) => {
  const [items, setItems] = useState<TFx[]>([])

  useLayoutEffect(() => {
    const svg = svgRef?.current
    if (loading || !svg) {
      return
    }

    const nextItems = Array.from(svg.querySelectorAll('[data-fx]')).map(
      (el) => {
        const element = el as SVGElement
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
            return {
              id: uid(),
              element,
              props,
            }
          }
        } catch (err) {
          // data-fx is not json
        }
      },
    )

    const flatItems = flatten(nextItems).filter(Boolean) as TFx[]

    flatItems.forEach(({ element }) => {
      element.setAttribute('transform-origin', '50% 50%')
    })

    setItems(flatItems)
  }, [svgRef, loading])

  // Add boxes
  return useMemo((): TFxWithBox[] => {
    const svg = svgRef.current

    if (!svg) {
      return items
    }

    const viewBox = svg?.viewBox.baseVal
    return items.map((item) => {
      const box = (item.element as SVGPathElement).getBBox()
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
  }, [svgRef, items])
}
