"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useStore } from "@/lib/store"
import { ROLE_LABEL, type Role } from "@/lib/types"
import { cn } from "@/lib/utils"
import { Eye, X } from "lucide-react"

const ROLES: Role[] = ["worker", "organization", "funder", "admin"]

export function RoleSwitcher() {
  const { role, setRole } = useStore()
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Hide on the public landing page.
  if (pathname === "/") return null

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-6">
      {open ? (
        <div className="w-72 rounded-xl border border-border bg-card p-3 shadow-[var(--shadow-lift)]">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Demo: view as
            </span>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted"
              aria-label="Close role switcher"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-col gap-1.5">
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors",
                  role === r
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/40",
                )}
              >
                {ROLE_LABEL[r]}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-lift)] transition-transform hover:-translate-y-0.5"
        >
          <Eye size={16} aria-hidden="true" />
          <span>Viewing: {ROLE_LABEL[role]}</span>
        </button>
      )}
    </div>
  )
}
