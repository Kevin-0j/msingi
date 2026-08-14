"use client"

import { useState } from "react"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { ThemeChip } from "@/components/stat-chip"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import type { Event, TicketType } from "@/lib/types"
import { Accessibility, CalendarDays, Check, MapPin, Ticket, X } from "lucide-react"

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-KE", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function fmtPrice(kes: number) {
  return kes === 0 ? "Free" : `KES ${kes.toLocaleString("en-KE")}`
}

export default function EventsPage() {
  const { events } = useStore()
  const upcoming = [...events].sort((a, b) => a.startsAt.localeCompare(b.startsAt))

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="font-display text-2xl text-foreground">Events</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Practical sessions run by workers, organisations and funders. Worker places are free.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          No events scheduled right now.
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {upcoming.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </ul>
      )}
    </AppShell>
  )
}

function EventCard({ event }: { event: Event }) {
  const { getActor, eventRegistrations, registerForEvent, meId } = useStore()
  const host = getActor(event.hostId)
  const registration = eventRegistrations.find(
    (r) => r.eventId === event.id && r.attendeeId === meId,
  )
  const [choosing, setChoosing] = useState(false)

  const registeredTicket: TicketType | undefined = registration
    ? event.ticketTypes.find((t) => t.id === registration.ticketTypeId)
    : undefined

  return (
    <li className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start gap-3">
        {host && (
          <Link href={`/profile/${host.id}`} aria-hidden="true" tabIndex={-1}>
            <Avatar name={host.name} color={host.avatarColor} size={44} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg leading-snug text-foreground text-pretty">
            {event.title}
          </h2>
          {host && (
            <Link
              href={`/profile/${host.id}`}
              className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground hover:underline"
            >
              {host.name}
              {host.verificationStatus === "verified" && <VerifiedSeal size={13} />}
            </Link>
          )}
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{event.summary}</p>

      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <CalendarDays size={15} aria-hidden="true" /> {fmtDate(event.startsAt)}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin size={15} aria-hidden="true" /> {event.location}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {event.themes.map((t) => (
          <ThemeChip key={t} label={t} />
        ))}
      </div>

      {/* Access provisions, stated before booking rather than on request. */}
      <div className="mt-3 rounded-lg border border-border bg-secondary/40 p-3">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Accessibility size={15} className="text-primary" aria-hidden="true" />
          Accessibility
        </p>
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {[
            { on: event.accessibility.signLanguage, label: "Kenyan Sign Language" },
            { on: event.accessibility.liveCaptions, label: "Live captions" },
            { on: event.accessibility.wheelchairAccessible, label: "Wheelchair accessible" },
            { on: event.accessibility.materialsInLargePrint, label: "Large-print materials" },
          ].map((a) => (
            <li
              key={a.label}
              className={cn(
                "flex items-center gap-1.5 text-sm",
                a.on ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {/* Provision is marked by icon AND wording, never colour alone. */}
              {a.on ? (
                <Check size={14} className="shrink-0 text-impact" aria-hidden="true" />
              ) : (
                <X size={14} className="shrink-0" aria-hidden="true" />
              )}
              {a.label}
              <span className="sr-only">{a.on ? ": available" : ": not available"}</span>
            </li>
          ))}
        </ul>
        {event.accessibility.notes && (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {event.accessibility.notes}
          </p>
        )}
      </div>

      {registration && registeredTicket ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-impact/30 bg-impact/10 p-3 text-sm">
          <Check size={16} className="shrink-0 text-impact" aria-hidden="true" />
          <span className="text-foreground">
            You&apos;re registered: {registeredTicket.name} ({fmtPrice(registeredTicket.price)})
          </span>
        </div>
      ) : choosing ? (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Choose a ticket
          </p>
          {event.ticketTypes.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                registerForEvent(event.id, t.id)
                setChoosing(false)
              }}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/40"
            >
              <span className="min-w-0">
                <span className="block text-sm font-medium text-foreground">{t.name}</span>
                <span className="block text-xs text-muted-foreground">{t.note}</span>
              </span>
              <span className="shrink-0 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {fmtPrice(t.price)}
              </span>
            </button>
          ))}
          <button
            onClick={() => setChoosing(false)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setChoosing(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Ticket size={16} aria-hidden="true" /> Get a ticket
        </button>
      )}
    </li>
  )
}
