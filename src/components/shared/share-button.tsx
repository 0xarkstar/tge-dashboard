import { Share2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  readonly text: string
  readonly url?: string
  readonly className?: string
}

export function ShareButton({ text, url, className }: ShareButtonProps) {
  const shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}${url ? `&url=${encodeURIComponent(url)}` : ""}`

  return (
    <a
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 rounded-[var(--radius)] border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
        className,
      )}
    >
      <Share2 className="h-4 w-4" />
      <span>Share</span>
    </a>
  )
}
