import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter, Newsreader } from "next/font/google"
import { StoreProvider } from "@/lib/store"
import { RoleSwitcher } from "@/components/role-switcher"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const newsreader = Newsreader({ subsets: ["latin"], variable: "--font-newsreader" })

export const metadata: Metadata = {
  title: "Msingi — the network for grassroots health workers",
  description:
    "A professional network, funding marketplace and knowledge hub for grassroots health workers in Kenya. Plain, practical, human. The opposite of LinkedIn.",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  applicationName: "Msingi",
  appleWebApp: { capable: true, title: "Msingi", statusBarStyle: "default" },
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
