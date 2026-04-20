import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "./Card"

interface WindowControlProps {
  isOpen: boolean
  connected: boolean
  onToggle: () => void
  delay?: number
}

export const WindowControl = ({ isOpen, connected, onToggle, delay = 0 }: WindowControlProps) => {
  const [armed, setArmed] = useState(false)
  const armTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (armTimerRef.current) clearTimeout(armTimerRef.current)
    }
  }, [])

  const handleClick = () => {
    if (!connected) return
    if (!armed) {
      setArmed(true)
      armTimerRef.current = setTimeout(() => setArmed(false), 3000)
    } else {
      setArmed(false)
      if (armTimerRef.current) clearTimeout(armTimerRef.current)
      onToggle()
    }
  }

  const paneColor = isOpen ? "#22c55e33" : "#1a2e1a"
  const paneStroke = isOpen ? "#22c55e66" : "#2d4a2d"
  const frameColor = isOpen ? "#2d4a2d" : "#1a2e1a"

  return (
    <Card delay={delay} className="flex flex-col items-center gap-4">
      <span className="font-sans text-xs font-semibold tracking-[0.2em] uppercase text-text-secondary">
        Okno
      </span>

      <div className="relative w-32 h-24">
        <svg width={128} height={96} viewBox="0 0 128 96" aria-label={`Okno je ${isOpen ? "otevrene" : "zavrene"}`}>
          <rect x={4} y={4} width={120} height={88} rx={4} fill="#0a140a" stroke={frameColor} strokeWidth={2} />
          <line x1={64} y1={4} x2={64} y2={92} stroke={frameColor} strokeWidth={2} />
          <line x1={4} y1={48} x2={124} y2={48} stroke={frameColor} strokeWidth={2} />

          {[
            { x: 6, y: 6, w: 56, h: 40 },
            { x: 66, y: 6, w: 56, h: 40 },
            { x: 6, y: 50, w: 56, h: 40 },
            { x: 66, y: 50, w: 56, h: 40 },
          ].map((pane, i) => (
            <motion.rect
              key={i}
              x={pane.x}
              y={pane.y}
              width={pane.w}
              height={pane.h}
              rx={2}
              fill={paneColor}
              stroke={paneStroke}
              strokeWidth={1}
              animate={{ fill: paneColor, stroke: paneStroke }}
              transition={{ duration: 0.6 }}
            />
          ))}
        </svg>

        <AnimatePresence>
          {isOpen && (
            <>
              {[20, 50, 80].map((x, i) => (
                <motion.div
                  key={i}
                  className="absolute top-0 bottom-0 pointer-events-none"
                  style={{ left: x }}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{ opacity: [0, 0.6, 0], scaleY: 1, y: [-20, 20] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                >
                  <svg width={8} height={96} viewBox="0 0 8 96">
                    <path d="M4,0 Q6,24 4,48 Q2,72 4,96" stroke="#22c55e44" strokeWidth={1.5} fill="none" strokeLinecap="round" />
                  </svg>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>
      </div>

      <span
        className="font-mono text-xs tracking-[0.15em] uppercase"
        style={{ color: isOpen ? "#22c55e" : "#6b7e6b" }}
      >
        {isOpen ? "Otevreno" : "Zavreno"}
      </span>

      <motion.button
        onClick={handleClick}
        disabled={!connected}
        whileTap={{ scale: connected ? 0.97 : 1 }}
        className={[
          "w-full py-2.5 px-4 rounded-lg border font-mono text-xs tracking-[0.15em] uppercase font-semibold",
          "transition-colors duration-200",
          !connected
            ? "border-border text-text-dim cursor-not-allowed"
            : armed
            ? "border-warm text-warm bg-warm/10 hover:bg-warm/20"
            : "border-border-active text-text-secondary hover:border-primary hover:text-primary hover:bg-primary-glow",
        ].join(" ")}
      >
        {!connected ? "Nepripojeno" : armed ? "Potvrdit?" : isOpen ? "Zavrit okno" : "Otevrit okno"}
      </motion.button>
    </Card>
  )
}
