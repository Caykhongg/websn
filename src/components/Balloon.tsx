import { useEffect, useRef } from "react"
import type { EffectType } from "../lib/types"

interface EffectRendererProps {
  effects: EffectType[]
}

export function EffectRenderer({ effects }: EffectRendererProps) {
  return <div id="effect-renderer" data-effects={effects.join(",")} />
}

export function BalloonPop({
  color,
  onDone,
}: {
  color: string
  onDone: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number }[] = []

    for (let i = 0; i < 150; i++) {
      const angle = Math.random() * Math.PI * 2
      const speed = 3 + Math.random() * 8
      particles.push({
        x: cx + (Math.random() - 0.5) * 40,
        y: cy + (Math.random() - 0.5) * 40,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        life: 0,
        maxLife: 40 + Math.random() * 30,
        size: 2 + Math.random() * 4,
      })
    }

    let frame: number
    const animate = () => {
      ctx!.clearRect(0, 0, canvas.width, canvas.height)
      let alive = false
      for (const p of particles) {
        if (p.life >= p.maxLife) continue
        alive = true
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.08
        p.life++
        const alpha = 1 - p.life / p.maxLife
        ctx!.globalAlpha = alpha
        ctx!.fillStyle = color
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.globalAlpha = 1
      if (alive) {
        frame = requestAnimationFrame(animate)
      } else {
        onDone()
      }
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [color, onDone])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />
}
