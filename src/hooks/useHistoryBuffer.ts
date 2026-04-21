import { useRef, useCallback } from "react"
import type { DataPoint } from "../types"
import { HISTORY_MAX_ENTRIES } from "../config"

export function useHistoryBuffer() {
  const buffers = useRef<{
    temperature: DataPoint[]
    humidity: [DataPoint[], DataPoint[], DataPoint[], DataPoint[]]
  }>({
    temperature: [],
    humidity: [[], [], [], []],
  })

  const pushTemperature = useCallback((value: number) => {
    const buf = buffers.current.temperature
    buf.push({ timestamp: Date.now(), value })
    if (buf.length > HISTORY_MAX_ENTRIES) buf.shift()
  }, [])

  const pushHumidity = useCallback((index: 0 | 1 | 2 | 3, value: number) => {
    const buf = buffers.current.humidity[index]
    buf.push({ timestamp: Date.now(), value })
    if (buf.length > HISTORY_MAX_ENTRIES) buf.shift()
  }, [])

  const getSlice = useCallback((rangeMs: number) => {
    const cutoff = Date.now() - rangeMs
    return {
      temperature: buffers.current.temperature.filter((p) => p.timestamp >= cutoff),
      humidity: buffers.current.humidity.map((buf) =>
        buf.filter((p) => p.timestamp >= cutoff)
      ) as [DataPoint[], DataPoint[], DataPoint[], DataPoint[]],
    }
  }, [])

  return { pushTemperature, pushHumidity, getSlice }
}
