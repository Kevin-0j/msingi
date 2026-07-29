"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useStore } from "@/lib/store"
import type { Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Eye, X } from "lucide-react"

const ROLES: { role: Role; label: string }[] = [
  { role: "worker", label: "Worker" },
  { role: "organization", label: "Organization" },
  { role: "funder", label: "Funder" },
  { role: "admin", label: "Admin" },
]

export function RoleSwitcher() {
  const { role, setRole } = useStore()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Hide on the public landing page.
  if (pathname === "/") return null

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      {open ? (
        <div className="w-56 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-lift)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demo: view as
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              aria-label="Close role switcher"
            >
              <X size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.role}
                onClick={() => setRole(r.role)}
                className={cn(
                  "rounded-lg border px-2 py-2 text-sm font-medium transition-colors",
                  role === r.role
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
        >
          <Eye size={16} />
          <span className="capitalize">Viewing: {role}</span>
        </button>
      )}
    </div>
  )
}
