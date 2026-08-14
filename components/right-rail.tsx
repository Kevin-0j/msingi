"use client"

import Link from "next/link"
import { useStore } from "@/lib/store"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { THEMES } from "@/lib/types"

function daysLeft(iso: string) {
  const d = Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000)
  return d > 0 ? `${d} days left` : "closed"
}

export function RightRail() {
  const { fundingCalls, getFunder, workers, meId, following, toggleFollow } = useStore()
  const suggestions = workers.filter((w) => w.id !== meId).slice(0, 3)

  return (
    <>
      <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Open funding calls</h2>
          <Link href="/calls" className="text-xs font-medium text-primary hover:underline">
            See all
          </Link>
        </div>
        <div className="space-y-3">
          {fundingCalls.slice(0, 3).map((call) => {
            const funder = getFunder(call.funderId)
            return (
              <Link
                key={call.id}
                href={`/calls/${call.id}`}
                className="block rounded-lg border border-border p-3 transition-colors hover:border-primary/40"
              >
                <p className="text-sm font-medium leading-snug text-foreground text-pretty">
                  {call.title}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{funder?.name}</p>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-impact">{call.amount}</span>
                  <span className="text-muted-foreground">{daysLeft(call.deadline)}</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <h2 className="mb-3 text-sm font-semibold text-foreground">People to connect with</h2>
        <div className="space-y-3">
          {suggestions.map((w) => {
            const isFollowing = following.includes(w.id)
            return (
              <div key={w.id} className="flex items-center gap-2">
                <Link href={`/profile/${w.id}`} aria-hidden="true" tabIndex={-1}>
                  <Avatar name={w.name} color={w.avatarColor} size={36} />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/profile/${w.id}`}
                    className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
                  >
                    <span className="truncate">{w.name}</span>
                    {w.verificationStatus === "verified" && <VerifiedSeal size={12} />}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{w.location}</p>
                </div>
                <button
                  onClick={() => toggleFollow(w.id)}
                  className={
                    isFollowing
                      ? "rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground"
                      : "rounded-lg border border-primary px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary-tint"
                  }
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <h2 className="mb-3 text-sm font-semibold text-foreground">Trending themes</h2>
        <div className="flex flex-wrap gap-2">
          {THEMES.slice(0, 6).map((t) => (
            <Link
              key={t}
              href={`/search?theme=${encodeURIComponent(t)}`}
              className="rounded-full border border-border bg-secondary px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/40"
            >
              {t}
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
