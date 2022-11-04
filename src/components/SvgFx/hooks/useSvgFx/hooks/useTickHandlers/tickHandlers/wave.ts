import { useMemo } from 'react'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler } from '../lib'

export const FX_NAME = 'wave' as const

export const FX_DEFAULT_PROPS = {
  speed: 4,
  angle: 10,
  delay: 0,
}

export const useHook = ({ attrHandler }: TUseTickHandlerProps) => {
  return useMemo(
    () =>
      createTickHandler(FX_NAME, ({ elapsedTime }, { box, props }) => {
        if (!box) {
          return
        }

        const angle =
          Math.sin((elapsedTime - props.delay) * props.speed) *
          props.angle *
          0.5

        const rotate = `rotate(${angle} ${box.xMid} ${box.height})`
        attrHandler.add('rotate', rotate)
      }),
    [attrHandler],
  )
}
