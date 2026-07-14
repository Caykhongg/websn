import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "motion/react"
import { EmojiPicker } from "../components/EmojiPicker"
import { PhotoUpload } from "../components/PhotoUpload"
import { QRCodeModal } from "../components/QRCodeModal"
import { WishHistory } from "../components/WishHistory"
import { GooeyBackground } from "../components/ui/gooey-background"
import { saveWish, generateId } from "../lib/store"
import { encodeToBase64 } from "../lib/encoding"
import type { WishFormData, EffectType, PresentationType } from "../lib/types"

const PRESENTATIONS: { id: PresentationType; label: string; icon: string; desc: string }[] = [
  { id: "gift", label: "Gift Box", icon: "🎁", desc: "Box opens with lid flying off" },
  { id: "cake", label: "Birthday Cake", icon: "🎂", desc: "Candle lights up with firework" },
  { id: "balloon", label: "Balloons", icon: "🎈", desc: "Balloons pop filling the screen" },
  { id: "firework", label: "Fireworks", icon: "🎆", desc: "Orbits converge and explode" },
]

const BALLOON_COLORS = [
  { name: "Pink", value: "#f472b6" },
  { name: "Red", value: "#ef4444" },
  { name: "Gold", value: "#facc15" },
  { name: "Blue", value: "#60a5fa" },
  { name: "Purple", value: "#a78bfa" },
  { name: "Green", value: "#4ade80" },
]

const EFFECTS_LIST: { id: EffectType; label: string; icon: string }[] = [
  { id: "balloons", label: "Balloons", icon: "🎈" },
  { id: "confetti", label: "Confetti", icon: "🎊" },
  { id: "sparkles", label: "Sparkles", icon: "✨" },
  { id: "hearts", label: "Hearts", icon: "💖" },
]

export function CreateWish() {
  const navigate = useNavigate()
  const [form, setForm] = useState<WishFormData>({
    from: "",
    message: "",
    photo: undefined,
    emoji: "🎂",
    effects: ["balloons", "confetti"],
    presentationType: "gift",
    balloonColor: "#f472b6",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof WishFormData, string>>>({})
  const [showQR, setShowQR] = useState(false)
  const [wishId, setWishId] = useState("")
  const [wishUrl, setWishUrl] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const updateField = <K extends keyof WishFormData>(
    key: K,
    value: WishFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const toggleEffect = (effect: EffectType) => {
    setForm((prev) => ({
      ...prev,
      effects: prev.effects.includes(effect)
        ? prev.effects.filter((e) => e !== effect)
        : [...prev.effects, effect],
    }))
  }

  const validate = (): boolean => {
    const errs: Partial<Record<keyof WishFormData, string>> = {}
    if (!form.from.trim()) errs.from = "Please enter your name"
    if (!form.message.trim()) errs.message = "Please write your wish"
    if (form.effects.length === 0) errs.effects = "Select at least one effect"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)

    const id = generateId()
    const wish = {
      id,
      from: form.from.trim(),
      message: form.message.trim(),
      photo: form.photo,
      emoji: form.emoji,
      effects: form.effects,
      presentationType: form.presentationType,
      balloonColor: form.presentationType === "balloon" ? form.balloonColor : undefined,
      createdAt: Date.now(),
    }

    const saved = saveWish(wish)
    if (!saved) {
      alert("Failed to save wish. Storage may be full.")
      setSubmitting(false)
      return
    }

    setWishId(id)
    const payload: Record<string, unknown> = {
      from: wish.from,
      message: wish.message,
      emoji: wish.emoji,
      effects: wish.effects,
      presentationType: wish.presentationType,
      createdAt: wish.createdAt,
    }
    if (wish.balloonColor) payload.balloonColor = wish.balloonColor
    const encoded = encodeToBase64(payload)
    const url = `${window.location.origin}/wish/${id}#${encoded}`
    setWishUrl(url)
    setShowQR(true)
    setSubmitting(false)
  }

  const handleDone = () => {
    setShowQR(false)
    navigate(`/wish/${wishId}`)
  }

  const handleLoadWish = (data: { from: string; message: string; photo?: string; emoji: string; effects: EffectType[]; presentationType: PresentationType; balloonColor?: string }) => {
    setForm(data)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-white to-pink-50 relative overflow-hidden">
      <GooeyBackground />
      <div className="max-w-lg mx-auto px-4 py-12 md:py-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", damping: 15, delay: 0.2 }}
            className="text-6xl mb-4"
          >
            🎂
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Create a Birthday Wish
          </h1>
          <p className="text-gray-500 max-w-sm mx-auto">
            Make their day special with a personalized message and celebration effects
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-xl shadow-rose-100/50 border border-rose-100/50 space-y-6">
            <div className="space-y-2">
              <label htmlFor="wish-from" className="block text-sm font-medium text-gray-700">
                Your name
              </label>
              <input
                id="wish-from"
                type="text"
                value={form.from}
                onChange={(e) => updateField("from", e.target.value)}
                placeholder="e.g. Minh"
                maxLength={50}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white/80
                  ${errors.from ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-wish-400"}
                  outline-none transition-colors text-sm placeholder:text-gray-300`}
              />
              {errors.from && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs"
                >
                  {errors.from}
                </motion.p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="wish-message" className="block text-sm font-medium text-gray-700">
                Birthday wish
              </label>
              <textarea
                id="wish-message"
                value={form.message}
                onChange={(e) => updateField("message", e.target.value)}
                placeholder="Write your heartfelt birthday message..."
                rows={4}
                maxLength={500}
                className={`w-full px-4 py-3 rounded-xl border-2 bg-white/80 resize-none
                  ${errors.message ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-wish-400"}
                  outline-none transition-colors text-sm placeholder:text-gray-300`}
              />
              {errors.message && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs"
                >
                  {errors.message}
                </motion.p>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Your photo (optional)
              </label>
              <PhotoUpload
                photo={form.photo}
                onChange={(v) => updateField("photo", v)}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Choose an emoji
              </label>
              <EmojiPicker
                selected={form.emoji}
                onSelect={(v) => updateField("emoji", v)}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Presentation style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PRESENTATIONS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateField("presentationType", p.id)}
                    className={`
                      flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all duration-200 text-center
                      ${form.presentationType === p.id
                        ? "border-wish-400 bg-wish-50 text-wish-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-600 hover:border-wish-300 hover:bg-wish-50/50"
                      }
                    `}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <span className="text-xs font-medium">{p.label}</span>
                    <span className="text-[10px] text-gray-400 leading-tight">{p.desc}</span>
                    {form.presentationType === p.id && (
                      <svg className="w-3 h-3 text-wish-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {form.presentationType === "balloon" && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Balloon color
                </label>
                <div className="flex flex-wrap gap-2">
                  {BALLOON_COLORS.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => updateField("balloonColor", c.value)}
                      className={`
                        w-10 h-10 rounded-full border-2 transition-all
                        ${form.balloonColor === c.value
                          ? "border-wish-500 scale-110 shadow-md"
                          : "border-gray-300 hover:scale-105"
                        }
                      `}
                      style={{ backgroundColor: c.value }}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Celebration effects
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EFFECTS_LIST.map((effect) => (
                  <button
                    key={effect.id}
                    type="button"
                    onClick={() => toggleEffect(effect.id)}
                    aria-pressed={form.effects.includes(effect.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200
                      ${
                        form.effects.includes(effect.id)
                          ? "border-wish-400 bg-wish-50 text-wish-700 shadow-sm"
                          : "border-gray-200 bg-white text-gray-600 hover:border-wish-300 hover:bg-wish-50/50"
                      }
                    `}
                  >
                    <span className="text-lg">{effect.icon}</span>
                    <span className="text-sm font-medium">{effect.label}</span>
                    {form.effects.includes(effect.id) && (
                      <svg className="w-4 h-4 ml-auto text-wish-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {errors.effects && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-xs"
                >
                  {errors.effects}
                </motion.p>
              )}
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={submitting}
            whileHover={submitting ? {} : { scale: 1.02 }}
            whileTap={submitting ? {} : { scale: 0.98 }}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-wish-500 to-wish-600
              text-white font-semibold text-lg tracking-tight
              hover:from-wish-600 hover:to-wish-700
              shadow-xl shadow-wish-200/50
              transition-all duration-200
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "Create wish ✨"
            )}
          </motion.button>
        </motion.form>

        <WishHistory onLoad={handleLoadWish} />
      </div>

      <QRCodeModal
        open={showQR}
        wishUrl={wishUrl}
        onClose={handleDone}
      />
    </div>
  )
}
