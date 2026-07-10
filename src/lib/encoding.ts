export function encodeToBase64(obj: unknown): string {
  try {
    const json = JSON.stringify(obj)
    const bytes = new TextEncoder().encode(json)
    let result = ""
    for (let i = 0; i < bytes.length; i++) {
      result += String.fromCharCode(bytes[i])
    }
    return btoa(result).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  } catch (e) {
    console.error("encodeToBase64 failed:", e)
    return ""
  }
}

export function decodeFromBase64<T>(str: string): T | null {
  try {
    const restored = str.replace(/-/g, "+").replace(/_/g, "/")
    const padding = restored.length % 4 === 3 ? "=" : restored.length % 4 === 2 ? "==" : ""
    const binary = atob(restored + padding)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    const json = new TextDecoder().decode(bytes)
    return JSON.parse(json)
  } catch {
    return null
  }
}
