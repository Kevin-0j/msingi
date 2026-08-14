import { sponsorTiers } from "@/data/mock"
import { cn } from "@/lib/utils"

/**
 * Small tier badge shown next to a funder's name wherever they appear.
 * Renders nothing when the funder isn't a sponsor, so callers can pass an
 * optional tier id without guarding first.
 */
export function SponsorBadge({
  tierId,
  className,
}: {
  tierId?: string
  className?: string
}) {
  const tier = sponsorTiers.find((t) => t.id === tierId)
  if (!tier) return null

  return (
    <span
      title={`${tier.name} sponsor`}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        className,
      )}
      style={{
        color: tier.badgeColor,
        borderColor: `${tier.badgeColor}66`,
        backgroundColor: `${tier.badgeColor}14`,
      }}
    >
      {tier.name}
    </span>
  )
}

/** Sort helper: higher sponsor rank first, then unchanged order. */
export function sponsorRank(tierId?: string): number {
  return sponsorTiers.find((t) => t.id === tierId)?.rank ?? 0
}
