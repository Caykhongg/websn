import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"

interface BalloonPresentationProps {
  color: string
  onComplete?: () => void
}

interface Balloon {
  id: number
  x: number
  y: number
  size: number
  delay: number
  popped: boolean
}

export function BalloonPresentation({ color, onComplete }: BalloonPresentationProps) {
  const [balloons, setBalloons] = useState<Balloon[]>([])
  const [allPopped, setAllPopped] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const popParticles = useRef<{ x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[]>([])
  const animFrame = useRef<number>(0)
  const doneRef = useRef(false)

  useEffect(() => {
    const b: Balloon[] = []
    for (let i = 0; i < 12; i++) {
      b.push({
        id: i,
        x: 10 + Math.random() * 80,
        y: 10 + Math.random() * 70,
        size: 40 + Math.random() * 30,
        delay: Math.random() * 2,
        popped: false,
      })
    }
    setBalloons(b)
  }, [])

  const popBalloon = useCallback((id: number, cx: number, cy: number) => {
    // Add pop particles
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 2 + Math.random() * 5
      popParticles.current.push({
        x: cx,
        y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 20 + Math.random() * 20,
        size: 2 + Math.random() * 4,
      })
    }

    setBalloons((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, popped: true } : b))
      if (next.every((b) => b.popped) && !doneRef.current) {
        doneRef.current = true
        setTimeout(() => setAllPopped(true), 500)
      }
      return next
    })
  }, [])

  // Animate pop particles
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (let i = popParticles.current.length - 1; i >= 0; i--) {
        const p = popParticles.current[i]
        if (p.life >= p.maxLife) {
          popParticles.current.splice(i, 1)
          continue
        }
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life++
        const alpha = 1 - p.life / p.maxLife
        ctx!.globalAlpha = alpha
        ctx!.fillStyle = color
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
      animFrame.current = requestAnimationFrame(animate)
    }
    animFrame.current = requestAnimationFrame(animate)
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current)
    }
  }, [color])

  useEffect(() => {
    if (!allPopped) return
    const timer = setTimeout(() => onComplete?.(), 1000)
    return () => clearTimeout(timer)
  }, [allPopped, onComplete])

  return (
    <div className="relative w-full h-full min-h-[60vh] flex items-center justify-center">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" />

      <AnimatePresence>
        {balloons.map((b) =>
          !b.popped ? (
            <motion.button
              key={b.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -20, 0],
              }}
              transition={{
                opacity: { delay: b.delay },
                scale: { delay: b.delay },
                y: { repeat: Infinity, duration: 3 + Math.random(), delay: b.delay, ease: "easeInOut" },
              }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                popBalloon(b.id, rect.left + rect.width / 2, rect.top + rect.height / 2)
              }}
              className="absolute cursor-pointer select-none"
              style={{
                left: `${b.x}%`,
                top: `${b.y}%`,
              }}
              aria-label="Pop balloon"
            >
              <svg width={b.size} height={b.size * 1.2} viewBox="0 0 40 48" fill="none">
                <ellipse cx="20" cy="22" rx="18" ry="22" fill={color} />
                <polygon points="20,42 16,48 24,48" fill={color} />
                <line x1="20" y1="48" x2="20" y2="52" stroke="#999" strokeWidth="1" />
                <ellipse cx="14" cy="18" rx="2" ry="3" fill="rgba(255,255,255,0.3)" />
              </svg>
            </motion.button>
          ) : null
        )}
      </AnimatePresence>
    </div>
  )
}
