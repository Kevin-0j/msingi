"use client"

import Link from "next/link"
import Image from "next/image"
import { useStore } from "@/lib/store"
import type { ImpactPost } from "@/lib/types"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { StatChip, ThemeChip } from "@/components/stat-chip"
import { Heart, MessageSquare, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"

function timeAgo(iso: string) {
  const d = (Date.now() - new Date(iso).getTime()) / 86400000
  if (d < 1) return "today"
  if (d < 2) return "yesterday"
  return `${Math.floor(d)}d ago`
}

export function PostCard({ post }: { post: ImpactPost }) {
  const { getActor, supports, toggleSupport, comments } = useStore()
  const author = getActor(post.authorId)
  const supported = supports.includes(post.id)
  const commentCount = comments.filter((c) => c.postId === post.id).length

  if (!author) return null

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${author.id}`} aria-hidden="true" tabIndex={-1}>
            <Avatar name={author.name} color={author.avatarColor} size={40} />
          </Link>
          <div className="min-w-0">
            <Link
              href={`/profile/${author.id}`}
              className="flex items-center gap-1 font-semibold text-foreground hover:underline"
            >
              <span className="truncate">{author.name}</span>
              {author.verificationStatus === "verified" && <VerifiedSeal size={14} />}
            </Link>
            <p className="truncate text-sm text-muted-foreground">
              {author.subtitle} · {timeAgo(post.createdAt)}
            </p>
          </div>
        </div>

        <Link href={`/post/${post.id}`} className="mt-3 block">
          <h3 className="font-display text-lg font-semibold leading-snug text-foreground text-pretty">
            {post.where}
          </h3>
        </Link>

        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin size={14} aria-hidden="true" /> {post.location}
        </p>

        <p className="mt-3 text-[15px] leading-relaxed text-foreground">{post.whatWeDid}</p>

        <div className="mt-3 rounded-lg border border-border bg-secondary/50 p-3">
          <p className="text-sm font-medium text-foreground">Evidence gap · {post.gapCategory}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{post.evidenceGap}</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {post.statChips.map((c) => (
            <StatChip key={c.label} chip={c} />
          ))}
        </div>
      </div>

      {post.photos.length > 0 && (
        <Link
          href={`/post/${post.id}`}
          className={cn(
            "grid gap-0.5",
            post.photos.length > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {post.photos.slice(0, 2).map((photo, i) => (
            <div key={i} className="relative aspect-[3/2]">
              <Image
                src={photo.src || "/placeholder.svg"}
                alt={photo.alt}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 400px"
                loading="lazy"
              />
            </div>
          ))}
        </Link>
      )}

      <div className="flex items-center gap-2 border-t border-border p-2">
        <div className="flex flex-wrap gap-1 px-2">
          {post.themes.map((t) => (
            <ThemeChip key={t} label={t} />
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => toggleSupport(post.id)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              supported
                ? "bg-primary-tint text-primary"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            <Heart size={16} className={supported ? "fill-primary" : ""} aria-hidden="true" />
            Support
          </button>
          <Link
            href={`/post/${post.id}`}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
          >
            <MessageSquare size={16} aria-hidden="true" /> {commentCount}
          </Link>
        </div>
      </div>
    </article>
  )
}
