import Link from "next/link"
import Image from "next/image"
import { Stethoscope, Building2, HandCoins, ArrowRight } from "lucide-react"
import { funders, sponsorTiers } from "@/data/mock"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <span className="font-display text-2xl font-semibold text-primary">Afyashinani</span>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            Log in
          </Link>
          <Link
            href="/feed"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Enter demo
          </Link>
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-10 md:grid-cols-2 md:py-16">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-primary-tint px-3 py-1 text-sm font-medium text-primary">
            For frontline health workers in Kenya
          </p>
          <h1 className="font-display text-4xl font-semibold leading-tight text-foreground text-balance md:text-5xl">
            The real work of frontline health, in plain words.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            No flowery titles. Just what happened. &ldquo;Last week in Kibera we ran a 3-day
            clinic, saw 214 mothers, biggest gap is night-time emergency transport.&rdquo;
            Afyashinani connects grassroots health workers in Kenya with funders who back real,
            credible work.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/feed"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Explore the feed <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-medium text-foreground hover:border-primary/40"
            >
              Create an account
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border shadow-[var(--shadow-lift)]">
          <Image
            src="/photos/maternal-clinic.png"
            alt="Community maternal health clinic in Kibera, Kenya"
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 560px"
          />
        </div>
      </section>

      {/* Mission */}
      <section className="border-y border-border bg-primary-tint/40 px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Our mission
          </p>
          <p className="mt-3 font-display text-2xl font-semibold leading-snug text-foreground text-balance md:text-3xl">
            Connecting grassroot health partners for innovative, impactful, accessible and
            measurable health solutions at the grassroots.
          </p>
          <p className="mt-5 font-display text-lg italic text-primary">
            &ldquo;Alone we can go fast, together we can go far.&rdquo;
          </p>
        </div>
      </section>

      {/* Three categories */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-semibold text-foreground">Three ways in</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Door
            icon={Stethoscope}
            title="For health workers"
            body="Show your real impact. Build a CV that reflects the work, not the jargon. Get seen by funders."
          />
          <Door
            icon={Building2}
            title="For health service providers"
            body="Clinics, CBOs and NGOs: put your communities and needs in front of people who fund frontline work."
          />
          <Door
            icon={HandCoins}
            title="For health funding organisations"
            body="Find credible frontline teams by the work they actually do. Post calls, back real people."
          />
        </div>
      </section>

      {/* Impact snippets */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Real numbers, real places
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Snippet
            place="Silanga, Kibera"
            text="214 mothers seen · 47 first antenatal visits · 12 high-risk referrals."
          />
          <Snippet
            place="Kalokol, Turkana"
            text="180 households · 320 children screened · 28 enrolled for feeding."
          />
          <Snippet
            place="Mathare 4A"
            text="96 contacts traced · 9 new TB cases found · 6 started on treatment."
          />
        </div>
      </section>

      {/* Sponsors: public disclosure of who funds the platform. */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Backed by our sponsors
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Health funding organisations that support the network itself. Sponsorship is public,
          and never affects who gets funded.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {[...sponsorTiers]
            .sort((a, b) => b.rank - a.rank)
            .flatMap((tier) =>
              funders
                .filter((f) => f.sponsorTierId === tier.id)
                .map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
                    style={{ borderTopColor: tier.badgeColor, borderTopWidth: 3 }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white"
                      style={{ backgroundColor: f.avatarColor }}
                    >
                      {f.name
                        .split(" ")
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{f.name}</p>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide"
                        style={{ color: tier.badgeColor }}
                      >
                        {tier.name} sponsor
                      </p>
                    </div>
                  </div>
                )),
            )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 text-center">
        <h2 className="font-display text-3xl font-semibold text-foreground text-balance">
          The foundation for grassroots health work.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground text-pretty">
          Join the network built for the people doing the work on the ground.
        </p>
        <Link
          href="/signup"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Get started <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>

      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        Afyashinani, a network for grassroots health workers. Demo build with mock data.
      </footer>
    </div>
  )
}

function Door({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  body: string
}) {
  return (
    <Link
      href="/feed"
      className="group rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]"
    >
      <span className="inline-flex rounded-lg bg-primary-tint p-2.5 text-primary">
        <Icon size={22} />
      </span>
      <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
        Enter <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </Link>
  )
}

function Snippet({ place, text }: { place: string; text: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <p className="text-sm font-medium text-impact">{place}</p>
      <p className="mt-2 leading-relaxed text-foreground">{text}</p>
    </div>
  )
}
