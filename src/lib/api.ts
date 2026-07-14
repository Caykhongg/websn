const API = window.location.origin

export interface WishResponse {
  id: string
  from: string
  message: string
  emoji: string
  effects: string[]
  presentationType: string
  balloonColor?: string
  photo?: string
  createdAt: number
}

export async function createWish(data: {
  from: string
  message: string
  emoji: string
  effects: string[]
  presentationType: string
  balloonColor?: string
  photo?: string
}): Promise<WishResponse | null> {
  try {
    const form = new FormData()
    form.append("from", data.from)
    form.append("message", data.message)
    form.append("emoji", data.emoji)
    form.append("effects", JSON.stringify(data.effects))
    form.append("presentationType", data.presentationType)
    if (data.balloonColor) form.append("balloonColor", data.balloonColor)
    if (data.photo?.startsWith("data:image")) {
      const res = await fetch(data.photo)
      const blob = await res.blob()
      form.append("photo", blob, "photo.jpg")
    }
    const res = await fetch(`${API}/api/wishes`, { method: "POST", body: form })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export async function getWish(id: string): Promise<WishResponse | null> {
  try {
    const res = await fetch(`${API}/api/wishes/${id}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}
