import { useMemo } from 'react'
import lerp from 'lerp'
import chroma from 'chroma-js'
import { TUseTickHandlerProps } from '../../../types'
import { createTickHandler } from '../lib'

export const FX_NAME = 'light' as const

export const FX_DEFAULT_PROPS = {
  time: 0.84,
  delay: 0.84 * 1.5,
  from: 0,
  to: 1,
  interval: 0,
  shadow: undefined as string | undefined,
}

const EXTRA_RUN_SECONDS = 2

export const useHook = ({ items, attrHandler }: TUseTickHandlerProps) => {
  const shadowMap = useMemo(() => {
    const entries = items
      .filter((x) => x.props.has('light'))
      // @ts-ignore
      .filter((x) => typeof x.props.get('light').shadow === 'string')
      .map((x) => {
        // @ts-ignore
        const shadowColor = x.props.get('light').shadow as string
        const strokes = x.element.querySelectorAll('[stroke]')
        const fills = x.element.querySelectorAll('[fill]')
        const setShadowP = (p: number) => {
          for (let i = 0; i < strokes.length; i++) {
            const stroke = strokes[i]
            if (!stroke.hasAttribute('data-stroke')) {
              stroke.setAttribute('data-stroke', stroke.getAttribute('stroke')!)
            }
            stroke.setAttribute(
              'stroke',
              chroma.mix(shadowColor, stroke.getAttribute('data-stroke'), p),
            )
          }
          for (let i = 0; i < fills.length; i++) {
            const fill = fills[i]
            if (!fill.hasAttribute('data-fill')) {
              fill.setAttribute('data-fill', fill.getAttribute('fill')!)
            }
            fill.setAttribute(
              'fill',
              chroma.mix(shadowColor, fill.getAttribute('data-fill'), p),
            )
          }
        }
        return [x.id, setShadowP]
      })
    return Object.fromEntries(entries)
  }, [items])

  return useMemo(
    () =>
      createTickHandler(
        FX_NAME,
        ({ elapsedTime }, { box, index, props, id }) => {
          if (!box) {
            return
          }

          const delay = props.delay + props.interval * index

          const time = Math.max(elapsedTime - delay, 0)
          if (time > props.time + EXTRA_RUN_SECONDS) {
            // Light animation done, no need to animate further
            return
          }

          const p = Math.min(time / props.time, 1)
          const opacity = lerp(props.from, props.to, p)

          if (shadowMap[id]) {
            shadowMap[id](opacity)
          } else {
            attrHandler.add('opacity', opacity)
          }
        },
      ),
    [attrHandler, shadowMap],
  )
}
