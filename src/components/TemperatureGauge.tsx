import { useId } from "react"
import { motion } from "framer-motion"
import { useAnimatedValue } from "../hooks/useAnimatedValue"
import { clamp, formatTemperature } from "../utils/format"
import { Card } from "./Card"

interface TemperatureGaugeProps {
  temperature: number
  delay?: number
}

const MIN_TEMP = 0
const MAX_TEMP = 50
const ARC_START_DEG = 135
const ARC_END_DEG = 405
const ARC_RANGE_DEG = ARC_END_DEG - ARC_START_DEG
const RADIUS = 90
const CX = 110
const CY = 110

function degToRad(deg: number) {
  return (deg * Math.PI) / 180
}

function pointOnArc(deg: number) {
  const rad = degToRad(deg)
  return { x: CX + RADIUS * Math.cos(rad), y: CY + RADIUS * Math.sin(rad) }
}

function arcPath(startDeg: number, endDeg: number, r: number) {
  const s = pointOnArc(startDeg)
  const e = { x: CX + r * Math.cos(degToRad(endDeg)), y: CY + r * Math.sin(degToRad(endDeg)) }
  const largeArc = endDeg - startDeg > 180 ? 1 : 0
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`
}

function tempToStatus(t: number): string {
  if (t < 10) return "Chladno"
  if (t < 18) return "Pod optimem"
  if (t <= 28) return "Optimalni"
  if (t <= 35) return "Teplo"
  if (t <= 42) return "Horko"
  return "Kriticky"
}

function tempToColor(t: number): string {
  if (t < 10) return "#0ea5e9"
  if (t < 18) return "#38bdf8"
  if (t <= 28) return "#22c55e"
  if (t <= 35) return "#f97316"
  return "#ef4444"
}

const TICKS = [0, 10, 20, 30, 40, 50]

export const TemperatureGauge = ({ temperature, delay = 0 }: TemperatureGaugeProps) => {
  const gradientId = useId()
  const animated = useAnimatedValue(clamp(temperature, MIN_TEMP, MAX_TEMP), 1000)
  const color = tempToColor(animated)
  const status = tempToStatus(animated)

  const normalizedTemp = (animated - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)
  const needleDeg = ARC_START_DEG + normalizedTemp * ARC_RANGE_DEG
  const needlePoint = pointOnArc(needleDeg)

  const optimalStartDeg = ARC_START_DEG + ((18 - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * ARC_RANGE_DEG
  const optimalEndDeg = ARC_START_DEG + ((28 - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * ARC_RANGE_DEG

  return (
    <Card delay={delay} className="flex flex-col items-center gap-2">
      <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
        Teplota
      </span>

      <svg width={220} height={180} viewBox="0 0 220 180" aria-label={`Teplota: ${formatTemperature(animated)} C`}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="36%" stopColor="#22c55e" />
            <stop offset="70%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>

        <path
          d={arcPath(ARC_START_DEG, ARC_END_DEG, RADIUS)}
          fill="none"
          stroke="#1a2e1a"
          strokeWidth={10}
          strokeLinecap="round"
        />

        <path
          d={arcPath(optimalStartDeg, optimalEndDeg, RADIUS)}
          fill="none"
          stroke="#22c55e33"
          strokeWidth={14}
          strokeLinecap="round"
        />

        <path
          d={arcPath(ARC_START_DEG, ARC_END_DEG, RADIUS)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={0.6}
        />

        {TICKS.map((t) => {
          const tickDeg = ARC_START_DEG + ((t - MIN_TEMP) / (MAX_TEMP - MIN_TEMP)) * ARC_RANGE_DEG
          const inner = { x: CX + (RADIUS - 10) * Math.cos(degToRad(tickDeg)), y: CY + (RADIUS - 10) * Math.sin(degToRad(tickDeg)) }
          const outer = { x: CX + (RADIUS + 10) * Math.cos(degToRad(tickDeg)), y: CY + (RADIUS + 10) * Math.sin(degToRad(tickDeg)) }
          const label = { x: CX + (RADIUS + 22) * Math.cos(degToRad(tickDeg)), y: CY + (RADIUS + 22) * Math.sin(degToRad(tickDeg)) }
          return (
            <g key={t}>
              <line x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} stroke="#2d4a2d" strokeWidth={1.5} />
              <text x={label.x} y={label.y} textAnchor="middle" dominantBaseline="middle" fill="#6b7e6b" fontFamily="JetBrains Mono, monospace" fontSize={9}>
                {t}
              </text>
            </g>
          )
        })}

        <motion.circle
          cx={needlePoint.x}
          cy={needlePoint.y}
          r={6}
          fill={color}
          animate={{ cx: needlePoint.x, cy: needlePoint.y }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
        <motion.line
          x1={CX}
          y1={CY}
          x2={needlePoint.x}
          y2={needlePoint.y}
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          opacity={0.5}
          animate={{ x2: needlePoint.x, y2: needlePoint.y }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        <circle cx={CX} cy={CY} r={4} fill={color} />

        <text x={CX} y={CY + 14} textAnchor="middle" fill={color} fontFamily="JetBrains Mono, monospace" fontWeight="700" fontSize="30">
          {formatTemperature(animated)}
        </text>
        <text x={CX + 34} y={CY + 6} textAnchor="start" fill={color + "99"} fontFamily="Space Grotesk, sans-serif" fontWeight="600" fontSize="13">
          C
        </text>
      </svg>

      <span className="font-mono text-xs tracking-[0.15em] uppercase" style={{ color }}>
        {status}
      </span>
    </Card>
  )
}
