import { useEffect, useRef } from 'react'
import mergeRefs from 'react-merge-refs'
import { useAttrHandler } from './hooks/useAttrHandler'
import { useTickHandlers } from './hooks/useTickHandlers'
import { useMouse } from './hooks/useMouse'
import { useFxItems } from './hooks/useFxItems'
import { usePolyfilledMeasure } from './hooks/usePolyfilledMeasure'

const MAX_FAIL_COUNT = 50

export const useSvgFx = ({
  active = true,
  loading = false,
}: {
  active?: boolean
  loading?: boolean
} = {}) => {
  const [measureRef, mouseBounds] = usePolyfilledMeasure()
  const svgRef = useRef<SVGSVGElement>()
  const ref = mergeRefs([measureRef, svgRef])
  const { items, updateItems } = useFxItems(svgRef, { loading })

  const failCount = useRef(0)

  const attrHandler = useAttrHandler()
  const mouseRef = useMouse({
    svgRef,
    width: mouseBounds.width,
    height: mouseBounds.height,
  })

  const tickHandlers = useTickHandlers({
    items,
    attrHandler,
    mouseRef,
  })

  const startTimeRef = useRef(performance.now())
  useEffect(() => {
    if (!loading && active) {
      startTimeRef.current = performance.now()
    }
  }, [loading, active])

  useEffect(() => {
    let running = !loading && active
    const startTime = startTimeRef.current
    const n = items.length
    const tickProps = {
      elapsedTime: 0,
      deltaTime: 0,
      lastTime: 0,
    }
    const m = tickHandlers.length

    if (n === 0 || m === 0) {
      // No items or tickHandlers
      return
    }

    const testItemIndex = failCount.current % n
    const testItem = items[testItemIndex]
    if (failCount.current > MAX_FAIL_COUNT) {
      // Failed to update items too many times, something is wrong with the svg
      console.warn(
        'Failed to update items too many times, something is wrong with the svg',
      )
      return
    }

    const tick = () => {
      // Update elapsed time
      tickProps.elapsedTime = (performance.now() - startTime) * 0.001
      tickProps.deltaTime = tickProps.elapsedTime - tickProps.lastTime

      // Loop items
      for (let i = 0; i < n; i++) {
        // Loop thru all the fx tick handlers
        for (let j = 0; j < m; j++) {
          // Tick handler communicates with attrHandler and adds all the needed attribute changes based on handlers
          tickHandlers[j].tick(tickProps, items[i])
        }
        // Apply item attributes added by each of the tick handlers
        attrHandler.apply(items[i].element)
      }

      // Reset handler item indexes so they are ready for the next frame
      for (let j = 0; j < m; j++) {
        tickHandlers[j].resetItemIndex()
      }

      tickProps.lastTime = tickProps.elapsedTime

      if (!running) {
        return
      }

      // Check if still connected, fix items if needed
      if (
        !testItem.element.isConnected ||
        (testItem.box?.width === 0 && testItem.box?.height === 0)
      ) {
        console.log(
          'test item broken',
          {
            connected: !testItem.element.isConnected,
            width: testItem.box?.width,
            height: testItem.box?.height,
          },
          testItem,
        )
        running = false
        updateItems()
        failCount.current++
      }

      // Draw
      requestAnimationFrame(tick)
    }

    tick()

    return () => {
      running = false
    }
  }, [items, updateItems, tickHandlers, attrHandler, active, loading])

  return ref
}
