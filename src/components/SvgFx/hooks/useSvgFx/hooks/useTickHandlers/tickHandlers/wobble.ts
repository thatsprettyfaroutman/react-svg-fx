import { useMemo } from 'react'
import lerp from 'lerp'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler, rand } from '../lib'

export const FX_NAME = 'wobble' as const

export const FX_DEFAULT_PROPS = {
  speed: 1,
  amount: 0.95,
  index: -1,
}

export const useHook = ({ items, attrHandler }: TUseTickHandlerProps) => {
  const staticProps = useMemo(() => {
    const wobbleItems = items.filter((x) => x.props.has(FX_NAME))
    const n = wobbleItems.length
    return { wobbleItems, n }
  }, [items])

  return useMemo(
    () =>
      createTickHandler(FX_NAME, ({ elapsedTime }, { box, index, props }) => {
        if (!box) {
          return
        }

        const i = props.index === -1 ? index : props.index
        const offset =
          (elapsedTime + (i / staticProps.n) * Math.PI) * 0.1 * props.speed
        const p0 = Math.sin(offset * Math.PI)
        const p1 = Math.cos(offset * Math.PI * rand(i))

        const x = lerp(props.amount, 1, p0)
        const y = lerp(props.amount, 1, p1)

        const translate = `translate(${x} ${y})`
        const scale = `scale(${x} ${y})`

        attrHandler.add('translate', translate)
        attrHandler.add('scale', scale)
      }),
    [attrHandler, staticProps.n],
  )
}
