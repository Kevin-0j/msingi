"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { useStore } from "@/lib/store"
import { assistantSample } from "@/data/mock"
import { cn } from "@/lib/utils"
import { Lock, Send, Sparkles } from "lucide-react"

// Canned, offline responses. No model call, no API key. This is a demo shell.
function cannedReply(question: string, callTitles: string[]) {
  const q = question.toLowerCase()
  if (q.includes("deadline") || q.includes("when")) {
    return "Check the deadline chip on each call. The closest one is usually the one to write first. Applications sent in the last 48 hours before a deadline get read alongside everything else, so earlier is genuinely better."
  }
  if (q.includes("verif")) {
    return "Most funders here filter on the Verified seal. If yours is still pending, say so in your note and name the document you submitted. Funders read that as honest rather than incomplete."
  }
  if (q.includes("write") || q.includes("application") || q.includes("apply")) {
    return "Three sentences beats three pages: what you did last quarter with real numbers, the one gap that money would close, and what exactly you'd spend it on. Skip the mission statement."
  }
  return `Based on your posted work, the closest open calls are: ${
    callTitles.slice(0, 2).join(" and ") || "none right now"
  }. Lead with your numbers, name the gap in one sentence, then the ask.`
}

export default function AssistantPage() {
  const { myTier, fundingCalls, setPlan } = useStore()
  const gated = myTier !== "paid"

  const [turns, setTurns] = useState<{ role: "user" | "assistant"; text: string }[]>([])
  const [draft, setDraft] = useState("")

  function send(e: React.FormEvent) {
    e.preventDefault()
    const q = draft.trim()
    if (!q) return
    setTurns((prev) => [
      ...prev,
      { role: "user", text: q },
      { role: "assistant", text: cannedReply(q, fundingCalls.map((c) => c.title)) },
    ])
    setDraft("")
  }

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 font-display text-2xl text-foreground">
          <Sparkles size={22} className="text-accent" aria-hidden="true" /> AI Funder Assistant
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask which open calls fit your work, and what to actually write. Included with
          Afyashinani Pro.
        </p>
      </div>

      {gated ? (
        <>
          <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
            <p className="flex items-center gap-2 font-semibold text-foreground">
              <Lock size={18} className="text-accent" aria-hidden="true" /> This is a Pro feature
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Everything else on Afyashinani stays free: your profile, posting, messaging, and
              applying to every funding call. The assistant is part of Afyashinani Pro.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href="/pricing"
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                See plans
              </Link>
              <button
                onClick={() => setPlan("plan_pro")}
                className="rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary"
              >
                Unlock in demo
              </button>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Sample conversation
            </p>
            <div className="space-y-3 rounded-xl border border-border bg-card p-5 opacity-90 shadow-[var(--shadow-soft)]">
              {assistantSample.map((t, i) => (
                <Bubble key={i} role={t.role} text={t.text} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-border bg-card shadow-[var(--shadow-soft)]">
          <div className="space-y-3 p-5">
            {turns.length === 0 ? (
              <>
                <p className="text-sm text-muted-foreground">
                  Ask anything about the open calls. Try one of these:
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Which call fits maternal health in Kibera?",
                    "What should I write in my application?",
                    "Does verification matter here?",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() =>
                        setTurns([
                          { role: "user", text: s },
                          {
                            role: "assistant",
                            text: cannedReply(
                              s,
                              fundingCalls.map((c) => c.title),
                            ),
                          },
                        ])
                      }
                      className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground hover:border-primary/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              turns.map((t, i) => <Bubble key={i} role={t.role} text={t.text} />)
            )}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-border p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Ask about a funding call…"
              className="msingi-input"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              aria-label="Send question"
              className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-40"
            >
              <Send size={16} aria-hidden="true" />
            </button>
          </form>
          <p className="border-t border-border p-3 text-xs text-muted-foreground">
            Demo build: replies are canned and generated on-device. No model is called.
          </p>
        </div>
      )}
    </AppShell>
  )
}

function Bubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const mine = role === "user"
  return (
    <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          mine
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-border bg-secondary/50 text-foreground",
        )}
      >
        {text}
      </div>
    </div>
  )
}
