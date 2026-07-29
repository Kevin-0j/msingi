"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { useStore } from "@/lib/store"
import type { VerificationRequest } from "@/lib/types"

type Filter = "pending" | "verified" | "rejected" | "all"

export default function AdminPage() {
  const {
    role,
    verificationRequests,
    getActor,
    reviewVerification,
    posts,
    workers,
    organizations,
    funders,
    fundingCalls,
    submissions,
  } = useStore()
  const [filter, setFilter] = useState<Filter>("pending")

  if (role !== "admin") {
    return (
      <AppShell>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl text-foreground">Admin only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Switch to the Admin role using the role switcher to review verification requests.
          </p>
        </div>
      </AppShell>
    )
  }

  const counts = {
    pending: verificationRequests.filter((r) => r.status === "pending").length,
    verified: verificationRequests.filter((r) => r.status === "verified").length,
    rejected: verificationRequests.filter((r) => r.status === "rejected").length,
    all: verificationRequests.length,
  }

  const filtered = verificationRequests
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform health, and the verification queue. Approving a request flips the Verified seal
          everywhere it appears.
        </p>
      </div>

      <div className="mb-8 grid gap-3 grid-cols-2 lg:grid-cols-3">
        {[
          { label: "health workers", value: workers.length },
          { label: "organisations", value: organizations.length },
          { label: "funders", value: funders.length },
          { label: "impact posts", value: posts.length },
          { label: "open funding calls", value: fundingCalls.length },
          { label: "funding responses", value: submissions.length },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <p className="font-display text-2xl font-semibold text-impact">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-3 font-display text-xl text-foreground">Verification review queue</h2>

      <div className="mb-5 flex flex-wrap gap-2">
        {(["pending", "verified", "rejected", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f} <span className="ml-1 opacity-70">{counts[f]}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No {filter === "all" ? "" : filter} requests in the queue.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((req) => (
            <ReviewCard
              key={req.id}
              req={req}
              actorName={getActor(req.subjectId)?.name ?? "Unknown"}
              actorColor={getActor(req.subjectId)?.avatarColor ?? "#1b2a30"}
              onReview={reviewVerification}
            />
          ))}
        </ul>
      )}
    </AppShell>
  )
}

function ReviewCard({
  req,
  actorName,
  actorColor,
  onReview,
}: {
  req: VerificationRequest
  actorName: string
  actorColor: string
  onReview: (id: string, decision: "verified" | "rejected") => void
}) {
  return (
    <li className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={actorName} color={actorColor} size={44} />
          <div>
            <div className="flex items-center gap-2">
              <Link
                href={`/profile/${req.subjectId}`}
                className="font-medium text-foreground hover:underline"
              >
                {actorName}
              </Link>
              {req.status === "verified" && <VerifiedSeal size={14} />}
            </div>
            <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">
              {req.subjectType === "worker" ? "Health worker" : "Organisation"} · submitted{" "}
              {new Date(req.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {req.note && (
        <p className="mt-4 rounded-lg bg-secondary p-3 text-sm text-foreground">{req.note}</p>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Uploaded documents
        </p>
        <ul className="flex flex-col gap-2">
          {req.documents.map((d, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2 text-foreground">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-muted-foreground">
                  <path
                    d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
                {d.name}
              </span>
              <span className="text-xs text-muted-foreground">{d.size}</span>
            </li>
          ))}
        </ul>
      </div>

      {req.status === "pending" ? (
        <div className="mt-5 flex gap-3">
          <button
            onClick={() => onReview(req.id, "verified")}
            className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Approve &amp; flip Verified seal
          </button>
          <button
            onClick={() => onReview(req.id, "rejected")}
            className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
          Reviewed
          {req.reviewedAt ? ` on ${new Date(req.reviewedAt).toLocaleDateString()}.` : "."}
          <button
            onClick={() => onReview(req.id, req.status === "verified" ? "rejected" : "verified")}
            className="text-primary hover:underline"
          >
            change to {req.status === "verified" ? "rejected" : "verified"}
          </button>
        </div>
      )}
    </li>
  )
}

function StatusBadge({ status }: { status: VerificationRequest["status"] }) {
  const map = {
    pending: { label: "Pending", cls: "bg-accent/15 text-accent-foreground border-accent/30" },
    verified: { label: "Verified", cls: "bg-primary/12 text-primary border-primary/30" },
    rejected: { label: "Rejected", cls: "bg-destructive/12 text-destructive border-destructive/30" },
  }[status]
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${map.cls}`}>
      {map.label}
    </span>
  )
}
