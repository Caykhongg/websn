export interface WishData {
  id: string
  from: string
  message: string
  photo?: string
  emoji: string
  effects: EffectType[]
  createdAt: number
}

export type EffectType = "balloons" | "confetti" | "sparkles" | "hearts"

export interface WishFormData {
  from: string
  message: string
  photo?: string
  emoji: string
  effects: EffectType[]
}
