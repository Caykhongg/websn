import { useEffect, useState, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "motion/react"
import { getWish } from "../lib/store"
import { decodeFromBase64 } from "../lib/encoding"
import { EffectRenderer } from "../components/Balloon"
import { GooeyBackground } from "../components/ui/gooey-background"
import type { WishData } from "../lib/types"
import type { Options } from "canvas-confetti"

interface HashPayload {
  from: string
  message: string
  emoji: string
  effects: string[]
  createdAt: number
}

export default function ViewWish() {
  const { id } = useParams<{ id: string }>()
  const [wish, setWish] = useState<WishData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [celebrated, setCelebrated] = useState(false)

  useEffect(() => {
    const hash = window.location.hash.replace("#", "")

    if (hash) {
      const data = decodeFromBase64<HashPayload>(hash)
      if (data) {
        const stored = id ? getWish(id) : null
        setWish({
          id: id ?? "shared",
          from: data.from,
          message: data.message,
          photo: stored?.photo,
          emoji: data.emoji,
          effects: data.effects as WishData["effects"],
          createdAt: data.createdAt,
        })
        return
      }
    }

    if (!id) {
      setNotFound(true)
      return
    }

    const data = getWish(id)
    if (!data) {
      setNotFound(true)
      return
    }
    setWish(data)
  }, [id])

  useEffect(() => {
    if (wish && !celebrated) {
      setCelebrated(true)
      let cancelled = false
      let intervalId: ReturnType<typeof setInterval> | null = null
      let timeoutId: ReturnType<typeof setTimeout> | null = null

      import("canvas-confetti").then(({ default: confetti }) => {
        if (cancelled) return
        const defaults: Partial<Options> = { spread: 60, ticks: 200, gravity: 0.6, decay: 0.94, startVelocity: 30 }
        const shoot = () => {
          confetti({ ...defaults, particleCount: 40, origin: { x: Math.random(), y: 0 } })
          confetti({ ...defaults, particleCount: 30, origin: { x: Math.random(), y: 0 }, colors: ["#FF6B6B", "#FFEAA7", "#4ECDC4"] })
        }
        shoot()
        intervalId = setInterval(shoot, 300)
        timeoutId = setTimeout(() => {
          if (intervalId) clearInterval(intervalId)
        }, 3000)
      }).catch(() => { /* confetti unavailable */ })

      return () => {
        cancelled = true
        if (intervalId) clearInterval(intervalId)
        if (timeoutId) clearTimeout(timeoutId)
      }
    }
  }, [wish, celebrated])

  const handleCelebrateAgain = useCallback(() => {
    import("canvas-confetti").then(({ default: confetti }) => {
      confetti({
        spread: 60, ticks: 200, gravity: 0.6, decay: 0.94, startVelocity: 30,
        particleCount: 80, origin: { x: 0.5, y: 0.5 },
        colors: ["#FF6B6B", "#FFEAA7", "#4ECDC4", "#DDA0DD", "#FF8C94"],
      })
    }).catch(() => {})
  }, [])

  if (notFound) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="text-6xl">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900">Wish not found</h1>
          <p className="text-gray-500">This wish may have expired or never existed.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-wish-500 to-wish-600
              text-white font-medium hover:from-wish-600 hover:to-wish-700 transition-all shadow-lg shadow-wish-200/50"
          >
            Create your own
          </Link>
        </motion.div>
      </div>
    )
  }

  if (!wish) {
    return (
      <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-white to-pink-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          role="status"
          aria-label="Loading wish"
          className="w-8 h-8 border-2 border-wish-500 border-t-transparent rounded-full animate-spin"
        />
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-white to-pink-50 relative overflow-hidden">
      <GooeyBackground />
      <EffectRenderer effects={wish.effects} />
      <div className="relative z-20 min-h-[100dvh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.3 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl shadow-rose-200/50 border border-white/60 text-center space-y-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12, delay: 0.6 }}
              className="text-7xl"
            >
              {wish.emoji}
            </motion.div>

            {wish.photo && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
              >
                <img
                  src={wish.photo}
                  alt={`Photo of ${wish.from}`}
                  className="w-24 h-24 rounded-2xl object-cover mx-auto border-2 border-wish-200 shadow-md"
                />
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="space-y-2"
            >
              <p className="text-gray-900 text-lg md:text-xl leading-relaxed font-medium italic">
                "{wish.message}"
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
            >
              <p className="text-wish-600 font-semibold">
                — {wish.from} —
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              <button
                onClick={handleCelebrateAgain}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
                  bg-gradient-to-r from-wish-400 to-wish-500 text-white text-sm font-medium
                  hover:from-wish-500 hover:to-wish-600 transition-all
                  active:scale-[0.97] shadow-lg shadow-wish-200/50"
              >
                🎉 Celebrate again!
              </button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
            className="text-center mt-8"
          >
            <Link
              to="/"
              className="inline-block text-sm text-gray-400 hover:text-wish-500 transition-colors"
            >
              Make someone's day too ✨
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
