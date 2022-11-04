import { useMemo } from 'react'
import lerp from 'lerp'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler, rand } from '../lib'

export const FX_NAME = 'hover' as const

export const FX_DEFAULT_PROPS = {
  speed: 1,
  amount: 1,
  ratio: 0.42,
}

export const useHook = ({ items, attrHandler }: TUseTickHandlerProps) => {
  const staticProps = useMemo(() => {
    const hoverItems = items.filter((x) => x.props.has(FX_NAME))
    const n = hoverItems.length
    return { n }
  }, [items])

  return useMemo(
    () =>
      createTickHandler(FX_NAME, ({ elapsedTime }, { index, box, props }) => {
        if (!box) {
          return
        }

        const offset0 =
          (elapsedTime + (index / staticProps.n) * Math.PI) *
            0.1 *
            props.speed *
            rand(index) +
          rand(index) * 100
        const offset1 = offset0
        const p0 = Math.sin(
          offset0 * lerp(1, 0, props.ratio) * Math.PI + Math.PI * 0.5,
        )
        const p1 = Math.cos(
          offset1 * lerp(0, 1, props.ratio) * Math.PI + Math.PI * 0.5,
        )

        const x = lerp(0, props.amount * 16, p0)
        const y = lerp(0, props.amount * 16, p1)

        const translate = `translate(${x} ${y})`
        attrHandler.add('translate', translate)
      }),
    [attrHandler, staticProps.n],
  )
}
