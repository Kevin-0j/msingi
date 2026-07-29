"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { VerifiedSeal, VerifiedBadge } from "@/components/verified-seal"
import { cn } from "@/lib/utils"
import { ShieldCheck, Upload, FileText, X, CheckCircle2, Clock } from "lucide-react"

const STEP_LABELS = ["Submitted", "Under review", "Verified"]

export default function VerificationPage() {
  const store = useStore()
  const { meId, role, getActor, verificationRequests, submitVerification, resetVerification } =
    useStore()
  const me = getActor(meId)

  const subjectType: "worker" | "organization" =
    role === "organization" ? "organization" : "worker"

  const existing = verificationRequests
    .filter((r) => r.subjectId === meId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  const currentStatus = store.verifStatusOf(
    meId,
    me?.verificationStatus ?? "unverified",
  )

  const [docs, setDocs] = useState<{ name: string; size: string }[]>([])
  const [note, setNote] = useState("")

  const canRequest = role === "worker" || role === "organization"

  const MOCK_DOCS = [
    { name: "professional-license.pdf", size: "412 KB" },
    { name: "id-document.jpg", size: "1.2 MB" },
    { name: "org-registration.pdf", size: "890 KB" },
    { name: "appointment-letter.pdf", size: "220 KB" },
  ]

  function addDoc() {
    const next = MOCK_DOCS[docs.length % MOCK_DOCS.length]
    setDocs((d) => [...d, { ...next, name: `${d.length + 1}-${next.name}` }])
  }
  function removeDoc(i: number) {
    setDocs((d) => d.filter((_, idx) => idx !== i))
  }
  function submit() {
    if (docs.length === 0) return
    submitVerification(meId, subjectType, docs, note.trim())
    setDocs([])
    setNote("")
  }

  const stepIndex =
    currentStatus === "verified" ? 2 : currentStatus === "pending" ? 1 : 0

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <span className="inline-flex rounded-lg bg-primary-tint p-2.5 text-primary">
            <ShieldCheck size={22} />
          </span>
          <h1 className="mt-3 font-display text-2xl font-semibold text-foreground">
            Request verification
          </h1>
          <p className="mt-1 text-muted-foreground">
            The Msingi seal tells funders your work is real. Upload documents that prove your role
            or your organisation&apos;s registration. Our team reviews every request by hand.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Your current status:</span>
            <VerifiedBadge status={currentStatus} />
            {canRequest && currentStatus !== "unverified" && (
              <button
                onClick={() => resetVerification(meId)}
                className="ml-auto text-xs text-muted-foreground underline hover:text-foreground"
              >
                Reset to unverified (demo)
              </button>
            )}
          </div>
        </div>

        {!canRequest ? (
          <div className="mt-4 rounded-xl border border-border bg-card p-6 text-center text-muted-foreground shadow-[var(--shadow-soft)]">
            Verification is for health workers and organizations. Switch role using the demo
            switcher to try it.
          </div>
        ) : currentStatus === "verified" ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-tint/40 p-6">
            <VerifiedSeal size={28} />
            <div>
              <p className="font-semibold text-foreground">You&apos;re verified</p>
              <p className="text-sm text-muted-foreground">
                The seal now shows on your profile and posts.
              </p>
            </div>
          </div>
        ) : existing && currentStatus === "pending" ? (
          <div className="mt-4 space-y-4">
            {/* Status tracker */}
            <StatusTracker stepIndex={stepIndex} />
            <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
              <h2 className="flex items-center gap-2 font-semibold text-foreground">
                <Clock size={18} className="text-accent" /> Request under review
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Submitted {new Date(existing.createdAt).toLocaleDateString("en-KE")}. You&apos;ll be
                notified when the team makes a decision.
              </p>
              <div className="mt-3 space-y-2">
                {existing.documents.map((d) => (
                  <div
                    key={d.name}
                    className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"
                  >
                    <FileText size={16} className="text-muted-foreground" />
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
          <div className="mt-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <h2 className="font-semibold text-foreground">Upload your documents</h2>
            <p className="text-sm text-muted-foreground">
              This is a demo. Click to attach sample files.
            </p>

            <button
              onClick={addDoc}
              className="mt-3 flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Upload size={22} />
              <span className="text-sm font-medium">Click to attach a document</span>
            </button>

            {docs.length > 0 && (
              <div className="mt-3 space-y-2">
                {docs.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm"
                  >
                    <FileText size={16} className="text-primary" />
                    <span className="flex-1 truncate text-foreground">{d.name}</span>
                    <span className="text-xs text-muted-foreground">{d.size}</span>
                    <button
                      onClick={() => removeDoc(i)}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                      aria-label={`Remove ${d.name}`}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="mt-4 block text-sm font-medium text-foreground">
              A note for the reviewer (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="e.g. Registered clinical officer, board number KMPDC/12345."
              className="msingi-input mt-1"
            />

            <button
              onClick={submit}
              disabled={docs.length === 0}
              className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Submit for review
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
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
              {i < stepIndex ? <CheckCircle2 size={16} /> : i + 1}
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
              className={cn(
                "mx-2 h-0.5 flex-1",
                i < stepIndex ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
