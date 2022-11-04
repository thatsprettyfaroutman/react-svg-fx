import { useMemo } from 'react'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler } from '../lib'

export const FX_NAME = 'rotate' as const

export const FX_DEFAULT_PROPS = {
  speed: 1,
}

export const useHook = ({ attrHandler }: TUseTickHandlerProps) => {
  return useMemo(
    () =>
      createTickHandler(FX_NAME, ({ elapsedTime }, { box, props }) => {
        if (!box) {
          return
        }

        const offset = elapsedTime * Math.PI * props.speed
        const rotate = `rotate(${offset} ${box.xMid} ${box.yMid})`
        attrHandler.add('rotate', rotate)
      }),
    [attrHandler],
  )
}
