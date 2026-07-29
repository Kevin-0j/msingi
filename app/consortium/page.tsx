"use client"

import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { consortiumMembers } from "@/data/mock"
import { Building2, HandCoins, Landmark, GraduationCap, ArrowRight } from "lucide-react"
import type { ConsortiumMember } from "@/lib/types"

const KIND_META: Record<
  ConsortiumMember["kind"],
  { label: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  county: { label: "County government", icon: Landmark },
  ngo: { label: "NGO / CBO", icon: Building2 },
  funder: { label: "Funder", icon: HandCoins },
  academic: { label: "Academic partner", icon: GraduationCap },
}

export default function ConsortiumPage() {
  const { posts, fundingCalls, workers, organizations } = useStore()

  const stats = [
    { label: "frontline workers on Msingi", value: workers.length.toLocaleString("en-KE") },
    { label: "organisations", value: organizations.length.toLocaleString("en-KE") },
    { label: "impact reports filed", value: posts.length.toLocaleString("en-KE") },
    { label: "open funding calls", value: fundingCalls.length.toLocaleString("en-KE") },
  ]

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">The Msingi Consortium</h1>
        <p className="mt-1 leading-relaxed text-muted-foreground text-pretty">
          Counties, funders, NGOs and academic partners pooling money and evidence behind the same
          frontline teams, instead of running four parallel pilots in the same village.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-[var(--shadow-soft)]"
          >
            <p className="font-display text-2xl font-semibold text-impact">{s.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl text-foreground">Members</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {consortiumMembers.map((m) => {
            const meta = KIND_META[m.kind]
            return (
              <li
                key={m.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
              >
                <span className="inline-flex shrink-0 rounded-lg bg-primary-tint p-2.5 text-primary">
                  <meta.icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{m.name}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {meta.label}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {m.contribution}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h2 className="font-display text-xl text-foreground">How it works</h2>
        <ol className="mt-3 space-y-3">
          {[
            "Members agree on a theme and county for a pooled window, say maternal health in Nairobi informal settlements.",
            "The window is posted as a single funding call, so workers write one application, not five.",
            "Verified frontline teams apply with their posted impact record attached.",
            "Members review together and split the funding. Results come back to the same feed everyone reads.",
          ].map((step, i) => (
            <li key={step} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span className="leading-relaxed text-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/calls"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          See the open calls <ArrowRight size={16} />
        </Link>
      </section>
    </AppShell>
  )
}
