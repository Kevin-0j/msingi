"use client"

import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { useStore } from "@/lib/store"

export default function NotificationsPage() {
  const { getActor, meId, following, connections, submissions, fundingCalls } = useStore()

  const items: { id: string; actorId: string; text: string; href: string }[] = []

  connections.forEach((id) => {
    const a = getActor(id)
    if (a) items.push({ id: `conn-${id}`, actorId: id, text: `You connected with ${a.name}.`, href: `/profile/${id}` })
  })
  following.forEach((id) => {
    const a = getActor(id)
    if (a) items.push({ id: `foll-${id}`, actorId: id, text: `You are following ${a.name}.`, href: `/profile/${id}` })
  })
  submissions.forEach((s) => {
    const call = fundingCalls.find((c) => c.id === s.callId)
    if (call)
      items.push({
        id: `sub-${s.id}`,
        actorId: call.funderId,
        text: `${s.type === "application" ? "Application" : "Interest"} sent for “${call.title}”.`,
        href: `/calls/${call.id}`,
      })
  })

  // A couple of seeded, welcoming notifications so the page is never empty.
  const seeded = [
    {
      id: "seed-welcome",
      actorId: "o_silanga",
      text: "Welcome to Msingi. Complete verification to earn your Verified seal.",
      href: "/verification",
    },
    {
      id: "seed-call",
      actorId: fundingCalls[0]?.funderId ?? meId,
      text: `New funding call: “${fundingCalls[0]?.title ?? "Open call"}”.`,
      href: fundingCalls[0] ? `/calls/${fundingCalls[0].id}` : "/calls",
    },
  ]

  const all = [...items, ...seeded]

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Notifications</h1>
        <p className="mt-1 text-sm text-muted-foreground">Recent activity across your Msingi network.</p>
      </div>

      <ul className="flex flex-col gap-2">
        {all.map((n) => {
          const a = getActor(n.actorId)
          return (
            <li key={n.id}>
              <Link
                href={n.href}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                {a && <Avatar name={a.name} color={a.avatarColor} size={40} />}
                <p className="text-sm text-foreground">{n.text}</p>
              </Link>
            </li>
          )
        })}
      </ul>
    </AppShell>
  )
}
