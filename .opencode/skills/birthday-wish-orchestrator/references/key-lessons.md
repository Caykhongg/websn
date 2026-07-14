# Birthday Wish — Key Technical Lessons

## Gooey Filter
SVG `<filter id="goo">` with CSS `filter: url(#goo)` fails when SVG is React-rendered (browser can't resolve `url(#id)` from React's DOM at paint time).
**Fix:** Inject SVG filter imperatively into `<body>` via `insertAdjacentHTML`.

## Pinterest Image Extraction
Pinterest blocks direct downloads. **Fix:** Use Pinterest oEmbed API:
1. `GET https://www.pinterest.com/oembed.json?url=...` → `thumbnail_url`
2. Replace `236x` with `originals` for full resolution

## Background Display (Portrait → Landscape)
Portrait BG on landscape screens gets cropped with `bg-cover`. **Fix:** Use `bg-contain bg-center bg-no-repeat` with dark overlay. Letterboxing is intentional.

## Express 5 Breaking Change
`app.get("*", ...)` throws `Missing parameter name at index 1: *`. **Fix:** Use `app.use((req, res) => ...)` for SPA catch-all.

## FormData + Multer + JSON Fields
All non-file fields in multipart FormData arrive as strings. `effects` is `"[...]"` not a real array. **Fix:** `typeof effects === "string" ? JSON.parse(effects) : effects`.

## PointerEvent TypeScript Strict Mode
`element.addEventListener("pointermove", (ev: PointerEvent) => ...)` fails TS strict. **Fix:** Use `window.addEventListener` instead of element listeners, or cast to `Event`.
