import { useMemo } from 'react'
import { TUseTickHandlerProps } from '../../types'
import * as hover from './tickHandlers/hover'
import * as parallax from './tickHandlers/parallax'
import * as rotate from './tickHandlers/rotate'
import * as sparkle from './tickHandlers/sparkle'
import * as tween from './tickHandlers/tween'
import * as wave from './tickHandlers/wave'
import * as wobble from './tickHandlers/wobble'

// TODO: registerFx func, allow registering of custom tickHandlers

export const DEFAULT_FX_PROPS_MAP = {
  [hover.FX_NAME]: hover.FX_DEFAULT_PROPS,
  [parallax.FX_NAME]: parallax.FX_DEFAULT_PROPS,
  [rotate.FX_NAME]: rotate.FX_DEFAULT_PROPS,
  [sparkle.FX_NAME]: sparkle.FX_DEFAULT_PROPS,
  [tween.FX_NAME]: tween.FX_DEFAULT_PROPS,
  [wave.FX_NAME]: wave.FX_DEFAULT_PROPS,
  [wobble.FX_NAME]: wobble.FX_DEFAULT_PROPS,
} as const

export const useTickHandlers = (props: TUseTickHandlerProps) => {
  const tickHandlers = [
    hover.useHook(props),
    parallax.useHook(props),
    rotate.useHook(props),
    sparkle.useHook(props),
    tween.useHook(props),
    wave.useHook(props),
    wobble.useHook(props),
  ]

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => tickHandlers, tickHandlers)
}
