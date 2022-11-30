import React, { FC, useRef, useLayoutEffect, useState } from 'react'
import { useSvgFx } from './hooks/useSvgFx'
import mergeRefs from 'react-merge-refs'
import { getElementFromHtml } from './lib'
import { useMounted } from './hooks/useMounted'
import { getSvgStringFromSrc } from '../../lib'
import {
  useHandleStatus,
  TProps as TUseHandleStatusProps,
} from './hooks/useHandleStatus'

export * from './hooks/useSvgFx'
export { DEFAULT_FX_PROPS_MAP } from './hooks/useSvgFx/hooks/useTickHandlers'
export { TStatus } from './hooks/useHandleStatus'

export interface ISvgFxProps {
  src?: string
  active?: boolean
  onStatus?: TUseHandleStatusProps['onStatus']
  /**
   * @deprecated use `src` prop instead
   */
  svg?: string
}

export const SvgFx: FC<ISvgFxProps> = ({
  src: srcProp,
  svg: svgProp,
  active = true,
  onStatus,
  ...restProps
}) => {
  const src = srcProp || svgProp
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)
  const [svgString, setSvgString] = useState<string>()
  const svgRef = useRef<SVGSVGElement | null>()
  const mounted = useMounted()

  useHandleStatus({
    onStatus,
    loading,
    errored,
  })

  // Handle svg loading
  useLayoutEffect(() => {
    const el = svgRef.current
    if (!el || !src) {
      return
    }
    const load = async () => {
      try {
        const svgString = await getSvgStringFromSrc(src)
        if (mounted.current) {
          setSvgString(svgString)
        }
      } catch (error) {
        // @ts-ignore
        console.error(error.message)
        if (mounted.current) {
          setErrored(true)
          setLoading(false)
        }
      }
    }
    load()
  }, [src, mounted])

  // Update svg dom element when svg loaded
  useLayoutEffect(() => {
    const el = svgRef.current
    if (!svgString || !el) {
      return
    }
    const svg = getElementFromHtml(svgString) as SVGSVGElement
    for (const attribute of Array.from(svg.attributes)) {
      el.setAttribute(attribute.name, attribute.value)
    }
    el.innerHTML = svg.innerHTML
    setLoading(false)
  }, [svgString])

  const svgFxRef = useSvgFx({
    loading,
    active,
  })

  return <svg {...restProps} ref={mergeRefs([svgRef, svgFxRef])} />
}
