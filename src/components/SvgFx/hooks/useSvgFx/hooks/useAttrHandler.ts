import { useMemo } from 'react'

const multiplyAll = (values: number[] = []) => {
  if (!values[0]) {
    return values[0]
  }
  let res = values[0]
  for (let i = 1; i < values.length; i++) {
    res *= values[i]
  }
  return res
}

const createAttrHandler = () => {
  const attrMap = {
    translate: [] as string[],
    rotate: [] as string[],
    scale: [] as string[],
    opacity: [] as number[],
  }

  const add = (key: keyof typeof attrMap, value: string | number) => {
    if (!attrMap[key]) {
      return
    }
    attrMap[key].push(
      // @ts-ignore
      value,
    )
  }

  const apply = (el: SVGElement) => {
    const { translate, rotate, scale, opacity } = attrMap

    if (translate.length || scale.length || rotate.length) {
      el.setAttribute(
        'transform',
        `${translate.join(' ')} ${scale.join(' ')} ${rotate.join(' ')}`,
      )
    }
    if (opacity.length) {
      el.setAttribute('opacity', String(multiplyAll(opacity)))
    }

    // Reset attrs after apply
    translate.length = 0
    rotate.length = 0
    scale.length = 0
    opacity.length = 0
  }

  return { add, apply }
}

export const useAttrHandler = () => useMemo(() => createAttrHandler(), [])
