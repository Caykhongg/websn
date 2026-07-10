import { createServer } from "node:http"
import { readFileSync, existsSync } from "node:fs"
import { join, extname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = fileURLToPath(new URL(".", import.meta.url))
const DIST = join(__dirname, "..", "dist")

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".json": "application/json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
}

const PORT = process.env.PORT || 10000

createServer((req, res) => {
  const path = req.url === "/" ? "/index.html" : req.url
  const filePath = join(DIST, path)

  if (!existsSync(filePath)) {
    const content = readFileSync(join(DIST, "index.html"))
    res.writeHead(200, { "Content-Type": "text/html" })
    res.end(content)
    return
  }

  try {
    const content = readFileSync(filePath)
    const ext = extname(filePath)
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" })
    res.end(content)
  } catch {
    res.writeHead(500)
    res.end("Internal Server Error")
  }
}).listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
