"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { PostCard } from "@/components/post-card"
import {
  useStore,
  orgTypeLabel,
  funderTypeLabel,
} from "@/lib/store"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal, VerifiedBadge } from "@/components/verified-seal"
import { SponsorBadge } from "@/components/sponsor-badge"
import { ThemeChip } from "@/components/stat-chip"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  MapPin,
  UserPlus,
  Check,
  MessageSquare,
  Briefcase,
  Users,
  Target,
  Megaphone,
} from "lucide-react"

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const store = useStore()
  const actor = store.getActor(id)

  if (!actor) {
    return (
      <AppShell>
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-foreground">Profile not found.</p>
          <Link href="/feed" className="mt-2 inline-block text-primary hover:underline">
            Back to the feed
          </Link>
        </div>
      </AppShell>
    )
  }

  const isMe = id === store.meId
  const isFollowing = store.following.includes(id)
  const isConnected = store.connections.includes(id)

  return (
    <AppShell>
      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} aria-hidden="true" /> Back
      </Link>

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={actor.name} color={actor.avatarColor} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-semibold text-foreground">{actor.name}</h1>
              {actor.verificationStatus === "verified" && <VerifiedSeal size={18} />}
            </div>
            <p className="text-muted-foreground">{actor.subtitle}</p>
            <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin size={14} aria-hidden="true" /> {actor.location}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <VerifiedBadge status={actor.verificationStatus} />
              <SponsorBadge tierId={actor.sponsorTierId} />
            </div>
          </div>
        </div>

        {!isMe && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => store.toggleConnect(id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                isConnected
                  ? "border border-border text-muted-foreground"
                  : "bg-primary text-primary-foreground hover:opacity-90",
              )}
            >
              {isConnected ? <Check size={16} aria-hidden="true" /> : <UserPlus size={16} aria-hidden="true" />}
              {isConnected ? "Connected" : "Connect"}
            </button>
            <button
              onClick={() => store.toggleFollow(id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                isFollowing
                  ? "border-border text-muted-foreground"
                  : "border-primary text-primary hover:bg-primary-tint",
              )}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
            <button
              onClick={() => router.push(`/messages?c=${store.startConversation(id)}`)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <MessageSquare size={16} aria-hidden="true" /> Message
            </button>
          </div>
        )}
        {isMe && (
          <div className="mt-4">
            <Link
              href="/verification"
              className="inline-flex items-center gap-2 rounded-lg border border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary-tint"
            >
              Request verification
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4">
        {actor.kind === "worker" && <WorkerBody id={id} />}
        {actor.kind === "organization" && <OrgBody id={id} />}
        {actor.kind === "funder" && <FunderBody id={id} />}
      </div>
    </AppShell>
  )
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <h2 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
        <Icon size={18} className="text-primary" /> {title}
      </h2>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Worker: CV-lite + impact timeline
// ---------------------------------------------------------------------------
function WorkerBody({ id }: { id: string }) {
  const store = useStore()
  const w = store.getWorker(id)
  if (!w) return null
  const timeline = store.posts
    .filter((p) => p.authorId === id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <div className="space-y-4">
      <Section icon={Briefcase} title="About">
        <p className="leading-relaxed text-foreground">{w.bio}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {w.focusAreas.map((f) => (
            <ThemeChip key={f} label={f} />
          ))}
        </div>
      </Section>

      {w.cumulativeStats && w.cumulativeStats.length > 0 && (
        <Section icon={Target} title="Cumulative impact">
          <div className="grid grid-cols-3 gap-3">
            {w.cumulativeStats.map((s) => (
              <div key={s.label} className="rounded-lg bg-impact/10 p-3 text-center">
                <p className="font-display text-xl font-semibold text-impact">{s.value}</p>
                <p className="text-xs text-impact/80">{s.label}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {w.experience && w.experience.length > 0 && (
        <Section icon={Briefcase} title="Experience">
          <ul className="space-y-3">
            {w.experience.map((e, i) => (
              <li key={i} className="flex gap-3">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                <div>
                  <p className="font-medium text-foreground">{e.role}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.place} · {e.period}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {w.affiliations.length > 0 && (
        <Section icon={Users} title="Affiliations">
          <div className="space-y-2">
            {w.affiliations.map((oid) => {
              const org = store.getOrg(oid)
              if (!org) return null
              return (
                <Link
                  key={oid}
                  href={`/profile/${oid}`}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 hover:border-primary/40"
                >
                  <Avatar name={org.name} color={org.avatarColor} size={32} />
                  <span className="text-sm font-medium text-foreground">{org.name}</span>
                </Link>
              )
            })}
          </div>
        </Section>
      )}

      <div>
        <h2 className="mb-3 px-1 font-semibold text-foreground">Impact timeline</h2>
        {timeline.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No posts yet. Share what you did this week.
          </p>
        ) : (
          <div className="space-y-4">
            {timeline.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Organization
// ---------------------------------------------------------------------------
function OrgBody({ id }: { id: string }) {
  const store = useStore()
  const o = store.getOrg(id)
  if (!o) return null

  return (
    <div className="space-y-4">
      <Section icon={Briefcase} title={orgTypeLabel(o.type)}>
        <p className="leading-relaxed text-foreground">{o.about}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {o.focusAreas.map((f) => (
            <ThemeChip key={f} label={f} />
          ))}
        </div>
      </Section>

      <Section icon={Target} title="What we're doing now">
        <p className="leading-relaxed text-foreground">{o.currentWork}</p>
      </Section>

      <Section icon={Users} title="Communities benefiting">
        <div className="flex flex-wrap gap-2">
          {o.communities.map((c) => (
            <span
              key={c}
              className="rounded-full bg-primary-tint px-3 py-1 text-sm text-primary"
            >
              {c}
            </span>
          ))}
        </div>
      </Section>

      {o.memberIds.length > 0 && (
        <Section icon={Users} title="Team">
          <div className="space-y-2">
            {o.memberIds.map((mid) => {
              const m = store.getWorker(mid)
              if (!m) return null
              return (
                <Link
                  key={mid}
                  href={`/profile/${mid}`}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 hover:border-primary/40"
                >
                  <Avatar name={m.name} color={m.avatarColor} size={36} />
                  <div>
                    <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                      {m.name}
                      {store.verifStatusOf(m.id, m.verificationStatus) === "verified" && (
                        <VerifiedSeal size={12} />
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{m.title}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </Section>
      )}

      <Section icon={Target} title="Next area of focus">
        <p className="leading-relaxed text-foreground">{o.nextFocus}</p>
      </Section>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Funder
// ---------------------------------------------------------------------------
function FunderBody({ id }: { id: string }) {
  const store = useStore()
  const f = store.getFunder(id)
  if (!f) return null
  const calls = store.fundingCalls.filter((c) => c.funderId === id)

  return (
    <div className="space-y-4">
      <Section icon={Target} title={funderTypeLabel(f.type)}>
        <p className="leading-relaxed text-foreground">{f.supports}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {f.focusAreas.map((x) => (
            <ThemeChip key={x} label={x} />
          ))}
        </div>
      </Section>

      <Section icon={Megaphone} title="Active calls for proposals">
        {calls.length === 0 ? (
          <p className="text-sm text-muted-foreground">No open calls right now.</p>
        ) : (
          <div className="space-y-2">
            {calls.map((c) => (
              <Link
                key={c.id}
                href={`/calls/${c.id}`}
                className="block rounded-lg border border-border p-3 hover:border-primary/40"
              >
                <p className="font-medium text-foreground">{c.title}</p>
                <p className="text-sm text-impact">{c.amount}</p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {f.backed.length > 0 && (
        <Section icon={Users} title="Workers & orgs we've backed">
          <div className="space-y-2">
            {f.backed.map((bid) => {
              const a = store.getActor(bid)
              if (!a) return null
              return (
                <Link
                  key={bid}
                  href={`/profile/${bid}`}
                  className="flex items-center gap-2 rounded-lg border border-border p-2 hover:border-primary/40"
                >
                  <Avatar name={a.name} color={a.avatarColor} size={36} />
                  <div>
                    <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                      {a.name}
                      {a.verificationStatus === "verified" && <VerifiedSeal size={12} />}
                    </p>
                    <p className="text-xs text-muted-foreground">{a.subtitle}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
