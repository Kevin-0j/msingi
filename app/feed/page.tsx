"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { RightRail } from "@/components/right-rail"
import { PostCard } from "@/components/post-card"
import { useStore } from "@/lib/store"
import { THEMES, LOCATIONS, GAP_CATEGORIES, type Theme, type GapCategory } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Search, PenSquare } from "lucide-react"

function isGapCategory(v: string | null): v is GapCategory {
  return v !== null && (GAP_CATEGORIES as string[]).includes(v)
}

function FeedInner() {
  const params = useSearchParams()
  const gapParam = params.get("gap")

  const { posts, getActor } = useStore()
  const [theme, setTheme] = useState<Theme | "all">("all")
  const [location, setLocation] = useState("all")
  const [gap, setGap] = useState<GapCategory | "all">(isGapCategory(gapParam) ? gapParam : "all")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (theme !== "all" && !p.themes.includes(theme)) return false
      if (location !== "all" && p.location !== location) return false
      if (gap !== "all" && p.gapCategory !== gap) return false
      if (verifiedOnly) {
        const a = getActor(p.authorId)
        if (!a || a.verificationStatus !== "verified") return false
      }
      if (query.trim()) {
        const hay = `${p.where} ${p.whatWeDid} ${p.evidenceGap} ${p.location} ${p.themes.join(" ")}`.toLowerCase()
        if (!hay.includes(query.toLowerCase())) return false
      }
      return true
    })
  }, [posts, theme, location, gap, verifiedOnly, query, getActor])

  return (
    <AppShell right={<RightRail />}>
      <div className="space-y-4">
        {/* Every page needs exactly one h1 so screen-reader users can orient
            themselves. The design has no visible title here, so it is
            visually hidden rather than omitted. */}
        <h1 className="sr-only">Discover: impact from frontline health workers</h1>

        {/* Search + composer entry */}
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-[var(--shadow-soft)]">
            <Search size={18} className="text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search impact, places, themes…"
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Link
            href="/compose"
            className="flex items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-transform hover:-translate-y-0.5"
          >
            <PenSquare size={16} aria-hidden="true" /> <span className="hidden sm:inline">Share</span>
          </Link>
        </div>

        {/* Theme chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
          <FilterChip active={theme === "all"} onClick={() => setTheme("all")}>
            All themes
          </FilterChip>
          {THEMES.map((t) => (
            <FilterChip key={t} active={theme === t} onClick={() => setTheme(t)}>
              {t}
            </FilterChip>
          ))}
        </div>

        {/* Location + gap + verified */}
        <div className="flex flex-wrap items-center gap-2">
          <select
              aria-label="Filter by location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none"
          >
            <option value="all">All locations</option>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
          <select
              aria-label="Filter by evidence gap"
            value={gap}
            onChange={(e) => setGap(e.target.value as GapCategory | "all")}
            className="h-9 rounded-lg border border-border bg-card px-3 text-sm text-foreground outline-none"
          >
            <option value="all">All evidence gaps</option>
            {GAP_CATEGORIES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-[var(--primary)]"
            />
            Verified only
          </label>
          {/* aria-live so a screen-reader user hears the result count change
              when they adjust a filter, instead of silence. */}
          <span
            role="status"
            aria-live="polite"
            className="ml-auto text-sm text-muted-foreground"
          >
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-foreground">No posts match these filters.</p>
            <p className="text-sm text-muted-foreground">
              Try clearing the theme, location or evidence gap, or{" "}
              <Link href="/compose" className="text-primary hover:underline">
                share what you did this week
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/40",
      )}
    >
      {children}
    </button>
  )
}

export default function FeedPage() {
  return (
    <Suspense fallback={null}>
      <FeedInner />
    </Suspense>
  )
}
