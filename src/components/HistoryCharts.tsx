import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import type { DataPoint } from "../types";
import { Card } from "./Card";

interface HistoryChartsProps {
    getSlice: (rangeMs: number) => {
        humidity: DataPoint[];
    };
    delay?: number;
}

type TimeRange = "1h" | "6h" | "24h" | "7d";

const TIME_RANGES: { label: TimeRange; ms: number }[] = [
    { label: "1h", ms: 60 * 60 * 1000 },
    { label: "6h", ms: 6 * 60 * 60 * 1000 },
    { label: "24h", ms: 24 * 60 * 60 * 1000 },
    { label: "7d", ms: 7 * 24 * 60 * 60 * 1000 },
];

const HUMIDITY_COLORS = ["#22c55e"] as const;
const HUMIDITY_LABELS = ["Vlhkost"] as const;

function formatAxisTime(timestamp: number, rangeMs: number): string {
    const d = new Date(timestamp);
    if (rangeMs <= 60 * 60 * 1000) {
        return d.toLocaleTimeString("cs", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    }
    if (rangeMs <= 24 * 60 * 60 * 1000) {
        return d.toLocaleTimeString("cs", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }
    return d.toLocaleDateString("cs", {
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function mergeToChartData(humidity: DataPoint[]) {
    const sorted = [...humidity].sort((a, b) => a.timestamp - b.timestamp);
    return sorted.map((p) => ({
        timestamp: p.timestamp,
        humidity: p.value,
    }));
}

const CustomTooltip = ({
    active,
    payload,
    label,
}: {
    active?: boolean;
    payload?: { color: string; name: string; value: number }[];
    label?: number;
}) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-surface-elevated border border-border rounded-lg p-3 font-mono text-xs shadow-xl">
            <p className="text-text-secondary mb-2 text-[10px] tracking-[0.1em]">
                {label ? new Date(label).toLocaleString("cs") : ""}
            </p>
            {payload.map((entry, i) => (
                <p
                    key={i}
                    style={{ color: entry.color }}
                    className="tracking-[0.08em]"
                >
                    {entry.name}:{" "}
                    {typeof entry.value === "number"
                        ? entry.value.toFixed(1)
                        : "–"}
                </p>
            ))}
        </div>
    );
};

export const HistoryCharts = ({ getSlice, delay = 0 }: HistoryChartsProps) => {
    const [activeRange, setActiveRange] = useState<TimeRange>("1h");

    const rangeMs = TIME_RANGES.find((r) => r.label === activeRange)!.ms;
    const slice = getSlice(rangeMs);
    const chartData = mergeToChartData(slice.humidity);

    return (
        <Card delay={delay} className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
                    Historie vlhkosti
                </span>

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
                    <LineChart
                        data={chartData}
                        margin={{ top: 4, right: 4, bottom: 4, left: 0 }}
                    >
                        <CartesianGrid
                            stroke="#1a2e1a"
                            strokeDasharray="3 3"
                            vertical={false}
                        />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(v) => formatAxisTime(v, rangeMs)}
                            tick={{
                                fill: "#6b7e6b",
                                fontFamily: "JetBrains Mono, monospace",
                                fontSize: 9,
                            }}
                            tickLine={false}
                            axisLine={{ stroke: "#1a2e1a" }}
                            minTickGap={40}
                        />
                        <YAxis
                            tick={{
                                fill: "#6b7e6b",
                                fontFamily: "JetBrains Mono, monospace",
                                fontSize: 9,
                            }}
                            tickLine={false}
                            axisLine={false}
                            width={32}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Line
                            type="monotone"
                            dataKey="humidity"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4, fill: "#22c55e" }}
                            name="Vlhkost (%)"
                            isAnimationActive={true}
                            animationDuration={800}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </Card>
    );
};
