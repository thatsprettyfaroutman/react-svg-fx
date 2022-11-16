import { useRef, useEffect } from 'react'

export type TStatus = 'loading' | 'errored' | 'ready'

export type TProps = {
  loading: boolean
  errored: boolean
  onStatus?: (status: TStatus) => void
}

export const useHandleStatus = ({ loading, onStatus, errored }: TProps) => {
  const onStatusRef = useRef(onStatus)
  useEffect(() => {
    onStatusRef.current = onStatus
  }, [onStatus])

  useEffect(() => {
    const cb = onStatusRef.current
    if (!cb) {
      return
    }
    if (loading) {
      cb('loading')
      return
    }
    if (errored) {
      cb('errored')
      return
    }
    cb('ready')
  }, [loading, errored])
}
