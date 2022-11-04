import { range } from 'ramda'
import { TFxWithBox, TTickProps, TFxProps } from '../../types'

export const RAD_TO_DEG = 180 / Math.PI
export const DEG_TO_RAD = Math.PI / 180

export const rand = (() => {
  const rands: number[] = [1, ...range(0, 1000).map(() => Math.random())]
  return (i: number) => rands[i % rands.length]
})()

export const createTickHandler = <
  A extends keyof TFxProps,
  B extends (
    tickProps: TTickProps,
    props: Omit<TFxWithBox, 'element' | 'props'> & {
      index: number
      props: TFxProps[A]
    },
  ) => void,
>(
  name: A,
  tickPredicate: B,
) => {
  let itemIndex = 0
  const tempObj = {} as Parameters<B>[1]

  const tick = (tickProps: TTickProps, item: TFxWithBox) => {
    if (!item.props.has(name)) {
      return
    }

    tempObj.id = item.id
    // tempObj.element = item.element
    tempObj.box = item.box
    tempObj.props = item.props.get(name) as TFxProps[A]
    tempObj.index = itemIndex
    tickPredicate(tickProps, tempObj)
    itemIndex++
  }

  const resetItemIndex = () => {
    itemIndex = 0
  }

  return { tick, resetItemIndex }
}
