import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Newsreader } from "next/font/google"
import { StoreProvider } from "@/lib/store"
import { RoleSwitcher } from "@/components/role-switcher"
import "./globals.css"

// display:"swap" shows text immediately in a fallback face rather than
// blocking on the webfont, which matters most on the slow mobile
// connections much of this audience is actually on.
// Newsreader is display-only (headings), so it is not preloaded.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
})

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
})

export const metadata: Metadata = {
  title: "Afyashinani: grassroot health partners for innovative, impactful, accessible and measurable health solutions",
  description:
    "Connecting grassroot health partners for innovative, impactful, accessible and measurable health solutions at the grassroots. Alone we can go fast, together we can go far.",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  applicationName: "Afyashinani",
  appleWebApp: { capable: true, title: "Afyashinani", statusBarStyle: "default" },
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#146879",
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`bg-background ${inter.variable} ${newsreader.variable}`}>
      <body className="antialiased font-sans">
        <StoreProvider>
          {children}
          <RoleSwitcher />
        </StoreProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
