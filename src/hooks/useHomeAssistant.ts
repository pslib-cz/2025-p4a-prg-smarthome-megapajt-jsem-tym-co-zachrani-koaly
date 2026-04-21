import { useCallback, useEffect, useRef, useState } from "react"
import { haConfig, wsUrl } from "../config"
import type { GreenhouseState, HaMessage } from "../types"
import { useHistoryBuffer } from "./useHistoryBuffer"

const INITIAL_STATE: GreenhouseState = {
  temperature: 0,
  waterPresent: true,
  humidity: [0, 0, 0, 0],
  windowOpen: false,
  pumpOn: false,
  lightOn: false,
  connected: false,
  connecting: true,
  lastUpdate: null,
  history: {
    temperature: [],
    humidity: [[], [], [], []],
  },
}

const MAX_BACKOFF_MS = 30_000

export function useHomeAssistant() {
  const [state, setState] = useState<GreenhouseState>(INITIAL_STATE)
  const wsRef = useRef<WebSocket | null>(null)
  const msgIdRef = useRef(1)
  const backoffRef = useRef(1000)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)
  const { pushTemperature, pushHumidity, getSlice } = useHistoryBuffer()

  const callService = useCallback(
    (domain: string, service: string, entityId: string) => {
      const ws = wsRef.current
      if (!ws || ws.readyState !== WebSocket.OPEN) return
      ws.send(
        JSON.stringify({
          id: msgIdRef.current++,
          type: "call_service",
          domain,
          service,
          service_data: { entity_id: entityId },
        })
      )
    },
    []
  )

  const toggleWindow = useCallback(() => {
    callService("switch", "toggle", haConfig.entities.window)
  }, [callService])

  const togglePump = useCallback(() => {
    callService("switch", "toggle", haConfig.entities.pump)
  }, [callService])

  const toggleLight = useCallback(() => {
    callService("switch", "toggle", haConfig.entities.light)
  }, [callService])

  const applyEntityState = useCallback(
    (entityId: string, stateValue: string) => {
      const { entities } = haConfig

      if (entityId === entities.temperature) {
        const val = parseFloat(stateValue)
        if (!isNaN(val)) {
          pushTemperature(val)
          setState((prev) => ({
            ...prev,
            temperature: val,
            lastUpdate: new Date(),
            history: { ...prev.history, temperature: getSlice(7 * 24 * 60 * 60 * 1000).temperature },
          }))
        }
      } else if (entityId === entities.waterPresent) {
        setState((prev) => ({
          ...prev,
          waterPresent: stateValue === "on",
          lastUpdate: new Date(),
        }))
      } else if (entityId === entities.window) {
        setState((prev) => ({ ...prev, windowOpen: stateValue === "on", lastUpdate: new Date() }))
      } else if (entityId === entities.pump) {
        setState((prev) => ({ ...prev, pumpOn: stateValue === "on", lastUpdate: new Date() }))
      } else if (entityId === entities.light) {
        setState((prev) => ({ ...prev, lightOn: stateValue === "on", lastUpdate: new Date() }))
      } else {
        const humidityIndex = entities.humidity.indexOf(entityId) as 0 | 1 | 2 | 3
        if (humidityIndex !== -1) {
          const val = parseFloat(stateValue)
          if (!isNaN(val)) {
            pushHumidity(humidityIndex, val)
            setState((prev) => {
              const newHumidity = [...prev.humidity] as [number, number, number, number]
              newHumidity[humidityIndex] = val
              const sliced = getSlice(7 * 24 * 60 * 60 * 1000)
              return {
                ...prev,
                humidity: newHumidity,
                lastUpdate: new Date(),
                history: { ...prev.history, humidity: sliced.humidity },
              }
            })
          }
        }
      }
    },
    [pushTemperature, pushHumidity, getSlice]
  )

  const connect = useCallback(() => {
    if (!mountedRef.current) return
    if (wsRef.current) {
      wsRef.current.onclose = null
      wsRef.current.close()
    }

    setState((prev) => ({ ...prev, connecting: true, connected: false }))
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onmessage = (event: MessageEvent) => {
      const msg: HaMessage = JSON.parse(event.data as string)

      if (msg.type === "auth_required") {
        ws.send(JSON.stringify({ type: "auth", access_token: haConfig.token }))
      } else if (msg.type === "auth_ok") {
        backoffRef.current = 1000
        setState((prev) => ({ ...prev, connected: true, connecting: false }))
        ws.send(
          JSON.stringify({
            id: msgIdRef.current++,
            type: "subscribe_events",
            event_type: "state_changed",
          })
        )
      } else if (msg.type === "auth_invalid") {
        ws.close()
      } else if (msg.type === "event") {
        const { entity_id, new_state } = msg.event.data
        if (new_state) {
          applyEntityState(entity_id, new_state.state)
        }
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setState((prev) => ({ ...prev, connected: false, connecting: false }))
      reconnectTimerRef.current = setTimeout(() => {
        backoffRef.current = Math.min(backoffRef.current * 2, MAX_BACKOFF_MS)
        connect()
      }, backoffRef.current)
    }

    ws.onerror = () => ws.close()
  }, [applyEntityState])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current)
      if (wsRef.current) {
        wsRef.current.onclose = null
        wsRef.current.close()
      }
    }
  }, [connect])

  return { state, toggleWindow, togglePump, toggleLight, getSlice }
}
