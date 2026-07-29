"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { useStore, type Actor } from "@/lib/store"
import { THEMES, LOCATIONS, type Theme } from "@/lib/types"

type Kind = "all" | "worker" | "organization" | "funder"

function isTheme(v: string | null): v is Theme {
  return v !== null && (THEMES as string[]).includes(v)
}

function SearchInner() {
  const params = useSearchParams()
  const themeParam = params.get("theme")

  const {
    workers,
    organizations,
    funders,
    getActor,
    following,
    connections,
    toggleFollow,
    toggleConnect,
  } = useStore()

  const [q, setQ] = useState("")
  const [kind, setKind] = useState<Kind>("all")
  const [theme, setTheme] = useState<Theme | "all">(isTheme(themeParam) ? themeParam : "all")
  const [location, setLocation] = useState("all")
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  // Focus areas live on the underlying records, not the normalized Actor.
  const focusAreasOf = useMemo(() => {
    const map = new Map<string, Theme[]>()
    workers.forEach((w) => map.set(w.id, w.focusAreas))
    organizations.forEach((o) => map.set(o.id, o.focusAreas))
    funders.forEach((f) => map.set(f.id, f.focusAreas))
    return map
  }, [workers, organizations, funders])

  const actors = useMemo(() => {
    const allIds = [
      ...workers.map((w) => w.id),
      ...organizations.map((o) => o.id),
      ...funders.map((f) => f.id),
    ]
    return allIds
      .map((id) => getActor(id))
      .filter((a): a is Actor => Boolean(a))
      .filter((a) => (kind === "all" ? true : a.kind === kind))
      .filter((a) => (location === "all" ? true : a.location === location))
      .filter((a) => (verifiedOnly ? a.verificationStatus === "verified" : true))
      .filter((a) => (theme === "all" ? true : (focusAreasOf.get(a.id) ?? []).includes(theme)))
      .filter((a) =>
        q.trim() === ""
          ? true
          : `${a.name} ${a.subtitle} ${a.location} ${(focusAreasOf.get(a.id) ?? []).join(" ")}`
              .toLowerCase()
              .includes(q.toLowerCase()),
      )
  }, [
    workers,
    organizations,
    funders,
    getActor,
    kind,
    location,
    verifiedOnly,
    theme,
    q,
    focusAreasOf,
  ])

  const kinds: { key: Kind; label: string }[] = [
    { key: "all", label: "Everyone" },
    { key: "worker", label: "Health workers" },
    { key: "organization", label: "Organisations" },
    { key: "funder", label: "Funders" },
  ]

  const filtersActive =
    kind !== "all" || theme !== "all" || location !== "all" || verifiedOnly || q.trim() !== ""

  function clearFilters() {
    setKind("all")
    setTheme("all")
    setLocation("all")
    setVerifiedOnly(false)
    setQ("")
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Directory</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Find health workers, organisations and funders. Follow to keep up, connect to collaborate.
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, role, location or focus area…"
        className="msingi-input mb-4"
      />

      <div className="mb-3 flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k.key}
            onClick={() => setKind(k.key)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              kind === k.key
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {k.label}
          </button>
        ))}
      </div>

      {/* Theme chips */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        <button
          onClick={() => setTheme("all")}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
            theme === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
        >
          All themes
        </button>
        {THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setTheme(t)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              theme === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Location + verified */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
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
        {filtersActive && (
          <button onClick={clearFilters} className="text-sm text-primary hover:underline">
            Clear filters
          </button>
        )}
        <span className="ml-auto text-sm text-muted-foreground">
          {actors.length} {actors.length === 1 ? "result" : "results"}
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {actors.map((a) => {
          const isFollowing = following.includes(a.id)
          const isConnected = connections.includes(a.id)
          return (
            <li
              key={a.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
            >
              <Link href={`/profile/${a.id}`}>
                <Avatar name={a.name} color={a.avatarColor} size={44} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${a.id}`}
                  className="flex items-center gap-1.5 font-medium text-foreground hover:underline"
                >
                  <span className="truncate">{a.name}</span>
                  {a.verificationStatus === "verified" && <VerifiedSeal size={14} />}
                </Link>
                <p className="truncate text-sm text-muted-foreground">
                  {a.subtitle} · {a.location}
                </p>
              </div>
              {a.kind === "worker" || a.kind === "organization" ? (
                <button
                  onClick={() => toggleConnect(a.id)}
                  className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isConnected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {isConnected ? "Connected" : "Connect"}
                </button>
              ) : (
                <button
                  onClick={() => toggleFollow(a.id)}
                  className={`shrink-0 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    isFollowing
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-foreground hover:bg-secondary"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </li>
          )
        })}
        {actors.length === 0 && (
          <li className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-foreground">No one matches these filters.</p>
            <button onClick={clearFilters} className="mt-2 text-sm text-primary hover:underline">
              Clear filters
            </button>
          </li>
        )}
      </ul>
    </AppShell>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  )
}
