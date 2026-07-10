import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence, useReducedMotion } from "motion/react"

interface QRCodeModalProps {
  open: boolean
  wishUrl: string
  onClose: () => void
}

export function QRCodeModal({ open, wishUrl, onClose }: QRCodeModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const reduce = useReducedMotion()
  const [copied, setCopied] = useState(false)
  const [qrError, setQrError] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)

  useEffect(() => {
    if (!open || !canvasRef.current || !wishUrl) return
    let cancelled = false
    setQrLoading(true)
    setQrError(false)

    import("qrcode").then(({ default: QRCode }) => {
      if (cancelled || !canvasRef.current) return
      QRCode.toCanvas(canvasRef.current, wishUrl, {
        width: 280,
        margin: 2,
        color: { dark: "#be185d", light: "#ffffff" },
      })
        .then(() => {
          if (!cancelled) setQrLoading(false)
        })
        .catch((err: Error) => {
          if (!cancelled) {
            console.error("QR generation failed:", err)
            setQrError(true)
            setQrLoading(false)
          }
        })
    }).catch((err: Error) => {
      if (!cancelled) {
        console.error("Failed to load QR library:", err)
        setQrError(true)
        setQrLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [open, wishUrl])

  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(wishUrl)
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      const input = document.createElement("input")
      input.value = wishUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand("copy")
      document.body.removeChild(input)
      setCopied(true)
      clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement("a")
    link.download = "birthday-wish-qr.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full text-center space-y-6"
          >
            <div className="space-y-2">
              <div className="text-4xl">🎉</div>
              <h2 id="qr-modal-title" className="text-2xl font-bold text-gray-900 tracking-tight">
                Wish created!
              </h2>
              <p className="text-gray-500 text-sm">
                Share this QR code so they can receive your wish
              </p>
            </div>

            <div className="bg-gradient-to-br from-wish-50 to-pink-50 rounded-2xl p-4 inline-block mx-auto min-h-[200px] flex items-center justify-center relative">
              <canvas ref={canvasRef} className="mx-auto rounded-lg" width={280} height={280} />
              {qrLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-2 border-wish-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Generating QR...</span>
                  </div>
                </div>
              )}
              {qrError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">⚠️</div>
                    <p className="text-xs text-gray-500">QR too large for this message.</p>
                    <p className="text-xs text-gray-400">Use copy link instead.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium
                  text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                onClick={handleDownload}
                disabled={qrError || qrLoading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-wish-500 to-wish-600
                  text-white text-sm font-medium hover:from-wish-600 hover:to-wish-700
                  transition-all active:scale-[0.98] shadow-lg shadow-wish-200/50
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download QR
              </button>
            </div>

            <button
              ref={closeRef}
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
