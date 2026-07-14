import express from "express"
import cors from "cors"
import multer from "multer"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { randomUUID } from "crypto"
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "fs"
import Database from "better-sqlite3"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const UPLOADS = join(__dirname, "uploads")
if (!existsSync(UPLOADS)) mkdirSync(UPLOADS, { recursive: true })

const db = new Database(join(__dirname, "data.db"))
db.pragma("journal_mode = WAL")
db.exec(`CREATE TABLE IF NOT EXISTS wishes (
  id TEXT PRIMARY KEY,
  from_name TEXT NOT NULL,
  message TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '🎂',
  effects TEXT NOT NULL DEFAULT '[]',
  presentation_type TEXT NOT NULL DEFAULT 'gift',
  balloon_color TEXT,
  photo_path TEXT,
  created_at INTEGER NOT NULL
)`)

const storage = multer.diskStorage({
  destination: UPLOADS,
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop() || "jpg"
    cb(null, `${randomUUID()}.${ext}`)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true)
    else cb(new Error("Only images allowed"))
  },
})

const app = express()
app.use(cors())
app.use(express.json())
app.use("/uploads", express.static(UPLOADS))

function serveStatic(fpath, res) {
  try {
    const content = readFileSync(fpath)
    const ext = fpath.split(".").pop()
    const mime = {
      html: "text/html",
      js: "text/javascript",
      css: "text/css",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      svg: "image/svg+xml",
      ico: "image/x-icon",
      json: "application/json",
    }
    res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" })
    res.end(content)
  } catch {
    res.writeHead(500)
    res.end("Internal Server Error")
  }
}

// API: Create wish
app.post("/api/wishes", upload.single("photo"), (req, res) => {
  try {
    const { from, message, emoji, effects, presentationType, balloonColor } = req.body
    if (!from?.trim() || !message?.trim()) {
      return res.status(400).json({ error: "Name and message required" })
    }
      const id = randomUUID().slice(0, 12)
      const photoPath = req.file ? `/uploads/${req.file.filename}` : null
      const effectsStr = typeof effects === "string" ? effects : JSON.stringify(effects || [])
      const stmt = db.prepare(
        `INSERT INTO wishes (id, from_name, message, emoji, effects, presentation_type, balloon_color, photo_path, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      stmt.run(id, from.trim(), message.trim(), emoji || "🎂",
        effectsStr, presentationType || "gift",
        balloonColor || null, photoPath, Date.now())

    res.json({
      id,
      from: from.trim(),
      message: message.trim(),
      emoji: emoji || "🎂",
      effects: effects || [],
      presentationType: presentationType || "gift",
      balloonColor: balloonColor || null,
      photo: photoPath,
      createdAt: Date.now(),
    })
  } catch (err) {
    console.error("POST /api/wishes:", err)
    res.status(500).json({ error: "Failed to create wish" })
  }
})

// API: Get wish
app.get("/api/wishes/:id", (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM wishes WHERE id = ?").get(req.params.id)
    if (!row) return res.status(404).json({ error: "Wish not found" })
    res.json({
      id: row.id,
      from: row.from_name,
      message: row.message,
      emoji: row.emoji,
      effects: JSON.parse(row.effects),
      presentationType: row.presentation_type,
      balloonColor: row.balloon_color,
      photo: row.photo_path,
      createdAt: row.created_at,
    })
  } catch (err) {
    console.error("GET /api/wishes/:id:", err)
    res.status(500).json({ error: "Failed to get wish" })
  }
})

// Serve SPA for all routes
app.use((req, res) => {
  const dist = join(__dirname, "..", "dist")
  const p = req.url === "/" ? "/index.html" : req.url
  const filePath = join(dist, p)
  if (existsSync(filePath)) return serveStatic(filePath, res)
  serveStatic(join(dist, "index.html"), res)
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
