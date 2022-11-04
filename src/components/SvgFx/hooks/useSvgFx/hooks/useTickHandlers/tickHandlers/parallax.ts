import { useMemo, useRef, useEffect } from 'react'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler } from '../lib'

export const FX_NAME = 'parallax' as const

export const FX_DEFAULT_PROPS = {
  amount: 16,
  back: false,
}

export const useHook = ({
  items,
  attrHandler,
  mouseRef,
}: TUseTickHandlerProps) => {
  const posRef = useRef<{
    [key: string]: { x: number; y: number } | undefined
  }>({})

  const staticProps = useMemo(() => {
    const parallaxItems = items.filter((x) => x.props.has(FX_NAME))
    const n = parallaxItems.length
    return { parallaxItems, n }
  }, [items])

  useEffect(() => {
    staticProps.parallaxItems.forEach((item) => {
      if (posRef.current[item.id]) {
        return
      }
      posRef.current[item.id] = { x: 0, y: 0 }
    })
  }, [staticProps.parallaxItems])

  return useMemo(
    () =>
      createTickHandler(FX_NAME, (_, { id, box, props }) => {
        const pos = posRef.current?.[id]
        if (!box || !pos) {
          return
        }

        const mouse = mouseRef.current

        if (mouse) {
          pos.x -= (pos.x - mouse.parallaxX) * 0.02
          pos.y -= (pos.y - mouse.parallaxY) * 0.02
        }

        pos.x *= 0.98
        pos.y *= 0.98

        if (isNaN(pos.x) || Math.abs(pos.x) < 0.001) {
          pos.x = 0
        }
        if (isNaN(pos.y) || Math.abs(pos.y) < 0.001) {
          pos.y = 0
        }

        const sign = props.back ? -1 : 1
        const x = sign * pos.x * props.amount * 2
        const y = sign * pos.y * props.amount * 2
        const translate = `translate(${x} ${y})`
        attrHandler.add('translate', translate)
      }),
    [mouseRef, attrHandler],
  )
}
