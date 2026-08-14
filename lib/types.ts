// Domain types for Afyashinani. Shapes map cleanly to Firestore collections later:
// string ids, ISO timestamps, flat references by id.

export type Role = "worker" | "organization" | "funder" | "admin"

// Public-facing category names for the three account types. The internal
// Role slugs stay short; these are what the product actually calls them.
export const ROLE_LABEL: Record<Role, string> = {
  worker: "Health worker",
  organization: "Health service provider",
  funder: "Health funding organisation",
  admin: "Admin",
}

export const ROLE_LABEL_PLURAL: Record<Role, string> = {
  worker: "Health workers",
  organization: "Health service providers",
  funder: "Health funding organisations",
  admin: "Admins",
}

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected"

export type SubscriptionTier = "free" | "paid"

export type OrgType =
  | "private-clinic"
  | "cbo"
  | "local-ngo"
  | "international-ngo"
  | "trust-foundation"
  | "research-institution"

export type FunderType = "foundation" | "donor" | "government" | "health-partner"

// A fixed, filterable taxonomy for the structural gap named in every impact
// post. Borrows the "evidence gap" framing used in public-health research
// (evidence gap maps, WHO/3ie methodology) so a flagged gap reads as
// something researchable, not just a complaint.
export type GapCategory =
  | "Emergency transport & referral"
  | "Health workforce shortage"
  | "Medicine & commodity stockouts"
  | "Cold chain & logistics"
  | "Health financing & affordability"
  | "Infrastructure & equipment"
  | "Health literacy & demand"
  | "Data & reporting systems"
  | "Mental health support"
  | "Water, sanitation & hygiene"

export const GAP_CATEGORIES: GapCategory[] = [
  "Emergency transport & referral",
  "Health workforce shortage",
  "Medicine & commodity stockouts",
  "Cold chain & logistics",
  "Health financing & affordability",
  "Infrastructure & equipment",
  "Health literacy & demand",
  "Data & reporting systems",
  "Mental health support",
  "Water, sanitation & hygiene",
]

export type Theme =
  | "WASH"
  | "Maternal health"
  | "TB"
  | "HIV"
  | "Adolescent SRH"
  | "Nutrition"
  | "Outbreak response"
  | "Immunization"
  | "Mental health"
  | "NCDs"

export const THEMES: Theme[] = [
  "WASH",
  "Maternal health",
  "TB",
  "HIV",
  "Adolescent SRH",
  "Nutrition",
  "Outbreak response",
  "Immunization",
  "Mental health",
  "NCDs",
]

export const LOCATIONS = [
  "Kibera, Nairobi",
  "Mathare, Nairobi",
  "Turkana",
  "Kisumu",
  "Nyamira",
  "Mombasa",
  "Silanga, Kibera",
]

export interface User {
  id: string
  role: Role
  name: string
  title: string // e.g. "Maternal-health clinician"
  location: string
  focusAreas: Theme[]
  bio: string
  avatarColor: string // used for initial-based avatar
  verificationStatus: VerificationStatus
  subscriptionTier: SubscriptionTier
  affiliations: string[] // organization ids
  // worker CV-lite
  experience?: { role: string; place: string; period: string }[]
  cumulativeStats?: { label: string; value: string }[]
  createdAt: string
}

export interface Organization {
  id: string
  name: string
  type: OrgType
  location: string
  focusAreas: Theme[]
  about: string
  currentWork: string
  communities: string[]
  nextFocus: string
  memberIds: string[]
  verificationStatus: VerificationStatus
  avatarColor: string
  createdAt: string
}

export interface Funder {
  id: string
  name: string
  type: FunderType
  location: string
  focusAreas: Theme[]
  supports: string // what we support
  backed: string[] // ids of workers/orgs backed
  avatarColor: string
  verificationStatus: VerificationStatus
  sponsorTierId?: string // references SponsorTier.id; absent = not a sponsor
  createdAt: string
}

export interface StatChip {
  label: string
  value: string
}

/**
 * A photo plus the alt text describing it. Alt text is captured at compose
 * time rather than generated, because only the person who was there can say
 * what the photo shows. Blind and low-vision users get nothing from a photo
 * without it.
 */
export interface PostPhoto {
  src: string
  alt: string
}

/**
 * A recorded voice note plus its text transcript. The transcript is required,
 * not optional: an audio-only update is unusable for Deaf and hard-of-hearing
 * users, and unsearchable for everyone.
 */
export interface VoiceNote {
  durationSeconds: number
  transcript: string
}

export interface ImpactPost {
  id: string
  authorId: string
  orgId?: string
  location: string
  themes: Theme[]
  // structured story fields
  where: string
  peopleReached: string
  whatWeDid: string
  // The evidence gap: a plain-language description plus a fixed category so
  // gaps are filterable and can be picked up as a research question, then
  // linked to a Research Hub publication once someone studies it.
  evidenceGap: string
  gapCategory: GapCategory
  statChips: StatChip[]
  /** Each photo carries its own alt text; see PostPhoto. */
  photos: PostPhoto[]
  /** Optional spoken update, always accompanied by a transcript. */
  voiceNote?: VoiceNote
  createdAt: string
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  text: string
  createdAt: string
}

export interface FundingCall {
  id: string
  funderId: string
  title: string
  theme: Theme
  summary: string
  description: string
  amount: string // e.g. "up to KES 2M"
  deadline: string // ISO date
  location: string
  themes: Theme[]
  eligibility: string[] // plain-language "who can apply" bullets
  createdAt: string
}

export interface Submission {
  id: string
  callId: string
  applicantId: string
  type: "interest" | "application"
  note: string
  status: "sent" | "reviewing" | "shortlisted"
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  text: string
  createdAt: string
}

export interface Conversation {
  id: string
  participantIds: string[]
  messages: Message[]
  updatedAt: string
}

export type VerificationSubjectType = "worker" | "organization" | "funder"

export interface VerificationRequest {
  id: string
  subjectId: string // user, org or funder id
  subjectType: VerificationSubjectType
  // Full legal name / registered name exactly as it appears on the
  // documents. Compared against the profile's display name at review time
  // so a mismatch is visible to the reviewer, not just trusted.
  legalName: string
  // The license, registration or ID number the documents attest to. Used to
  // block a second account from submitting the same number while the first
  // is pending or verified — the cheapest available fraud control without a
  // real document-verification backend.
  identifierNumber: string
  documents: { key?: string; name: string; size: string }[]
  note: string
  status: "pending" | "verified" | "rejected"
  createdAt: string
  reviewedAt?: string
  reviewedBy?: string // admin actor id, for an audit trail
  expiresAt?: string // set on approval; lapses back to "pending" once passed
}

// ---------------------------------------------------------------------------
// Verification document requirements, by subject type (and, for
// organizations, by OrgType). This is product policy/config, not user data,
// so it lives as code rather than a mock-data row.
// ---------------------------------------------------------------------------

export interface VerificationDocSpec {
  key: string
  label: string
  helpText: string
}

export const WORKER_VERIFICATION_DOCS: VerificationDocSpec[] = [
  {
    key: "national_id",
    label: "National ID or passport",
    helpText: "Proof of identity matching the legal name you enter below.",
  },
  {
    key: "practice_license",
    label: "Professional practice license",
    helpText: "Current registration with your professional board (e.g. KMPDC, NCK, PPB, COC).",
  },
  {
    key: "good_conduct",
    label: "Certificate of Good Conduct (DCI)",
    helpText: "Directorate of Criminal Investigations clearance, issued within the last 12 months.",
  },
]

export const ORG_VERIFICATION_DOCS: VerificationDocSpec[] = [
  {
    key: "registration_cert",
    label: "Registration certificate",
    helpText: "NGO Coordination Board, CBO, or company registration certificate.",
  },
  {
    key: "kra_pin",
    label: "KRA PIN certificate",
    helpText: "Tax registration for the organisation.",
  },
  {
    key: "good_standing",
    label: "Letter of good standing",
    helpText: "A recent letter confirming the organisation is active and in good standing.",
  },
]

export const FACILITY_VERIFICATION_DOC: VerificationDocSpec = {
  key: "facility_license",
  label: "Facility license (KMHFL)",
  helpText: "Kenya Master Health Facility List registration for the clinic.",
}

export const FUNDER_VERIFICATION_DOCS: VerificationDocSpec[] = [
  {
    key: "incorporation_cert",
    label: "Certificate of incorporation or trust deed",
    helpText: "Legal registration of the funding entity (or a government gazette notice for county/national funders).",
  },
  {
    key: "kra_pin",
    label: "KRA PIN certificate",
    helpText: "Tax registration for the organisation.",
  },
  {
    key: "funding_reference",
    label: "Proof of funding history",
    helpText: "A reference letter or public record of grants previously disbursed.",
  },
]

export function verificationDocsFor(
  subjectType: VerificationSubjectType,
  orgType?: OrgType,
): VerificationDocSpec[] {
  if (subjectType === "worker") return WORKER_VERIFICATION_DOCS
  if (subjectType === "funder") return FUNDER_VERIFICATION_DOCS
  return orgType === "private-clinic"
    ? [...ORG_VERIFICATION_DOCS, FACILITY_VERIFICATION_DOC]
    : ORG_VERIFICATION_DOCS
}

// ---------------------------------------------------------------------------
// Post-MVP surfaces
// ---------------------------------------------------------------------------

export interface TicketType {
  id: string
  name: string
  price: number // KES, 0 = free
  note: string
}

/**
 * Access provisions an event offers. Stated up front so a Deaf, blind or
 * mobility-impaired attendee can tell whether they can actually take part
 * before they book, instead of having to ask every host individually.
 */
export interface EventAccessibility {
  signLanguage: boolean // Kenyan Sign Language interpretation
  liveCaptions: boolean
  wheelchairAccessible: boolean
  materialsInLargePrint: boolean
  /** Anything else, in plain language. */
  notes?: string
}

export interface Event {
  id: string
  hostId: string // user / org / funder id
  title: string
  summary: string
  location: string
  themes: Theme[]
  startsAt: string // ISO
  ticketTypes: TicketType[]
  accessibility: EventAccessibility
  createdAt: string
}

export interface EventRegistration {
  id: string
  eventId: string
  ticketTypeId: string
  attendeeId: string
  createdAt: string
}

export interface Publication {
  id: string
  authorId: string
  title: string
  abstract: string
  themes: Theme[]
  location: string
  pages: number
  priceKes: number // gross price; Afyashinani takes COMMISSION_RATE
  readMinutes: number // free preview window
  // The evidence gap this research addresses, and optionally the specific
  // impact post that first flagged it, so a gap's page can show the field
  // report and the research answering it side by side.
  relatedGapCategory?: GapCategory
  relatedPostId?: string
  createdAt: string
}

export interface PublicationPurchase {
  id: string
  publicationId: string
  buyerId: string
  grossKes: number
  commissionKes: number
  createdAt: string
}

export interface Plan {
  id: string
  name: string
  tier: SubscriptionTier
  priceKes: number // per month
  audience: string
  features: string[]
}

export interface BoostOption {
  id: string
  name: string
  priceKes: number
  description: string
}

export interface ConsortiumMember {
  id: string
  name: string
  kind: "county" | "ngo" | "funder" | "academic"
  contribution: string
}

export interface AssistantSampleTurn {
  role: "user" | "assistant"
  text: string
}

// Afyashinani takes 15% of every publication sale.
export const COMMISSION_RATE = 0.15

// ---------------------------------------------------------------------------
// Sponsorship (funder-side monetization, distinct from the worker/org/funder
// subscription plans above). Modelled on the conference/open-source sponsor
// ladder used broadly across platforms of this kind, e.g. GitHub Sponsors,
// Open Collective, and standard event sponsorship tiers.
// ---------------------------------------------------------------------------

export interface SponsorTier {
  id: string
  name: string // "Platinum" | "Gold" | "Silver" | "Bronze"
  priceKes: number
  period: "month"
  rank: number // higher = more prominent; used to order sponsors and badges
  badgeColor: string
  benefits: string[]
}
