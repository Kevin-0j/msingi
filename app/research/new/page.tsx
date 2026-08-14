"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { THEMES, LOCATIONS, GAP_CATEGORIES, type Theme, type GapCategory } from "@/lib/types"
import { cn } from "@/lib/utils"
import { ArrowLeft, CircleAlert } from "lucide-react"

export default function NewResearchPage() {
  const router = useRouter()
  const { role, meId, posts, addPublication } = useStore()

  const [title, setTitle] = useState("")
  const [abstract, setAbstract] = useState("")
  const [themes, setThemes] = useState<Theme[]>([])
  const [location, setLocation] = useState(LOCATIONS[0])
  const [pages, setPages] = useState("12")
  const [priceKes, setPriceKes] = useState("500")
  const [gapCategory, setGapCategory] = useState<GapCategory | "">("")
  const [relatedPostId, setRelatedPostId] = useState("")
  const [error, setError] = useState<string | null>(null)

  if (role !== "worker" && role !== "organization") {
    return (
      <AppShell>
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl text-foreground">
            Research is submitted by health workers and service providers
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Switch role using the demo switcher to try it.
          </p>
          <Link href="/research" className="mt-3 inline-block text-sm text-primary hover:underline">
            Back to the Research Hub
          </Link>
        </div>
      </AppShell>
    )
  }

  const myPostsForGap = posts.filter(
    (p) => p.authorId === meId && (!gapCategory || p.gapCategory === gapCategory),
  )

  function toggleTheme(t: Theme) {
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function submit() {
    if (!title.trim() || !abstract.trim()) {
      setError("Title and abstract are both needed.")
      return
    }
    if (themes.length === 0) {
      setError("Pick at least one theme so the right people can find this.")
      return
    }
    addPublication({
      title: title.trim(),
      abstract: abstract.trim(),
      themes,
      location,
      pages: Math.max(1, Number(pages) || 1),
      priceKes: Math.max(0, Number(priceKes) || 0),
      readMinutes: 15,
      relatedGapCategory: gapCategory || undefined,
      relatedPostId: relatedPostId || undefined,
    })
    router.push(gapCategory ? `/research?gap=${encodeURIComponent(gapCategory)}` : "/research")
  }

  return (
    <AppShell>
      <Link
        href="/research"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Research Hub
      </Link>

      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h1 className="font-display text-2xl font-semibold text-foreground">Submit research</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Link it to the evidence gap it answers, so other health workers, researchers and
          funders searching that gap find your work.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Night-time obstetric referral in Kibera: a two-rider pilot"
              className="msingi-input"
            />
          </Field>

          <Field label="Abstract">
            <textarea
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              rows={4}
              placeholder="What you tried, what it cost, and what did and did not work."
              className="msingi-input"
            />
          </Field>

          <Field label="Which evidence gap does this address?">
            <select
              value={gapCategory}
              onChange={(e) => {
                setGapCategory(e.target.value as GapCategory)
                setRelatedPostId("")
              }}
              className="msingi-input"
            >
              <option value="">Not tied to a specific gap</option>
              {GAP_CATEGORIES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          {gapCategory && myPostsForGap.length > 0 && (
            <Field label="Link the impact post that first flagged this gap (optional)">
              <select
                value={relatedPostId}
                onChange={(e) => setRelatedPostId(e.target.value)}
                className="msingi-input"
              >
                <option value="">Don&apos;t link a specific post</option>
                {myPostsForGap.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.where}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Themes">
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

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Location">
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
            <Field label="Pages">
              <input
                type="number"
                min={1}
                value={pages}
                onChange={(e) => setPages(e.target.value)}
                className="msingi-input"
              />
            </Field>
            <Field label="Price (KES, 0 = free)">
              <input
                type="number"
                min={0}
                value={priceKes}
                onChange={(e) => setPriceKes(e.target.value)}
                className="msingi-input"
              />
            </Field>
          </div>

          {error && (
            <p className="flex items-start gap-1.5 text-sm text-destructive">
              <CircleAlert size={15} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Link
              href="/research"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Link>
            <button
              onClick={submit}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Publish
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
