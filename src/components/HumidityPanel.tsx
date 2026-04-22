import { useId } from "react";
import { motion } from "framer-motion";
import { useAnimatedValue } from "../hooks/useAnimatedValue";
import { clamp } from "../utils/format";
import { Card } from "./Card";

interface HumidityPanelProps {
    humidity: number;
    delay?: number;
}

function humidityColor(value: number): string {
    if (value >= 60) return "#22c55e";
    if (value >= 40) return "#f97316";
    return "#ef4444";
}

function humidityStatus(value: number): string {
    if (value >= 60) return "Optimalni";
    if (value >= 40) return "Sucho";
    return "Kriticke sucho";
}

const ARC_START_DEG = 135;
const ARC_END_DEG = 405;
const ARC_RANGE_DEG = ARC_END_DEG - ARC_START_DEG;
const RADIUS = 90;
const CX = 110;
const CY = 110;

function degToRad(deg: number) {
    return (deg * Math.PI) / 180;
}

function pointOnArc(deg: number) {
    const rad = degToRad(deg);
    return { x: CX + RADIUS * Math.cos(rad), y: CY + RADIUS * Math.sin(rad) };
}

function arcPath(startDeg: number, endDeg: number, r: number) {
    const s = pointOnArc(startDeg);
    const e = {
        x: CX + r * Math.cos(degToRad(endDeg)),
        y: CY + r * Math.sin(degToRad(endDeg)),
    };
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
}

const TICKS = [0, 20, 40, 60, 80, 100];

export const HumidityPanel = ({ humidity, delay = 0 }: HumidityPanelProps) => {
    const gradientId = useId();
    const animated = useAnimatedValue(clamp(humidity, 0, 100), 1000);
    const color = humidityColor(animated);
    const status = humidityStatus(animated);

    const normalized = animated / 100;
    const needleDeg = ARC_START_DEG + normalized * ARC_RANGE_DEG;
    const needlePoint = pointOnArc(needleDeg);

    const optimalStartDeg = ARC_START_DEG + (60 / 100) * ARC_RANGE_DEG;
    const optimalEndDeg = ARC_START_DEG + (100 / 100) * ARC_RANGE_DEG;

    return (
        <Card delay={delay} className="flex flex-col items-center gap-2 h-full">
            <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
                Vlhkost pudy
            </span>

            <svg
                width={220}
                height={180}
                viewBox="0 0 220 180"
                aria-label={`Vlhkost: ${Math.round(animated)}%`}
            >
                <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#ef4444" />
                        <stop offset="40%" stopColor="#f97316" />
                        <stop offset="60%" stopColor="#22c55e" />
                        <stop offset="100%" stopColor="#22c55e" />
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

                <motion.path
                    d={arcPath(ARC_START_DEG, needleDeg, RADIUS)}
                    fill="none"
                    stroke={`url(#${gradientId})`}
                    strokeWidth={10}
                    strokeLinecap="round"
                    initial={false}
                    animate={{ d: arcPath(ARC_START_DEG, needleDeg, RADIUS) }}
                    transition={{ duration: 1, ease: "easeOut" }}
                />

                {TICKS.map((tick) => {
                    const deg = ARC_START_DEG + (tick / 100) * ARC_RANGE_DEG;
                    const outer = pointOnArc(deg);
                    const innerR = RADIUS - 14;
                    const inner = {
                        x: CX + innerR * Math.cos(degToRad(deg)),
                        y: CY + innerR * Math.sin(degToRad(deg)),
                    };
                    const labelR = RADIUS + 14;
                    const label = {
                        x: CX + labelR * Math.cos(degToRad(deg)),
                        y: CY + labelR * Math.sin(degToRad(deg)),
                    };
                    return (
                        <g key={tick}>
                            <line
                                x1={inner.x}
                                y1={inner.y}
                                x2={outer.x}
                                y2={outer.y}
                                stroke="#6b7e6b"
                                strokeWidth={1}
                            />
                            <text
                                x={label.x}
                                y={label.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#6b7e6b"
                                fontFamily="JetBrains Mono, monospace"
                                fontSize={8}
                            >
                                {tick}
                            </text>
                        </g>
                    );
                })}

                <motion.circle
                    cx={needlePoint.x}
                    cy={needlePoint.y}
                    r={5}
                    fill={color}
                    animate={{ cx: needlePoint.x, cy: needlePoint.y }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    style={{ filter: `drop-shadow(0 0 6px ${color})` }}
                />
            </svg>

            <span className="font-mono text-4xl font-bold" style={{ color }}>
                {Math.round(animated)}
                <span
                    className="text-lg ml-0.5 font-normal"
                    style={{ color: color + "99" }}
                >
                    %
                </span>
            </span>

            <span
                className="font-mono text-xs tracking-[0.15em] uppercase"
                style={{ color: color + "cc" }}
            >
                {status}
            </span>
        </Card>
    );
};
