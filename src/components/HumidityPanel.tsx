import { useState } from "react"
import { motion } from "framer-motion"
import { useAnimatedValue } from "../hooks/useAnimatedValue"
import { clamp } from "../utils/format"
import { Card } from "./Card"

interface HumidityPanelProps {
  humidity: [number, number, number, number]
  delay?: number
}

const SENSOR_LABELS = ["Sever", "Vychod", "Jih", "Zapad"] as const

function humidityColor(value: number): string {
  if (value >= 60) return "#22c55e"
  if (value >= 40) return "#f97316"
  return "#ef4444"
}

const RADAR_CX = 80
const RADAR_CY = 80
const RADAR_RADIUS = 60

function radarPoint(index: number, value: number): { x: number; y: number } {
  const angle = (index / 4) * 2 * Math.PI - Math.PI / 2
  const r = (value / 100) * RADAR_RADIUS
  return { x: RADAR_CX + r * Math.cos(angle), y: RADAR_CY + r * Math.sin(angle) }
}

function radarAxisPoint(index: number): { x: number; y: number } {
  const angle = (index / 4) * 2 * Math.PI - Math.PI / 2
  return { x: RADAR_CX + RADAR_RADIUS * Math.cos(angle), y: RADAR_CY + RADAR_RADIUS * Math.sin(angle) }
}

interface AnimatedBarProps {
  label: string
  value: number
  highlighted: boolean
  onHover: (active: boolean) => void
}

const AnimatedBar = ({ label, value, highlighted, onHover }: AnimatedBarProps) => {
  const animated = useAnimatedValue(clamp(value, 0, 100), 1200)
  const color = humidityColor(animated)

  return (
    <div
      className="group cursor-default"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="flex justify-between items-center mb-1">
        <span
          className="font-mono text-xs tracking-[0.15em] uppercase transition-colors duration-200"
          style={{ color: highlighted ? color : "#6b7e6b" }}
        >
          {label}
        </span>
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {Math.round(animated)}%
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-elevated overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          animate={{ width: `${animated}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

export const HumidityPanel = ({ humidity, delay = 0 }: HumidityPanelProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const average = Math.round(humidity.reduce((a, b) => a + b, 0) / 4)
  const avgColor = humidityColor(average)

  const points = humidity.map((v, i) => radarPoint(i, v))
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ")

  const gridLevels = [25, 50, 75, 100]

  return (
    <Card delay={delay} className="flex flex-col gap-4 h-full">
      <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
        Vlhkost pudy
      </span>

      <div className="flex flex-col gap-3">
        {SENSOR_LABELS.map((label, i) => (
          <AnimatedBar
            key={label}
            label={label}
            value={humidity[i]}
            highlighted={hoveredIndex === i}
            onHover={(active) => setHoveredIndex(active ? i : null)}
          />
        ))}
      </div>

      <div className="flex items-center gap-6 mt-auto pt-4 border-t border-border">
        <svg width={160} height={160} viewBox="0 0 160 160">
          {gridLevels.map((level) => {
            const r = (level / 100) * RADAR_RADIUS
            const gPoints = [0, 1, 2, 3].map((i) => {
              const angle = (i / 4) * 2 * Math.PI - Math.PI / 2
              return `${RADAR_CX + r * Math.cos(angle)},${RADAR_CY + r * Math.sin(angle)}`
            }).join(" ")
            return (
              <polygon
                key={level}
                points={gPoints}
                fill="none"
                stroke="#1a2e1a"
                strokeWidth={1}
              />
            )
          })}

          {[0, 1, 2, 3].map((i) => {
            const axisEnd = radarAxisPoint(i)
            return (
              <line
                key={i}
                x1={RADAR_CX}
                y1={RADAR_CY}
                x2={axisEnd.x}
                y2={axisEnd.y}
                stroke="#1a2e1a"
                strokeWidth={1}
              />
            )
          })}

          <motion.polygon
            points={polygonPoints}
            fill="#22c55e22"
            stroke="#22c55e"
            strokeWidth={1.5}
            animate={{ points: polygonPoints }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredIndex === i ? 5 : 3}
              fill={humidityColor(humidity[i])}
              animate={{ cx: p.x, cy: p.y, r: hoveredIndex === i ? 5 : 3 }}
              transition={{ duration: 1, ease: "easeInOut" }}
              style={{ filter: hoveredIndex === i ? `drop-shadow(0 0 4px ${humidityColor(humidity[i])})` : "none" }}
            />
          ))}

          {[0, 1, 2, 3].map((i) => {
            const axisEnd = radarAxisPoint(i)
            const labelOffset = 14
            const angle = (i / 4) * 2 * Math.PI - Math.PI / 2
            return (
              <text
                key={i}
                x={RADAR_CX + (RADAR_RADIUS + labelOffset) * Math.cos(angle)}
                y={RADAR_CY + (RADAR_RADIUS + labelOffset) * Math.sin(angle)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={hoveredIndex === i ? humidityColor(humidity[i]) : "#6b7e6b"}
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="600"
                fontSize={9}
                style={{ transition: "fill 200ms" }}
              >
                {SENSOR_LABELS[i][0]}
              </text>
            )
          })}
        </svg>

        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-text-secondary tracking-[0.12em] uppercase">Prumer</span>
          <span className="font-mono text-3xl font-bold" style={{ color: avgColor }}>
            {average}
            <span className="text-base ml-0.5 font-normal" style={{ color: avgColor + "99" }}>%</span>
          </span>
        </div>
      </div>
    </Card>
  )
}
