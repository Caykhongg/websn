import { useEffect, useRef } from "react"

interface FireworkProps {
  emoji: string
  message: string
  from: string
  photo?: string
  onShowInfo: () => void
}

export function Firework({ onShowInfo }: FireworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const orbitCount = 6
    const orbits: { angle: number; radius: number; speed: number; particleCount: number }[] = []

    for (let i = 0; i < orbitCount; i++) {
      orbits.push({
        angle: (Math.PI * 2 * i) / orbitCount,
        radius: 40 + Math.random() * 60,
        speed: 0.02 + Math.random() * 0.03,
        particleCount: 30 + Math.floor(Math.random() * 30),
      })
    }

    const trail: { x: number; y: number; life: number }[] = []
    let phase: "orbit" | "converge" | "explode" = "orbit"
    let convergeStart = 0
    let explodeDone = false
    let frame: number

    const animate = (now: number) => {
      ctx!.fillStyle = "rgba(0,0,0,0.08)"
      ctx!.fillRect(0, 0, canvas.width, canvas.height)

      if (phase === "orbit") {
        for (const o of orbits) {
          o.angle += o.speed
          const x = cx + Math.cos(o.angle) * o.radius
          const y = cy + Math.sin(o.angle) * o.radius
          trail.push({ x, y, life: 0 })
          ctx!.fillStyle = `hsl(${o.angle * 30}, 80%, 60%)`
          ctx!.beginPath()
          ctx!.arc(x, y, 4, 0, Math.PI * 2)
          ctx!.fill()
        }

        // Draw trails
        for (let i = trail.length - 1; i >= 0; i--) {
          trail[i].life++
          const alpha = 1 - trail[i].life / 60
          if (alpha <= 0) {
            trail.splice(i, 1)
            continue
          }
          ctx!.globalAlpha = alpha * 0.5
          ctx!.fillStyle = "#fff"
          ctx!.beginPath()
          ctx!.arc(trail[i].x, trail[i].y, 2, 0, Math.PI * 2)
          ctx!.fill()
        }
        ctx!.globalAlpha = 1

        if (trail.length > 200) {
          phase = "converge"
          convergeStart = now
          trail.length = 0
        }

        frame = requestAnimationFrame(animate)
      } else if (phase === "converge") {
        const elapsed = (now - convergeStart) / 1000
        const progress = Math.min(elapsed / 1.5, 1)

        for (const o of orbits) {
          o.angle += o.speed * (1 - progress * 0.5)
          const r = o.radius * (1 - progress)
          const x = cx + Math.cos(o.angle) * r
          const y = cy + Math.sin(o.angle) * r
          ctx!.fillStyle = `hsl(${o.angle * 30}, 80%, 60%)`
          ctx!.beginPath()
          ctx!.arc(x, y, 4 - progress * 3, 0, Math.PI * 2)
          ctx!.fill()
        }

        if (progress >= 1) {
          phase = "explode"
        }

        frame = requestAnimationFrame(animate)
      } else if (phase === "explode" && !explodeDone) {
        explodeDone = true

        // White flash
        ctx!.fillStyle = "rgba(255,255,255,1)"
        ctx!.fillRect(0, 0, canvas.width, canvas.height)

        // Explosion particles
        const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = []
        for (let i = 0; i < 400; i++) {
          const angle = (Math.PI * 2 * i) / 400 + (Math.random() - 0.5) * 0.2
          const speed = 5 + Math.random() * 15
          particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 0,
            maxLife: 50 + Math.random() * 40,
            size: 2 + Math.random() * 4,
          })
        }

        const explodeFrame = () => {
          ctx!.fillStyle = "rgba(255,255,255,0.92)"
          ctx!.fillRect(0, 0, canvas.width, canvas.height)

          let alive = false
          for (const p of particles) {
            if (p.life >= p.maxLife) continue
            alive = true
            p.x += p.vx
            p.y += p.vy
            p.vy += 0.03
            p.life++
            const alpha = 1 - p.life / p.maxLife
            ctx!.globalAlpha = alpha
            ctx!.fillStyle = "#fff"
            ctx!.beginPath()
            ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx!.fill()
          }
          ctx!.globalAlpha = 1

          if (alive) {
            requestAnimationFrame(explodeFrame)
          } else {
            onShowInfo()
          }
        }
        explodeFrame()
        return
      } else {
        frame = requestAnimationFrame(animate)
      }
    }

    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [onShowInfo])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
}
