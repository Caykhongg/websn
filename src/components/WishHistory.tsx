import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getAllWishes, deleteWish } from "../lib/store"
import { encodeToBase64 } from "../lib/encoding"
import type { WishData, EffectType, PresentationType } from "../lib/types"

interface WishHistoryProps {
  onLoad: (data: { from: string; message: string; photo?: string; emoji: string; effects: EffectType[]; presentationType: PresentationType; balloonColor?: string }) => void
}

export function WishHistory({ onLoad }: WishHistoryProps) {
  const [wishes, setWishes] = useState<WishData[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setWishes(getAllWishes())
  }, [])

  const handleReShare = (wish: WishData) => {
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
    const url = `${window.location.origin}/wish/${wish.id}#${encoded}`
    navigator.clipboard.writeText(url).catch(() => {})
    navigate(`/wish/${wish.id}`)
  }

  const handleDelete = (id: string) => {
    deleteWish(id)
    setWishes(getAllWishes())
  }

  if (wishes.length === 0) return null

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-lg font-semibold text-gray-700 text-center mb-4">
        Your recent wishes
      </h2>
      <div className="space-y-2">
        {wishes.slice(0, 10).map((wish) => (
          <div
            key={wish.id}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-rose-100/50 shadow-sm
              flex items-center gap-3 group hover:shadow-md transition-shadow"
          >
            <span className="text-2xl flex-shrink-0">{wish.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                To: {wish.from}
              </p>
              <p className="text-xs text-gray-400 truncate">{wish.message}</p>
              <p className="text-[10px] text-gray-300 mt-0.5">
                {new Date(wish.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onLoad({ from: wish.from, message: wish.message, photo: wish.photo, emoji: wish.emoji, effects: wish.effects, presentationType: wish.presentationType, balloonColor: wish.balloonColor })}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-wish-50 text-wish-600 hover:bg-wish-100 transition-colors"
                title="Edit and reuse"
              >
                Reuse
              </button>
              <button
                onClick={() => handleReShare(wish)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="Share again"
              >
                Share
              </button>
              <button
                onClick={() => handleDelete(wish.id)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                title="Delete"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
