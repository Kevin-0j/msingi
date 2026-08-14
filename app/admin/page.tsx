"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { useStore } from "@/lib/store"
import type { VerificationRequest } from "@/lib/types"
import { TriangleAlert } from "lucide-react"

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
          { label: "health service providers", value: organizations.length },
          { label: "health funding organisations", value: funders.length },
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
          {filtered.map((req) => {
            const actor = getActor(req.subjectId)
            // Anti-fraud signals surfaced to the reviewer rather than assumed away:
            // a legal name that doesn't match the profile, or an identifier
            // number already used by another account.
            const nameMismatch =
              Boolean(actor) &&
              actor!.name.trim().toLowerCase() !== req.legalName.trim().toLowerCase()
            const duplicateIdentifier = verificationRequests.some(
              (r) =>
                r.id !== req.id &&
                r.subjectId !== req.subjectId &&
                r.status !== "rejected" &&
                r.identifierNumber.trim().toLowerCase() ===
                  req.identifierNumber.trim().toLowerCase(),
            )
            return (
              <ReviewCard
                key={req.id}
                req={req}
                actorName={actor?.name ?? "Unknown"}
                actorColor={actor?.avatarColor ?? "#1b2a30"}
                nameMismatch={nameMismatch}
                duplicateIdentifier={duplicateIdentifier}
                onReview={reviewVerification}
              />
            )
          })}
        </ul>
      )}
    </AppShell>
  )
}

function ReviewCard({
  req,
  actorName,
  actorColor,
  nameMismatch,
  duplicateIdentifier,
  onReview,
}: {
  req: VerificationRequest
  actorName: string
  actorColor: string
  nameMismatch: boolean
  duplicateIdentifier: boolean
  onReview: (id: string, decision: "verified" | "rejected") => void
}) {
  const subjectLabel =
    req.subjectType === "worker"
      ? "Health worker"
      : req.subjectType === "organization"
        ? "Health service provider"
        : "Health funding organisation"

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
              {subjectLabel} · submitted {new Date(req.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StatusBadge status={req.status} />
      </div>

      {/* Identity claim, checked by hand against the documents below. */}
      <dl className="mt-4 grid gap-2 rounded-lg border border-border p-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">Legal name</dt>
          <dd className="mt-0.5 font-medium text-foreground">{req.legalName}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            License / registration no.
          </dt>
          <dd className="mt-0.5 font-mono text-[13px] font-medium text-foreground">
            {req.identifierNumber}
          </dd>
        </div>
      </dl>

      {(nameMismatch || duplicateIdentifier) && (
        <div className="mt-3 space-y-2">
          {duplicateIdentifier && (
            <p className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
              <TriangleAlert size={15} className="mt-0.5 shrink-0" />
              This license/registration number is also on another account&apos;s active request.
              Do not approve both.
            </p>
          )}
          {nameMismatch && (
            <p className="flex items-start gap-2 rounded-lg border border-accent/40 bg-accent/5 p-3 text-sm text-foreground">
              <TriangleAlert size={15} className="mt-0.5 shrink-0 text-accent" />
              Legal name does not match the profile name ({actorName}). Confirm this is the same
              person or entity before approving.
            </p>
          )}
        </div>
      )}

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
        <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>
            Reviewed
            {req.reviewedAt ? ` on ${new Date(req.reviewedAt).toLocaleDateString()}` : ""}
            {req.reviewedBy ? ` by ${req.reviewedBy}` : ""}.
            {req.status === "verified" && req.expiresAt
              ? ` Expires ${new Date(req.expiresAt).toLocaleDateString()}.`
              : ""}
          </span>
          <button
            onClick={() => onReview(req.id, req.status === "verified" ? "rejected" : "verified")}
            className="text-primary hover:underline"
          >
            {req.status === "verified" ? "revoke this seal" : "change to verified"}
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
