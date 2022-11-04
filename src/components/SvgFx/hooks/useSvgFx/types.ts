import { useAttrHandler } from './hooks/useAttrHandler'
import { useMouse } from './hooks/useMouse'
import { DEFAULT_FX_PROPS_MAP } from './hooks/useTickHandlers'

export type TFxProps = typeof DEFAULT_FX_PROPS_MAP

const DEFAULT_FX_PROPS_MAP_AS_MAP = new Map(
  Object.entries(DEFAULT_FX_PROPS_MAP),
)

export type TFx = {
  id: string
  element: SVGElement
  props: typeof DEFAULT_FX_PROPS_MAP_AS_MAP
}

export type TFxWithBox = TFx & {
  box?: {
    x: number
    y: number
    width: number
    height: number
    xMid: number
    yMid: number
  }
}

export type TTickProps = {
  elapsedTime: number
  lastTime: number
  deltaTime: number
}

export type TUseTickHandlerProps = {
  items: TFxWithBox[]
  attrHandler: ReturnType<typeof useAttrHandler>
  mouseRef: ReturnType<typeof useMouse>
}
