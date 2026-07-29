"use client"

import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { plans, boostOptions } from "@/data/mock"
import { cn } from "@/lib/utils"
import { Check, Rocket } from "lucide-react"

function kes(n: number) {
  return n === 0 ? "Free" : `KES ${n.toLocaleString("en-KE")}`
}

export default function PricingPage() {
  const { myPlanId, myTier, setPlan, role } = useStore()

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Plans & boost</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything a frontline health worker needs is free, forever. Paid tiers are for people
          who want extra reach — never for access to funding.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re on{" "}
          <span className="font-medium text-foreground">
            {plans.find((p) => p.id === myPlanId)?.name ?? "Msingi Free"}
          </span>{" "}
          ({myTier}) as <span className="capitalize">{role}</span>.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => {
          const current = p.id === myPlanId
          return (
            <div
              key={p.id}
              className={cn(
                "flex flex-col rounded-xl border bg-card p-5 shadow-[var(--shadow-soft)]",
                current ? "border-primary" : "border-border",
              )}
            >
              <h2 className="font-display text-lg font-semibold text-foreground">{p.name}</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{p.audience}</p>
              <p className="mt-3 text-2xl font-semibold text-foreground">
                {kes(p.priceKes)}
                {p.priceKes > 0 && (
                  <span className="text-sm font-normal text-muted-foreground"> / month</span>
                )}
              </p>
              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-sm leading-relaxed text-foreground">
                    <Check size={15} className="mt-0.5 shrink-0 text-impact" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setPlan(p.id)}
                disabled={current}
                className={cn(
                  "mt-5 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity",
                  current
                    ? "border border-border text-muted-foreground"
                    : "bg-primary text-primary-foreground hover:opacity-90",
                )}
              >
                {current ? "Current plan" : p.priceKes === 0 ? "Switch to Free" : "Choose plan"}
              </button>
            </div>
          )
        })}
      </div>

      <section className="mt-8">
        <h2 className="flex items-center gap-2 font-display text-xl text-foreground">
          <Rocket size={20} className="text-accent" /> Boost
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One-off placement, no subscription. Boost never changes who gets funded — only who sees
          the work.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {boostOptions.map((b) => (
            <div
              key={b.id}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <p className="font-medium text-foreground">{b.name}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{b.description}</p>
              <p className="mt-3 font-semibold text-impact">{kes(b.priceKes)}</p>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
        Demo build: switching plans changes the paywall gate locally. No payment is taken and no
        card details are collected anywhere in this app.
      </p>
    </AppShell>
  )
}
