import { Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

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
      className={cn(buttonVariants({ variant: "outline" }), "gap-2", className)}
    >
      <Share2 className="h-4 w-4" />
      <span>Share</span>
    </a>
  )
}
