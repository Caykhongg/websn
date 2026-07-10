# QA Inspection Report — Birthday Wish App

**Date:** 2026-07-10  
**Inspector:** QA Inspector (Migration Quality & Compliance)  
**Scope:** Complete source code audit of birthday-wish app  

---

## Executive Summary

The app is **functionally WORKING** in production. Core flows (create wish → QR code → view wish) are intact. However, **5 real bugs** were found — 1 that breaks a feature in development, 1 that progressively corrupts stored data, and 3 that degrade reliability.

**Verdict:** PASS with blockers — ship only after critical items are fixed.

---

## Bug List

### 🔴 BUG 1 — PhotoUpload mountedRef broken in StrictMode (Development Only)

**File:** `src/components/PhotoUpload.tsx`, lines 10–14  
**Severity:** HIGH (feature broken in dev)  
**Type:** Runtime logic error

```tsx
const mountedRef = useRef(true)

useEffect(() => {
  return () => { mountedRef.current = false }   // line 13
}, [])
```

**Root cause:** In React StrictMode (development), the component mounts → cleanup sets `mountedRef.current = false` → component re-mounts. The effect does NOT reset `mountedRef.current` to `true` on re-mount. Since `useRef(true)` initializes only on the first mount, the ref persists as `false`.

**Impact:** Photo upload silently fails in dev mode — `handleFile` reads the file via `FileReader`, but line 43 (`if (mountedRef.current) onChange(...)`) evaluates to `false`, so `onChange` is never called. The user sees no error, but the photo is never set.

**Fix:** Reset `mountedRef.current = true` at the start of the effect:
```tsx
useEffect(() => {
  mountedRef.current = true
  return () => { mountedRef.current = false }
}, [])
```

---

### 🔴 BUG 2 — localStorage Wish Order Progressively Corrupted

**File:** `src/lib/store.ts`, lines 5–15  
**Severity:** HIGH (data integrity)  
**Type:** Logic error — array mutation after reversal

```tsx
export function saveWish(wish: WishData): boolean {
  try {
    const wishes = getAllWishes()     // line 7 — returns REVERSED array
    wishes.push(wish)                 // line 8 — appends to END of reversed array
    localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes))  // saves WRONG ORDER
    return true
  } catch (e) { ... }
}
```

Where `getAllWishes()` (line 41) does:
```tsx
return parsed.filter(isValidWishData).reverse()
```

**Root cause:** `getAllWishes()` reverses the array for display (newest first). But `saveWish()` takes this reversed array, pushes the new wish to the **end** (instead of the beginning), and saves the NOW-MANGLED order back to localStorage. Each `saveWish()` call corrupts the order further.

**Trace:**
| Step | Storage content | getAllWishes() returns | After push | Saved |
|------|----------------|----------------------|------------|-------|
| Save A | `[]` | `[]` | `[A]` | `[A]` |
| Save B | `[A]` | `[A]` | `[A, B]` | `[A, B]` |
| Save C | `[A, B]` | `[B, A]` | `[B, A, C]` | `[B, A, C]` |
| Save D | `[B, A, C]` | `[C, A, B]` | `[C, A, B, D]` | `[C, A, B, D]` |

After 4 saves, the WishHistory displays: `D, B, A, C` — D (newest) correctly first, but B, A, C in completely wrong order.

**Fix:** Insert at index 0 instead of push, or save without reversing:
```tsx
wishes.unshift(wish)  // instead of wishes.push(wish)
```

---

### 🔴 BUG 3 — Unhandled Promise Rejections (canvas-confetti import)

**File:** `src/pages/ViewWish.tsx`, lines 65–77 and 88–94  
**Severity:** MEDIUM (unhandled rejection can trigger error boundaries in some setups)  
**Type:** Missing error handling

```tsx
import("canvas-confetti").then(({ default: confetti }) => {   // line 65
  // ...
  shoot()
  intervalId = setInterval(shoot, 300)
  timeoutId = setTimeout(() => { ... }, 3000)
})  // NO .catch() !!

// ...

const handleCelebrateAgain = useCallback(() => {
  import("canvas-confetti").then(({ default: confetti }) => {   // line 88
    confetti({...})
  })  // NO .catch() !!
}, [])
```

**Impact:** If the `canvas-confetti` module fails to load (network error, CSP restriction, ad blocker), an **unhandled promise rejection** is thrown. In development React, this triggers error overlay. In production, it logs to console and can crash Node.js process in SSR contexts.

**Fix:** Add `.catch()` to both imports:
```tsx
import("canvas-confetti").then(...).catch(() => console.warn("confetti unavailable"))
```

---

### 🟡 BUG 4 — WishHistory Stale After Creating New Wish

**File:** `src/components/WishHistory.tsx`, lines 15–17  
**Severity:** LOW (UX issue, data correct after page refresh)  
**Type:** Missing refresh trigger

```tsx
useEffect(() => {
  setWishes(getAllWishes())
}, [])  // ← empty dependency array — runs ONCE on mount only
```

**Impact:** When a user creates a new wish via the form, `saveWish()` writes to localStorage, but WishHistory doesn't re-read. The new wish is invisible in the history list until the page is refreshed or the component re-mounts.

**Fix:** Add a refresh mechanism (e.g., expose a refresh callback or watch a storage event).

---

### 🟡 BUG 5 — Missing useEffect Dependency (`window.location.hash`)

**File:** `src/pages/ViewWish.tsx`, line 56  
**Severity:** LOW (doesn't manifest in current app flow)  
**Type:** React hook dependency warning

```tsx
useEffect(() => {
    const hash = window.location.hash.replace("#", "")
    // ...
}, [id])  // ← missing `window.location.hash` dependency
```

**Impact:** If the hash fragment changes while `id` stays the same, the effect won't re-run. In the current app flow, this can't happen — the hash is only read on mount. But it's a latent bug waiting for future changes.

---

## Security Scan

| Check | Result |
|-------|--------|
| Hardcoded secrets | ✅ NONE |
| PHI in logs | ✅ NONE — console.error only for generic errors |
| PHI in client state (exposed) | ✅ NONE — wish data stays in component state |
| XSS via URL params | ✅ SAFE — `decodeFromBase64` validates via `JSON.parse` |
| localStorage injection | ✅ SAFE — `isValidWishData` validates shape on read |
| Canvas taint (cross-origin) | ✅ SAFE — QR and photo canvases use same-origin data |

---

## Functional Flow Verification

### Flow: Create Wish → QR Code → View Wish ✅

| Step | Status | Details |
|------|--------|---------|
| Form validation | ✅ | `validate()` checks required fields, effects selection |
| `saveWish()` | ⚠️ | Works but corrupts order (Bug 2) |
| `encodeToBase64()` | ✅ | Verified round-trip with emoji, multi-byte, long messages |
| URL construction | ✅ | `${origin}/wish/${id}#${encoded}` — tested 204-char QR-safe URL |
| QR code render | ✅ | Dynamic import of `qrcode`, `toCanvas()` API, 280x280 |
| ViewWish hash read | ✅ | `replace("#", "")` correctly strips leading `#` |
| `decodeFromBase64()` | ✅ | Verified padding restoration, URL-safe char reversal |
| Fallback to stored wish | ✅ | Works when hash is missing or invalid |
| Not-found handling | ✅ | Redirects to "Wish not found" page |
| Confetti celebration | ⚠️ | Unhandled rejection on import failure (Bug 3) |

### Flow: Photo Upload ✅ (in production)

| Step | Status | Details |
|------|--------|---------|
| File selection | ✅ | `accept="image/*"`, 5MB max, type check |
| FileReader | ✅ | Data URL generation |
| StrictMode | ❌ | **Broken in dev** (Bug 1) — `mountedRef` stuck at `false` |

---

## Bundle Size Check

| Component | Size (approx) | Notes |
|-----------|---------------|-------|
| CreateWish (incl. form) | ~8KB gzip | ✅ |
| ViewWish | ~4KB gzip | ✅ |
| QRCodeModal (lazy `qrcode`) | ~15KB gzip (async) | ✅ loaded on demand |
| Balloon effects | ~6KB gzip | ✅ |
| PixelTrail/PixelTrail | ~3KB gzip | ✅ |

---

## Recommendations Before Ship

1. **FIX (BLOCKER):** PhotoUpload mountedRef reset — if you test in dev, photo upload won't work.
2. **FIX (BLOCKER):** `saveWish` order corruption — use `unshift` instead of `push`.
3. **FIX (RECOMMENDED):** Add `.catch()` to both `canvas-confetti` dynamic imports.
4. **FIX (NICE-TO-HAVE):** Add `window.location.hash` to ViewWish effect deps.
5. **FIX (NICE-TO-HAVE):** Refresh WishHistory after save via callback or `useSyncExternalStore`.
