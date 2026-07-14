import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface CakeProps {
  onComplete?: () => void
}

export function Cake({ onComplete }: CakeProps) {
  const [exploded, setExploded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const infoShownRef = useRef(false)

  const handleLight = useCallback(() => {
    setExploded(true)
  }, [])

  useEffect(() => {
    if (!exploded) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = []

    for (let i = 0; i < 300; i++) {
      const angle = (Math.PI * 2 * i) / 300 + (Math.random() - 0.5) * 0.3
      const speed = 8 + Math.random() * 12
      particles.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 60 + Math.random() * 40,
      })
    }

    const colors = ["#FFD700", "#FF6B6B", "#FFEAA7", "#4ECDC4", "#FF8C94", "#DDA0DD", "#fff"]
    let frame: number

    const animate = () => {
      ctx!.fillStyle = "rgba(0,0,0,0.15)"
      ctx!.fillRect(0, 0, canvas.width, canvas.height)

      let alive = false
      for (const p of particles) {
        if (p.life >= p.maxLife) continue
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life++
        const alpha = 1 - p.life / p.maxLife
        ctx!.globalAlpha = alpha
        ctx!.fillStyle = colors[Math.floor(Math.random() * colors.length)]
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 3 + Math.random() * 3, 0, Math.PI * 2)
        ctx!.fill()
      }

      ctx!.globalAlpha = 1
      if (alive) {
        frame = requestAnimationFrame(animate)
      } else {
        ctx!.fillStyle = "rgba(255,255,255,0.95)"
        ctx!.fillRect(0, 0, canvas.width, canvas.height)
        if (!infoShownRef.current) {
          infoShownRef.current = true
          setTimeout(() => onComplete?.(), 2000)
        }
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [exploded, onComplete])

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[60vh]">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      <AnimatePresence>
        {!exploded ? (
          <motion.button
            key="cake-closed"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLight}
            className="relative cursor-pointer select-none"
            aria-label="Light the cake"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="text-[120px] md:text-[160px] leading-none"
            >
              🎂
            </motion.div>
            <div className="mt-2 flex justify-center gap-1">
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="text-2xl"
              >
                🕯️
              </motion.span>
            </div>
            <p className="text-center text-sm text-white/70 mt-2 font-medium">Tap to light!</p>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
