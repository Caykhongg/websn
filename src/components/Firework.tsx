import { useState, useCallback, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface FireworkProps {
  onShowInfo: () => void
}

export function Firework({ onShowInfo }: FireworkProps) {
  const [started, setStarted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startedRef = useRef(false)
  const doneRef = useRef(false)

  const handleStart = useCallback(() => setStarted(true), [])

  useEffect(() => {
    if (!started || startedRef.current) return
    startedRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const W = canvas.width
    const H = canvas.height
    const cx = W / 2
    const cy = H / 2

    const NUM = 25
    const particles: { x: number; y: number; targetX: number; targetY: number; hue: number; speed: number; t: number; converged: boolean }[] = []

    for (let i = 0; i < NUM; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        targetX: Math.random() * W,
        targetY: Math.random() * H,
        hue: Math.random() * 360,
        speed: 0.003 + Math.random() * 0.007,
        t: Math.random() * 2,
        converged: false,
      })
    }

    const sparks: { x: number; y: number; vx: number; vy: number; hue: number; size: number; life: number; maxLife: number }[] = []
    let phase: "fly" | "converge" | "explode" = "fly"
    const START_TIME = performance.now()
    const MIN_FLY_TIME = 4000
    let frame: number

    const animate = (now: number) => {
      ctx!.clearRect(0, 0, W, H)

      if (phase === "fly") {
        const elapsed = now - START_TIME
        let allReady = true

        for (const p of particles) {
          p.t += p.speed
          const swayX = Math.sin(p.t * 30 + p.hue) * (100 + Math.sin(p.hue + p.t * 7) * 50)
          const swayY = Math.cos(p.t * 25 + p.hue * 2) * (80 + Math.cos(p.hue + p.t * 5) * 40)
          const drawX = p.targetX + swayX
          const drawY = p.targetY + swayY

          if (p.t > 3 + Math.random() * 2) {
            p.targetX = Math.random() * W
            p.targetY = Math.random() * H
            p.t = 0
          }

          ctx!.fillStyle = `hsla(${p.hue + p.t * 60}, 95%, 65%, 0.85)`
          ctx!.beginPath()
          ctx!.arc(drawX, drawY, 5 + Math.sin(p.t * 10) * 2, 0, Math.PI * 2)
          ctx!.fill()

          ctx!.fillStyle = `hsla(${p.hue + p.t * 60}, 95%, 75%, 0.25)`
          ctx!.beginPath()
          ctx!.arc(drawX, drawY, 14, 0, Math.PI * 2)
          ctx!.fill()

          if (elapsed < MIN_FLY_TIME) allReady = false
        }

        if (allReady && elapsed >= MIN_FLY_TIME) {
          phase = "converge"
        }

        frame = requestAnimationFrame(animate)
      } else if (phase === "converge") {
        let allAtCenter = true

        for (const p of particles) {
          const dx = cx - p.targetX
          const dy = cy - p.targetY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist > 3) {
            allAtCenter = false
            p.targetX += dx * 0.06
            p.targetY += dy * 0.06
          }

          p.t += p.speed
          const swayX = Math.sin(p.t * 30 + p.hue) * (dist * 0.3)
          const swayY = Math.cos(p.t * 25 + p.hue * 2) * (dist * 0.3)
          const drawX = p.targetX + swayX
          const drawY = p.targetY + swayY

          ctx!.fillStyle = `hsla(${p.hue + p.t * 60}, 95%, 65%, ${0.3 + 0.6 * (1 - dist / 300)})`
          ctx!.beginPath()
          ctx!.arc(drawX, drawY, 3 + (1 - dist / 300) * 4, 0, Math.PI * 2)
          ctx!.fill()
        }

        if (allAtCenter) {
          phase = "explode"
          // White flash
          ctx!.fillStyle = "#ffffff"
          ctx!.fillRect(0, 0, W, H)

          for (let i = 0; i < 500; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 3 + Math.random() * 20
            sparks.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed,
              hue: Math.random() * 360,
              size: 2 + Math.random() * 5,
              life: 0,
              maxLife: 50 + Math.random() * 60,
            })
          }
        }

        frame = requestAnimationFrame(animate)
      } else if (phase === "explode" && !doneRef.current) {
        ctx!.fillStyle = "rgba(255,255,255,0.93)"
        ctx!.fillRect(0, 0, W, H)

        let alive = false
        for (const s of sparks) {
          if (s.life >= s.maxLife) continue
          alive = true
          s.x += s.vx
          s.y += s.vy
          s.vy += 0.04
          s.vx *= 0.99
          s.life++
          const alpha = 1 - s.life / s.maxLife
          ctx!.globalAlpha = alpha
          ctx!.fillStyle = `hsl(${s.hue}, 100%, ${50 + alpha * 30}%)`
          ctx!.beginPath()
          ctx!.arc(s.x, s.y, s.size, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.globalAlpha = 1

        if (!alive) {
          doneRef.current = true
          ctx!.fillStyle = "#ffffff"
          ctx!.fillRect(0, 0, W, H)
          setTimeout(() => onShowInfo(), 500)
          return
        }

        frame = requestAnimationFrame(animate)
      } else {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [started, onShowInfo])

  return (
    <div className="relative flex items-center justify-center w-full min-h-[60vh]">
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40"
        style={{ display: started ? "block" : "none" }}
      />

      <AnimatePresence>
        {!started ? (
          <motion.button
            key="firework-start"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            className="relative cursor-pointer select-none outline-none"
            aria-label="Start fireworks"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="text-[120px] md:text-[160px] leading-none"
            >
              🎆
            </motion.div>
            <p className="text-center text-sm text-white/70 mt-2 font-medium">Tap for fireworks!</p>
          </motion.button>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
