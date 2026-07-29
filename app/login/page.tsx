"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useStore } from "@/lib/store"
import { Avatar } from "@/components/avatar"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ArrowLeft, ArrowRight } from "lucide-react"

// Demo accounts, one per role dimension. No passwords, no backend.
const SEEDED: { role: Role; id: string; label: string }[] = [
  { role: "worker", id: "u_amina", label: "Health worker" },
  { role: "organization", id: "o_silanga", label: "Organization" },
  { role: "funder", id: "f_ubuntu", label: "Funder" },
  { role: "admin", id: "admin_1", label: "Msingi admin" },
]

export default function LoginPage() {
  const router = useRouter()
  const { signInAs, getActor, createdWorkers, createdOrgs, createdFunders } = useStore()

  // Profiles created through sign-up appear alongside the demo personas.
  const mine: { role: Role; id: string; label: string }[] = [
    ...createdWorkers.map((w) => ({ role: "worker" as Role, id: w.id, label: "Your profile" })),
    ...createdOrgs.map((o) => ({
      role: "organization" as Role,
      id: o.id,
      label: "Your organization",
    })),
    ...createdFunders.map((f) => ({ role: "funder" as Role, id: f.id, label: "Your funder" })),
  ]
  const accounts = [...mine, ...SEEDED]

  // Derived, not stored: the list grows once created profiles hydrate, so an
  // initial useState value would pin a stale default.
  const [picked, setPicked] = useState<string | null>(null)
  const selected = picked && accounts.some((a) => a.id === picked) ? picked : accounts[0].id
  const setSelected = setPicked

  function signIn() {
    const account = accounts.find((a) => a.id === selected)
    if (!account) return
    signInAs(account.role, account.id)
    router.push("/feed")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} /> Back
        </Link>
        <span className="font-display text-xl font-semibold text-primary">Msingi</span>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        <h1 className="font-display text-3xl font-semibold text-foreground text-balance">
          Welcome back
        </h1>
        <p className="mt-2 text-muted-foreground">
          This demo has no passwords. Pick an account to sign in as. You can switch roles at any
          time with the demo switcher.
        </p>

        <div className="mt-6 space-y-2">
          {accounts.map((a) => {
            const actor = getActor(a.id)
            const active = selected === a.id
            return (
              <button
                key={a.id}
                onClick={() => setSelected(a.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border bg-card p-4 text-left transition-colors",
                  active ? "border-primary shadow-[var(--shadow-lift)]" : "border-border hover:border-primary/40",
                )}
              >
                <Avatar
                  name={actor?.name ?? a.label}
                  color={actor?.avatarColor ?? "#146879"}
                  size={44}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{actor?.name ?? a.label}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {a.label}
                    {actor?.location ? ` · ${actor.location}` : ""}
                  </p>
                </div>
                <span
                  className={cn(
                    "h-4 w-4 shrink-0 rounded-full border-2",
                    active ? "border-primary bg-primary" : "border-border",
                  )}
                />
              </button>
            )
          })}
        </div>

        <button
          onClick={signIn}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Sign in <ArrowRight size={16} />
        </button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </main>
    </div>
  )
}
