import React, { FC, useRef, useLayoutEffect, useState } from 'react'
import { useSvgFx } from './hooks/useSvgFx'
import { mergeRefs } from 'react-merge-refs'
import { getElementFromHtml } from './lib'

export interface ISvgFxProps {
  svg?: string
  active?: boolean
}

export const SvgFx: FC<ISvgFxProps> = ({
  svg: svgString,
  active = true,
  ...restProps
}) => {
  const [loading, setLoading] = useState(true)
  const svgRef = useRef<SVGSVGElement | null>()

  useLayoutEffect(() => {
    const el = svgRef.current
    if (!el || !svgString) {
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
