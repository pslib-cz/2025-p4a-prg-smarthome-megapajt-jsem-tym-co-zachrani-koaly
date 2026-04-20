import { useEffect, useRef, useState } from "react"

export function useAnimatedValue(target: number, durationMs = 800): number {
  const [displayed, setDisplayed] = useState(target)
  const startRef = useRef<number | null>(null)
  const fromRef = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    fromRef.current = displayed
    startRef.current = null

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)

    const animate = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(fromRef.current + (target - fromRef.current) * eased)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, durationMs])

  return displayed
}
