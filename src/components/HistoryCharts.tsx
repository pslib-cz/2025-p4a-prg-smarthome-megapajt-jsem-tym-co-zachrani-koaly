import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import { motion } from "framer-motion"
import type { DataPoint } from "../types"
import { Card } from "./Card"

interface HistoryChartsProps {
  getSlice: (rangeMs: number) => {
    temperature: DataPoint[]
    humidity: [DataPoint[], DataPoint[], DataPoint[], DataPoint[]]
  }
  delay?: number
}

type TimeRange = "1h" | "6h" | "24h" | "7d"

const TIME_RANGES: { label: TimeRange; ms: number }[] = [
  { label: "1h", ms: 60 * 60 * 1000 },
  { label: "6h", ms: 6 * 60 * 60 * 1000 },
  { label: "24h", ms: 24 * 60 * 60 * 1000 },
  { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
]

const HUMIDITY_COLORS = ["#22c55e", "#0ea5e9", "#f97316", "#a78bfa"] as const
const HUMIDITY_LABELS = ["Sever", "Vychod", "Jih", "Zapad"] as const

function formatAxisTime(timestamp: number, rangeMs: number): string {
  const d = new Date(timestamp)
  if (rangeMs <= 60 * 60 * 1000) {
    return d.toLocaleTimeString("cs", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }
  if (rangeMs <= 24 * 60 * 60 * 1000) {
    return d.toLocaleTimeString("cs", { hour: "2-digit", minute: "2-digit" })
  }
  return d.toLocaleDateString("cs", { weekday: "short", hour: "2-digit", minute: "2-digit" })
}

function mergeToChartData(
  temperature: DataPoint[],
  humidity: [DataPoint[], DataPoint[], DataPoint[], DataPoint[]]
) {
  const timestamps = new Set<number>()
  temperature.forEach((p) => timestamps.add(p.timestamp))
  humidity.flat().forEach((p) => timestamps.add(p.timestamp))

  const sorted = Array.from(timestamps).sort((a, b) => a - b)

  const tempMap = new Map(temperature.map((p) => [p.timestamp, p.value]))
  const humMaps = humidity.map((arr) => new Map(arr.map((p) => [p.timestamp, p.value])))

  return sorted.map((ts) => ({
    timestamp: ts,
    temperature: tempMap.get(ts),
    h0: humMaps[0].get(ts),
    h1: humMaps[1].get(ts),
    h2: humMaps[2].get(ts),
    h3: humMaps[3].get(ts),
  }))
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { color: string; name: string; value: number }[]; label?: number }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-elevated border border-border rounded-lg p-3 font-mono text-xs shadow-xl">
      <p className="text-text-secondary mb-2 text-[10px] tracking-[0.1em]">
        {label ? new Date(label).toLocaleString("cs") : ""}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="tracking-[0.08em]">
          {entry.name}: {typeof entry.value === "number" ? entry.value.toFixed(1) : "–"}
        </p>
      ))}
    </div>
  )
}

export const HistoryCharts = ({ getSlice, delay = 0 }: HistoryChartsProps) => {
  const [activeRange, setActiveRange] = useState<TimeRange>("1h")
  const [activeTab, setActiveTab] = useState<"temperature" | "humidity">("temperature")

  const rangeMs = TIME_RANGES.find((r) => r.label === activeRange)!.ms
  const slice = getSlice(rangeMs)
  const chartData = mergeToChartData(slice.temperature, slice.humidity)

  return (
    <Card delay={delay} className="flex flex-col gap-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1">
          {(["temperature", "humidity"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={[
                "font-mono text-xs px-3 py-1.5 rounded-lg border tracking-[0.12em] uppercase transition-colors duration-200",
                activeTab === tab
                  ? "border-primary text-primary bg-primary-glow"
                  : "border-border text-text-secondary hover:border-border-active",
              ].join(" ")}
            >
              {tab === "temperature" ? "Teplota" : "Vlhkost"}
            </button>
          ))}
        </div>

        <div className="flex gap-1">
          {TIME_RANGES.map(({ label }) => (
            <motion.button
              key={label}
              onClick={() => setActiveRange(label)}
              whileTap={{ scale: 0.97 }}
              className={[
                "font-mono text-xs px-3 py-1.5 rounded-lg border tracking-[0.12em] uppercase transition-colors duration-200",
                activeRange === label
                  ? "border-primary text-primary bg-primary-glow"
                  : "border-border text-text-secondary hover:border-border-active",
              ].join(" ")}
            >
              {label}
            </motion.button>
          ))}
        </div>
      </div>

      {chartData.length < 2 ? (
        <div className="h-48 flex items-center justify-center text-text-dim font-mono text-xs tracking-[0.15em] uppercase">
          Cekam na data...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="#1a2e1a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(v) => formatAxisTime(v, rangeMs)}
              tick={{ fill: "#6b7e6b", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}
              tickLine={false}
              axisLine={{ stroke: "#1a2e1a" }}
              minTickGap={40}
            />
            <YAxis
              tick={{ fill: "#6b7e6b", fontFamily: "JetBrains Mono, monospace", fontSize: 9 }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<CustomTooltip />} />

            {activeTab === "temperature" ? (
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#f97316" }}
                name="Teplota (C)"
                isAnimationActive={true}
                animationDuration={800}
              />
            ) : (
              HUMIDITY_COLORS.map((color, i) => (
                <Line
                  key={i}
                  type="monotone"
                  dataKey={`h${i}`}
                  stroke={color}
                  strokeWidth={1.5}
                  dot={false}
                  activeDot={{ r: 3, fill: color }}
                  name={HUMIDITY_LABELS[i]}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              ))
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}
