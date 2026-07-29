"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { useStore } from "@/lib/store"
import { Avatar } from "@/components/avatar"
import { VerifiedSeal } from "@/components/verified-seal"
import { cn } from "@/lib/utils"
import {
  Home,
  Search,
  MessageSquare,
  Banknote,
  ShieldCheck,
  Bell,
  CalendarDays,
  BookOpen,
  Sparkles,
  Users,
  CreditCard,
} from "lucide-react"

const NAV = [
  { href: "/feed", label: "Discover", icon: Home },
  { href: "/search", label: "Directory", icon: Search },
  { href: "/messages", label: "Messages", icon: MessageSquare },
  { href: "/calls", label: "Funding", icon: Banknote },
]

const MORE_NAV = [
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/research", label: "Research Hub", icon: BookOpen },
  { href: "/assistant", label: "Funder Assistant", icon: Sparkles },
  { href: "/consortium", label: "Consortium", icon: Users },
  { href: "/pricing", label: "Plans & boost", icon: CreditCard },
]

export function AppShell({
  children,
  right,
}: {
  children: ReactNode
  right?: ReactNode
}) {
  const pathname = usePathname()
  const { meId, getActor, role } = useStore()
  const me = getActor(meId)

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/feed" className="font-display text-xl font-semibold text-primary">
            Msingi
          </Link>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/verification"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted sm:flex"
            >
              <ShieldCheck size={16} /> Verification
            </Link>
            {role === "admin" && (
              <Link
                href="/admin"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary-tint"
              >
                Admin
              </Link>
            )}
            <Link
              href="/notifications"
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell size={18} />
            </Link>
            {me && (
              <Link href={`/profile/${me.id}`} aria-label="My profile">
                <Avatar name={me.name} color={me.avatarColor} size={32} />
              </Link>
            )}
          </div>
        </div>

        {/* Secondary nav: the left rail is hidden below lg, so surface it here */}
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:hidden">
          {MORE_NAV.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary-tint text-primary"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon size={14} /> {item.label}
              </Link>
            )
          })}
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        {/* Left column */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">
            {me && (
              <Link
                href={`/profile/${me.id}`}
                className="block rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
              >
                <Avatar name={me.name} color={me.avatarColor} size={48} />
                <div className="mt-3 flex items-center gap-1 font-semibold text-foreground">
                  {me.name}
                  {me.verificationStatus === "verified" && <VerifiedSeal size={14} />}
                </div>
                <p className="text-sm text-muted-foreground">{me.subtitle}</p>
                <p className="text-xs text-muted-foreground">{me.location}</p>
              </Link>
            )}
            <nav className="rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-soft)]">
              {NAV.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-tint text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon size={18} /> {item.label}
                  </Link>
                )
              })}
              <div className="my-2 border-t border-border" />
              {MORE_NAV.map((item) => {
                const active = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-tint text-primary"
                        : "text-muted-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon size={18} /> {item.label}
                  </Link>
                )
              })}
            </nav>
          </div>
        </aside>

        {/* Center */}
        <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>

        {/* Right column */}
        {right && (
          <aside className="hidden w-72 shrink-0 xl:block">
            <div className="sticky top-20 space-y-4">{right}</div>
          </aside>
        )}
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border bg-background md:hidden">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 py-2 text-xs",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
