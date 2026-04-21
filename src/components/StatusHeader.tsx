import { motion } from "framer-motion"
import { formatRelativeTime } from "../utils/format"

interface StatusHeaderProps {
  connected: boolean
  connecting: boolean
  lastUpdate: Date | null
}

export const StatusHeader = ({ connected, connecting, lastUpdate }: StatusHeaderProps) => {
  const statusLabel = connecting ? "Pripojovani..." : connected ? "Pripojeno" : "Odpojeno"
  const dotColor = connecting ? "bg-warm" : connected ? "bg-primary" : "bg-danger"

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border bg-surface">
      <div>
        <h1 className="font-sans text-2xl font-bold tracking-[0.2em] uppercase text-text-primary leading-none">
          Sklenik
        </h1>
        <p className="font-mono text-xs text-text-secondary tracking-[0.15em] uppercase mt-1">
          IoT Monitoring System
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="relative flex items-center justify-center">
            {connected && (
              <motion.span
                className="absolute inline-flex h-3 w-3 rounded-full bg-primary opacity-75"
                animate={{ scale: [1, 1.8, 1], opacity: [0.75, 0, 0.75] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotColor}`} />
          </div>
          <span className="font-mono text-xs tracking-[0.12em] uppercase text-text-secondary">
            {statusLabel}
          </span>
        </div>

        {lastUpdate && (
          <span className="font-mono text-xs text-text-dim tracking-[0.1em]">
            {formatRelativeTime(lastUpdate)}
          </span>
        )}
      </div>
    </header>
  )
}
