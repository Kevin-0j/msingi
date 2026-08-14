"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { VerifiedSeal, VerifiedBadge } from "@/components/verified-seal"
import { verificationDocsFor, type VerificationSubjectType } from "@/lib/types"
import { cn } from "@/lib/utils"
import {
  ShieldCheck,
  Upload,
  FileText,
  X,
  CheckCircle2,
  Clock,
  CircleAlert,
  Lock,
} from "lucide-react"

const STEP_LABELS = ["Submitted", "Under review", "Verified"]

export default function VerificationPage() {
  const {
    meId,
    role,
    getActor,
    getOrg,
    verifStatusOf,
    verificationExpiryOf,
    latestVerificationRequestOf,
    submitVerification,
    resetVerification,
    simulateVerificationExpiry,
  } = useStore()

  const me = getActor(meId)
  const myOrg = getOrg(meId)

  // Funders verify too: an unverified funder can browse, but can't post a
  // funding call (enforced on /calls/new), so money never moves through an
  // unchecked account.
  const subjectType: VerificationSubjectType =
    role === "organization" ? "organization" : role === "funder" ? "funder" : "worker"

  const requiredDocs = verificationDocsFor(subjectType, myOrg?.type)

  const existing = latestVerificationRequestOf(meId)
  const currentStatus = verifStatusOf(meId, me?.verificationStatus ?? "unverified")
  const expiresAt = verificationExpiryOf(meId)
  const lapsed = Boolean(
    expiresAt && expiresAt < new Date().toISOString() && existing?.status === "verified",
  )

  const [legalName, setLegalName] = useState("")
  const [identifierNumber, setIdentifierNumber] = useState("")
  const [uploaded, setUploaded] = useState<Record<string, { name: string; size: string }>>({})
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)

  const canRequest = role === "worker" || role === "organization" || role === "funder"

  function attach(key: string, label: string) {
    setUploaded((u) => ({
      ...u,
      [key]: {
        name: `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`,
        size: `${180 + ((label.length * 37) % 900)} KB`,
      },
    }))
    setError(null)
  }

  function detach(key: string) {
    setUploaded((u) => {
      const next = { ...u }
      delete next[key]
      return next
    })
  }

  const missing = requiredDocs.filter((d) => !uploaded[d.key])

  function submit() {
    if (!legalName.trim()) {
      setError("Enter the full legal name exactly as it appears on your documents.")
      return
    }
    if (!identifierNumber.trim()) {
      setError("Enter your license, registration or ID number.")
      return
    }
    if (missing.length > 0) {
      setError(`Still missing: ${missing.map((d) => d.label).join(", ")}.`)
      return
    }

    const result = submitVerification({
      subjectId: meId,
      subjectType,
      legalName: legalName.trim(),
      identifierNumber: identifierNumber.trim(),
      documents: requiredDocs.map((d) => ({
        key: d.key,
        name: uploaded[d.key].name,
        size: uploaded[d.key].size,
      })),
      note: note.trim(),
    })

    if (!result.ok) {
      setError(result.error)
      return
    }
    setUploaded({})
    setNote("")
    setLegalName("")
    setIdentifierNumber("")
    setError(null)
  }

  const stepIndex = currentStatus === "verified" ? 2 : currentStatus === "pending" ? 1 : 0

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <span className="inline-flex rounded-lg bg-primary-tint p-2.5 text-primary">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-foreground">
            Request verification
          </h1>
          <p className="mt-1 text-muted-foreground">
            The Afyashinani seal tells funders your work is real. Every request is reviewed by
            hand against the documents you upload, and the seal lapses after 12 months so it
            always reflects a current check.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Your current status:</span>
            <VerifiedBadge status={currentStatus} />
            {canRequest && currentStatus !== "unverified" && (
              <span className="ml-auto flex gap-3">
                {currentStatus === "verified" && (
                  <button
                    onClick={() => simulateVerificationExpiry(meId)}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Simulate expiry (demo)
                  </button>
                )}
                <button
                  onClick={() => resetVerification(meId)}
                  className="text-xs text-muted-foreground underline hover:text-foreground"
                >
                  Reset to unverified (demo)
                </button>
              </span>
            )}
          </div>
        </div>

        {!canRequest ? (
          <div className="mt-4 rounded-xl border border-border bg-card p-6 text-center text-muted-foreground shadow-[var(--shadow-soft)]">
            The admin account reviews verification rather than requesting it. Switch role using
            the demo switcher to try a request.
          </div>
        ) : lapsed ? (
          <div className="mt-4 rounded-xl border border-accent/40 bg-accent/5 p-5">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <CircleAlert size={18} className="text-accent" aria-hidden="true" /> Your verification has lapsed
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              It expired on {new Date(expiresAt!).toLocaleDateString("en-KE")}. Your seal is
              paused until you resubmit current documents. Funders filtering for verified
              partners will not see you in the meantime.
            </p>
            <button
              onClick={() => resetVerification(meId)}
              className="mt-3 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start renewal
            </button>
          </div>
        ) : currentStatus === "verified" ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-tint/40 p-6">
            <VerifiedSeal size={28} />
            <div>
              <p className="font-semibold text-foreground">You&apos;re verified</p>
              <p className="text-sm text-muted-foreground">
                The seal now shows on your profile and posts.
                {expiresAt &&
                  ` Valid until ${new Date(expiresAt).toLocaleDateString("en-KE")}.`}
              </p>
            </div>
          </div>
        ) : existing && currentStatus === "pending" ? (
          <div className="mt-4 space-y-4">
            <StatusTracker stepIndex={stepIndex} />
            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Clock size={18} className="text-accent" aria-hidden="true" /> Request under review
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted {new Date(existing.createdAt).toLocaleDateString("en-KE")} as{" "}
                <span className="font-medium text-foreground">{existing.legalName}</span> ·{" "}
                {existing.identifierNumber}. You&apos;ll be notified when the team decides.
              </p>
              <div className="mt-3 space-y-2">
                {existing.documents.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"
                  >
                    <FileText size={16} className="text-muted-foreground" aria-hidden="true" />
                    <span className="flex-1 truncate text-foreground">{d.name}</span>
                    <span className="text-xs text-muted-foreground">{d.size}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Reviewer? Open the{" "}
                <Link href="/admin" className="text-primary hover:underline">
                  admin review queue
                </Link>{" "}
                to approve or reject requests.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {existing?.status === "rejected" && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                  <CircleAlert size={16} aria-hidden="true" /> Your last request was rejected
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Correct the documents below and resubmit. Nothing is permanently blocked.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <h2 className="font-semibold text-foreground">
                Documents required for a {subjectTypeLabel(subjectType).toLowerCase()}
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                All of these are required. This is a demo, so clicking attaches a sample file.
              </p>

              <div className="mt-4 space-y-3">
                {requiredDocs.map((d) => {
                  const file = uploaded[d.key]
                  return (
                    <div key={d.key} className="rounded-lg border border-border p-3">
                      <div className="flex flex-wrap items-start gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-foreground">{d.label}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                            {d.helpText}
                          </p>
                        </div>
                        {file ? (
                          <span className="flex shrink-0 items-center gap-1.5 rounded-md bg-impact/10 px-2 py-1 text-xs text-impact">
                            <CheckCircle2 size={13} aria-hidden="true" /> Attached
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                            Required
                          </span>
                        )}
                      </div>

                      {file ? (
                        <div className="mt-2 flex items-center gap-2 rounded-md bg-secondary/60 p-2 text-sm">
                          <FileText size={15} className="text-primary" aria-hidden="true" />
                          <span className="flex-1 truncate text-foreground">{file.name}</span>
                          <span className="text-xs text-muted-foreground">{file.size}</span>
                          <button
                            onClick={() => detach(d.key)}
                            className="rounded p-1 text-muted-foreground hover:bg-muted"
                            aria-label={`Remove ${d.label}`}
                          >
                            <X size={14} aria-hidden="true" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => attach(d.key, d.label)}
                          className="mt-2 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-border py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <Upload size={15} aria-hidden="true" /> Attach {d.label}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <h2 className="font-semibold text-foreground">Confirm your identity</h2>

              <label className="mt-3 block text-sm font-medium text-foreground">
                {subjectType === "worker" ? "Full legal name" : "Registered legal name"}
              </label>
              <input
                value={legalName}
                onChange={(e) => {
                  setLegalName(e.target.value)
                  setError(null)
                }}
                placeholder={
                  subjectType === "worker" ? "As printed on your ID" : "As printed on the certificate"
                }
                className="msingi-input mt-1"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Reviewers compare this against both your documents and your profile name.
              </p>

              <label className="mt-4 block text-sm font-medium text-foreground">
                {subjectType === "worker"
                  ? "Professional board / license number"
                  : "Registration number"}
              </label>
              <input
                value={identifierNumber}
                onChange={(e) => {
                  setIdentifierNumber(e.target.value)
                  setError(null)
                }}
                placeholder={
                  subjectType === "worker" ? "e.g. KMPDC/OT-48213" : "e.g. CBO/NRB/2019/00452"
                }
                className="msingi-input mt-1"
              />
              <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                <Lock size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                One number, one account. If this number is already tied to another Afyashinani
                account, the request is blocked.
              </p>

              <label className="mt-4 block text-sm font-medium text-foreground">
                A note for the reviewer (optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Anything that helps the reviewer confirm your work."
                className="msingi-input mt-1"
              />

              {error && (
                <p className="mt-3 flex items-start gap-1.5 text-sm text-destructive">
                  <CircleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}

              <button
                onClick={submit}
                className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Submit for review
              </button>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                Submitting a document that isn&apos;t yours is fraud. Requests are logged against
                the reviewing admin and can be revoked at any time.
              </p>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  )
}

function subjectTypeLabel(t: VerificationSubjectType) {
  return t === "worker"
    ? "Health worker"
    : t === "organization"
      ? "Health service provider"
      : "Health funding organisation"
}

function StatusTracker({ stepIndex }: { stepIndex: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      {STEP_LABELS.map((label, i) => (
        <div key={label} className="flex flex-1 items-center">
          <div className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                i <= stepIndex
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {i < stepIndex ? <CheckCircle2 size={16} aria-hidden="true" /> : i + 1}
            </span>
            <span
              className={cn(
                "text-xs",
                i <= stepIndex ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {label}
            </span>
          </div>
          {i < STEP_LABELS.length - 1 && (
            <div
              className={cn("mx-2 h-0.5 flex-1", i < stepIndex ? "bg-primary" : "bg-border")}
            />
          )}
        </div>
      ))}
    </div>
  )
}
