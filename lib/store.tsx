"use client"

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react"
import {
  workers as seedWorkers,
  organizations as seedOrgs,
  funders as seedFunders,
  posts as seedPosts,
  comments as seedComments,
  fundingCalls as seedCalls,
  submissions as seedSubmissions,
  conversations as seedConversations,
  verificationRequests as seedVerifications,
  events as seedEvents,
  publications as seedPublications,
  plans as seedPlans,
  sponsorTiers as seedSponsorTiers,
} from "@/data/mock"
import type {
  User,
  Organization,
  Funder,
  ImpactPost,
  Comment,
  FundingCall,
  Conversation,
  Message,
  VerificationRequest,
  VerificationSubjectType,
  Submission,
  Role,
  VerificationStatus,
  SubscriptionTier,
  Event,
  EventRegistration,
  Publication,
  PublicationPurchase,
  Theme,
  OrgType,
  FunderType,
  SponsorTier,
} from "@/lib/types"
import { COMMISSION_RATE } from "@/lib/types"

// Bump this whenever seeded copy or shape changes: persisted state snapshots the
// seed data, so an old key would keep serving stale text to returning visitors.
const STORAGE_KEY = "afyashinani.state.v2"

// A verified seal is trusted for 12 months before it needs renewing, the
// same discipline real verification platforms (Stripe Identity, Candid's
// Seal of Transparency) use so a stale document can't back a live claim
// indefinitely.
const VERIFICATION_VALIDITY_DAYS = 365

// Normalized actor used across profiles / messaging / follow.
export interface Actor {
  id: string
  kind: "worker" | "organization" | "funder"
  name: string
  subtitle: string
  location: string
  avatarColor: string
  verificationStatus: VerificationStatus
  sponsorTierId?: string // funders only
}

interface PersistState {
  role: Role
  signedIn: boolean
  posts: ImpactPost[]
  comments: Comment[]
  conversations: Conversation[]
  verificationRequests: VerificationRequest[]
  fundingCalls: FundingCall[]
  submissions: Submission[]
  eventRegistrations: EventRegistration[]
  publicationPurchases: PublicationPurchase[]
  createdPublications: Publication[]
  supports: string[] // post ids the current demo has supported
  following: string[] // actor ids
  connections: string[] // actor ids
  // verification overrides keyed by subject id
  verifiedOverrides: Record<string, VerificationStatus>
  // subscription plan id per role, so the paywall gate is switchable in the demo
  planByRole: Record<Role, string>
  // sponsor tier overrides keyed by funder id; null means explicitly cleared
  sponsorOverrides: Record<string, string | null>
  // profiles created through onboarding, alongside the seeded ones
  createdWorkers: User[]
  createdOrgs: Organization[]
  createdFunders: Funder[]
  // when you sign up, the role you created points at your own profile
  meOverrideByRole: Partial<Record<Role, string>>
}

// The seeded demo "me" for each role, used until you create your own profile.
const ME_BY_ROLE: Record<Role, string> = {
  worker: "u_amina",
  organization: "o_silanga",
  funder: "f_ubuntu",
  admin: "admin_1",
}

const defaultState: PersistState = {
  role: "worker",
  signedIn: false,
  posts: seedPosts,
  comments: seedComments,
  conversations: seedConversations,
  verificationRequests: seedVerifications,
  fundingCalls: seedCalls,
  submissions: seedSubmissions,
  eventRegistrations: [],
  publicationPurchases: [],
  createdPublications: [],
  supports: [],
  following: [],
  connections: [],
  verifiedOverrides: {},
  planByRole: {
    worker: "plan_free",
    organization: "plan_free",
    funder: "plan_institution",
    admin: "plan_institution",
  },
  sponsorOverrides: {},
  createdWorkers: [],
  createdOrgs: [],
  createdFunders: [],
  meOverrideByRole: {},
}

export interface OnboardingInput {
  role: Role
  name: string
  /** Worker job title. Ignored for orgs and funders. */
  title?: string
  orgType?: OrgType
  funderType?: FunderType
  location: string
  about: string
  focusAreas: Theme[]
  /** Organization ids a worker is affiliated with. */
  affiliations?: string[]
}

// Deterministic palette so a new profile still looks like it belongs.
const AVATAR_COLORS = ["#146879", "#3e7d5b", "#c98a3c", "#b4472f"]

interface StoreValue extends PersistState {
  meId: string
  // lookups
  getWorker: (id: string) => User | undefined
  getOrg: (id: string) => Organization | undefined
  getFunder: (id: string) => Funder | undefined
  getActor: (id: string) => Actor | undefined
  workers: User[]
  organizations: Organization[]
  funders: Funder[]
  events: Event[]
  publications: Publication[]
  sponsorTiers: SponsorTier[]
  verifStatusOf: (id: string, fallback: VerificationStatus) => VerificationStatus
  /** The expiry date of the subject's most recent verified request, if any. */
  verificationExpiryOf: (id: string) => string | undefined
  /** The subject's most recent verification request of any status, if any. */
  latestVerificationRequestOf: (id: string) => VerificationRequest | undefined
  sponsorTierIdOf: (id: string, fallback?: string) => string | undefined
  myPlanId: string
  myTier: SubscriptionTier
  mySponsorTierId: string | undefined
  // actions
  setRole: (r: Role) => void
  setSignedIn: (v: boolean) => void
  setPlan: (planId: string) => void
  /** Creates the profile captured during onboarding and signs in as it. */
  completeOnboarding: (input: OnboardingInput) => string
  /** Signs in as a specific profile, pinning who "me" is for that role. */
  signInAs: (role: Role, actorId: string) => void
  addPost: (p: Omit<ImpactPost, "id" | "createdAt" | "authorId">) => string
  addComment: (postId: string, text: string) => void
  toggleSupport: (postId: string) => void
  toggleFollow: (actorId: string) => void
  toggleConnect: (actorId: string) => void
  sendMessage: (conversationId: string, text: string) => void
  startConversation: (otherId: string) => string
  submitVerification: (input: {
    subjectId: string
    subjectType: VerificationSubjectType
    legalName: string
    identifierNumber: string
    documents: { key: string; name: string; size: string }[]
    note: string
  }) => { ok: true } | { ok: false; error: string }
  reviewVerification: (requestId: string, decision: "verified" | "rejected") => void
  /** Demo-only: clears a subject's seal so the request → review → approve flow can be replayed. */
  resetVerification: (subjectId: string) => void
  /** Demo-only: backdates the subject's verification so the renewal-lapse behaviour can be shown live. */
  simulateVerificationExpiry: (subjectId: string) => void
  addSubmission: (callId: string, type: "interest" | "application", note: string) => void
  setSubmissionStatus: (submissionId: string, status: Submission["status"]) => void
  addFundingCall: (
    call: Omit<FundingCall, "id" | "createdAt" | "funderId" | "theme"> & { theme?: Theme },
  ) => string
  registerForEvent: (eventId: string, ticketTypeId: string) => void
  addPublication: (p: Omit<Publication, "id" | "createdAt" | "authorId">) => string
  purchasePublication: (publicationId: string) => void
  hasPurchased: (publicationId: string) => boolean
  setSponsorTier: (tierId: string | null) => void
}

const StoreContext = createContext<StoreValue | null>(null)

// ---------------------------------------------------------------------------
// External store backed by localStorage.
//
// Read through useSyncExternalStore rather than a hydrate-in-useEffect: the
// server snapshot is always the seed data, so server HTML and the hydration
// pass agree, and React re-renders with the persisted snapshot straight after.
// No hydration mismatch, no setState inside an effect.
// ---------------------------------------------------------------------------

function readStoredState(): PersistState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...defaultState, ...(JSON.parse(raw) as Partial<PersistState>) }
  } catch {
    // corrupt or unavailable storage, so fall back to seed data
  }
  return defaultState
}

// Hydrated once, at module load, on the client only.
let liveState: PersistState =
  typeof window === "undefined" ? defaultState : readStoredState()

const listeners = new Set<() => void>()

function subscribeToStore(onChange: () => void) {
  listeners.add(onChange)
  return () => {
    listeners.delete(onChange)
  }
}

const getStoreSnapshot = () => liveState
const getServerSnapshot = () => defaultState

function setState(update: (prev: PersistState) => PersistState) {
  const next = update(liveState)
  if (next === liveState) return
  liveState = next
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // ignore, the demo still works from memory
  }
  listeners.forEach((l) => l())
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    subscribeToStore,
    getStoreSnapshot,
    getServerSnapshot,
  )

  const value = useMemo<StoreValue>(() => {
    // Your own onboarding-created profile wins over the seeded demo persona.
    const meId = state.meOverrideByRole[state.role] ?? ME_BY_ROLE[state.role]
    const myPlanId = state.planByRole[state.role] ?? "plan_free"

    // Created profiles first so they lead the directory and suggestion lists.
    const allWorkers = [...state.createdWorkers, ...seedWorkers]
    const allOrgs = [...state.createdOrgs, ...seedOrgs]
    const allFunders = [...state.createdFunders, ...seedFunders]
    const allPublications = [...state.createdPublications, ...seedPublications]

    const getWorker = (id: string) => allWorkers.find((w) => w.id === id)
    const getOrg = (id: string) => allOrgs.find((o) => o.id === id)
    const getFunder = (id: string) => allFunders.find((f) => f.id === id)

    // The latest verification request for a subject, across every status,
    // most recent first. Several helpers below need this same lookup.
    const requestsFor = (id: string) =>
      state.verificationRequests
        .filter((r) => r.subjectId === id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))

    const latestVerificationRequestOf = (id: string) => requestsFor(id)[0]

    const verificationExpiryOf = (id: string) =>
      requestsFor(id).find((r) => r.status === "verified" && r.expiresAt)?.expiresAt

    // A verified seal that has passed its expiry stops counting as verified
    // until it's renewed — trust lapses automatically rather than staying
    // valid forever on a document nobody has re-checked.
    const verifStatusOf = (id: string, fallback: VerificationStatus): VerificationStatus => {
      const status = state.verifiedOverrides[id] ?? fallback
      if (status === "verified") {
        const expiresAt = verificationExpiryOf(id)
        if (expiresAt && expiresAt < new Date().toISOString()) return "pending"
      }
      return status
    }

    const sponsorTierIdOf = (id: string, fallback?: string) =>
      id in state.sponsorOverrides ? (state.sponsorOverrides[id] ?? undefined) : fallback

    const getActor = (id: string): Actor | undefined => {
      const w = getWorker(id)
      if (w)
        return {
          id: w.id,
          kind: "worker",
          name: w.name,
          subtitle: w.title,
          location: w.location,
          avatarColor: w.avatarColor,
          verificationStatus: verifStatusOf(w.id, w.verificationStatus),
        }
      const o = getOrg(id)
      if (o)
        return {
          id: o.id,
          kind: "organization",
          name: o.name,
          subtitle: orgTypeLabel(o.type),
          location: o.location,
          avatarColor: o.avatarColor,
          verificationStatus: verifStatusOf(o.id, o.verificationStatus),
        }
      const f = getFunder(id)
      if (f)
        return {
          id: f.id,
          kind: "funder",
          name: f.name,
          subtitle: funderTypeLabel(f.type),
          location: f.location,
          avatarColor: f.avatarColor,
          verificationStatus: verifStatusOf(f.id, f.verificationStatus),
          sponsorTierId: sponsorTierIdOf(f.id, f.sponsorTierId),
        }
      if (id.startsWith("admin"))
        return {
          id,
          kind: "worker",
          name: "Afyashinani Admin",
          subtitle: "Verification team",
          location: "Nairobi",
          avatarColor: "#1b2a30",
          verificationStatus: "verified",
        }
      return undefined
    }

    const setRole = (r: Role) => setState((s) => ({ ...s, role: r }))
    const setSignedIn = (v: boolean) => setState((s) => ({ ...s, signedIn: v }))
    const signInAs: StoreValue["signInAs"] = (r, actorId) =>
      setState((s) => ({
        ...s,
        role: r,
        signedIn: true,
        meOverrideByRole: { ...s.meOverrideByRole, [r]: actorId },
      }))

    const completeOnboarding: StoreValue["completeOnboarding"] = (input) => {
      const now = new Date().toISOString()
      const stamp = Date.now()
      const color = AVATAR_COLORS[stamp % AVATAR_COLORS.length]

      if (input.role === "organization") {
        const id = `o_new_${stamp}`
        const org: Organization = {
          id,
          name: input.name,
          type: input.orgType ?? "cbo",
          location: input.location,
          focusAreas: input.focusAreas,
          about: input.about,
          currentWork: input.about,
          communities: [],
          nextFocus: "",
          memberIds: [],
          verificationStatus: "unverified",
          avatarColor: color,
          createdAt: now,
        }
        setState((s) => ({
          ...s,
          createdOrgs: [org, ...s.createdOrgs],
          meOverrideByRole: { ...s.meOverrideByRole, organization: id },
          signedIn: true,
          role: "organization",
        }))
        return id
      }

      if (input.role === "funder") {
        const id = `f_new_${stamp}`
        const funder: Funder = {
          id,
          name: input.name,
          type: input.funderType ?? "foundation",
          location: input.location,
          focusAreas: input.focusAreas,
          supports: input.about,
          backed: [],
          avatarColor: color,
          verificationStatus: "unverified",
          createdAt: now,
        }
        setState((s) => ({
          ...s,
          createdFunders: [funder, ...s.createdFunders],
          meOverrideByRole: { ...s.meOverrideByRole, funder: id },
          signedIn: true,
          role: "funder",
        }))
        return id
      }

      const id = `u_new_${stamp}`
      const worker: User = {
        id,
        role: "worker",
        name: input.name,
        title: input.title?.trim() || "Community health worker",
        location: input.location,
        focusAreas: input.focusAreas,
        bio: input.about,
        avatarColor: color,
        verificationStatus: "unverified",
        subscriptionTier: "free",
        affiliations: input.affiliations ?? [],
        experience: [],
        cumulativeStats: [],
        createdAt: now,
      }
      setState((s) => ({
        ...s,
        createdWorkers: [worker, ...s.createdWorkers],
        meOverrideByRole: { ...s.meOverrideByRole, worker: id },
        signedIn: true,
        role: "worker",
      }))
      return id
    }

    const setPlan = (planId: string) =>
      setState((s) => ({
        ...s,
        planByRole: { ...s.planByRole, [s.role]: planId },
      }))

    const addPost: StoreValue["addPost"] = (p) => {
      const id = `p_${Date.now()}`
      const post: ImpactPost = {
        ...p,
        id,
        authorId: meId,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, posts: [post, ...s.posts] }))
      return id
    }

    const addComment: StoreValue["addComment"] = (postId, text) => {
      const c: Comment = {
        id: `c_${Date.now()}`,
        postId,
        authorId: meId,
        text,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, comments: [...s.comments, c] }))
    }

    const toggleSupport: StoreValue["toggleSupport"] = (postId) =>
      setState((s) => ({
        ...s,
        supports: s.supports.includes(postId)
          ? s.supports.filter((x) => x !== postId)
          : [...s.supports, postId],
      }))

    const toggleFollow: StoreValue["toggleFollow"] = (actorId) =>
      setState((s) => ({
        ...s,
        following: s.following.includes(actorId)
          ? s.following.filter((x) => x !== actorId)
          : [...s.following, actorId],
      }))

    const toggleConnect: StoreValue["toggleConnect"] = (actorId) =>
      setState((s) => ({
        ...s,
        connections: s.connections.includes(actorId)
          ? s.connections.filter((x) => x !== actorId)
          : [...s.connections, actorId],
      }))

    const sendMessage: StoreValue["sendMessage"] = (conversationId, text) => {
      const msg: Message = {
        id: `m_${Date.now()}`,
        conversationId,
        senderId: meId,
        text,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({
        ...s,
        conversations: s.conversations.map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, msg], updatedAt: msg.createdAt }
            : c,
        ),
      }))
    }

    const startConversation: StoreValue["startConversation"] = (otherId) => {
      const existing = state.conversations.find(
        (c) =>
          c.participantIds.includes(meId) && c.participantIds.includes(otherId),
      )
      if (existing) return existing.id
      const id = `conv_${Date.now()}`
      const conv: Conversation = {
        id,
        participantIds: [meId, otherId],
        messages: [],
        updatedAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, conversations: [conv, ...s.conversations] }))
      return id
    }

    const submitVerification: StoreValue["submitVerification"] = (input) => {
      const { subjectId, subjectType, legalName, identifierNumber, documents, note } = input

      // Fraud control: the same license/registration/ID number can't back a
      // pending or verified claim on two different accounts at once. A
      // rejected prior attempt doesn't block a fresh, corrected submission.
      const normalized = identifierNumber.trim().toLowerCase()
      const collision = state.verificationRequests.find(
        (r) =>
          r.subjectId !== subjectId &&
          r.status !== "rejected" &&
          r.identifierNumber.trim().toLowerCase() === normalized,
      )
      if (collision) {
        return {
          ok: false,
          error:
            "This registration/license number is already linked to another Afyashinani account. Contact support if this is a mistake.",
        }
      }

      const req: VerificationRequest = {
        id: `vr_${Date.now()}`,
        subjectId,
        subjectType,
        legalName,
        identifierNumber,
        documents,
        note,
        status: "pending",
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({
        ...s,
        verificationRequests: [
          req,
          ...s.verificationRequests.filter(
            (r) => !(r.subjectId === subjectId && r.status === "pending"),
          ),
        ],
        verifiedOverrides: { ...s.verifiedOverrides, [subjectId]: "pending" },
      }))
      return { ok: true }
    }

    const reviewVerification: StoreValue["reviewVerification"] = (requestId, decision) =>
      setState((s) => {
        const req = s.verificationRequests.find((r) => r.id === requestId)
        const now = new Date()
        const expiresAt =
          decision === "verified"
            ? new Date(now.getTime() + VERIFICATION_VALIDITY_DAYS * 86400000).toISOString()
            : undefined
        return {
          ...s,
          verificationRequests: s.verificationRequests.map((r) =>
            r.id === requestId
              ? { ...r, status: decision, reviewedAt: now.toISOString(), reviewedBy: meId, expiresAt }
              : r,
          ),
          verifiedOverrides: req
            ? { ...s.verifiedOverrides, [req.subjectId]: decision }
            : s.verifiedOverrides,
        }
      })

    const resetVerification: StoreValue["resetVerification"] = (subjectId) =>
      setState((s) => ({
        ...s,
        verifiedOverrides: { ...s.verifiedOverrides, [subjectId]: "unverified" },
        verificationRequests: s.verificationRequests.filter((r) => r.subjectId !== subjectId),
      }))

    const simulateVerificationExpiry: StoreValue["simulateVerificationExpiry"] = (subjectId) =>
      setState((s) => ({
        ...s,
        verificationRequests: s.verificationRequests.map((r) =>
          r.subjectId === subjectId && r.status === "verified"
            ? { ...r, expiresAt: new Date(Date.now() - 86400000).toISOString() }
            : r,
        ),
      }))

    const addSubmission: StoreValue["addSubmission"] = (callId, type, note) => {
      const sub: Submission = {
        id: `sub_${Date.now()}`,
        callId,
        applicantId: meId,
        type,
        note,
        status: "sent",
        createdAt: new Date().toISOString(),
      }
      // One submission per call per applicant: applying replaces an earlier interest.
      setState((s) => ({
        ...s,
        submissions: [
          sub,
          ...s.submissions.filter(
            (x) => !(x.callId === callId && x.applicantId === meId),
          ),
        ],
      }))
    }

    const setSubmissionStatus: StoreValue["setSubmissionStatus"] = (id, status) =>
      setState((s) => ({
        ...s,
        submissions: s.submissions.map((x) => (x.id === id ? { ...x, status } : x)),
      }))

    const addFundingCall: StoreValue["addFundingCall"] = (call) => {
      const id = `fc_${Date.now()}`
      const next: FundingCall = {
        ...call,
        id,
        funderId: meId,
        theme: call.theme ?? call.themes[0] ?? "Maternal health",
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, fundingCalls: [next, ...s.fundingCalls] }))
      return id
    }

    const registerForEvent: StoreValue["registerForEvent"] = (eventId, ticketTypeId) =>
      setState((s) => ({
        ...s,
        eventRegistrations: [
          {
            id: `reg_${Date.now()}`,
            eventId,
            ticketTypeId,
            attendeeId: meId,
            createdAt: new Date().toISOString(),
          },
          ...s.eventRegistrations.filter(
            (r) => !(r.eventId === eventId && r.attendeeId === meId),
          ),
        ],
      }))

    const addPublication: StoreValue["addPublication"] = (p) => {
      const id = `pub_${Date.now()}`
      const pub: Publication = {
        ...p,
        id,
        authorId: meId,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, createdPublications: [pub, ...s.createdPublications] }))
      return id
    }

    const purchasePublication: StoreValue["purchasePublication"] = (publicationId) => {
      const pub = allPublications.find((p) => p.id === publicationId)
      if (!pub) return
      const gross = pub.priceKes
      setState((s) =>
        s.publicationPurchases.some(
          (p) => p.publicationId === publicationId && p.buyerId === meId,
        )
          ? s
          : {
              ...s,
              publicationPurchases: [
                {
                  id: `buy_${Date.now()}`,
                  publicationId,
                  buyerId: meId,
                  grossKes: gross,
                  commissionKes: Math.round(gross * COMMISSION_RATE),
                  createdAt: new Date().toISOString(),
                },
                ...s.publicationPurchases,
              ],
            },
      )
    }

    const hasPurchased: StoreValue["hasPurchased"] = (publicationId) =>
      state.publicationPurchases.some(
        (p) => p.publicationId === publicationId && p.buyerId === meId,
      )

    const setSponsorTier: StoreValue["setSponsorTier"] = (tierId) =>
      setState((s) => ({
        ...s,
        sponsorOverrides: { ...s.sponsorOverrides, [meId]: tierId },
      }))

    return {
      ...state,
      meId,
      getWorker,
      getOrg,
      getFunder,
      getActor,
      workers: allWorkers,
      organizations: allOrgs,
      funders: allFunders,
      events: seedEvents,
      publications: allPublications,
      sponsorTiers: seedSponsorTiers,
      verifStatusOf,
      verificationExpiryOf,
      latestVerificationRequestOf,
      sponsorTierIdOf,
      myPlanId,
      myTier: seedPlans.find((p) => p.id === myPlanId)?.tier ?? "free",
      mySponsorTierId: (() => {
        const f = getFunder(meId)
        return f ? sponsorTierIdOf(f.id, f.sponsorTierId) : undefined
      })(),
      setRole,
      setSignedIn,
      setPlan,
      completeOnboarding,
      signInAs,
      addPost,
      addComment,
      toggleSupport,
      toggleFollow,
      toggleConnect,
      sendMessage,
      startConversation,
      submitVerification,
      reviewVerification,
      resetVerification,
      simulateVerificationExpiry,
      addSubmission,
      setSubmissionStatus,
      addFundingCall,
      registerForEvent,
      addPublication,
      purchasePublication,
      hasPurchased,
      setSponsorTier,
    }
  }, [state])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export function orgTypeLabel(t: Organization["type"]): string {
  return {
    "private-clinic": "Private not-for-profit clinic",
    cbo: "Community-based organisation",
    "local-ngo": "Local NGO",
    "international-ngo": "International NGO",
    "trust-foundation": "Trust / foundation",
    "research-institution": "Research / educational institution",
  }[t]
}

export function funderTypeLabel(t: Funder["type"]): string {
  return {
    foundation: "Foundation",
    donor: "Donor",
    government: "County / national government",
    "health-partner": "Health-sector partner",
  }[t]
}
