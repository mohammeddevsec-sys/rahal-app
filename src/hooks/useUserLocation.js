import { useCallback, useEffect, useRef, useState } from 'react'
import {
  GEO_STATUS,
  getCurrentPosition,
  watchPosition,
  isGeolocationSupported,
} from '../lib/geolocation.js'

export function useUserLocation() {
  const [location, setLocation] = useState(null)
  const [status, setStatus] = useState(GEO_STATUS.IDLE)
  const [error, setError] = useState(null)
  const stopWatchRef = useRef(null)

  const startWatch = useCallback(() => {
    if (stopWatchRef.current) return
    stopWatchRef.current = watchPosition(
      (pos) => {
        setLocation({ lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy })
        setStatus(GEO_STATUS.GRANTED)
        setError(null)
      },
      (err) => {
        setStatus(err.status)
        setError(err)
      }
    )
  }, [])

  const stopWatch = useCallback(() => {
    if (stopWatchRef.current) {
      stopWatchRef.current()
      stopWatchRef.current = null
    }
  }, [])

  const request = useCallback(async () => {
    if (!isGeolocationSupported()) {
      setStatus(GEO_STATUS.UNSUPPORTED)
      setError({ status: GEO_STATUS.UNSUPPORTED, code: 0, message: 'Geolocation API not available' })
      return null
    }
    setStatus(GEO_STATUS.REQUESTING)
    setError(null)
    try {
      const pos = await getCurrentPosition()
      setLocation({ lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy })
      setStatus(GEO_STATUS.GRANTED)
      startWatch()
      return pos
    } catch (err) {
      setStatus(err.status)
      setError(err)
      return null
    }
  }, [startWatch])

  useEffect(() => {
    const id = setTimeout(() => { request() }, 0)
    return () => {
      clearTimeout(id)
      stopWatch()
    }
  }, [request, stopWatch])

  return { location, status, error, request, stopWatch }
}