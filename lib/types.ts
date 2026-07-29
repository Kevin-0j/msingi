// Domain types for Msingi. Shapes map cleanly to Firestore collections later:
// string ids, ISO timestamps, flat references by id.

export type Role = "worker" | "organization" | "funder" | "admin"

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
  createdAt: string
}

export interface StatChip {
  label: string
  value: string
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
  biggestGap: string
  statChips: StatChip[]
  photos: string[]
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

export interface VerificationRequest {
  id: string
  subjectId: string // user or org id
  subjectType: "worker" | "organization"
  documents: { name: string; size: string }[]
  note: string
  status: "pending" | "verified" | "rejected"
  createdAt: string
  reviewedAt?: string
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

export interface Event {
  id: string
  hostId: string // user / org / funder id
  title: string
  summary: string
  location: string
  themes: Theme[]
  startsAt: string // ISO
  ticketTypes: TicketType[]
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
  priceKes: number // gross price; Msingi takes COMMISSION_RATE
  readMinutes: number // free preview window
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

// Msingi takes 15% of every publication sale.
export const COMMISSION_RATE = 0.15
