"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { THEMES, type Theme } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ArrowLeft, CircleAlert, Plus, ShieldCheck, X } from "lucide-react"

export default function NewCallPage() {
  const router = useRouter()
  const { role, meId, getActor, verifStatusOf, addFundingCall } = useStore()
  const me = getActor(meId)
  const myStatus = verifStatusOf(meId, me?.verificationStatus ?? "unverified")

  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [deadline, setDeadline] = useState("")
  const [location, setLocation] = useState("")
  const [themes, setThemes] = useState<Theme[]>([])
  const [eligibility, setEligibility] = useState<string[]>([])
  const [rule, setRule] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (role !== "funder") {
    return (
      <AppShell>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl text-foreground">
            Health funding organisations only
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Switch to the Health funding organisation role with the demo switcher to post a call.
          </p>
          <Link href="/calls" className="mt-3 inline-block text-sm text-primary hover:underline">
            Back to funding calls
          </Link>
        </div>
      </AppShell>
    )
  }

  // Money never moves through an unchecked account: only a verified funding
  // organisation can put a call in front of health workers.
  if (myStatus !== "verified") {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl rounded-xl border border-accent/40 bg-accent/5 p-8 text-center">
          <span className="inline-flex rounded-lg bg-accent/15 p-2.5 text-accent">
            <ShieldCheck size={22} />
          </span>
          <h1 className="mt-3 font-display text-xl text-foreground">
            Verify your organisation before posting a call
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Health workers are asked to share real work and real numbers with whoever posts a
            call. We hold funders to the same bar, so only verified funding organisations can
            post. Your current status is{" "}
            <span className="font-medium text-foreground">{myStatus}</span>.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link
              href="/verification"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Start verification
            </Link>
            <Link
              href="/calls"
              className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
            >
              Back to funding calls
            </Link>
          </div>
        </div>
      </AppShell>
    )
  }

  function toggleTheme(t: Theme) {
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function addRule() {
    const r = rule.trim()
    if (!r) return
    setEligibility((prev) => [...prev, r])
    setRule("")
  }

  function submit() {
    if (!title.trim() || !summary.trim() || !amount.trim() || !deadline) {
      setError("Title, summary, amount and deadline are all needed.")
      return
    }
    if (themes.length === 0) {
      setError("Pick at least one focus area so the right people see this call.")
      return
    }
    const id = addFundingCall({
      title: title.trim(),
      summary: summary.trim(),
      description: description.trim() || summary.trim(),
      amount: amount.trim(),
      deadline: new Date(`${deadline}T23:59:00.000Z`).toISOString(),
      location: location.trim() || "Kenya",
      themes,
      eligibility,
    })
    router.push(`/calls/${id}`)
  }

  return (
    <AppShell>
      <Link
        href="/calls"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Funding calls
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h1 className="font-display text-2xl font-semibold text-foreground">Post a funding call</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Write it the way you would say it out loud. Frontline teams skip calls they can&apos;t
          understand.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Night-time maternal referral in informal settlements"
              className="msingi-input"
            />
          </Field>

          <Field label="One-line summary">
            <input
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g. Up to KES 1M for teams solving night transport for mothers in labour"
              className="msingi-input"
            />
          </Field>

          <Field label="Full description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="What you'll fund, what you won't, and what you need to see from applicants."
              className="msingi-input"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Amount">
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. KES 300,000 - 1,000,000"
                className="msingi-input"
              />
            </Field>
            <Field label="Deadline">
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="msingi-input"
              />
            </Field>
          </div>

          <Field label="Location focus">
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Nairobi informal settlements"
              className="msingi-input"
            />
          </Field>

          <Field label="Focus areas">
            <div className="flex flex-wrap gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTheme(t)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm transition-colors",
                    themes.includes(t)
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-primary/40",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Who can apply">
            <div className="flex gap-2">
              <input
                value={rule}
                onChange={(e) => setRule(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addRule()
                  }
                }}
                placeholder="e.g. At least three months of posted work on Afyashinani"
                className="msingi-input"
              />
              <button
                type="button"
                onClick={addRule}
                className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-border px-3 text-sm font-medium text-foreground hover:bg-secondary"
              >
                <Plus size={15} /> Add
              </button>
            </div>
            {eligibility.length > 0 && (
              <ul className="mt-3 space-y-2">
                {eligibility.map((e, i) => (
                  <li
                    key={`${e}-${i}`}
                    className="flex items-center gap-2 rounded-lg border border-border p-2 text-sm text-foreground"
                  >
                    <span className="flex-1">{e}</span>
                    <button
                      type="button"
                      onClick={() => setEligibility((prev) => prev.filter((_, x) => x !== i))}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                      aria-label={`Remove ${e}`}
                    >
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Field>

          {error && (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Link
              href="/calls"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Link>
            <button
              onClick={submit}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Publish call
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}
