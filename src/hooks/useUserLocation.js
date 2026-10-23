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

  const lastSpeedRef = useRef(null)
  const lastHeadingRef = useRef(null)

  const processPosition = useCallback((pos) => {
    if (typeof pos.lat !== 'number' || typeof pos.lng !== 'number' || isNaN(pos.lat) || isNaN(pos.lng)) {
      return null
    }

    const rawSpeed = (typeof pos.speed === 'number' && Number.isFinite(pos.speed) && pos.speed >= 0) ? pos.speed : null
    let smoothedSpeed = lastSpeedRef.current
    if (rawSpeed !== null) {
      if (smoothedSpeed === null) smoothedSpeed = rawSpeed
      else smoothedSpeed = 0.3 * rawSpeed + 0.7 * smoothedSpeed
      if (smoothedSpeed < 0.3) smoothedSpeed = 0
      lastSpeedRef.current = smoothedSpeed
    }

    const rawHeading = (typeof pos.heading === 'number' && Number.isFinite(pos.heading)) ? pos.heading : null
    let smoothedHeading = lastHeadingRef.current
    const effectiveSpeed = smoothedSpeed !== null ? smoothedSpeed : 0

    if (rawHeading !== null && effectiveSpeed > 1.5) {
      if (smoothedHeading === null) {
        smoothedHeading = rawHeading
      } else {
        let diff = ((rawHeading - smoothedHeading + 540) % 360) - 180
        if (Math.abs(diff) > 60 && effectiveSpeed < 7) {
          diff = 0
        }
        smoothedHeading = (smoothedHeading + diff * 0.2 + 360) % 360
      }
      lastHeadingRef.current = smoothedHeading
    }

    return {
      lat: pos.lat,
      lng: pos.lng,
      accuracy: pos.accuracy,
      heading: smoothedHeading,
      speed: smoothedSpeed
    }
  }, [])

  const startWatch = useCallback(() => {
    if (stopWatchRef.current) return
    stopWatchRef.current = watchPosition(
      (pos) => {
        const smoothed = processPosition(pos)
        if (smoothed) {
          setLocation(smoothed)
          setStatus(GEO_STATUS.GRANTED)
          setError(null)
        }
      },
      (err) => {
        setStatus(err.status)
        setError(err)
      }
    )
  }, [processPosition])

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
      const smoothed = processPosition(pos)
      if (smoothed) {
        setLocation(smoothed)
      }
      setStatus(GEO_STATUS.GRANTED)
      startWatch()
      return pos
    } catch (err) {
      setStatus(err.status)
      setError(err)
      return null
    }
  }, [startWatch, processPosition])

  useEffect(() => {
    const id = setTimeout(() => { request() }, 0)
    return () => {
      clearTimeout(id)
      stopWatch()
    }
  }, [request, stopWatch])

  return { location, status, error, request, stopWatch }
}