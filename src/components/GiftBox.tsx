import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"

interface GiftBoxProps {
  emoji: string
  message: string
  from: string
  photo?: string
  onComplete?: () => void
}

// Isometric projection constants
const C30 = 0.866
const S30 = 0.5
const OX = 170
const OY = 150

function iso(x: number, y: number, z: number): [number, number] {
  return [OX + (x - y) * C30, OY + (x + y) * S30 - z]
}

// Box 3D dimensions
const BW = 120, BD = 120, BH = 100
const LW = 132, LD = 132, LH = 14 // lid slightly larger

// Compute all vertices
const [bfx, bfy] = iso(BW / 2, BD / 2, 0) // box front-right-bottom
const [bfxT, bfyT] = iso(BW / 2, BD / 2, BH) // box front-right-top
const [blx, bly] = iso(-BW / 2, BD / 2, 0) // box front-left-bottom
const [blxT, blyT] = iso(-BW / 2, BD / 2, BH) // box front-left-top
const [brx, bry] = iso(BW / 2, -BD / 2, 0) // box back-right-bottom
const [brxT, bryT] = iso(BW / 2, -BD / 2, BH) // box back-right-top
const [blbXT, blbYT] = iso(-BW / 2, -BD / 2, BH) // box back-left-top

// Lid vertices
const [lfx, lfy] = iso(LW / 2, LD / 2, BH) // lid front-right-bottom
const [lfxT, lfyT] = iso(LW / 2, LD / 2, BH + LH) // lid front-right-top
const [llx, lly] = iso(-LW / 2, LD / 2, BH) // lid front-left-bottom
const [llxT, llyT] = iso(-LW / 2, LD / 2, BH + LH) // lid front-left-top
const [lrx, lry] = iso(LW / 2, -LD / 2, BH) // lid back-right-bottom
const [lrxT, lryT] = iso(LW / 2, -LD / 2, BH + LH) // lid back-right-top
const [lbxT, lbyT] = iso(-LW / 2, -LD / 2, BH + LH) // lid back-left-top

// Box face polygons
const BOX_TOP = `${bfxT},${bfyT} ${blxT},${blyT} ${blbXT},${blbYT} ${brxT},${bryT}`
const BOX_FRONT = `${bfx},${bfy} ${blx},${bly} ${blxT},${blyT} ${bfxT},${bfyT}`
const BOX_RIGHT = `${brx},${bry} ${bfx},${bfy} ${bfxT},${bfyT} ${brxT},${bryT}`

// Lid face polygons
const LID_TOP = `${lfxT},${lfyT} ${llxT},${llyT} ${lbxT},${lbyT} ${lrxT},${lryT}`
const LID_FRONT = `${lfx},${lfy} ${llx},${lly} ${llxT},${llyT} ${lfxT},${lfyT}`
const LID_RIGHT = `${lrx},${lry} ${lfx},${lfy} ${lfxT},${lfyT} ${lrxT},${lryT}`

// Ribbon helper — returns polygon points for a ribbon strip
function ribbonStrip(x1: number, y1: number, x2: number, y2: number, w: number): string {
  const dx = x2 - x1, dy = y2 - y1
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const px = (-dy / len) * w / 2
  const py = (dx / len) * w / 2
  return `${x1 + px},${y1 + py} ${x1 - px},${y1 - py} ${x2 - px},${y2 - py} ${x2 + px},${y2 + py}`
}

// Box ribbon
const fCx = (bfx + blx) / 2
const fCy = (bfy + bly) / 2
const fCxT = (bfxT + blxT) / 2
const fCyT = (bfyT + blyT) / 2

const rCx = (brx + bfx) / 2
const rCy = (bry + bfy) / 2
const rCxT = (brxT + bfxT) / 2
const rCyT = (bryT + bfyT) / 2

const tFrontCx = (bfxT + blxT) / 2
const tFrontCy = (bfyT + blyT) / 2
const tBackCx = (brxT + blbXT) / 2
const tBackCy = (bryT + blbYT) / 2
const tLeftCx = (blxT + blbXT) / 2
const tLeftCy = (blyT + blbYT) / 2
const tRightCx = (bfxT + brxT) / 2
const tRightCy = (bfyT + bryT) / 2

const RB_W = 14

// Center of box top face
const topCenterX = (bfxT + blxT + brxT + blbXT) / 4
const topCenterY = (bfyT + blyT + bryT + blbYT) / 4

// Colors
const C = {
  boxFront: "#1e3a5f",
  boxFrontDark: "#152d4a",
  boxRight: "#162d4d",
  boxRightDark: "#10203d",
  boxTop: "#25476e",
  boxTopLight: "#2d5585",
  lidFront: "#264a70",
  lidRight: "#1e3a5f",
  lidTop: "#2d5585",
  gold: "#d4a843",
  goldLight: "#f5e3a0",
  goldDark: "#b8892e",
  goldShadow: "#a07828",
}

const ribbonGrad = `linear-gradient(135deg, ${C.goldDark}, ${C.goldLight}, ${C.gold})`

function GoldRibbon({ points }: { points: string }) {
  return (
    <polygon
      points={points}
      fill={ribbonGrad}
      stroke={C.goldDark}
      strokeWidth="0.5"
      opacity="0.92"
    />
  )
}

function BoxShadow() {
  return (
    <ellipse
      cx={OX}
      cy={OY + 115}
      rx={100}
      ry={18}
      fill="rgba(0,0,0,0.15)"
      filter="url(#shadowBlur)"
    />
  )
}

function BowSVG() {
  return (
    <g transform={`translate(${topCenterX}, ${topCenterY - 5})`}>
      <defs>
        <radialGradient id="bowGrad" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor={C.goldLight} />
          <stop offset="50%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.goldDark} />
        </radialGradient>
        <filter id="bowShadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.35" />
        </filter>
      </defs>
      <g filter="url(#bowShadow)">
        {/* Left loops */}
        <path d="M0,-5 C-40,-30 -55,10 -5,5" fill="url(#bowGrad)" opacity="0.85" />
        <path d="M0,-5 C-30,-40 -45,0 -5,3" fill="url(#bowGrad)" />
        <path d="M-5,-10 C-25,-20 -35,8 -5,0" fill={C.goldLight} opacity="0.35" />
        {/* Right loops */}
        <path d="M0,-5 C40,-30 55,10 5,5" fill="url(#bowGrad)" opacity="0.85" />
        <path d="M0,-5 C30,-40 45,0 5,3" fill="url(#bowGrad)" />
        <path d="M5,-10 C25,-20 35,8 5,0" fill={C.goldLight} opacity="0.35" />
        {/* Center knot */}
        <ellipse cx="0" cy="2" rx="10" ry="7" fill={C.goldDark} />
        <ellipse cx="0" cy="1" rx="7" ry="5" fill={C.gold} />
        <ellipse cx="-1" cy="0" rx="3" ry="2.5" fill={C.goldLight} />
        {/* Tails */}
        <path d="M-5,9 C-18,28 -20,38 -35,48" stroke={C.gold} strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.9" />
        <path d="M5,9 C18,28 20,38 35,48" stroke={C.goldDark} strokeWidth="4.5" fill="none" strokeLinecap="round" opacity="0.85" />
        <path d="M-5,9 C-18,28 -20,38 -35,48" stroke={C.goldLight} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      </g>
    </g>
  )
}

/**
 * Build an isometric gift box with separate animatable parts.
 * Opening sequence: bow flies up → lid flies away → walls fall → content
 */
export function GiftBox({ emoji, message, from, photo, onComplete }: GiftBoxProps) {
  const [opened, setOpened] = useState(false)
  const [showContent, setShowContent] = useState(false)

  const handleOpen = useCallback(() => {
    setOpened(true)
    setTimeout(() => setShowContent(true), 1200)
  }, [])

  useEffect(() => {
    if (!showContent) return
    const timer = setTimeout(() => onComplete?.(), 3000)
    return () => clearTimeout(timer)
  }, [showContent, onComplete])

  // Ribbon polygons
  const frontVertRibbon = ribbonStrip(fCxT, fCyT, fCx, fCy, RB_W)
  const frontHorizRibbon = ribbonStrip(blx, (bly + blyT) / 2, bfx, (bfy + bfyT) / 2, 12)
  const topStrip1 = ribbonStrip(tFrontCx, tFrontCy, tBackCx, tBackCy, RB_W)
  const topStrip2 = ribbonStrip(tLeftCx, tLeftCy, tRightCx, tRightCy, 12)
  const rightVertRibbon = ribbonStrip(rCxT, rCyT, rCx, rCy, RB_W)
  const rightHorizRibbon = ribbonStrip(bfx, (bfy + bfyT) / 2, brx, (bry + bryT) / 2, 12)

  return (
    <div className="relative flex items-center justify-center w-full min-h-[60vh] overflow-hidden">
      {/* SVG definitions */}
      <svg className="absolute w-0 h-0">
        <defs>
          <filter id="shadowBlur"><feGaussianBlur stdDeviation="4" /></filter>
          <linearGradient id="boxFrontGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.boxTop} />
            <stop offset="100%" stopColor={C.boxFrontDark} />
          </linearGradient>
          <linearGradient id="boxRightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.boxFront} />
            <stop offset="100%" stopColor={C.boxRightDark} />
          </linearGradient>
          <linearGradient id="boxTopGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={C.boxTopLight} />
            <stop offset="100%" stopColor={C.boxTop} />
          </linearGradient>
          <linearGradient id="lidFrontGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.lidTop} />
            <stop offset="100%" stopColor={C.lidFront} />
          </linearGradient>
          <linearGradient id="lidRightGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.lidFront} />
            <stop offset="100%" stopColor={C.lidRight} />
          </linearGradient>
          <linearGradient id="lidTopGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3268a0" />
            <stop offset="100%" stopColor={C.lidTop} />
          </linearGradient>
        </defs>
      </svg>

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
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            >
              <svg width="340" height="300" viewBox="0 0 340 300">
                {/* Shadow */}
                <BoxShadow />

                {/* === BOX BASE === */}
                {/* Front face */}
                <polygon points={BOX_FRONT} fill="url(#boxFrontGrad)" stroke={C.boxFrontDark} strokeWidth="0.5" />
                {/* Right face */}
                <polygon points={BOX_RIGHT} fill="url(#boxRightGrad)" stroke={C.boxRightDark} strokeWidth="0.5" />
                {/* Top face */}
                <polygon points={BOX_TOP} fill="url(#boxTopGrad)" stroke={C.boxTop} strokeWidth="0.5" />

                {/* Box Ribbon */}
                <GoldRibbon points={frontVertRibbon} />
                <GoldRibbon points={frontHorizRibbon} />
                <GoldRibbon points={topStrip1} />
                <GoldRibbon points={topStrip2} />
                <GoldRibbon points={rightVertRibbon} />
                <GoldRibbon points={rightHorizRibbon} />

                {/* Lid ribbon — front */}
                <GoldRibbon points={ribbonStrip(
                  (llxT + lfxT) / 2, (llyT + lfyT) / 2,
                  (llx + lfx) / 2, (lly + lfy) / 2, RB_W
                )} />
                {/* Lid ribbon — top strip 1 */}
                <GoldRibbon points={ribbonStrip(
                  (lfxT + llxT) / 2, (lfyT + llyT) / 2,
                  (lrxT + lbxT) / 2, (lryT + lbyT) / 2, RB_W
                )} />
                {/* Lid ribbon — top strip 2 */}
                <GoldRibbon points={ribbonStrip(
                  (llxT + lbxT) / 2, (llyT + lbyT) / 2,
                  (lfxT + lrxT) / 2, (lfyT + lryT) / 2, 12
                )} />
                {/* Lid ribbon — right */}
                <GoldRibbon points={ribbonStrip(
                  (lfxT + lrxT) / 2, (lfyT + lryT) / 2,
                  (lfx + lrx) / 2, (lfy + lry) / 2, RB_W
                )} />

                {/* === LID === */}
                {/* Lid front face */}
                <polygon points={LID_FRONT} fill="url(#lidFrontGrad)" stroke={C.lidFront} strokeWidth="0.5" />
                {/* Lid right face */}
                <polygon points={LID_RIGHT} fill="url(#lidRightGrad)" stroke={C.lidRight} strokeWidth="0.5" />
                {/* Lid top face */}
                <polygon points={LID_TOP} fill="url(#lidTopGrad)" stroke={C.lidTop} strokeWidth="0.5" />

                {/* Bow */}
                <BowSVG />
              </svg>
            </motion.div>

            <p className="text-center text-sm text-white/70 mt-2 font-medium">Tap to open!</p>
          </motion.button>
        )}
      </AnimatePresence>

      {/* === OPENING ANIMATION === */}
      <AnimatePresence>
        {opened && !showContent && (
          <motion.div
            key="box-opening"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Bow flying up */}
            <motion.div
              key="bow-fly"
              initial={{ y: 0, opacity: 1, scale: 1 }}
              animate={{ y: -250, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute"
              style={{ zIndex: 20 }}
            >
              <svg width="80" height="80" viewBox="0 0 120 108">
                <BowSVG />
              </svg>
            </motion.div>

            {/* Lid flying up-right */}
            <motion.div
              key="lid-fly"
              initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
              animate={{ y: -180, x: 100, opacity: 0, rotate: 25 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.25 }}
              className="absolute"
              style={{ zIndex: 15 }}
            >
              <svg width="200" height="160" viewBox="0 0 340 280">
                <polygon points={LID_TOP} fill={C.lidTop} opacity="0.9" />
                <polygon points={LID_FRONT} fill={C.lidFront} opacity="0.8" />
                <polygon points={LID_RIGHT} fill={C.lidRight} opacity="0.7" />
              </svg>
            </motion.div>

            {/* Front face falling left-down */}
            <motion.div
              key="wall-front"
              initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
              animate={{ x: -120, y: 80, opacity: 0, rotate: -15 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.65 }}
              className="absolute"
            >
              <svg width="120" height="170" viewBox="0 0 120 170">
                <polygon points={`0,0 103.9,0 103.9,100 0,100`} fill={C.boxFront} opacity="0.7" />
              </svg>
            </motion.div>

            {/* Right face falling right-down */}
            <motion.div
              key="wall-right"
              initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
              animate={{ x: 120, y: 80, opacity: 0, rotate: 15 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.7 }}
              className="absolute"
            >
              <svg width="170" height="170" viewBox="0 0 170 170">
                <polygon points={`0,0 103.9,0 103.9,100 0,100`} fill={C.boxRight} opacity="0.7" />
              </svg>
            </motion.div>

            {/* Top face (base box) falling down */}
            <motion.div
              key="wall-top"
              initial={{ y: 0, opacity: 1 }}
              animate={{ y: 100, opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.75 }}
              className="absolute"
            >
              <svg width="220" height="130" viewBox="0 0 220 130">
                <polygon points={`0,60 103.9,0 0,-60 -103.9,0`} fill={C.boxTop} opacity="0.7" />
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
              &ldquo;{message}&rdquo;
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-blue-200 font-semibold text-lg"
            >
              &mdash; {from} &mdash;
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
