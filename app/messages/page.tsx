"use client"

import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { cn } from "@/lib/utils"
import { Send, MessageSquare, ArrowLeft } from "lucide-react"

function time(iso: string) {
  return new Date(iso).toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })
}

function MessagesInner() {
  const searchParams = useSearchParams()
  // Callers create the conversation on click and link here with its id, so this
  // screen never has to mutate state while rendering.
  const convoParam = searchParams.get("c")
  const { conversations, meId, getActor, sendMessage } = useStore()

  const [picked, setPicked] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [composing, setComposing] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  // Conversations that include me, most recent first.
  const myConvos = useMemo(
    () =>
      conversations
        .filter((c) => c.participantIds.includes(meId))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [conversations, meId],
  )

  // Derived, not stored: an explicit pick wins, then the deep link, then the
  // most recent thread.
  const activeId =
    (picked && myConvos.some((c) => c.id === picked) ? picked : null) ??
    (convoParam && myConvos.some((c) => c.id === convoParam) ? convoParam : null) ??
    myConvos[0]?.id ??
    null

  const setActiveId = setPicked

  const active = myConvos.find((c) => c.id === activeId)
  const otherId = active?.participantIds.find((p) => p !== meId)
  const other = otherId ? getActor(otherId) : undefined

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [active?.messages.length, activeId])

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!draft.trim() || !activeId) return
    sendMessage(activeId, draft.trim())
    setDraft("")
  }

  return (
    <AppShell>
      <div className="grid h-[calc(100vh-8rem)] grid-cols-1 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-soft)] md:grid-cols-[300px_1fr]">
        {/* Conversation list */}
        <div
          className={cn(
            "flex flex-col border-r border-border",
            composing || active ? "hidden md:flex" : "flex",
          )}
        >
          <div className="border-b border-border p-4">
            <h1 className="font-display text-lg font-semibold text-foreground">Messages</h1>
            <p className="text-xs text-muted-foreground">Free 1:1 chat for everyone</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {myConvos.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                No conversations yet. Open someone&apos;s profile and tap Message.
              </p>
            ) : (
              myConvos.map((c) => {
                const oid = c.participantIds.find((p) => p !== meId)
                const o = oid ? getActor(oid) : undefined
                if (!o) return null
                const last = c.messages[c.messages.length - 1]
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveId(c.id)
                      setComposing(true)
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 border-b border-border px-4 py-3 text-left transition-colors",
                      activeId === c.id ? "bg-primary-tint/50" : "hover:bg-muted",
                    )}
                  >
                    <Avatar name={o.name} color={o.avatarColor} size={40} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <span className="truncate">{o.name}</span>
                        {o.verificationStatus === "verified" && <VerifiedSeal size={12} />}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {last ? last.text : "No messages yet"}
                      </p>
                    </div>
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Thread */}
        <div
          className={cn(
            "flex flex-col",
            composing || active ? "flex" : "hidden md:flex",
          )}
        >
          {active && other ? (
            <>
              <div className="flex items-center gap-3 border-b border-border p-4">
                <button
                  onClick={() => setComposing(false)}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft size={18} />
                </button>
                <Link href={`/profile/${other.id}`}>
                  <Avatar name={other.name} color={other.avatarColor} size={40} />
                </Link>
                <div>
                  <Link
                    href={`/profile/${other.id}`}
                    className="flex items-center gap-1 font-medium text-foreground hover:underline"
                  >
                    {other.name}
                    {other.verificationStatus === "verified" && <VerifiedSeal size={13} />}
                  </Link>
                  <p className="text-xs text-muted-foreground">{other.subtitle}</p>
                </div>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto bg-background/40 p-4">
                {active.messages.length === 0 && (
                  <p className="mt-8 text-center text-sm text-muted-foreground">
                    Say hello — start the conversation.
                  </p>
                )}
                {active.messages.map((m) => {
                  const mine = m.senderId === meId
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                          mine
                            ? "rounded-br-sm bg-primary text-primary-foreground"
                            : "rounded-bl-sm border border-border bg-card text-foreground",
                        )}
                      >
                        <p>{m.text}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            mine ? "text-primary-foreground/70" : "text-muted-foreground",
                          )}
                        >
                          {time(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={endRef} />
              </div>

              <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing &&
                      e.keyCode !== 229
                    ) {
                      submit(e)
                    }
                  }}
                  placeholder="Write a message…"
                  className="msingi-input"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-muted-foreground">
              <MessageSquare size={32} className="mb-2 opacity-50" />
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesInner />
    </Suspense>
  )
}
