"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useStore } from "@/lib/store"
import {
  THEMES,
  LOCATIONS,
  type Theme,
  type Role,
  type OrgType,
  type FunderType,
} from "@/lib/types"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, CircleAlert, ShieldCheck } from "lucide-react"

const ORG_TYPES: { value: OrgType; label: string }[] = [
  { value: "private-clinic", label: "Private not-for-profit clinic" },
  { value: "cbo", label: "Community-based organisation" },
  { value: "local-ngo", label: "Local NGO" },
  { value: "international-ngo", label: "International NGO" },
  { value: "trust-foundation", label: "Trust / foundation" },
  { value: "research-institution", label: "Research / educational institution" },
]

const FUNDER_TYPES: { value: FunderType; label: string }[] = [
  { value: "foundation", label: "Foundation" },
  { value: "donor", label: "Donor" },
  { value: "government", label: "County / national government" },
  { value: "health-partner", label: "Health-sector partner" },
]

function isRole(v: string | null): v is Role {
  return v === "worker" || v === "organization" || v === "funder"
}

function OnboardingInner() {
  const router = useRouter()
  const params = useSearchParams()
  const { completeOnboarding, organizations } = useStore()

  const roleParam = params.get("role")
  const role: Role = isRole(roleParam) ? roleParam : "worker"

  const [name, setName] = useState("")
  const [detail, setDetail] = useState("") // title / org type label / funder type label
  const [orgType, setOrgType] = useState<OrgType>("cbo")
  const [funderType, setFunderType] = useState<FunderType>("foundation")
  const [location, setLocation] = useState(LOCATIONS[0])
  const [about, setAbout] = useState("")
  const [themes, setThemes] = useState<Theme[]>([])
  const [affiliations, setAffiliations] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  function toggleTheme(t: Theme) {
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function finish() {
    if (!name.trim()) {
      setError(
        role === "worker" ? "Tell us your name." : "Tell us what your organization is called.",
      )
      return
    }
    if (themes.length === 0) {
      setError("Pick at least one focus area. This is how the right people find you.")
      return
    }
    completeOnboarding({
      role,
      name: name.trim(),
      title: detail.trim(),
      orgType,
      funderType,
      location,
      about: about.trim(),
      focusAreas: themes,
      affiliations,
    })
    router.push("/feed")
  }

  const heading =
    role === "worker"
      ? "Tell us about your work"
      : role === "organization"
        ? "Tell us about your organization"
        : "Tell us what you fund"

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="font-display text-xl font-semibold text-primary">Afyashinani</span>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm font-medium text-muted-foreground">Step 2 of 2</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground text-balance">
          {heading}
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Plain words only. No mission statements, just what you actually do and where.
        </p>

        <div className="mt-6 space-y-5 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <Field label={role === "worker" ? "Your name" : "Organization name"}>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={
                role === "worker"
                  ? "e.g. Amina Wanjiru"
                  : role === "organization"
                    ? "e.g. Silanga Community Clinic"
                    : "e.g. Ubuntu Health Foundation"
              }
              className="msingi-input"
            />
          </Field>

          {role === "worker" && (
            <Field label="What do you do?">
              <input
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="e.g. Maternal-health clinician"
                className="msingi-input"
              />
            </Field>
          )}

          {role === "organization" && (
            <Field label="What kind of organization?">
              <select
                value={orgType}
                onChange={(e) => setOrgType(e.target.value as OrgType)}
                className="msingi-input"
              >
                {ORG_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {role === "funder" && (
            <Field label="What kind of funder?">
              <select
                value={funderType}
                onChange={(e) => setFunderType(e.target.value as FunderType)}
                className="msingi-input"
              >
                {FUNDER_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Where are you based?">
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="msingi-input"
            >
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>

          <Field
            label={
              role === "funder" ? "What do you support?" : "What are you working on right now?"
            }
          >
            <textarea
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={3}
              placeholder={
                role === "funder"
                  ? "e.g. Frontline reproductive-health work in informal settlements. We fund people, not paperwork."
                  : "e.g. Weekly antenatal clinics and a night-referral pilot with two boda-boda riders."
              }
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

          {role === "worker" && (
            <Field label="Affiliated with an organization? (optional, you can pick more than one)">
              <div className="space-y-2">
                {organizations.map((o) => (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-2.5 text-sm text-foreground"
                  >
                    <input
                      type="checkbox"
                      checked={affiliations.includes(o.id)}
                      onChange={() =>
                        setAffiliations((prev) =>
                          prev.includes(o.id)
                            ? prev.filter((x) => x !== o.id)
                            : [...prev, o.id],
                        )
                      }
                      className="accent-[var(--primary)]"
                    />
                    {o.name}
                    <span className="text-xs text-muted-foreground">· {o.location}</span>
                  </label>
                ))}
              </div>
            </Field>
          )}

          {role !== "funder" && (
            <div className="flex items-start gap-2 rounded-lg border border-border bg-secondary/50 p-3">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-primary" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Next step after this: request your Verified seal. You can use Afyashinani fully
                without it, but funders look for it.
              </p>
            </div>
          )}

          {error && (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <button
            onClick={finish}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Enter Afyashinani <ArrowRight size={16} />
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Demo build: this creates a real profile in local storage. No server, no account.
          </p>
        </div>
      </main>
    </div>
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

export default function OnboardingPage() {
  return (
    <Suspense fallback={null}>
      <OnboardingInner />
    </Suspense>
  )
}
