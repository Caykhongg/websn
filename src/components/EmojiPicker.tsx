import { emojiOptions } from "../lib/emoji"

interface EmojiPickerProps {
  selected: string
  onSelect: (emoji: string) => void
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {emojiOptions.map(({ emoji, label }) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={`
            aspect-square text-2xl flex items-center justify-center
            rounded-xl border-2 transition-all duration-200
            hover:scale-110 hover:shadow-lg
            ${
              selected === emoji
                ? "border-wish-500 bg-wish-50 shadow-lg shadow-wish-200/50 scale-110"
                : "border-gray-200 bg-white hover:border-wish-300 hover:bg-wish-50/50"
            }
          `}
          aria-label={label}
          title={label}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}
