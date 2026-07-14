import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface GiftBoxProps {
  emoji: string
  message: string
  from: string
  photo?: string
  onComplete?: () => void
}

export function GiftBox({ emoji, message, from, photo, onComplete }: GiftBoxProps) {
  const [opened, setOpened] = useState(false)

  const handleOpen = useCallback(() => setOpened(true), [])

  useEffect(() => {
    if (!opened) return
    const timer = setTimeout(() => onComplete?.(), 3500)
    return () => clearTimeout(timer)
  }, [opened, onComplete])

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[60vh]">
      <AnimatePresence>
        {!opened ? (
          <motion.button
            key="gift-closed"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="relative cursor-pointer select-none"
            aria-label="Open gift"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-[120px] md:text-[160px] leading-none"
            >
              🎁
            </motion.div>
            <p className="text-center text-sm text-white/70 mt-2 font-medium">Tap to open!</p>
          </motion.button>
        ) : (
          <motion.div
            key="gift-open"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="text-center space-y-6 p-8"
          >
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: -200, opacity: 0, rotate: 15 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-6xl"
            >
              🎁
            </motion.div>

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.3, type: "spring", damping: 12 }}
              className="text-8xl md:text-9xl"
            >
              {emoji}
            </motion.div>

            {photo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <img
                  src={photo}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-white/40 shadow-lg"
                />
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-white text-lg md:text-xl font-medium italic leading-relaxed max-w-sm"
            >
              "{message}"
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-pink-200 font-semibold text-lg"
            >
              — {from} —
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
