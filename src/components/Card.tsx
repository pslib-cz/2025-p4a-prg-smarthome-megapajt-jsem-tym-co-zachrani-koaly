import { motion } from "framer-motion"
import { ReactNode } from "react"

interface CardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export const Card = ({ children, className = "", delay = 0 }: CardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut", delay }}
    whileHover={{ y: -2 }}
    className={[
      "rounded-xl border border-border bg-surface p-5",
      "transition-[border-color,box-shadow] duration-200",
      "hover:border-border-active hover:shadow-[0_8px_32px_rgba(0,0,0,0.4)]",
      className,
    ].join(" ")}
  >
    {children}
  </motion.div>
)
