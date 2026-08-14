"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight, Stethoscope, Building2, HandCoins } from "lucide-react"

const ACCOUNT_TYPES: {
  role: Role
  title: string
  body: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}[] = [
  {
    role: "worker",
    title: "I'm a health worker",
    body: "Doctor, clinical officer, nurse, pharmacist or community health promoter. Free, always.",
    icon: Stethoscope,
  },
  {
    role: "organization",
    title: "We're a health service provider",
    body: "A clinic, CBO, NGO, trust or research institution working on the ground.",
    icon: Building2,
  },
  {
    role: "funder",
    title: "We're a health funding organisation",
    body: "Foundation, donor, county government or health-sector partner.",
    icon: HandCoins,
  },
]

export default function SignupPage() {
  const router = useRouter()
  const [role, setRole] = useState<Role | null>(null)

  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back
        </Link>
        <span className="font-display text-xl font-semibold text-primary">Afyashinani</span>
      </header>

      <main id="main-content" tabIndex={-1} className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-sm font-medium text-muted-foreground">Step 1 of 2</p>
        <h1 className="mt-1 font-display text-3xl font-semibold text-foreground text-balance">
          What brings you to Afyashinani?
        </h1>
        <p className="mt-2 text-muted-foreground text-pretty">
          Pick the one that fits. You can affiliate with organizations later, and this doesn&apos;t
          lock you out of anything.
        </p>

        <div className="mt-6 space-y-3">
          {ACCOUNT_TYPES.map((t) => {
            const active = role === t.role
            return (
              <button
                key={t.role}
                onClick={() => setRole(t.role)}
                className={cn(
                  "flex w-full items-start gap-4 rounded-xl border bg-card p-5 text-left transition-all",
                  active
                    ? "border-primary shadow-[var(--shadow-lift)]"
                    : "border-border hover:border-primary/40",
                )}
              >
                <span className="inline-flex shrink-0 rounded-lg bg-primary-tint p-2.5 text-primary">
                  <t.icon size={22} />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{t.title}</p>
                  <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </div>
              </button>
            )
          })}
        </div>

        <button
          onClick={() => role && router.push(`/onboarding?role=${role}`)}
          disabled={!role}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-40"
        >
          Continue <ArrowRight size={16} aria-hidden="true" />
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </div>
  )
}
