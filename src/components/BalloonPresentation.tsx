import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"

interface BalloonPresentationProps {
  color: string
  onComplete?: () => void
}

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return r ? `${parseInt(r[1], 16)},${parseInt(r[2], 16)},${parseInt(r[3], 16)}` : "255,100,150"
}

export function BalloonPresentation({ color, onComplete }: BalloonPresentationProps) {
  const [mode, setMode] = useState<"idle" | "flying" | "popped" | "done">("idle")
  const [pullDir, setPullDir] = useState<"up" | "down" | null>(null)
  const [pullAmount, setPullAmount] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dragStartY = useRef(0)
  const pullStartY = useRef(0)
  const doneRef = useRef(false)

  // Pull string logic
  const handleStringPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragStartY.current = e.clientY
    pullStartY.current = 0

    const onMove = (ev: globalThis.PointerEvent) => {
      const delta = dragStartY.current - ev.clientY
      pullStartY.current = delta
      const amount = Math.min(Math.abs(delta) / 200, 1)
      setPullAmount(amount)
      setPullDir(delta > 0 ? "up" : "down")
      setShowHint(false)

      if (amount >= 0.8) {
        setMode("flying")
        window.removeEventListener("pointermove", onMove)
        window.removeEventListener("pointerup", onUp)
      }
    }

    const onUp = () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      if (pullStartY.current < 50) {
        setPullAmount(0)
        setPullDir(null)
      }
    }

    window.addEventListener("pointermove", onMove)
    window.addEventListener("pointerup", onUp)
  }, [])

  // Flying complete
  useEffect(() => {
    if (mode !== "done") return
    const timer = setTimeout(() => onComplete?.(), 500)
    return () => clearTimeout(timer)
  }, [mode, onComplete])

  // Water splash pop effect
  useEffect(() => {
    if (mode !== "popped") return
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
    const rgb = hexToRgb(color)

    const totalFrames = 240
    const onCompleteFrame = 150

    // Splat blobs — large overlapping blobs for full screen coverage
    const blobs: { x: number; y: number; rx: number; ry: number; rot: number; delay: number; expand: number }[] = []
    for (let i = 0; i < 35; i++) {
      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 40
      blobs.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        rx: 80 + Math.random() * 250,
        ry: 60 + Math.random() * 200,
        rot: Math.random() * Math.PI,
        delay: Math.random() * 3,
        expand: 0.8 + Math.random() * 0.4,
      })
    }

    // Radial splats — few, round, wide
    const spikes: { angle: number; rx: number; ry: number; delay: number }[] = []
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2
      spikes.push({
        angle,
        rx: 100 + Math.random() * 200,
        ry: 30 + Math.random() * 60,
        delay: Math.random() * 3,
      })
    }

    // Droplets with trails
    const drops: { x: number; y: number; vx: number; vy: number; r: number; life: number; trail: { x: number; y: number }[] }[] = []
    for (let i = 0; i < 140; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 15
      drops.push({
        x: cx + (Math.random() - 0.5) * 30,
        y: cy + (Math.random() - 0.5) * 30,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        r: 1.5 + Math.random() * 7,
        life: 0,
        trail: [],
      })
    }

    let frame = 0
    let completedCalled = false
    let animId: number

    const animate = () => {
      ctx!.clearRect(0, 0, W, H)
      const progress = Math.min(frame / totalFrames, 1)
      const splashAlpha = Math.max(0, 1 - progress * 1.1)

      // Call onComplete when splash is mostly faded but still visible
      if (!completedCalled && frame >= onCompleteFrame) {
        completedCalled = true
        setTimeout(() => onComplete?.(), 100)
      }

      // Draw blobs — full opacity, covers everything
      for (const b of blobs) {
        const p = Math.max(0, Math.min(1, (frame - b.delay) / 8))
        if (p <= 0) continue
        const a = splashAlpha * 0.95 * p
        if (a < 0.01) continue
        ctx!.globalAlpha = a
        ctx!.save()
        ctx!.translate(b.x, b.y)
        ctx!.rotate(b.rot)
        ctx!.beginPath()
        ctx!.ellipse(0, 0, b.rx * p, b.ry * p, 0, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${rgb}, 1)`
        ctx!.fill()
        ctx!.restore()
      }

      // Draw splats — round, wide, few
      for (const sp of spikes) {
        const p = Math.max(0, Math.min(1, (frame - sp.delay) / 6))
        if (p <= 0) continue
        const a = splashAlpha * 0.85 * p
        if (a < 0.01) continue
        ctx!.globalAlpha = a
        ctx!.save()
        ctx!.translate(cx, cy)
        ctx!.rotate(sp.angle)
        ctx!.beginPath()
        ctx!.ellipse(0, 0, sp.rx * p, sp.ry * p, 0, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${rgb}, 1)`
        ctx!.fill()
        ctx!.restore()
      }

      // Draw highlight sheen (white overlay for wet look)
      ctx!.globalAlpha = splashAlpha * 0.15
      for (let i = 0; i < 12; i++) {
        const a = Math.random() * Math.PI * 2
        const d = 10 + Math.random() * 120
        ctx!.beginPath()
        ctx!.ellipse(
          cx + Math.cos(a) * d,
          cy + Math.sin(a) * d,
          20 + Math.random() * 60,
          12 + Math.random() * 30,
          Math.random() * Math.PI,
          0, Math.PI * 2,
        )
        ctx!.fillStyle = "#ffffff"
        ctx!.fill()
      }

      // Draw droplets
      ctx!.globalAlpha = splashAlpha * 0.85
      for (const d of drops) {
        if (d.life > 60) continue
        d.trail.push({ x: d.x, y: d.y })
        if (d.trail.length > 6) d.trail.shift()
        d.x += d.vx
        d.y += d.vy
        d.vy += 0.08
        d.vx *= 0.99
        d.life++

        const da = splashAlpha * Math.max(0, 1 - d.life / 60)
        // Trail
        for (let t = 0; t < d.trail.length; t++) {
          ctx!.globalAlpha = da * (t / d.trail.length) * 0.3
          ctx!.beginPath()
          ctx!.arc(d.trail[t].x, d.trail[t].y, d.r * (t / d.trail.length) * 0.6, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(${rgb}, 1)`
          ctx!.fill()
        }
        // Droplet
        ctx!.globalAlpha = da
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${rgb}, 1)`
        ctx!.fill()
      }

      ctx!.globalAlpha = 1

      frame++
      if (frame <= totalFrames + 20) {
        animId = requestAnimationFrame(animate)
      } else if (!doneRef.current) {
        doneRef.current = true
        onComplete?.()
      }
    }

    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [mode, color, onComplete])

  // Hide hint after 3s
  useEffect(() => {
    if (!showHint) return
    const timer = setTimeout(() => setShowHint(false), 3000)
    return () => clearTimeout(timer)
  }, [showHint])

  return (
    <div className="relative flex items-center justify-center w-full min-h-[60vh]">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-30" style={{ display: mode === "popped" ? "block" : "none" }} />

      {/* Floating balloon */}
      <AnimatePresence>
        {mode === "idle" && (
          <motion.div
            key="balloon"
            initial={{ scale: 0 }}
            animate={{ scale: 1, y: [0, -12, 0] }}
            transition={{ scale: { type: "spring", damping: 12 }, y: { repeat: Infinity, duration: 3, ease: "easeInOut" } }}
            className="relative flex flex-col items-center z-20"
          >
            {/* Balloon body - tap to pop */}
            <motion.button
              onClick={() => setMode("popped")}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.9 }}
              className="relative cursor-pointer select-none outline-none"
              aria-label="Pop balloon"
            >
              <svg width="140" height="170" viewBox="0 0 140 170">
                <defs>
                  <radialGradient id="balloonGrad" cx="40%" cy="30%">
                    <stop offset="0%" stopColor="#fff" stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="1" />
                  </radialGradient>
                </defs>
                <ellipse cx="70" cy="85" rx="60" ry="80" fill="url(#balloonGrad)" />
                <polygon points="70,160 60,170 80,170" fill={color} />
                <ellipse cx="48" cy="65" rx="12" ry="16" fill="rgba(255,255,255,0.25)" transform="rotate(-15 48 65)" />
              </svg>
            </motion.button>

            {/* String - pull to release */}
            <div
              className="relative cursor-grab active:cursor-grabbing touch-none select-none"
              onPointerDown={handleStringPointerDown}
              style={{ touchAction: "none" }}
            >
              <svg width="4" height="160" viewBox="0 0 4 160" className="overflow-visible">
                <path
                  d="M2,0 Q4,30 2,60 Q0,90 3,120 Q4,140 2,160"
                  fill="none"
                  stroke={pullDir === "down" ? "#999" : "#ccc"}
                  strokeWidth="2"
                  strokeDasharray={pullDir ? "4 2" : "none"}
                />
              </svg>
              {pullAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -left-6 top-1/2 -translate-y-1/2 text-xs text-white/50"
                >
                  {pullDir === "up" ? "↑" : "↓"}
                </motion.div>
              )}
            </div>

            {/* Pull progress bar */}
            {pullAmount > 0.05 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-[-40px] w-20 h-1 bg-white/20 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-white/60 rounded-full transition-all duration-75"
                  style={{ width: `${pullAmount * 100}%` }}
                />
              </motion.div>
            )}

            {/* Instruction hints */}
            <AnimatePresence>
              {showHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-[-70px] text-center space-y-1"
                >
                  <p className="text-xs text-white/60">⬆ Pull string or tap balloon ⬇</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Balloon flying up */}
      <AnimatePresence>
        {mode === "flying" && (
          <motion.div
            key="balloon-fly"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -window.innerHeight - 200, opacity: 0, scale: 0.5 }}
            transition={{ duration: 1.5, ease: "easeIn" }}
            onAnimationComplete={() => setMode("done")}
            className="relative z-20"
          >
            <svg width="100" height="120" viewBox="0 0 140 170">
              <ellipse cx="70" cy="85" rx="60" ry="80" fill={color} />
              <polygon points="70,160 60,170 80,170" fill={color} />
              <path d="M70,170 Q72,200 70,250" fill="none" stroke="#ccc" strokeWidth="2" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
