import { useRef, useEffect } from "react"

interface PhotoUploadProps {
  photo: string | undefined
  onChange: (dataUrl: string | undefined) => void
}

export function PhotoUpload({ photo, onChange }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  const handleSelect = () => {
    inputRef.current?.click()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      handleSelect()
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB")
      return
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (mountedRef.current) onChange(reader.result as string)
    }
    reader.onerror = () => {
      if (mountedRef.current) alert("Failed to read image file")
    }
    reader.readAsDataURL(file)
  }

  const handleRemove = () => {
    onChange(undefined)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />

      {photo ? (
        <button
          type="button"
          onClick={handleSelect}
          onKeyDown={handleKeyDown}
          className="relative w-32 h-32 mx-auto group"
        >
          <img
            src={photo}
            alt="Selected photo preview"
            className="w-full h-full object-cover rounded-2xl border-2 border-wish-200 shadow-md"
          />
          <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
              Change
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleRemove()
            }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full
              text-xs flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
            aria-label="Remove photo"
          >
            ✕
          </button>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleSelect}
          className="w-32 h-32 mx-auto rounded-2xl border-2 border-dashed border-gray-300
            hover:border-wish-400 hover:bg-wish-50/50 transition-all duration-200
            flex flex-col items-center justify-center gap-1 group"
        >
          <svg
            className="w-8 h-8 text-gray-400 group-hover:text-wish-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.318-2.805A3.75 3.75 0 0118.75 19.5H6.75z"
            />
          </svg>
          <span className="text-xs text-gray-400 group-hover:text-wish-500 transition-colors">
            Add photo
          </span>
        </button>
      )}
    </div>
  )
}
