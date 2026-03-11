import { cn } from "@/lib/utils"

interface ErrorBannerProps {
  readonly message: string
  readonly className?: string
}

export function ErrorBanner({ message, className }: ErrorBannerProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-red/30 bg-red/10 p-4 text-sm text-red",
        className,
      )}
      role="alert"
    >
      {message}
    </div>
  )
}
