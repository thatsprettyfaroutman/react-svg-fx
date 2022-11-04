import { useEffect, useRef } from 'react'
import useMeasure from 'react-use-measure'
import { mergeRefs } from 'react-merge-refs'
import { useAttrHandler } from './hooks/useAttrHandler'
import { useTickHandlers } from './hooks/useTickHandlers'
import { useMouse } from './hooks/useMouse'
import { useFxItems } from './hooks/useFxItems'

export const useSvgFx = ({ active = true, loading = false } = {}) => {
  const [measureRef, { width, height }] = useMeasure()
  const svgRef = useRef<SVGSVGElement>()
  const ref = mergeRefs([measureRef, svgRef])
  const items = useFxItems(svgRef, { loading })

  const attrHandler = useAttrHandler()
  const mouseRef = useMouse({ svgRef, width, height })

  const tickHandlers = useTickHandlers({
    items,
    attrHandler,
    mouseRef,
  })

  useEffect(() => {
    let running = !loading && active
    const startTime = performance.now()
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
      // Draw
      requestAnimationFrame(tick)
    }

    tick()

    return () => {
      running = false
    }
  }, [items, tickHandlers, attrHandler, active, loading])

  return ref
}
