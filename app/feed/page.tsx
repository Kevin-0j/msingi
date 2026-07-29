"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { RightRail } from "@/components/right-rail"
import { PostCard } from "@/components/post-card"
import { useStore } from "@/lib/store"
import { THEMES, LOCATIONS, type Theme } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Search, PenSquare } from "lucide-react"

export default function FeedPage() {
  const { posts, getActor } = useStore()
  const [theme, setTheme] = useState<Theme | "all">("all")
  const [location, setLocation] = useState("all")
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      if (theme !== "all" && !p.themes.includes(theme)) return false
      if (location !== "all" && p.location !== location) return false
      if (verifiedOnly) {
        const a = getActor(p.authorId)
        if (!a || a.verificationStatus !== "verified") return false
      }
      if (query.trim()) {
        const hay = `${p.where} ${p.whatWeDid} ${p.biggestGap} ${p.location} ${p.themes.join(" ")}`.toLowerCase()
        if (!hay.includes(query.toLowerCase())) return false
      }
      return true
    })
  }, [posts, theme, location, verifiedOnly, query, getActor])

  return (
    <AppShell right={<RightRail />}>
      <div className="space-y-4">
        {/* Search + composer entry */}
        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-3 shadow-[var(--shadow-soft)]">
            <Search size={18} className="text-muted-foreground" />
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
            <PenSquare size={16} /> <span className="hidden sm:inline">Share</span>
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

        {/* Location + verified */}
        <div className="flex flex-wrap items-center gap-2">
          <select
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
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-foreground">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="accent-[var(--primary)]"
            />
            Verified only
          </label>
          <span className="ml-auto text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "post" : "posts"}
          </span>
        </div>

        {/* Feed */}
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-foreground">No posts match these filters.</p>
            <p className="text-sm text-muted-foreground">
              Try clearing the theme or location, or{" "}
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
