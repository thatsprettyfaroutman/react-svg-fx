import {
  useLayoutEffect,
  useCallback,
  useState,
  MutableRefObject,
  // useRef,
} from 'react'
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
  // TODO: rm mounted
  const mounted = useMounted()
  // const wonkyFixCount = useRef(0)
  const [items, setItems] = useState<TFxWithBox[]>([])

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

          // undefined items are removed by filter (line 85)
          return undefined
        } catch (err) {
          // data-fx is not json
        }
      },
    )

    const flatItems = flatten(nextItems).filter(Boolean) as TFx[]
    const itemsWithBoxes = getBoxes(svg, flatItems)
    setItems(itemsWithBoxes)

    // // Wonky animation bug fix
    // // ---------------------------------------------------------------------
    // // For some reason sometimes the svg (or its elements) is not in dom at
    // // this stage, causing getBBox (inside getBoxes func) to return {x: 0, y:0, width: 0, height:0}.
    // // The animation is broken because of that.
    // //
    // // To remedy that we can check if width is 0 which it never should be or if
    // // the element is not connected and update the items if thats the case.

    // if (
    //   itemsWithBoxes[0]?.box.width === 0 ||
    //   (flatItems[0]?.element && !flatItems[0].element.isConnected)
    // ) {
    //   wonkyFixCount.current++
    //   if (wonkyFixCount.current < 50) {
    //     setTimeout(updateItems, 10)
    //   }
    // }
  }, [svgRef, mounted])

  useLayoutEffect(() => {
    if (!svgRef.current || loading) {
      return
    }
    updateItems()
  }, [svgRef, loading, updateItems])

  return { items, updateItems }
}
