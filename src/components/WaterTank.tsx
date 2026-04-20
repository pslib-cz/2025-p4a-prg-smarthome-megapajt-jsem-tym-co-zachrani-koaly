import { useId } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "./Card"

interface WaterTankProps {
  waterPresent: boolean
  delay?: number
}

const TANK_WIDTH = 160
const TANK_HEIGHT = 280
const PADDING = 20

const FILL_PRESENT = 0.78
const FILL_ABSENT = 0.08

export const WaterTank = ({ waterPresent, delay = 0 }: WaterTankProps) => {
  const gradientId = useId()
  const clipId = useId()

  const fillRatio = waterPresent ? FILL_PRESENT : FILL_ABSENT
  const fillHeight = TANK_HEIGHT * fillRatio
  const waterY = PADDING + TANK_HEIGHT - fillHeight
  const color = waterPresent ? "#0ea5e9" : "#ef4444"

  const graduations = [0, 25, 50, 75, 100]

  return (
    <Card delay={delay} className="flex flex-col items-center gap-4 h-full">
      <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
        Nadrz na vodu
      </span>

      <div className="relative group cursor-default">
        <svg
          width={TANK_WIDTH + 60}
          height={TANK_HEIGHT + PADDING * 2}
          aria-label={`Hladina vody: ${waterPresent ? "OK" : "nizka"}`}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color + "bb"} />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
            <clipPath id={clipId}>
              <rect x={PADDING} y={PADDING} width={TANK_WIDTH} height={TANK_HEIGHT} rx={8} />
            </clipPath>
          </defs>

          <rect
            x={PADDING}
            y={PADDING}
            width={TANK_WIDTH}
            height={TANK_HEIGHT}
            rx={8}
            fill="#050a05"
            stroke="#1a2e1a"
            strokeWidth={1.5}
          />

          <motion.rect
            x={PADDING}
            y={waterY}
            width={TANK_WIDTH}
            height={fillHeight}
            fill={`url(#${gradientId})`}
            clipPath={`url(#${clipId})`}
            animate={{ y: waterY, height: fillHeight }}
            transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
          />

          <AnimatePresence>
            {!waterPresent && (
              <motion.rect
                x={PADDING}
                y={waterY}
                width={TANK_WIDTH}
                height={fillHeight}
                fill={color + "44"}
                clipPath={`url(#${clipId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          <AnimatePresence>
            {waterPresent && (
              <motion.g
                clipPath={`url(#${clipId})`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  fill={color + "33"}
                  animate={{
                    d: [
                      `M${PADDING},${waterY} Q${PADDING + 40},${waterY - 8} ${PADDING + 80},${waterY} Q${PADDING + 120},${waterY + 8} ${PADDING + TANK_WIDTH},${waterY} L${PADDING + TANK_WIDTH},${PADDING + TANK_HEIGHT} L${PADDING},${PADDING + TANK_HEIGHT} Z`,
                      `M${PADDING},${waterY} Q${PADDING + 40},${waterY + 8} ${PADDING + 80},${waterY} Q${PADDING + 120},${waterY - 8} ${PADDING + TANK_WIDTH},${waterY} L${PADDING + TANK_WIDTH},${PADDING + TANK_HEIGHT} L${PADDING},${PADDING + TANK_HEIGHT} Z`,
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                />

                {[1, 2, 3, 4].map((i) => (
                  <motion.circle
                    key={i}
                    cx={PADDING + (TANK_WIDTH / 5) * i}
                    cy={PADDING + TANK_HEIGHT - 10}
                    r={2}
                    fill={color + "99"}
                    animate={{
                      cy: [PADDING + TANK_HEIGHT - 10, waterY + 10],
                      opacity: [0.8, 0],
                    }}
                    transition={{
                      duration: 2 + i * 0.7,
                      repeat: Infinity,
                      delay: i * 0.5,
                      ease: "easeOut",
                    }}
                  />
                ))}
              </motion.g>
            )}
          </AnimatePresence>

          <text
            x={PADDING + TANK_WIDTH / 2}
            y={PADDING + TANK_HEIGHT / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontFamily="Space Grotesk, sans-serif"
            fontWeight="700"
            fontSize="15"
            letterSpacing="2"
          >
            {waterPresent ? "HLADINA OK" : "NIZKA HLADINA"}
          </text>

          {graduations.map((pct) => {
            const gy = PADDING + TANK_HEIGHT - (pct / 100) * TANK_HEIGHT
            return (
              <g key={pct}>
                <line
                  x1={PADDING + TANK_WIDTH}
                  y1={gy}
                  x2={PADDING + TANK_WIDTH + 8}
                  y2={gy}
                  stroke="#2d4a2d"
                  strokeWidth={1}
                />
                <text
                  x={PADDING + TANK_WIDTH + 12}
                  y={gy}
                  dominantBaseline="middle"
                  fill="#6b7e6b"
                  fontFamily="JetBrains Mono, monospace"
                  fontSize="9"
                >
                  {pct}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      <span
        className="font-mono text-xs tracking-[0.15em] uppercase"
        style={{ color }}
      >
        {waterPresent ? "Dostatek vody" : "Doplnte vodu"}
      </span>
    </Card>
  )
}
