# QA Report — 2026-07-14

## Build Status: PASS

## Report Items

### 1. Build (tsc + vite build) — PASS
`npm run build` completed with zero errors. TypeScript compilation passed (tsc -b), Vite bundled successfully. All modules transform clean.

### 2. Backend Server Startup — PASS
`node backend/server.js` starts without crash, outputs `Server running on port 10000` within 2s. SQLite DB created, WAL mode enabled, table `wishes` created on first run.

### 3. Frontend API ↔ Backend Response Shape — FAIL
- Frontend `WishResponse` type (`src/lib/api.ts:4-13`) matches backend GET response (`server.js:112-122`) field-for-field: `id`, `from`, `message`, `emoji`, `effects`, `presentationType`, `balloonColor`, `photo`, `createdAt`. Types align: `string[]` for effects, `number` for `createdAt`, optional `string` for `balloonColor`/`photo`. ✅
- **Critical:** POST response (`server.js:90-100`) returns `effects: effects || []` — but `req.body.effects` comes from FormData as a JSON-stringified string (e.g. `'["balloons","confetti"]'`), not a parsed array. The response returns the raw string, breaking the `WishResponse.effects: string[]` contract. ❌
  - Mitigation: `CreateWish.tsx` only reads `id` and `photo` from the POST response, not `effects`. The stored DB value is correct via `effectsStr`. This is a latent type-contract violation, not a runtime crash.

### 4. URL Hash Encoding/Decoding Parity — PASS
- `encodeToBase64` (`src/lib/encoding.ts:1-14`): `JSON.stringify` → `TextEncoder` → `String.fromCharCode` → `btoa` → URL-safe base64url (replace `+/` with `-_`, strip `=`).
- `decodeFromBase64` (`src/lib/encoding.ts:16-30`): Reverse: restore standard chars, recalc padding, `atob`, `Uint8Array`, `TextDecoder`, `JSON.parse`.
- Roundtrip is correct for all inputs including emoji (UTF-8 via TextEncoder). Padding recovery logic handles %4=2 and %4=3 cases. ✅
- Used consistently in `CreateWish.tsx:124` and `WishHistory.tsx:29` for URL hash construction.

### 5. Presentation Components & `onComplete` Pattern — FAIL
| Component | File | Prop Name | Follows `onComplete`? |
|-----------|------|-----------|----------------------|
| GiftBox | `src/components/GiftBox.tsx` | `onComplete?` | ✅ |
| Cake | `src/components/Cake.tsx` | `onComplete?` | ✅ |
| BalloonPresentation | `src/components/BalloonPresentation.tsx` | `onComplete?` | ✅ |
| Firework | `src/components/Firework.tsx` | `onShowInfo` | ❌ **uses `onShowInfo` instead of `onComplete`** |
- Firework receives `onShowInfo` from ViewWish (`ViewWish.tsx:108`), which passes `handlePresentationDone`. This works functionally but breaks the naming convention established by the other three components. ❌
- All four presentation components exist and are dispatched correctly via `renderPresentation()` (`ViewWish.tsx:98-112`).

### 6. Gooey Background Uses `insertAdjacentHTML` — PASS
`src/components/ui/gooey-background.tsx:27`:
```ts
document.body.insertAdjacentHTML("beforeend", SVG_FILTER)
```
The SVG filter (`<filter id="bg-gooey">`) is injected directly into `<body>` as raw HTML, not rendered through React's DOM. This ensures the browser can resolve the `url(#bg-gooey)` CSS filter reference at paint time. Cleanup in the effect return removes the SVG element. ✅

Canvas rendering uses `ctx.roundRect()` (available via ES2023 + DOM libs). ✅

### 7. TypeScript Strict Mode & Pointer Events — PASS
- `tsconfig.app.json` does not enable `strict: true`, but enables `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`.
- `BalloonPresentation.tsx:26` uses `globalThis.PointerEvent` typing for window-level pointer event listeners — correct pattern for `addEventListener` callbacks.
- All pointer event handlers use `touchAction: "none"` where required.
- Build passes with zero type errors. ✅

## Summary
- Total: 7 items
- PASS: 5
- FAIL: 2
- Blocking: no

### Blocking Assessment
- Item 3 (POST `effects` type mismatch) is **non-blocking** — frontend does not consume `effects` from the POST response; stored DB value is correct; only the response contract is broken.
- Item 5 (Firework `onShowInfo`) is **non-blocking** — functional correct, only a naming inconsistency.

Both failures are convention/consistency issues, not runtime bugs. Recommend fixing in a cleanup pass but do not block release.
