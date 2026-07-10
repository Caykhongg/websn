import { useEffect, useState } from "react"

const BALLOON_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
  "#FFEAA7", "#DDA0DD", "#FF8C94", "#98D8C8",
  "#F7DC6F", "#BB8FCE", "#85C1E9", "#F8C471",
]

interface BalloonData {
  id: number
  left: number
  color: string
  delay: number
  duration: number
  size: number
  swingDelay: number
  swayDuration: number
}

const WILL_CHANGE = "will-change-transform will-change-opacity"

export function Balloons() {
  const [balloons, setBalloons] = useState<BalloonData[]>([])

  useEffect(() => {
    const items: BalloonData[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 6,
      size: 40 + Math.random() * 30,
      swingDelay: Math.random() * 3,
      swayDuration: 3 + Math.random() * 2,
    }))
    setBalloons(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {balloons.map((b) => (
        <div
          key={b.id}
          className={`absolute ${WILL_CHANGE} animate-[float_5s_ease-in-out_infinite]`}
          style={{
            left: `${b.left}%`,
            bottom: "-80px",
            animationDelay: `${b.delay}s`,
            animationDuration: `${b.duration}s`,
          }}
        >
          <svg
            width={b.size}
            height={b.size * 1.25}
            viewBox="0 0 60 75"
            fill="none"
            className="drop-shadow-lg"
            style={{ animation: `sway ${b.swayDuration}s ease-in-out ${b.swingDelay}s infinite` }}
          >
            <ellipse cx="30" cy="35" rx="26" ry="32" fill={b.color} opacity="0.9" />
            <path
              d="M30 67 L28 75 L32 75 Z"
              fill={b.color}
              opacity="0.8"
            />
            <path
              d="M30 67 Q28 72 26 80"
              stroke={b.color}
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            <ellipse cx="24" cy="28" rx="5" ry="4" fill="white" opacity="0.3" />
          </svg>
        </div>
      ))}
    </div>
  )
}

interface ConfettiPiece {
  id: number
  x: number
  color: string
  delay: number
  duration: number
  size: number
  rotation: number
  shape: "square" | "circle" | "triangle"
}

const CONFETTI_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFEAA7",
  "#DDA0DD", "#FF8C94", "#F7DC6F", "#BB8FCE",
  "#85C1E9", "#F8C471", "#82E0AA", "#F1948A",
]

export function ConfettiRain() {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])

  useEffect(() => {
    const items: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 10,
      duration: 4 + Math.random() * 4,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      shape: (["square", "circle", "triangle"] as const)[Math.floor(Math.random() * 3)],
    }))
    setPieces(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-[confetti-fall_linear_infinite]"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.shape === "circle" ? (
            <div
              className="rounded-full"
              style={{
                width: p.size,
                height: p.size,
                backgroundColor: p.color,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ) : p.shape === "triangle" ? (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: `${p.size / 2}px solid transparent`,
                borderRight: `${p.size / 2}px solid transparent`,
                borderBottom: `${p.size}px solid ${p.color}`,
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          ) : (
            <div
              style={{
                width: p.size,
                height: p.size * 0.6,
                backgroundColor: p.color,
                borderRadius: "2px",
                transform: `rotate(${p.rotation}deg)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

interface Sparkle {
  id: number
  x: number
  y: number
  delay: number
  duration: number
  size: number
}

export function Sparkles() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([])

  useEffect(() => {
    const items: Sparkle[] = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 2 + Math.random() * 3,
      size: 4 + Math.random() * 8,
    }))
    setSparkles(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="absolute animate-[sparkle_ease-in-out_infinite]"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        >
          <svg width={s.size} height={s.size} viewBox="0 0 20 20" fill="#FFD700">
            <path d="M10 0 L12 8 L20 10 L12 12 L10 20 L8 12 L0 10 L8 8 Z" />
          </svg>
        </div>
      ))}
    </div>
  )
}

interface FloatingHeart {
  id: number
  left: number
  delay: number
  duration: number
  size: number
}

export function FloatingHearts() {
  const [hearts, setHearts] = useState<FloatingHeart[]>([])

  useEffect(() => {
    const items: FloatingHeart[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 6,
      duration: 6 + Math.random() * 4,
      size: 12 + Math.random() * 16,
    }))
    setHearts(items)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {hearts.map((h) => (
        <div
          key={h.id}
          className="absolute animate-[float_6s_ease-in-out_infinite]"
          style={{
            left: `${h.left}%`,
            bottom: "-20px",
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
          }}
        >
          <svg width={h.size} height={h.size} viewBox="0 0 24 24" fill="#FF6B9D">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </div>
      ))}
    </div>
  )
}

export function EffectRenderer({ effects }: { effects: string[] }) {
  return (
    <>
      {effects.includes("balloons") && <Balloons />}
      {effects.includes("confetti") && <ConfettiRain />}
      {effects.includes("sparkles") && <Sparkles />}
      {effects.includes("hearts") && <FloatingHearts />}
    </>
  )
}
