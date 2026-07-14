import { useState, useCallback, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"

interface GiftBoxProps {
  emoji: string
  message: string
  from: string
  photo?: string
  onComplete?: () => void
}

const SIDE_W = 80
const SIDE_H = 90

export function GiftBox({ emoji, message, from, photo, onComplete }: GiftBoxProps) {
  const [opened, setOpened] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)

  const handleOpen = useCallback(() => {
    setOpened(true)
    setTimeout(() => setShowContent(true), 650)
  }, [])

  useEffect(() => {
    if (!showContent) return
    const timer = setTimeout(() => onComplete?.(), 3000)
    return () => clearTimeout(timer)
  }, [showContent, onComplete])

  return (
    <div ref={boxRef} className="relative flex items-center justify-center w-full min-h-[60vh]">
      <AnimatePresence>
        {!opened ? (
          <motion.button
            key="gift-closed"
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOpen}
            className="relative cursor-pointer select-none outline-none"
            aria-label="Open gift"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="relative"
            >
              <svg width="200" height="190" viewBox="0 0 200 190">
                {/* Box body */}
                <rect x="20" y="50" width="160" height="120" rx="6" fill="url(#boxGrad)" />
                {/* Vertical ribbon */}
                <rect x="88" y="50" width="24" height="120" fill="url(#ribbonGrad)" />
                {/* Horizontal ribbon */}
                <rect x="20" y="102" width="160" height="24" fill="url(#ribbonGrad)" />
                {/* Bow */}
                <circle cx="100" cy="50" r="14" fill="#facc15" />
                <ellipse cx="80" cy="44" rx="14" ry="10" fill="#fbbf24" transform="rotate(-25 80 44)" />
                <ellipse cx="120" cy="44" rx="14" ry="10" fill="#fbbf24" transform="rotate(25 120 44)" />
                {/* Lid */}
                <rect x="14" y="10" width="172" height="44" rx="4" fill="url(#lidGrad)" />
                <rect x="86" y="10" width="28" height="44" fill="url(#ribbonGrad)" />
                {/* Gradients */}
                <defs>
                  <linearGradient id="boxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="100%" stopColor="#db2777" />
                  </linearGradient>
                  <linearGradient id="lidGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f9a8d4" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                  <linearGradient id="ribbonGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#facc15" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
            <p className="text-center text-sm text-white/70 mt-4 font-medium">Tap to open!</p>
          </motion.button>
        ) : null}
      </AnimatePresence>

      {/* Animated box opening */}
      <AnimatePresence>
        {opened && !showContent && (
          <motion.div
            key="box-anim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Lid flying off */}
            <motion.div
              initial={{ y: 0, x: 0, rotate: 0 }}
              animate={{ y: -250, x: 80, rotate: 30, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute"
              style={{ zIndex: 10 }}
            >
              <svg width="172" height="48" viewBox="0 0 172 44">
                <rect x="0" y="0" width="172" height="44" rx="4" fill="url(#lidGrad2)" />
                <rect x="72" y="0" width="28" height="44" fill="url(#ribbonGrad2)" />
                <defs>
                  <linearGradient id="lidGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f9a8d4" />
                    <stop offset="100%" stopColor="#f472b6" />
                  </linearGradient>
                  <linearGradient id="ribbonGrad2" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#facc15" />
                    <stop offset="50%" stopColor="#fef08a" />
                    <stop offset="100%" stopColor="#facc15" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* 4 sides splitting */}
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ x: -200, y: 40, rotate: -15, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              className="absolute"
            >
              <svg width={SIDE_W} height={SIDE_H} viewBox={`0 0 ${SIDE_W} ${SIDE_H}`}>
                <rect x="0" y="0" width={SIDE_W} height={SIDE_H} rx="4" fill="#f472b6" opacity="0.7" />
              </svg>
            </motion.div>
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ x: 200, y: 40, rotate: 15, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
              className="absolute"
            >
              <svg width={SIDE_W} height={SIDE_H} viewBox={`0 0 ${SIDE_W} ${SIDE_H}`}>
                <rect x="0" y="0" width={SIDE_W} height={SIDE_H} rx="4" fill="#f472b6" opacity="0.7" />
              </svg>
            </motion.div>
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ y: 180, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
              className="absolute"
            >
              <svg width={SIDE_W} height={SIDE_H} viewBox={`0 0 ${SIDE_W} ${SIDE_H}`}>
                <rect x="0" y="0" width={SIDE_W} height={SIDE_H} rx="4" fill="#db2777" opacity="0.7" />
              </svg>
            </motion.div>
            <motion.div
              initial={{ x: 0, y: 0, rotate: 0 }}
              animate={{ y: -180, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.25 }}
              className="absolute"
            >
              <svg width={SIDE_W} height={SIDE_H} viewBox={`0 0 ${SIDE_W} ${SIDE_H}`}>
                <rect x="0" y="0" width={SIDE_W} height={SIDE_H} rx="4" fill="#db2777" opacity="0.7" />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            key="content"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className="text-center space-y-5 p-8 z-30"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12 }}
              className="text-8xl md:text-9xl"
            >
              {emoji}
            </motion.div>

            {photo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <img src={photo} alt="" className="w-20 h-20 rounded-2xl object-cover mx-auto border-2 border-white/40 shadow-lg" />
              </motion.div>
            )}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-white text-lg md:text-xl font-medium italic leading-relaxed max-w-sm"
            >
              "{message}"
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
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
