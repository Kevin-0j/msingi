"use client"

import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { plans, boostOptions } from "@/data/mock"
import { ROLE_LABEL } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Award, Check, Rocket } from "lucide-react"

function kes(n: number) {
  return n === 0 ? "Free" : `KES ${n.toLocaleString("en-KE")}`
}

export default function PricingPage() {
  const {
    myPlanId,
    myTier,
    setPlan,
    role,
    sponsorTiers,
    mySponsorTierId,
    setSponsorTier,
  } = useStore()

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Plans & boost</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Everything a frontline health worker needs is free, forever. Paid tiers are for people
          who want extra reach, never for access to funding.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;re on{" "}
          <span className="font-medium text-foreground">
            {plans.find((p) => p.id === myPlanId)?.name ?? "Afyashinani Free"}
          </span>{" "}
          ({myTier}) as <span>{ROLE_LABEL[role]}</span>.
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
          One-off placement, no subscription. Boost never changes who gets funded, only who sees
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

      {/* Sponsorship: funder-side revenue, kept visually and structurally
          separate from the worker/org subscription plans above. */}
      <section className="mt-10">
        <h2 className="flex items-center gap-2 font-display text-xl text-foreground">
          <Award size={20} className="text-accent" /> Sponsorship
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          For health funding organisations backing the network itself, not a single call.
          Sponsorship buys visibility and analytics. It never buys influence over who gets
          funded, and it is never required to post a call.
        </p>
        {role === "funder" ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Your organisation is currently{" "}
            <span className="font-medium text-foreground">
              {sponsorTiers.find((t) => t.id === mySponsorTierId)?.name ?? "not a sponsor"}
            </span>
            .
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            Switch to the Health funding organisation role to choose a tier.
          </p>
        )}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[...sponsorTiers]
            .sort((a, b) => b.rank - a.rank)
            .map((t) => {
              const current = t.id === mySponsorTierId
              return (
                <div
                  key={t.id}
                  className={cn(
                    "flex flex-col rounded-xl border bg-card p-5 shadow-[var(--shadow-soft)]",
                    current ? "border-primary" : "border-border",
                  )}
                  style={current ? undefined : { borderTopColor: t.badgeColor, borderTopWidth: 3 }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: t.badgeColor }}
                  >
                    {t.name}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-foreground">
                    {kes(t.priceKes)}
                    <span className="text-sm font-normal text-muted-foreground"> / month</span>
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {t.benefits.map((b) => (
                      <li key={b} className="flex gap-2 text-sm leading-relaxed text-foreground">
                        <Check size={14} className="mt-1 shrink-0 text-impact" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  {role === "funder" && (
                    <button
                      onClick={() => setSponsorTier(current ? null : t.id)}
                      className={cn(
                        "mt-4 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity",
                        current
                          ? "border border-border text-muted-foreground hover:bg-secondary"
                          : "bg-primary text-primary-foreground hover:opacity-90",
                      )}
                    >
                      {current ? "Current tier · cancel" : `Become ${t.name}`}
                    </button>
                  )}
                </div>
              )
            })}
        </div>

        <p className="mt-4 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
          Sponsors are shown a{" "}
          <Link href="/consortium" className="text-primary hover:underline">
            consortium
          </Link>{" "}
          view of pooled windows. Sponsorship is disclosed publicly on every sponsor badge, so
          workers can always see who funds the platform.
        </p>
      </section>

      <p className="mt-6 rounded-xl border border-border bg-card p-4 text-xs leading-relaxed text-muted-foreground">
        Demo build: switching plans or sponsor tiers changes state locally. No payment is taken
        and no card details are collected anywhere in this app.
      </p>
    </AppShell>
  )
}
