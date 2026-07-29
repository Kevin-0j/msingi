"use client"

import { use, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { RightRail } from "@/components/right-rail"
import { useStore } from "@/lib/store"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { StatChip, ThemeChip } from "@/components/stat-chip"
import { cn } from "@/lib/utils"
import { ArrowLeft, Heart, MapPin, MessageSquare, UserPlus, Check, Send } from "lucide-react"

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const {
    posts,
    comments,
    getActor,
    getOrg,
    meId,
    supports,
    toggleSupport,
    addComment,
    connections,
    toggleConnect,
    startConversation,
  } = useStore()

  const post = posts.find((p) => p.id === id)
  const [draft, setDraft] = useState("")

  if (!post) {
    return (
      <AppShell>
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-foreground">This post could not be found.</p>
          <Link href="/feed" className="mt-2 inline-block text-primary hover:underline">
            Back to the feed
          </Link>
        </div>
      </AppShell>
    )
  }

  const author = getActor(post.authorId)!
  const org = post.orgId ? getOrg(post.orgId) : undefined
  const supported = supports.includes(post.id)
  const isConnected = connections.includes(post.authorId)
  const postComments = comments
    .filter((c) => c.postId === post.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
  const isMe = post.authorId === meId

  function submitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim()) return
    addComment(post!.id, draft.trim())
    setDraft("")
  }

  return (
    <AppShell right={<RightRail />}>
      <Link
        href="/feed"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to feed
      </Link>

      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
        {/* Author */}
        <div className="flex items-center gap-3 p-5 pb-3">
          <Link href={`/profile/${author.id}`}>
            <Avatar name={author.name} color={author.avatarColor} size={48} />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              href={`/profile/${author.id}`}
              className="flex items-center gap-1 font-semibold text-foreground hover:underline"
            >
              {author.name}
              {author.verificationStatus === "verified" && <VerifiedSeal size={15} />}
            </Link>
            <p className="text-sm text-muted-foreground">
              {author.subtitle}
              {org && (
                <>
                  {" · "}
                  <Link href={`/profile/${org.id}`} className="hover:underline">
                    {org.name}
                  </Link>
                </>
              )}
            </p>
            <p className="text-xs text-muted-foreground">{fmt(post.createdAt)}</p>
          </div>
        </div>

        {/* Structured story */}
        <div className="px-5">
          <h1 className="font-display text-2xl font-semibold leading-snug text-foreground text-pretty">
            {post.where}
          </h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin size={14} /> {post.location}
          </p>
        </div>

        {/* Photos */}
        {post.photos.length > 0 && (
          <div
            className={cn(
              "mt-4 grid gap-0.5",
              post.photos.length > 1 ? "grid-cols-2" : "grid-cols-1",
            )}
          >
            {post.photos.map((src, i) => (
              <div key={i} className="relative aspect-[3/2]">
                <Image
                  src={src || "/placeholder.svg"}
                  alt={`${post.where} — photo ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 500px"
                />
              </div>
            ))}
          </div>
        )}

        {/* Story fields */}
        <div className="space-y-4 p-5">
          <StoryRow label="How many people" value={post.peopleReached} />
          <StoryRow label="What we did" value={post.whatWeDid} />
          <div className="rounded-lg border border-accent/30 bg-accent/5 p-4">
            <p className="text-sm font-semibold text-accent">Biggest gap or need</p>
            <p className="mt-1 leading-relaxed text-foreground">{post.biggestGap}</p>
          </div>

          {/* Stat chips */}
          <div className="flex flex-wrap gap-2">
            {post.statChips.map((c) => (
              <StatChip key={c.label} chip={c} />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {post.themes.map((t) => (
              <ThemeChip key={t} label={t} />
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border p-4">
          <button
            onClick={() => toggleSupport(post.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
              supported
                ? "bg-primary text-primary-foreground"
                : "bg-primary-tint text-primary hover:opacity-90",
            )}
          >
            <Heart size={16} className={supported ? "fill-current" : ""} />
            {supported ? "Supporting this work" : "Support this work"}
          </button>

          {!isMe && (
            <>
              <button
                onClick={() => toggleConnect(post.authorId)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors",
                  isConnected
                    ? "border-border text-muted-foreground"
                    : "border-primary text-primary hover:bg-primary-tint",
                )}
              >
                {isConnected ? <Check size={16} /> : <UserPlus size={16} />}
                {isConnected ? "Connected" : "Connect"}
              </button>
              <button
                onClick={() => router.push(`/messages?c=${startConversation(post.authorId)}`)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                <MessageSquare size={16} /> Message
              </button>
            </>
          )}
        </div>
      </article>

      {/* Comments */}
      <section className="mt-4 rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <MessageSquare size={18} /> Comments ({postComments.length})
        </h2>

        <form onSubmit={submitComment} className="mt-4 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a plain, practical comment…"
            className="msingi-input"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
          >
            <Send size={15} />
          </button>
        </form>

        <div className="mt-5 space-y-4">
          {postComments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No comments yet — be the first to respond.
            </p>
          ) : (
            postComments.map((c) => {
              const a = getActor(c.authorId)
              if (!a) return null
              return (
                <div key={c.id} className="flex gap-3">
                  <Link href={`/profile/${a.id}`}>
                    <Avatar name={a.name} color={a.avatarColor} size={36} />
                  </Link>
                  <div className="min-w-0 flex-1 rounded-lg bg-secondary/50 px-3 py-2">
                    <Link
                      href={`/profile/${a.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-foreground hover:underline"
                    >
                      {a.name}
                      {a.verificationStatus === "verified" && <VerifiedSeal size={12} />}
                    </Link>
                    <p className="text-sm leading-relaxed text-foreground">{c.text}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </section>
    </AppShell>
  )
}

function StoryRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="leading-relaxed text-foreground">{value}</p>
    </div>
  )
}
