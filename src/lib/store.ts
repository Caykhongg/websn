import type { WishData } from "./types"

const STORAGE_KEY = "birthday-wishes"

export function saveWish(wish: WishData): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const wishes: WishData[] = raw ? JSON.parse(raw) : []
    if (!Array.isArray(wishes)) return false
    wishes.push(wish)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes))
    return true
  } catch (e) {
    console.error("Failed to save wish:", e)
    return false
  }
}

export function getWish(id: string): WishData | null {
  const wishes = getAllWishes()
  return wishes.find((w) => w.id === id) ?? null
}

function isValidWishData(item: unknown): item is WishData {
  if (typeof item !== "object" || item === null) return false
  const obj = item as Record<string, unknown>
  return (
    typeof obj.id === "string" &&
    typeof obj.from === "string" &&
    typeof obj.message === "string" &&
    typeof obj.emoji === "string" &&
    Array.isArray(obj.effects) &&
    typeof obj.createdAt === "number"
  )
}

export function getAllWishes(): WishData[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) return []
    const parsed = JSON.parse(data)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isValidWishData)
  } catch {
    return []
  }
}

export function deleteWish(id: string): void {
  try {
    const wishes = getAllWishes().filter((w) => w.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes))
  } catch {
    // silently fail
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
