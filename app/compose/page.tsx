"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { THEMES, LOCATIONS, GAP_CATEGORIES, type Theme, type GapCategory, type StatChip } from "@/lib/types"
import { StatChip as StatChipView } from "@/components/stat-chip"
import { cn } from "@/lib/utils"
import { Mic, ImagePlus, ArrowLeft, CircleAlert } from "lucide-react"
import Link from "next/link"

const PHOTO_OPTIONS = [
  "/photos/maternal-clinic.png",
  "/photos/wash-water.png",
  "/photos/community-gathering.png",
  "/photos/health-outreach.png",
]

// Build clean stat chips from the structured answers.
function deriveChips(reached: string, did: string): StatChip[] {
  const chips: StatChip[] = []
  const num = reached.match(/\d[\d,]*/)
  if (num) chips.push({ label: "reached", value: num[0] })
  // Allow hyphenated words so "9 high-risk referrals" doesn't become "9 high".
  const matches = [...did.matchAll(/(\d[\d,]*)\s+([a-zA-Z][a-zA-Z\s-]{2,24})/g)]
  for (const m of matches.slice(0, 3)) {
    chips.push({ label: m[2].trim().split(/\s+/).slice(0, 2).join(" "), value: m[1] })
  }
  return chips.slice(0, 4)
}

export default function ComposePage() {
  const router = useRouter()
  const { addPost } = useStore()
  const [where, setWhere] = useState("")
  const [reached, setReached] = useState("")
  const [did, setDid] = useState("")
  const [gap, setGap] = useState("")
  const [gapCategory, setGapCategory] = useState<GapCategory>(GAP_CATEGORIES[0])
  const [location, setLocation] = useState(LOCATIONS[0])
  const [themes, setThemes] = useState<Theme[]>([])
  // Photo alt text is captured here, keyed by image, because only the person
  // who was there can describe what a photo actually shows.
  const [photos, setPhotos] = useState<string[]>([])
  const [photoAlts, setPhotoAlts] = useState<Record<string, string>>({})
  const [voiceNote, setVoiceNote] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const chips = deriveChips(reached, did)
  const missingAlt = photos.filter((p) => !(photoAlts[p] ?? "").trim())
  const valid = where.trim() && did.trim() && themes.length > 0

  function toggleTheme(t: Theme) {
    setThemes((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }
  function togglePhoto(p: string) {
    setPhotos((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]))
    setError(null)
  }

  function submit() {
    if (!valid) return
    // A photo without a description is invisible to blind users, and a voice
    // note without a transcript is unusable for Deaf users. Both are blocked
    // rather than silently posted as inaccessible content.
    if (missingAlt.length > 0) {
      setError(
        `Describe ${missingAlt.length === 1 ? "the photo" : "each photo"} you attached, so people using a screen reader know what it shows.`,
      )
      return
    }
    if (voiceNote && !transcript.trim()) {
      setError("Add a transcript for your voice note so Deaf and hard-of-hearing people can read it.")
      return
    }

    const id = addPost({
      location,
      themes,
      where: where.trim(),
      peopleReached: reached.trim(),
      whatWeDid: did.trim(),
      evidenceGap: gap.trim(),
      gapCategory,
      statChips: chips,
      photos: photos.map((src) => ({ src, alt: photoAlts[src].trim() })),
      voiceNote: voiceNote
        ? { durationSeconds: 12, transcript: transcript.trim() }
        : undefined,
    })
    router.push(`/post/${id}`)
  }

  return (
    <AppShell>
      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back to feed
      </Link>
      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h1 className="font-display text-2xl font-semibold text-foreground">
          Share what you did this week
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Answer a few plain questions. We turn them into clean impact chips.
        </p>

        <div className="mt-6 space-y-5">
          <Field label="Where were you?">
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="e.g. 3-day maternal clinic in Silanga, Kibera"
              className="msingi-input"
            />
          </Field>

          <Field label="How many people did you reach?">
            <input
              value={reached}
              onChange={(e) => setReached(e.target.value)}
              placeholder="e.g. 214 mothers seen"
              className="msingi-input"
            />
          </Field>

          <Field label="What did you do or treat?">
            <textarea
              value={did}
              onChange={(e) => setDid(e.target.value)}
              rows={3}
              placeholder="e.g. 47 first antenatal visits, 12 high-risk referrals, iron supplements for everyone"
              className="msingi-input"
            />
          </Field>

          <Field label="What's the evidence gap?">
            <textarea
              value={gap}
              onChange={(e) => setGap(e.target.value)}
              rows={2}
              placeholder="e.g. No night-time emergency transport"
              className="msingi-input"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Plain language is fine. This becomes a citable gap other health workers, researchers
              and funders can search and act on.
            </p>
          </Field>

          <Field label="Evidence gap category">
            <select
              aria-label="Evidence gap category"
              value={gapCategory}
              onChange={(e) => setGapCategory(e.target.value as GapCategory)}
              className="msingi-input"
            >
              {GAP_CATEGORIES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </Field>

          <Field label="Location">
            <select
              aria-label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="msingi-input"
            >
              {LOCATIONS.map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </Field>

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

          <Field label="Photos">
            <div className="flex flex-wrap gap-2">
              {PHOTO_OPTIONS.map((p) => {
                const selected = photos.includes(p)
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => togglePhoto(p)}
                    aria-pressed={selected}
                    className={cn(
                      "relative h-20 w-28 overflow-hidden rounded-lg border-2",
                      selected ? "border-primary" : "border-transparent",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                    <span className="sr-only">
                      {selected ? "Remove this photo" : "Add this photo"}
                    </span>
                  </button>
                )
              })}
              <span className="flex h-20 w-28 items-center justify-center rounded-lg border border-dashed border-border text-muted-foreground">
                <ImagePlus size={20} aria-hidden="true" />
              </span>
            </div>

            {/* One description per attached photo. Required before posting. */}
            {photos.length > 0 && (
              <div className="mt-3 space-y-3">
                {photos.map((p, i) => (
                  <div key={p} className="rounded-lg border border-border p-3">
                    <label
                      htmlFor={`alt-${i}`}
                      className="block text-sm font-medium text-foreground"
                    >
                      Describe photo {i + 1}
                    </label>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      What would you tell someone who can&apos;t see it? e.g. &ldquo;A nurse
                      weighing a baby outside the clinic tent.&rdquo;
                    </p>
                    <input
                      id={`alt-${i}`}
                      value={photoAlts[p] ?? ""}
                      onChange={(e) => {
                        setPhotoAlts((a) => ({ ...a, [p]: e.target.value }))
                        setError(null)
                      }}
                      aria-invalid={!(photoAlts[p] ?? "").trim() || undefined}
                      placeholder="Describe what is happening in the photo"
                      className="msingi-input mt-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </Field>

          <div>
            <button
              type="button"
              onClick={() => {
                setVoiceNote((v) => !v)
                setError(null)
              }}
              aria-pressed={voiceNote}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                voiceNote
                  ? "border-primary bg-primary-tint text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40",
              )}
            >
              <Mic size={16} aria-hidden="true" />{" "}
              {voiceNote ? "Voice note attached (0:12)" : "Add a voice note"}
            </button>

            {voiceNote && (
              <div className="mt-3 rounded-lg border border-border p-3">
                <label htmlFor="transcript" className="block text-sm font-medium text-foreground">
                  Transcript (required)
                </label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Type what you said. Deaf and hard-of-hearing colleagues read this instead of
                  listening, and it makes your update searchable.
                </p>
                <textarea
                  id="transcript"
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value)
                    setError(null)
                  }}
                  rows={3}
                  aria-invalid={!transcript.trim() || undefined}
                  placeholder="e.g. Three days at the Silanga clinic. We saw 214 mothers…"
                  className="msingi-input mt-2"
                />
              </div>
            )}
          </div>

          {chips.length > 0 && (
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="mb-2 text-sm font-medium text-foreground">Auto-generated impact chips</p>
              <div className="flex flex-wrap gap-2">
                {chips.map((c) => (
                  <StatChipView key={c.label + c.value} chip={c} />
                ))}
              </div>
            </div>
          )}

          {/* role="alert" so a screen reader announces the problem
              immediately, rather than leaving the user stuck on a button
              that appears to do nothing. */}
          {error && (
            <p
              role="alert"
              className="flex items-start gap-1.5 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            >
              <CircleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2">
            <Link
              href="/feed"
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Link>
            <button
              onClick={submit}
              disabled={!valid}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              Post
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
