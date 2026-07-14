import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface GiftBoxProps {
  emoji: string
  message: string
  from: string
  photo?: string
  onComplete?: () => void
}

const W = 160
const H = 100
const D = 110
const L = 4
const LW = W + L * 2
const LH = H + L
const LD = D + L * 2

const RED = { front: "#b91c30", back: "#7f1422", left: "#8f1828", right: "#a61c2e", top: "#c41e34", bottom: "#6e111e" }
const LID = { front: "#d42038", back: "#961a2c", left: "#a61c2e", right: "#c41e34", top: "#e6223c", bottom: "#b91c30" }
const GOLD = "#d4a843"
const GOLD_L = "#e8c98a"
const GOLD_D = "#b8892e"

const ribbonStyle: React.CSSProperties = {
  position: "absolute", background: `linear-gradient(135deg, ${GOLD_D}, ${GOLD_L}, ${GOLD})`,
}

function BoxFace({
  style, children, className,
}: {
  style: React.CSSProperties
  children?: React.ReactNode
  className?: string
}) {
  return <div className={`absolute ${className || ""}`} style={style}>{children}</div>
}

function RibbonCross({ w, h, verticalW, horizontalH }: { w: number; h: number; verticalW?: number; horizontalH?: number }) {
  const vw = verticalW ?? 12
  const hh = horizontalH ?? 10
  return (
    <>
      <div style={{ ...ribbonStyle, left: `${(w - vw) / 2}px`, width: vw, height: "100%", top: 0 }} />
      <div style={{ ...ribbonStyle, top: `${(h - hh) / 2}px`, height: hh, width: "100%", left: 0 }} />
    </>
  )
}

function BowSVG({ size = 100 }: { size?: number }) {
  const s = size
  return (
    <svg width={s} height={s * 0.9} viewBox={`0 0 120 108`}>
      <defs>
        <radialGradient id="bowGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={GOLD_L} />
          <stop offset="60%" stopColor={GOLD} />
          <stop offset="100%" stopColor={GOLD_D} />
        </radialGradient>
        <filter id="bowShadow">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>
      <g filter="url(#bowShadow)">
        {/* Left loop - back */}
        <path d="M60,36 C30,10 10,38 55,46" fill="url(#bowGrad)" opacity="0.7" />
        {/* Left loop - front */}
        <path d="M60,36 C20,20 5,55 55,48" fill="url(#bowGrad)" />
        {/* Left loop highlight */}
        <path d="M52,32 C30,22 18,42 48,42" fill={GOLD_L} opacity="0.4" />
        {/* Right loop - back */}
        <path d="M60,36 C90,10 110,38 65,46" fill="url(#bowGrad)" opacity="0.7" />
        {/* Right loop - front */}
        <path d="M60,36 C100,20 115,55 65,48" fill="url(#bowGrad)" />
        {/* Right loop highlight */}
        <path d="M68,32 C90,22 102,42 72,42" fill={GOLD_L} opacity="0.4" />
        {/* Center knot */}
        <ellipse cx="60" cy="44" rx="12" ry="9" fill={GOLD_D} />
        <ellipse cx="60" cy="43" rx="8" ry="6" fill={GOLD} />
        <ellipse cx="58" cy="42" rx="4" ry="3" fill={GOLD_L} />
        {/* Tails */}
        <path d="M56,52 C48,68 52,80 40,88" stroke={GOLD} strokeWidth="6" fill="none" strokeLinecap="round" />
        <path d="M64,52 C72,68 68,80 80,88" stroke={GOLD_D} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M56,52 C48,68 52,80 40,88" stroke={GOLD_L} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export function GiftBox({ emoji, message, from, photo, onComplete }: GiftBoxProps) {
  const [opened, setOpened] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [bowGone, setBowGone] = useState(false)

  const handleOpen = useCallback(() => {
    setOpened(true)
    setTimeout(() => setBowGone(true), 200)
    setTimeout(() => setShowContent(true), 1050)
  }, [])

  useEffect(() => {
    if (!showContent) return
    const timer = setTimeout(() => onComplete?.(), 3000)
    return () => clearTimeout(timer)
  }, [showContent, onComplete])

  const perspective = 900

  function renderBoxFace(name: string, color: string, dims: [number, number, number, number, number, number], extra?: React.CSSProperties) {
    const [tw, th, tx, ty, tz, rotY] = dims
    return (
      <BoxFace
        key={name}
        style={{
          width: tw, height: th,
          background: `linear-gradient(145deg, ${color}dd, ${color}88, ${color}bb)`,
          transform: `translateX(${tx}px) translateY(${ty}px) translateZ(${tz}px) rotateY(${rotY}deg)`,
          border: `1px solid ${color}44`,
          boxShadow: "inset 0 0 30px rgba(0,0,0,0.15)",
          ...extra,
        }}
      />
    )
  }

  function ribbonOnFront(w: number, h: number) {
    return <RibbonCross w={w} h={h} />
  }

  function ribbonOnTop(w: number, d: number) {
    const vw = 12
    const hh = 10
    const cx = (w - vw) / 2
    const cy = (d - hh) / 2
    return (
      <>
        <div style={{ ...ribbonStyle, left: cx, width: vw, height: "100%", top: 0, opacity: 0.85 }} />
        <div style={{ ...ribbonStyle, top: cy, height: hh, width: "100%", left: 0, opacity: 0.85 }} />
      </>
    )
  }

  function ribbonOnSide(d: number, h: number) {
    const vw = 12
    const hh = 10
    const cx = (d - vw) / 2
    const cy = (h - hh) / 2
    return (
      <>
        <div style={{ ...ribbonStyle, left: cx, width: vw, height: "100%", top: 0, opacity: 0.7 }} />
        <div style={{ ...ribbonStyle, top: cy, height: hh, width: "100%", left: 0, opacity: 0.7 }} />
      </>
    )
  }

  return (
    <div className="relative flex items-center justify-center w-full min-h-[60vh] overflow-hidden">
      <AnimatePresence>
        {!opened && (
          <motion.button
            key="gift-closed"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleOpen}
            className="relative cursor-pointer select-none outline-none"
            aria-label="Open gift"
            style={{ perspective }}
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              style={{ transformStyle: "preserve-3d", transform: `rotateX(-18deg) rotateY(-25deg)`, width: W + 20, height: H + D / 2 + 30 }}
            >
              {/* Shadow */}
              <div style={{
                position: "absolute", bottom: -20, left: -10, width: W + 30, height: 20,
                background: "radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)",
                transform: "rotateX(90deg) translateZ(-10px)",
              }} />

              {/* Box base — front */}
              {renderBoxFace("front", RED.front, [W, H, -W / 2, -H / 2, D / 2, 0], { zIndex: 4 })}
              {/* back */}
              {renderBoxFace("back", RED.back, [W, H, -W / 2, -H / 2, -D / 2, 180], { zIndex: 1 })}
              {/* left */}
              {renderBoxFace("left", RED.left, [D, H, -W / 2 - D / 2, -H / 2, 0, -90], { zIndex: 2 })}
              {/* right */}
              {renderBoxFace("right", RED.right, [D, H, W / 2, -H / 2, 0, 90], { zIndex: 3 })}
              {/* bottom */}
              {renderBoxFace("bottom", RED.bottom, [W, D, -W / 2, H / 2, 0, -90], { transform: `translateX(${-W / 2}px) translateY(${H / 2}px) rotateX(90deg)`, zIndex: 0 })}
              {/* top face (bottom of base box interior) */}
              {renderBoxFace("top", RED.top, [W, D, -W / 2, -H / 2 - D / 2, 0, -90], { transform: `translateX(${-W / 2}px) translateY(${-H / 2}px) rotateX(-90deg)`, zIndex: 5 })}

              {/* Ribbons on base faces */}
              <BoxFace style={{ width: W, height: H, transform: `translateX(${-W / 2}px) translateY(${-H / 2}px) translateZ(${D / 2 + 0.5}px)`, zIndex: 6 }}>
                {ribbonOnFront(W, H)}
              </BoxFace>

              {/* Lid group */}
              <motion.div
                style={{ transformStyle: "preserve-3d", transform: `translateY(${-L}px)`, zIndex: 7 }}
              >
                {/* lid front */}
                {renderBoxFace("lidFront", LID.front, [LW, LH, -LW / 2, -LH / 2, LD / 2, 0], { zIndex: 4 })}
                {/* lid back */}
                {renderBoxFace("lidBack", LID.back, [LW, LH, -LW / 2, -LH / 2, -LD / 2, 180], { zIndex: 1 })}
                {/* lid left */}
                {renderBoxFace("lidLeft", LID.left, [LD, LH, -LW / 2 - LD / 2, -LH / 2, 0, -90], { zIndex: 2 })}
                {/* lid right */}
                {renderBoxFace("lidRight", LID.right, [LD, LH, LW / 2, -LH / 2, 0, 90], { zIndex: 3 })}
                {/* lid top */}
                {renderBoxFace("lidTop", LID.top, [LW, LD, -LW / 2, -LH / 2, 0, -90], {
                  transform: `translateX(${-LW / 2}px) translateY(${-LH / 2}px) rotateX(-90deg)`,
                  zIndex: 5,
                })}

                {/* Ribbon on lid front */}
                <BoxFace style={{ width: LW, height: LH, transform: `translateX(${-LW / 2}px) translateY(${-LH / 2}px) translateZ(${LD / 2 + 0.5}px)`, zIndex: 6 }}>
                  {ribbonOnFront(LW, LH)}
                </BoxFace>

                {/* Ribbon on lid top */}
                <BoxFace style={{ width: LW, height: LD, transform: `translateX(${-LW / 2}px) translateY(${-LH / 2}px) rotateX(-90deg) translateZ(${-LD / 2 + 0.5}px)`, zIndex: 6 }}>
                  {ribbonOnTop(LW, LD)}
                </BoxFace>

                {/* Ribbon on lid left */}
                <BoxFace style={{ width: LD, height: LH, transform: `translateX(${-LW / 2 - LD / 2}px) translateY(${-LH / 2}px) rotateY(-90deg) translateZ(${0.5}px)`, zIndex: 6 }}>
                  {ribbonOnSide(LD, LH)}
                </BoxFace>

                {/* Bow on top */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%", top: "50%",
                    transform: `translateX(-50%) translateY(${-LH / 2 - 35}px) translateZ(${-LD / 2}px)`,
                    zIndex: 10,
                  }}
                >
                  <BowSVG size={90} />
                </div>
              </motion.div>
            </motion.div>

            <p className="text-center text-sm text-white/70 mt-6 font-medium">Tap to open!</p>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Opening animation */}
      <AnimatePresence>
        {opened && !showContent && (
          <motion.div
            key="box-opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
            style={{ perspective }}
          >
            {/* Bow flying up */}
            {!bowGone && (
              <motion.div
                key="bow-fly"
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -300, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute"
                style={{ zIndex: 20 }}
              >
                <BowSVG size={90} />
              </motion.div>
            )}

            {/* Lid flying off */}
            <motion.div
              initial={{ y: 0, opacity: 1, rotateX: 0, rotateY: 0 }}
              animate={{
                y: -260, x: 140, opacity: 0,
                rotateX: 40, rotateY: 50,
              }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              className="absolute"
              style={{ transformStyle: "preserve-3d", zIndex: 15 }}
            >
              <div style={{ transformStyle: "preserve-3d", transform: "rotateX(-18deg) rotateY(-25deg)", width: LW + 10, height: LH + 10 }}>
                {/* Simplified lid visual for the flying piece */}
                <div style={{
                  width: LW, height: LH,
                  background: `linear-gradient(145deg, ${LID.front}dd, ${LID.front}88)`,
                  borderRadius: 4,
                  border: `1px solid ${LID.front}44`,
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  transform: `translateZ(${LD / 2}px)`,
                  position: "absolute",
                }} />
                <div style={{
                  width: LW, height: LD,
                  background: `linear-gradient(145deg, ${LID.top}dd, ${LID.top}88)`,
                  transform: `rotateX(-90deg) translateZ(${-LD / 2}px)`,
                  position: "absolute",
                }} />
              </div>
            </motion.div>

            {/* Base walls falling outward */}
            {/* Front wall */}  
            <motion.div
              initial={{ y: 0, x: 0, opacity: 1, rotateX: 0 }}
              animate={{ y: 180, z: -100, opacity: 0, rotateX: 30 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
              className="absolute"
            >
              <div style={{
                width: W, height: H,
                background: `linear-gradient(145deg, ${RED.front}dd, ${RED.front}88)`,
                borderRadius: 4, border: `1px solid ${RED.front}44`,
              }} />
            </motion.div>

            {/* Back wall */}
            <motion.div
              initial={{ y: 0, x: 0, opacity: 1 }}
              animate={{ y: -140, opacity: 0, rotateX: -20 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.65 }}
              className="absolute"
            >
              <div style={{
                width: W, height: H,
                background: `linear-gradient(145deg, ${RED.back}dd, ${RED.back}88)`,
                borderRadius: 4, border: `1px solid ${RED.back}44`,
              }} />
            </motion.div>

            {/* Left wall */}
            <motion.div
              initial={{ y: 0, x: 0, opacity: 1 }}
              animate={{ x: -200, y: 60, opacity: 0, rotateY: -30 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
              className="absolute"
            >
              <div style={{
                width: D, height: H,
                background: `linear-gradient(145deg, ${RED.left}dd, ${RED.left}88)`,
                borderRadius: 4, border: `1px solid ${RED.left}44`,
              }} />
            </motion.div>

            {/* Right wall */}
            <motion.div
              initial={{ y: 0, x: 0, opacity: 1 }}
              animate={{ x: 200, y: 60, opacity: 0, rotateY: 30 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.75 }}
              className="absolute"
            >
              <div style={{
                width: D, height: H,
                background: `linear-gradient(145deg, ${RED.right}dd, ${RED.right}88)`,
                borderRadius: 4, border: `1px solid ${RED.right}44`,
              }} />
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
              transition={{ delay: 0.25 }}
              className="text-white text-lg md:text-xl font-medium italic leading-relaxed max-w-sm"
            >
              &ldquo;{message}&rdquo;
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-pink-200 font-semibold text-lg"
            >
              &mdash; {from} &mdash;
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
