import { useEffect, useRef } from "react"

const PIXEL_SIZE = 40
const GOOEY_ID = "bg-gooey"
const COLOR = "#ffffff"

interface Pixel {
  x: number
  y: number
  expiresAt: number
}

const SVG_FILTER = `<svg width="0" height="0" style="position:fixed;top:-9999px;left:-9999px" aria-hidden="true">
  <defs>
    <filter id="${GOOEY_ID}">
      <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
      <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10" result="goo" />
      <feComposite in="SourceGraphic" in2="goo" operator="atop" />
    </filter>
  </defs>
</svg>`

export function GooeyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    document.body.insertAdjacentHTML("beforeend", SVG_FILTER)
    return () => {
      const el = document.getElementById(GOOEY_ID)
      if (el) el.closest("svg")?.remove()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const pixels: Pixel[] = []
    const mouse = { x: -100, y: -100 }
    let frame: number

    const spawnAt = (cx: number, cy: number) => {
      const col = Math.floor(cx / PIXEL_SIZE)
      const row = Math.floor(cy / PIXEL_SIZE)
      const px = col * PIXEL_SIZE
      const py = row * PIXEL_SIZE
      if (!pixels.some((p) => Math.abs(p.x - px) < 1 && Math.abs(p.y - py) < 1)) {
        pixels.push({ x: px, y: py, expiresAt: performance.now() + 900 })
      }
    }

    const handleMouse = (e: MouseEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY
      spawnAt(e.clientX, e.clientY)
    }
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (t) {
        mouse.x = t.clientX; mouse.y = t.clientY
        spawnAt(t.clientX, t.clientY)
      }
    }

    window.addEventListener("mousemove", handleMouse)
    window.addEventListener("touchmove", handleTouch)
    window.addEventListener("touchstart", handleTouch)

    const animate = (now: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.globalAlpha = 1

      for (let i = pixels.length - 1; i >= 0; i--) {
        if (now >= pixels[i].expiresAt) {
          pixels.splice(i, 1)
          continue
        }
        ctx.fillStyle = COLOR
        ctx.beginPath()
        ctx.roundRect(pixels[i].x, pixels[i].y, PIXEL_SIZE, PIXEL_SIZE, 6)
        ctx.fill()
      }

      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      window.removeEventListener("mousemove", handleMouse)
      window.removeEventListener("touchmove", handleTouch)
      window.removeEventListener("touchstart", handleTouch)
    }
  }, [])

  return (
    <>
      <div className="fixed inset-0 bg-black/60 bg-cover bg-center" style={{ backgroundImage: 'url(/bg.jpg)', zIndex: 0 }} />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ filter: `url(#${GOOEY_ID})`, zIndex: 2 }}
      >
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
    </>
  )
}