"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { ThemeChip } from "@/components/stat-chip"
import { useStore } from "@/lib/store"
import { COMMISSION_RATE, type Publication } from "@/lib/types"
import { BookOpen, Check, Clock, Download } from "lucide-react"

function kes(n: number) {
  return `KES ${n.toLocaleString("en-KE")}`
}

export default function ResearchPage() {
  const { publications, publicationPurchases, meId } = useStore()
  const mine = publicationPurchases.filter((p) => p.buyerId === meId)

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Research Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Field evidence written by the people who collected it. Read the first 15 minutes free;
          pay to download the full paper. Msingi takes {Math.round(COMMISSION_RATE * 100)}% — the
          rest goes to the author.
        </p>
      </div>

      {mine.length > 0 && (
        <div className="mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground shadow-[var(--shadow-soft)]">
          You&apos;ve bought {mine.length} {mine.length === 1 ? "paper" : "papers"} · authors
          earned{" "}
          <span className="font-medium text-impact">
            {kes(mine.reduce((sum, p) => sum + (p.grossKes - p.commissionKes), 0))}
          </span>
        </div>
      )}

      <ul className="flex flex-col gap-4">
        {publications.map((p) => (
          <PublicationCard key={p.id} pub={p} />
        ))}
      </ul>
    </AppShell>
  )
}

function PublicationCard({ pub }: { pub: Publication }) {
  const { getActor, purchasePublication, hasPurchased } = useStore()
  const author = getActor(pub.authorId)
  const purchased = hasPurchased(pub.id)
  const [reading, setReading] = useState(false)

  const commission = Math.round(pub.priceKes * COMMISSION_RATE)

  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start gap-3">
        {author && (
          <Link href={`/profile/${author.id}`}>
            <Avatar name={author.name} color={author.avatarColor} size={44} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg leading-snug text-foreground text-pretty">
            {pub.title}
          </h2>
          {author && (
            <Link
              href={`/profile/${author.id}`}
              className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
            >
              {author.name}
              {author.verificationStatus === "verified" && <VerifiedSeal size={13} />}
            </Link>
          )}
        </div>
        <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          {kes(pub.priceKes)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{pub.abstract}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {pub.themes.map((t) => (
          <ThemeChip key={t} label={t} />
        ))}
        <span className="text-xs text-muted-foreground">
          {pub.pages} pages · {pub.location}
        </span>
      </div>

      {purchased ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-impact/30 bg-impact/10 p-3">
          <Check size={16} className="shrink-0 text-impact" />
          <span className="text-sm text-foreground">
            Purchased — full paper unlocked. {kes(pub.priceKes - commission)} went to the author,{" "}
            {kes(commission)} to Msingi.
          </span>
          <button className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary">
            <Download size={15} /> Download PDF
          </button>
        </div>
      ) : reading ? (
        <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock size={15} className="text-accent" /> Free preview — {pub.readMinutes} minutes
          </p>
          <p className="mt-2 text-sm leading-relaxed text-foreground">{pub.abstract}</p>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The full paper covers method, month-by-month figures, cost breakdowns and the parts
            that did not work. Preview ends here.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => purchasePublication(pub.id)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Pay {kes(pub.priceKes)} to download
            </button>
            <button
              onClick={() => setReading(false)}
              className="rounded-lg border border-border px-4 py-2 text-sm text-foreground hover:bg-secondary"
            >
              Close preview
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => setReading(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <BookOpen size={16} /> Read {pub.readMinutes} min free
          </button>
          <button
            onClick={() => purchasePublication(pub.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download size={16} /> Buy for {kes(pub.priceKes)}
          </button>
        </div>
      )}
    </li>
  )
}
