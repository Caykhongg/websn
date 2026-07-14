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

    const rocket = {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 6,
      vy: (Math.random() - 0.5) * 6,
      targetX: Math.random() * W,
      targetY: Math.random() * H,
      trail: [] as { x: number; y: number }[],
    }

    const sparks: { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number }[] = []
    let phase: "fly" | "converge" | "explode" = "fly"
    const MIN_FLY_TIME = 4000
    const START_TIME = performance.now()
    let frame: number

    const animate = (now: number) => {
      ctx!.clearRect(0, 0, W, H)

      if (phase === "fly") {
        // Random movement - steer toward target
        const dx = rocket.targetX - rocket.x
        const dy = rocket.targetY - rocket.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 30) {
          rocket.targetX = Math.random() * W
          rocket.targetY = Math.random() * H
        }

        rocket.vx += (dx / (dist || 1)) * 0.05 + (Math.random() - 0.5) * 0.4
        rocket.vy += (dy / (dist || 1)) * 0.05 + (Math.random() - 0.5) * 0.4
        rocket.vx = Math.max(-5, Math.min(5, rocket.vx))
        rocket.vy = Math.max(-5, Math.min(5, rocket.vy))
        rocket.x += rocket.vx
        rocket.y += rocket.vy

        // Keep in bounds
        if (rocket.x < 0 || rocket.x > W) { rocket.vx *= -0.5; rocket.targetX = Math.random() * W }
        if (rocket.y < 0 || rocket.y > H) { rocket.vy *= -0.5; rocket.targetY = Math.random() * H }

        // Trail
        rocket.trail.push({ x: rocket.x, y: rocket.y })
        if (rocket.trail.length > 40) rocket.trail.shift()

        // Draw trail
        for (let i = 0; i < rocket.trail.length; i++) {
          const alpha = (i / rocket.trail.length) * 0.6
          ctx!.globalAlpha = alpha
          ctx!.fillStyle = "#fff"
          ctx!.beginPath()
          ctx!.arc(rocket.trail[i].x, rocket.trail[i].y, 2 + (i / rocket.trail.length) * 3, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.globalAlpha = 1

        // Draw rocket
        ctx!.fillStyle = "#ffd700"
        ctx!.beginPath()
        ctx!.arc(rocket.x, rocket.y, 6, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.fillStyle = "rgba(255,215,0,0.3)"
        ctx!.beginPath()
        ctx!.arc(rocket.x, rocket.y, 14, 0, Math.PI * 2)
        ctx!.fill()

        // Sparkle particles behind rocket
        for (let i = 0; i < 3; i++) {
          ctx!.fillStyle = `hsla(${30 + Math.random() * 30}, 100%, ${50 + Math.random() * 30}%, 0.5)`
          ctx!.beginPath()
          ctx!.arc(
            rocket.x + (Math.random() - 0.5) * 10,
            rocket.y + (Math.random() - 0.5) * 10,
            1 + Math.random() * 2,
            0, Math.PI * 2
          )
          ctx!.fill()
        }

        if (now - START_TIME >= MIN_FLY_TIME) {
          phase = "converge"
        }

        frame = requestAnimationFrame(animate)
      } else if (phase === "converge") {
        const dx = cx - rocket.x
        const dy = cy - rocket.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist > 3) {
          rocket.vx += dx * 0.03
          rocket.vy += dy * 0.03
          rocket.vx *= 0.95
          rocket.vy *= 0.95
          rocket.x += rocket.vx
          rocket.y += rocket.vy
        }

        // Draw converging rocket with trail
        rocket.trail.push({ x: rocket.x, y: rocket.y })
        if (rocket.trail.length > 60) rocket.trail.shift()

        for (let i = 0; i < rocket.trail.length; i++) {
          const alpha = (i / rocket.trail.length) * 0.8
          ctx!.globalAlpha = alpha
          ctx!.fillStyle = "#fff"
          ctx!.beginPath()
          ctx!.arc(rocket.trail[i].x, rocket.trail[i].y, 1 + (i / rocket.trail.length) * 2, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.globalAlpha = 1

        ctx!.fillStyle = "#ffd700"
        ctx!.beginPath()
        ctx!.arc(rocket.x, rocket.y, 5, 0, Math.PI * 2)
        ctx!.fill()

        // Explode when close enough
        if (dist < 10) {
          phase = "explode"
          ctx!.fillStyle = "#ffffff"
          ctx!.fillRect(0, 0, W, H)

          for (let i = 0; i < 400; i++) {
            const angle = Math.random() * Math.PI * 2
            const speed = 4 + Math.random() * 18
            sparks.push({
              x: cx,
              y: cy,
              vx: Math.cos(angle) * speed,
              vy: Math.sin(angle) * speed - 2,
              size: 2 + Math.random() * 4,
              life: 0,
              maxLife: 50 + Math.random() * 50,
            })
          }
        }

        frame = requestAnimationFrame(animate)
      } else if (phase === "explode" && !doneRef.current) {
        ctx!.fillStyle = "rgba(255,255,255,0.92)"
        ctx!.fillRect(0, 0, W, H)

        let alive = false
        for (const s of sparks) {
          if (s.life >= s.maxLife) continue
          alive = true
          s.x += s.vx
          s.y += s.vy
          s.vy += 0.04
          s.life++
          const alpha = 1 - s.life / s.maxLife
          ctx!.globalAlpha = alpha
          ctx!.fillStyle = `hsl(${30 + Math.random() * 30}, 100%, ${50 + alpha * 40}%)`
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
