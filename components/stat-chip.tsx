import type { StatChip as StatChipType } from "@/lib/types"

export function StatChip({ chip }: { chip: StatChipType }) {
  return (
    <span className="inline-flex items-baseline gap-1 rounded-full bg-impact/10 px-3 py-1 text-sm text-impact">
      <span className="font-semibold">{chip.value}</span>
      <span className="text-impact/80">{chip.label}</span>
    </span>
  )
}

export function ThemeChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
      {label}
    </span>
  )
}
