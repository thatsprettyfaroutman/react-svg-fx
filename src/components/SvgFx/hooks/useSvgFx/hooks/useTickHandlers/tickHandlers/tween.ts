import { useMemo } from 'react'
import lerp from 'lerp'
import { easeCubicIn, easeCubicOut, easeCubicInOut } from 'd3-ease'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler } from '../lib'

export const FX_NAME = 'tween' as const

const EASE_MAP = {
  in: easeCubicIn,
  out: easeCubicOut,
  inOut: easeCubicInOut,
}

export const FX_DEFAULT_PROPS = {
  x: 0,
  y: 0,
  time: 0.42,
  ease: 'out' as keyof typeof EASE_MAP,
  delay: 0,
  opacity: 1,
  angle: 0,
  interval: 0,
  scaleX: 1,
  scaleY: 1,
}

const EXTRA_RUN_SECONDS = 2

const ease = (name: keyof typeof EASE_MAP, p: number) => {
  const fn = EASE_MAP[name] || EASE_MAP[FX_DEFAULT_PROPS.ease]
  return fn(p)
}

export const useHook = ({ attrHandler }: TUseTickHandlerProps) => {
  return useMemo(
    () =>
      createTickHandler(FX_NAME, ({ elapsedTime }, { box, index, props }) => {
        if (!box) {
          return
        }

        // TODO: interval should be added not subtracted
        const delay = props.delay - props.interval * index

        const time = Math.max(elapsedTime - delay, 0)
        if (time > props.time + EXTRA_RUN_SECONDS) {
          // Tween done, no transforms needed
          return
        }

        const p = ease(props.ease, Math.min(time / props.time, 1))
        const x = lerp(props.x, 0, p)
        const y = lerp(props.y, 0, p)
        const translate = `translate(${x} ${y})`
        const rotate = `rotate(${lerp(props.angle, 0, p)} ${box.xMid} ${
          box.yMid
        })`
        const opacity = lerp(props.opacity, 1, p)
        const scaleX = lerp(props.scaleX, 1, p)
        const scaleY = lerp(props.scaleY, 1, p)
        const scale = `scale(${scaleX}, ${scaleY})`

        attrHandler.add('translate', translate)
        attrHandler.add('rotate', rotate)
        attrHandler.add('opacity', opacity)
        attrHandler.add('scale', scale)
      }),
    [attrHandler],
  )
}
