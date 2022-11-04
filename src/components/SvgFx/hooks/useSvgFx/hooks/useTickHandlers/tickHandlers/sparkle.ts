import { useMemo } from 'react'
import lerp from 'lerp'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler, RAD_TO_DEG, rand } from '../lib'

export const FX_NAME = 'sparkle' as const

export const FX_DEFAULT_PROPS = {
  speed: 1,
  amount: 1,
}

const Y_AMOUNT = -8

export const useHook = ({ items, attrHandler }: TUseTickHandlerProps) => {
  const staticProps = useMemo(() => {
    const sparkleItems = items.filter((x) => x.props.has(FX_NAME))
    const n = sparkleItems.length
    return { sparkleItems, n }
  }, [items])

  return useMemo(
    () =>
      createTickHandler(FX_NAME, ({ elapsedTime }, { box, index, props }) => {
        if (!box) {
          return
        }

        const offset =
          (elapsedTime + (index / staticProps.n) * Math.PI) * props.speed
        const p0 = Math.sin(offset * Math.PI)
        const p1 = Math.sin(offset * Math.PI + Math.PI * 0.5)

        const x = 0
        const y =
          lerp(0, Y_AMOUNT * props.amount, p0) - Y_AMOUNT * 0.5 * props.amount

        const translate = `translate(${x} ${y})`

        const a0 = p0 * RAD_TO_DEG
        const a1 = lerp(-a0, a0, rand(index + staticProps.n))
        const rotate = `rotate(${a1} ${box.xMid} ${box.yMid})`

        attrHandler.add('translate', translate)
        attrHandler.add('rotate', rotate)
        attrHandler.add('opacity', Math.max(0, p1 * 2))
      }),
    [attrHandler, staticProps.n],
  )
}
