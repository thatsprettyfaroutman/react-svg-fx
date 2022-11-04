import { useRef, useLayoutEffect, MutableRefObject } from 'react'

export const useMouse = ({
  svgRef,
  width,
  height,
}: {
  svgRef: MutableRefObject<SVGSVGElement | null | undefined>
  width: number
  height: number
}) => {
  const mouseRef = useRef<
    | {
        parallaxX: number
        parallaxY: number
      }
    | undefined
  >()
  useLayoutEffect(() => {
    const svg = svgRef.current

    if (!svg) {
      return
    }

    const handleSvgMouseMove = (e) => {
      mouseRef.current = {
        parallaxX: (e.offsetX / width) * 2 - 1,
        parallaxY: (e.offsetY / height) * 2 - 1,
      }
    }

    const handleSvgMouseLeave = () => {
      mouseRef.current = undefined
    }

    svg.addEventListener('mousemove', handleSvgMouseMove)
    svg.addEventListener('mouseleave', handleSvgMouseLeave)

    return () => {
      svg.removeEventListener('mousemove', handleSvgMouseMove)
      svg.removeEventListener('mouseleave', handleSvgMouseLeave)
    }
  }, [svgRef, width, height])

  return mouseRef
}
