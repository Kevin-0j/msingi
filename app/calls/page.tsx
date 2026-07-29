"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { useStore } from "@/lib/store"
import { THEMES, type Theme } from "@/lib/types"
import { Plus, Inbox } from "lucide-react"

function daysLeft(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default function CallsPage() {
  const { fundingCalls, getActor, submissions, role, meId } = useStore()
  const [theme, setTheme] = useState<Theme | "all">("all")

  const calls = fundingCalls
    .filter((c) => (theme === "all" ? true : c.themes.includes(theme)))
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))

  const isFunder = role === "funder"
  const myCalls = fundingCalls.filter((c) => c.funderId === meId)
  const myCallIds = new Set(myCalls.map((c) => c.id))
  const responsesToMe = submissions.filter((s) => myCallIds.has(s.callId))

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground">Funding calls</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Open calls from foundations, donors and health partners. Express interest or apply
            directly.
          </p>
        </div>
        {isFunder && (
          <Link
            href="/calls/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus size={16} /> Post a call
          </Link>
        )}
      </div>

      {/* Funder inbox summary */}
      {isFunder && (
        <div className="mb-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Inbox size={18} className="text-primary" /> Your calls
          </h2>
          {myCalls.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              You haven&apos;t posted a call yet.{" "}
              <Link href="/calls/new" className="text-primary hover:underline">
                Post your first call
              </Link>
              .
            </p>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                {myCalls.length} open {myCalls.length === 1 ? "call" : "calls"} ·{" "}
                {responsesToMe.length} {responsesToMe.length === 1 ? "response" : "responses"}{" "}
                received
              </p>
              <ul className="mt-3 space-y-2">
                {myCalls.map((c) => {
                  const n = submissions.filter((s) => s.callId === c.id).length
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/calls/${c.id}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:border-primary/40"
                      >
                        <span className="min-w-0 truncate text-sm font-medium text-foreground">
                          {c.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-impact/10 px-2.5 py-1 text-xs font-medium text-impact">
                          {n} {n === 1 ? "response" : "responses"}
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => setTheme("all")}
          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
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
            className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
              theme === t
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {calls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-foreground">No open calls for this theme.</p>
          <button
            onClick={() => setTheme("all")}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Show all themes
          </button>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {calls.map((call) => {
            const funder = getActor(call.funderId)
            const dl = daysLeft(call.deadline)
            const submitted = submissions.find(
              (s) => s.callId === call.id && s.applicantId === meId,
            )
            return (
              <li key={call.id}>
                <Link
                  href={`/calls/${call.id}`}
                  className="block rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      {funder && (
                        <Avatar name={funder.name} color={funder.avatarColor} size={40} />
                      )}
                      <div>
                        <h2 className="font-display text-lg leading-snug text-foreground text-pretty">
                          {call.title}
                        </h2>
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                          {funder?.name ?? "Msingi funder"}
                          {funder?.verificationStatus === "verified" && <VerifiedSeal size={14} />}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
                        dl <= 14
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-border bg-secondary text-muted-foreground"
                      }`}
                    >
                      {dl > 0 ? `${dl} days left` : "Closed"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {call.summary}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      {call.amount}
                    </span>
                    {call.themes.map((t) => (
                      <span
                        key={t}
                        className="rounded-md bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      >
                        {t}
                      </span>
                    ))}
                    {submitted && (
                      <span className="ml-auto rounded-full bg-impact/10 px-2.5 py-1 text-xs font-medium text-impact">
                        {submitted.type === "application" ? "Applied" : "Interest sent"}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </AppShell>
  )
}
