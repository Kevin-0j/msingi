"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { useStore } from "@/lib/store"
import type { Submission } from "@/lib/types"
import { ArrowLeft, Check, CircleAlert, Inbox } from "lucide-react"

function daysLeft(deadline: string) {
  const ms = new Date(deadline).getTime() - Date.now()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default function CallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const {
    fundingCalls,
    getActor,
    submissions,
    addSubmission,
    setSubmissionStatus,
    startConversation,
    meId,
    role,
  } = useStore()

  const call = fundingCalls.find((c) => c.id === id)
  const [mode, setMode] = useState<null | "interest" | "application">(null)
  const [note, setNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [justSent, setJustSent] = useState(false)

  if (!call) {
    return (
      <AppShell>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl text-foreground">Call not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This call may have closed, or the link is wrong.
          </p>
          <Link href="/calls" className="mt-3 inline-block text-sm text-primary hover:underline">
            Back to funding calls
          </Link>
        </div>
      </AppShell>
    )
  }

  const funder = getActor(call.funderId)
  const dl = daysLeft(call.deadline)
  const closed = dl <= 0
  const mySubmission = submissions.find(
    (s) => s.callId === call.id && s.applicantId === meId,
  )
  const isOwner = call.funderId === meId
  const responses = submissions
    .filter((s) => s.callId === call.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  function submit() {
    if (!call || !mode) return
    if (closed) {
      setError("This call has closed. You can still message the funder.")
      return
    }
    if (note.trim().length < 10) {
      setError(
        mode === "application"
          ? "Add a short summary of your work, at least a sentence."
          : "Add a line about why this call fits your work.",
      )
      return
    }
    addSubmission(call.id, mode, note.trim())
    setMode(null)
    setNote("")
    setError(null)
    setJustSent(true)
  }

  return (
    <AppShell>
      <Link
        href="/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Funding calls
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <article className="rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              {call.theme}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                dl <= 14
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border bg-secondary text-muted-foreground"
              }`}
            >
              {dl > 0 ? `${dl} days left` : "Closed"}
            </span>
          </div>

          <h1 className="mt-3 font-display text-2xl leading-tight text-foreground text-balance">
            {call.title}
          </h1>
          <p className="mt-2 leading-relaxed text-muted-foreground">{call.summary}</p>

          {funder && (
            <Link
              href={`/profile/${funder.id}`}
              className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary"
            >
              <Avatar name={funder.name} color={funder.avatarColor} size={40} />
              <div>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  {funder.name}
                  {funder.verificationStatus === "verified" && <VerifiedSeal size={14} />}
                </div>
                <p className="text-xs text-muted-foreground">
                  {funder.subtitle} · {funder.location}
                </p>
              </div>
            </Link>
          )}

          <div className="mt-6 whitespace-pre-line text-[15px] leading-relaxed text-foreground">
            {call.description}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Who can apply
            </p>
            {call.eligibility.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                The funder hasn&apos;t listed eligibility rules. Message them if you&apos;re
                unsure.
              </p>
            ) : (
              <ul className="space-y-2">
                {call.eligibility.map((e) => (
                  <li key={e} className="flex gap-2 text-[15px] leading-relaxed text-foreground">
                    <Check size={16} className="mt-1 shrink-0 text-impact" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Focus areas in scope
            </p>
            <div className="flex flex-wrap gap-2">
              {call.themes.map((t) => (
                <span
                  key={t}
                  className="rounded-md bg-secondary px-2.5 py-1 text-sm text-secondary-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </article>

        <aside className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
            <dl className="flex flex-col gap-4">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Funding amount
                </dt>
                <dd className="mt-0.5 text-lg font-semibold text-foreground">{call.amount}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Application deadline
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">
                  {new Date(call.deadline).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Location focus
                </dt>
                <dd className="mt-0.5 font-medium text-foreground">{call.location}</dd>
              </div>
            </dl>

            {isOwner ? (
              <p className="mt-5 rounded-lg border border-border bg-secondary/60 p-3 text-sm text-muted-foreground">
                This is your call. Responses are listed below.
              </p>
            ) : mySubmission ? (
              <div className="mt-5 rounded-lg border border-impact/30 bg-impact/10 p-3">
                <p className="flex items-center gap-1.5 text-sm font-medium text-impact">
                  <Check size={15} />
                  {mySubmission.type === "application" ? "Applied" : "Interest sent"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sent {new Date(mySubmission.createdAt).toLocaleDateString("en-KE")}. Status:{" "}
                  {mySubmission.status}. The funder will follow up through Afyashinani messages.
                </p>
                {mySubmission.type === "interest" && !closed && mode === null && (
                  <button
                    onClick={() => {
                      setMode("application")
                      setJustSent(false)
                    }}
                    className="mt-2 text-xs font-medium text-primary hover:underline"
                  >
                    Turn this into a full application
                  </button>
                )}
              </div>
            ) : null}

            {!isOwner && mode ? (
              <div className="mt-5">
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  {mode === "application" ? "Your application summary" : "Why you're interested"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => {
                    setNote(e.target.value)
                    if (error) setError(null)
                  }}
                  rows={5}
                  placeholder={
                    mode === "application"
                      ? "What you do, your last three months of numbers, and how the money would be used…"
                      : "A short note about your interest and current work…"
                  }
                  className="msingi-input resize-none"
                />
                {error && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
                    <CircleAlert size={14} className="mt-0.5 shrink-0" />
                    {error}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={submit}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    Submit {mode === "application" ? "application" : "interest"}
                  </button>
                  <button
                    onClick={() => {
                      setMode(null)
                      setError(null)
                    }}
                    className="rounded-lg border border-border px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : !isOwner && !mySubmission ? (
              <div className="mt-5 flex flex-col gap-2">
                {closed && (
                  <p className="rounded-lg bg-secondary p-2.5 text-xs text-muted-foreground">
                    This call closed on {new Date(call.deadline).toLocaleDateString("en-KE")}. You
                    can still message the funder about future rounds.
                  </p>
                )}
                <button
                  onClick={() => setMode("application")}
                  disabled={closed}
                  className="rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  Apply for this call
                </button>
                <button
                  onClick={() => setMode("interest")}
                  disabled={closed}
                  className="rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
                >
                  Express interest
                </button>
              </div>
            ) : null}

            {!isOwner && funder && (
              <button
                onClick={() => {
                  router.push(`/messages?c=${startConversation(funder.id)}`)
                }}
                className="mt-2 w-full rounded-lg py-2 text-sm font-medium text-primary transition-colors hover:bg-secondary"
              >
                Message the funder
              </button>
            )}

            {justSent && !isOwner && (
              <p className="mt-3 text-xs text-muted-foreground">
                Saved. It now shows in your{" "}
                <Link href="/notifications" className="text-primary hover:underline">
                  notifications
                </Link>{" "}
                and in the funder&apos;s response list.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card p-5 text-xs leading-relaxed text-muted-foreground">
            Submissions are stored locally on your device for this demo. In production,
            Afyashinani routes them to the funder&apos;s dashboard with your verified profile
            attached.
          </div>
        </aside>
      </div>

      {/* Funder-only: who responded */}
      {(isOwner || role === "admin") && (
        <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <h2 className="flex items-center gap-2 font-semibold text-foreground">
            <Inbox size={18} className="text-primary" /> Responses ({responses.length})
          </h2>
          {responses.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No interest or applications yet. Boost the call to reach more verified workers.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {responses.map((s) => (
                <ResponseRow
                  key={s.id}
                  submission={s}
                  onStatus={setSubmissionStatus}
                  onMessage={(otherId) => {
                    router.push(`/messages?c=${startConversation(otherId)}`)
                  }}
                />
              ))}
            </ul>
          )}
        </section>
      )}
    </AppShell>
  )
}

function ResponseRow({
  submission,
  onStatus,
  onMessage,
}: {
  submission: Submission
  onStatus: (id: string, status: Submission["status"]) => void
  onMessage: (otherId: string) => void
}) {
  const { getActor } = useStore()
  const applicant = getActor(submission.applicantId)
  if (!applicant) return null

  return (
    <li className="rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start gap-3">
        <Avatar name={applicant.name} color={applicant.avatarColor} size={40} />
        <div className="min-w-0 flex-1">
          <Link
            href={`/profile/${applicant.id}`}
            className="flex items-center gap-1.5 font-medium text-foreground hover:underline"
          >
            <span className="truncate">{applicant.name}</span>
            {applicant.verificationStatus === "verified" && <VerifiedSeal size={13} />}
          </Link>
          <p className="text-xs text-muted-foreground">
            {applicant.subtitle} · {applicant.location} ·{" "}
            {submission.type === "application" ? "Full application" : "Expressed interest"} ·{" "}
            {new Date(submission.createdAt).toLocaleDateString("en-KE")}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground">
          {submission.status}
        </span>
      </div>

      {submission.note && (
        <p className="mt-3 rounded-lg bg-secondary/60 p-3 text-sm leading-relaxed text-foreground">
          {submission.note}
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {(["reviewing", "shortlisted"] as const).map((s) => (
          <button
            key={s}
            onClick={() => onStatus(submission.id, s)}
            disabled={submission.status === s}
            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-40"
          >
            Mark {s}
          </button>
        ))}
        <button
          onClick={() => onMessage(submission.applicantId)}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-secondary"
        >
          Message
        </button>
      </div>
    </li>
  )
}
