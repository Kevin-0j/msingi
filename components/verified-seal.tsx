import { cn } from "@/lib/utils"
import type { VerificationStatus } from "@/lib/types"

// A deliberately non-Twitter seal/shield with a check.
export function VerifiedSeal({
  size = 16,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <span
      title="Verified"
      className={cn("inline-flex items-center text-primary", className)}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-label="Verified"
        role="img"
      >
        <path
          d="M12 2l7 2.5v6.2c0 4.6-3 8.4-7 9.8-4-1.4-7-5.2-7-9.8V4.5L12 2z"
          fill="currentColor"
          opacity="0.14"
        />
        <path
          d="M12 2l7 2.5v6.2c0 4.6-3 8.4-7 9.8-4-1.4-7-5.2-7-9.8V4.5L12 2z"
          stroke="currentColor"
          strokeWidth="1.6"
          fill="none"
        />
        <path
          d="M8.5 12l2.3 2.3L15.5 9.5"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function VerifiedBadge({ status }: { status: VerificationStatus }) {
  if (status === "verified")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2 py-0.5 text-xs font-medium text-primary">
        <VerifiedSeal size={13} /> Verified
      </span>
    )
  if (status === "pending")
    return (
      <span className="inline-flex items-center rounded-full bg-accent/15 px-2 py-0.5 text-xs font-medium text-accent">
        Verification pending
      </span>
    )
  if (status === "rejected")
    return (
      <span className="inline-flex items-center rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
        Not verified
      </span>
    )
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
      Unverified
    </span>
  )
}
