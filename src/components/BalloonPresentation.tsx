import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"

interface BalloonPresentationProps {
  color: string
  onComplete?: () => void
}

export function BalloonPresentation({ color, onComplete }: BalloonPresentationProps) {
  const [mode, setMode] = useState<"idle" | "flying" | "popped" | "done">("idle")
  const [pullDir, setPullDir] = useState<"up" | "down" | null>(null)
  const [pullAmount, setPullAmount] = useState(0)
  const [showHint, setShowHint] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const balloonRef = useRef<HTMLDivElement>(null)
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

  // Pop animation on canvas
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

    // Shards flying upward
    const shards: { x: number; y: number; vx: number; vy: number; size: number; rot: number; rotV: number; life: number; maxLife: number }[] = []
    for (let i = 0; i < 60; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.2
      const speed = 2 + Math.random() * 6
      shards.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 2,
        vy: Math.sin(angle) * speed - 2 - Math.random() * 3,
        size: 3 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.2,
        life: 0,
        maxLife: 30 + Math.random() * 30,
      })
    }

    // Jagged edge particles (surrounding the burst area)
    const edges: { x: number; y: number; angle: number; len: number; life: number; maxLife: number }[] = []
    for (let i = 0; i < 36; i++) {
      const angle = (Math.PI * 2 * i) / 36
      const len = 20 + Math.random() * 50
      edges.push({
        x: cx + Math.cos(angle) * 30,
        y: cy + Math.sin(angle) * 30,
        angle,
        len: len + (Math.random() - 0.5) * 20,
        life: 0,
        maxLife: 25 + Math.random() * 20,
      })
    }

    let frame: number
    const animate = () => {
      ctx!.clearRect(0, 0, W, H)

      // Draw jagged edge ring
      let edgeAlive = false
      ctx!.beginPath()
      for (const e of edges) {
        if (e.life >= e.maxLife) continue
        edgeAlive = true
        const alpha = 1 - e.life / e.maxLife
        ctx!.globalAlpha = alpha * 0.7
        const tipX = e.x + Math.cos(e.angle) * e.len
        const tipY = e.y + Math.sin(e.angle) * e.len
        ctx!.moveTo(e.x, e.y)
        ctx!.lineTo(tipX, tipY)
        e.life++
        e.len *= 0.97
      }
      ctx!.strokeStyle = color
      ctx!.lineWidth = 2
      ctx!.stroke()
      ctx!.globalAlpha = 1

      // Draw shards
      let shardAlive = false
      for (const s of shards) {
        if (s.life >= s.maxLife) continue
        shardAlive = true
        s.x += s.vx
        s.y += s.vy
        s.vy -= 0.02
        s.vx *= 0.99
        s.rot += s.rotV
        s.life++
        const alpha = 1 - s.life / s.maxLife
        ctx!.globalAlpha = alpha
        ctx!.save()
        ctx!.translate(s.x, s.y)
        ctx!.rotate(s.rot)
        ctx!.fillStyle = color
        // Draw irregular shard
        ctx!.beginPath()
        ctx!.moveTo(-s.size / 2, -s.size / 2)
        ctx!.lineTo(s.size / 2, -s.size / 3)
        ctx!.lineTo(s.size / 2, s.size / 2)
        ctx!.lineTo(-s.size / 3, s.size / 3)
        ctx!.closePath()
        ctx!.fill()
        ctx!.restore()
      }
      ctx!.globalAlpha = 1

      if (shardAlive || edgeAlive) {
        frame = requestAnimationFrame(animate)
      } else if (!doneRef.current) {
        doneRef.current = true
        setTimeout(() => onComplete?.(), 500)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [mode, color, onComplete])

  // Auto-complete after flying
  useEffect(() => {
    if (mode !== "flying") return
    const timer = setTimeout(() => onComplete?.(), 2000)
    return () => clearTimeout(timer)
  }, [mode, onComplete])

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
            ref={balloonRef}
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
                {/* Highlight */}
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
              {/* Pull indicator */}
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
