import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Dashboard
        </Link>
        <Link
          href="/tokens"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors"
        >
          Browse Tokens
        </Link>
      </div>
    </div>
  )
}
