import { useEffect, useState, useCallback } from "react"
import { useParams, Link } from "react-router-dom"
import { motion } from "motion/react"
import { getWish } from "../lib/store"
import { decodeFromBase64 } from "../lib/encoding"
import { EffectRenderer } from "../components/Balloon"
import { GiftBox } from "../components/GiftBox"
import { Cake } from "../components/Cake"
import { BalloonPresentation } from "../components/BalloonPresentation"
import { Firework } from "../components/Firework"
import { GooeyBackground } from "../components/ui/gooey-background"
import type { WishData, PresentationType } from "../lib/types"

interface HashPayload {
  from: string
  message: string
  photo?: string
  emoji: string
  effects: string[]
  presentationType: string
  balloonColor?: string
  createdAt: number
}

export default function ViewWish() {
  const { id } = useParams<{ id: string }>()
  const [wish, setWish] = useState<WishData | null>(null)
  const [notFound, setNotFound] = useState(false)
  const [presentationDone, setPresentationDone] = useState(false)

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
          photo: data.photo || stored?.photo,
          emoji: data.emoji,
          effects: data.effects as WishData["effects"],
          presentationType: data.presentationType as PresentationType,
          balloonColor: data.balloonColor,
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

  const handlePresentationDone = useCallback(() => {
    setPresentationDone(true)
  }, [])

  const renderPresentation = () => {
    if (!wish) return null
    switch (wish.presentationType) {
      case "gift":
        return <GiftBox emoji={wish.emoji} message={wish.message} from={wish.from} photo={wish.photo} onComplete={handlePresentationDone} />
      case "cake":
        return <Cake onComplete={handlePresentationDone} />
      case "balloon":
        return <BalloonPresentation color={wish.balloonColor || "#f472b6"} onComplete={handlePresentationDone} />
      case "firework":
        return <Firework emoji={wish.emoji} message={wish.message} from={wish.from} photo={wish.photo} onShowInfo={handlePresentationDone} />
      default:
        return null
    }
  }

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

  // Show presentation first, then info card
  return (
    <div className="min-h-[100dvh] relative overflow-hidden">
      <GooeyBackground />

      {!presentationDone ? (
        <div className="relative z-20 min-h-[100dvh] flex items-center justify-center p-4">
          {renderPresentation()}
          {wish.presentationType !== "gift" && wish.presentationType !== "cake" && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handlePresentationDone}
              className="absolute bottom-8 px-6 py-2 rounded-xl bg-white/20 text-white/70 text-sm
                hover:bg-white/30 transition-colors backdrop-blur-sm"
            >
              Skip →
            </motion.button>
          )}
        </div>
      ) : (
        <div className="relative z-20 min-h-[100dvh] flex items-center justify-center p-4">
          <EffectRenderer effects={wish.effects} />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-10 shadow-2xl shadow-rose-200/50 border border-white/60 text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                className="text-7xl"
              >
                {wish.emoji}
              </motion.div>

              {wish.photo && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
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
                transition={{ delay: 0.6 }}
                className="space-y-2"
              >
                <p className="text-gray-900 text-lg md:text-xl leading-relaxed font-medium italic">
                  "{wish.message}"
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <p className="text-wish-600 font-semibold">
                  — {wish.from} —
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
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
      )}
    </div>
  )
}
