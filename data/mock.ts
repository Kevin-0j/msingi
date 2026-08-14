import type {
  User,
  Organization,
  Funder,
  ImpactPost,
  Comment,
  FundingCall,
  Submission,
  Conversation,
  VerificationRequest,
  Event,
  Publication,
  Plan,
  BoostOption,
  ConsortiumMember,
  AssistantSampleTurn,
  SponsorTier,
} from "@/lib/types"

// Seed timestamps are anchored to today so the demo never goes stale (calls
// stop being permanently "closed", posts stop reading "400d ago"). Anchoring to
// UTC midnight keeps the value identical on the server and in the browser, so
// there is no hydration mismatch.
function isoDaysFromToday(days: number, hourUtc = 9): string {
  const now = new Date()
  const d = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days, hourUtc, 0, 0, 0),
  )
  return d.toISOString()
}

const PHOTOS = {
  maternal: "/photos/maternal-clinic.png",
  wash: "/photos/wash-water.png",
  community: "/photos/community-gathering.png",
  outreach: "/photos/health-outreach.png",
}

// ---------------------------------------------------------------------------
// Workers
// ---------------------------------------------------------------------------
export const workers: User[] = [
  {
    id: "u_amina",
    role: "worker",
    name: "Amina Wanjiru",
    title: "Maternal-health clinician",
    location: "Silanga, Kibera",
    focusAreas: ["Maternal health", "Adolescent SRH"],
    bio: "I run mobile antenatal clinics in Silanga. Most of my work is finding first-time mothers early and getting high-risk cases referred before it's too late.",
    avatarColor: "#146879",
    verificationStatus: "verified",
    subscriptionTier: "paid",
    affiliations: ["o_silanga"],
    experience: [
      { role: "Clinical officer (RH)", place: "Silanga Community Clinic", period: "2019 - now" },
      { role: "Nurse", place: "Mbagathi County Hospital", period: "2015 - 2019" },
    ],
    cumulativeStats: [
      { label: "Mothers seen", value: "3,120" },
      { label: "First ANC visits", value: "640" },
      { label: "High-risk referrals", value: "180" },
    ],
    createdAt: "2024-01-12T08:00:00.000Z",
  },
  {
    id: "u_lokol",
    role: "worker",
    name: "John Lokol",
    title: "WASH & nutrition nurse",
    location: "Turkana",
    focusAreas: ["WASH", "Nutrition"],
    bio: "Clean water and nutrition go together here. I move between manyattas checking for malnutrition and setting up simple water treatment.",
    avatarColor: "#3e7d5b",
    verificationStatus: "verified",
    subscriptionTier: "free",
    affiliations: ["o_maji"],
    experience: [
      { role: "Community nurse", place: "Maji Bora Initiative", period: "2020 - now" },
    ],
    cumulativeStats: [
      { label: "Households reached", value: "1,450" },
      { label: "Children screened", value: "2,010" },
      { label: "Water points set up", value: "36" },
    ],
    createdAt: "2024-02-03T08:00:00.000Z",
  },
  {
    id: "u_baraka",
    role: "worker",
    name: "Baraka Otieno",
    title: "TB/HIV clinical officer",
    location: "Mathare, Nairobi",
    focusAreas: ["TB", "HIV"],
    bio: "TB and HIV are still hiding in plain sight in Mathare. I do contact tracing, adherence support and a lot of listening.",
    avatarColor: "#c98a3c",
    verificationStatus: "pending",
    subscriptionTier: "free",
    affiliations: ["o_mathare"],
    experience: [
      { role: "Clinical officer", place: "Mathare Health CBO", period: "2018 - now" },
    ],
    cumulativeStats: [
      { label: "Patients on treatment", value: "540" },
      { label: "Contacts traced", value: "1,900" },
    ],
    createdAt: "2024-02-20T08:00:00.000Z",
  },
  {
    id: "u_faith",
    role: "worker",
    name: "Faith Achieng",
    title: "Adolescent-SRH pharmacist",
    location: "Kisumu",
    focusAreas: ["Adolescent SRH", "HIV"],
    bio: "Young people need a place that doesn't judge them. I run a youth-friendly pharmacy corner and outreach in schools.",
    avatarColor: "#146879",
    verificationStatus: "unverified",
    subscriptionTier: "free",
    affiliations: [],
    experience: [{ role: "Pharmacist", place: "Kisumu Youth Health", period: "2021 - now" }],
    cumulativeStats: [
      { label: "Young people reached", value: "2,300" },
      { label: "School sessions", value: "84" },
    ],
    createdAt: "2024-03-01T08:00:00.000Z",
  },
  {
    id: "u_mercy",
    role: "worker",
    name: "Mercy Nafula",
    title: "Community health promoter",
    location: "Nyamira",
    focusAreas: ["Immunization", "Maternal health"],
    bio: "I walk door to door making sure children get their jabs on time and mothers know where the clinic is.",
    avatarColor: "#3e7d5b",
    verificationStatus: "verified",
    subscriptionTier: "free",
    affiliations: [],
    experience: [{ role: "CHP", place: "Nyamira County", period: "2017 - now" }],
    cumulativeStats: [
      { label: "Children immunized", value: "1,120" },
      { label: "Home visits", value: "4,800" },
    ],
    createdAt: "2024-03-10T08:00:00.000Z",
  },
  {
    id: "u_daniel",
    role: "worker",
    name: "Daniel Kiptoo",
    title: "Outbreak response officer",
    location: "Mombasa",
    focusAreas: ["Outbreak response", "WASH"],
    bio: "Cholera and dengue keep me busy on the coast. Fast case-finding and community messaging is everything.",
    avatarColor: "#b4472f",
    verificationStatus: "unverified",
    subscriptionTier: "free",
    affiliations: [],
    createdAt: "2024-03-18T08:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------
export const organizations: Organization[] = [
  {
    id: "o_silanga",
    name: "Silanga Community Clinic",
    type: "private-clinic",
    location: "Silanga, Kibera",
    focusAreas: ["Maternal health", "Adolescent SRH", "Immunization"],
    about:
      "A not-for-profit clinic embedded in Silanga village, Kibera. We keep fees at zero for antenatal and child health.",
    currentWork: "Running weekly antenatal clinics and a night-referral pilot with two boda-boda riders.",
    communities: ["Silanga village", "Gatwikera"],
    nextFocus: "Setting up a 24-hour maternal emergency line.",
    memberIds: ["u_amina"],
    verificationStatus: "verified",
    avatarColor: "#146879",
    createdAt: "2023-11-01T08:00:00.000Z",
  },
  {
    id: "o_maji",
    name: "Maji Bora Initiative",
    type: "cbo",
    location: "Turkana",
    focusAreas: ["WASH", "Nutrition"],
    about: "A community-based organisation improving water access and child nutrition across Turkana manyattas.",
    currentWork: "Installing sand-filter water points and running monthly nutrition screening.",
    communities: ["Lodwar outskirts", "Kalokol"],
    nextFocus: "Mapping dry-season water sources with community scouts.",
    memberIds: ["u_lokol"],
    verificationStatus: "verified",
    avatarColor: "#3e7d5b",
    createdAt: "2023-10-05T08:00:00.000Z",
  },
  {
    id: "o_mathare",
    name: "Mathare Health CBO",
    type: "local-ngo",
    location: "Mathare, Nairobi",
    focusAreas: ["TB", "HIV", "Mental health"],
    about: "Local NGO focused on TB, HIV and mental health support in the Mathare informal settlement.",
    currentWork: "Door-to-door TB contact tracing and a peer adherence group.",
    communities: ["Mathare 4A", "Mabatini"],
    nextFocus: "Adding a community mental-health first-aid programme.",
    memberIds: ["u_baraka"],
    verificationStatus: "pending",
    avatarColor: "#c98a3c",
    createdAt: "2023-12-11T08:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Funders
// ---------------------------------------------------------------------------
export const funders: Funder[] = [
  {
    id: "f_ubuntu",
    name: "Ubuntu Health Foundation",
    type: "foundation",
    location: "Nairobi",
    focusAreas: ["Adolescent SRH", "Maternal health"],
    supports: "Frontline reproductive-health work in informal settlements. We fund people, not paperwork.",
    backed: ["o_silanga", "u_amina"],
    avatarColor: "#146879",
    verificationStatus: "verified",
    sponsorTierId: "sponsor_platinum",
    createdAt: "2023-09-01T08:00:00.000Z",
  },
  {
    id: "f_coastal",
    name: "Coastal Wellbeing Fund",
    type: "donor",
    location: "Mombasa",
    focusAreas: ["WASH", "Outbreak response"],
    supports: "Water, sanitation and outbreak-readiness along the coast.",
    backed: ["u_daniel"],
    avatarColor: "#3e7d5b",
    verificationStatus: "verified",
    sponsorTierId: "sponsor_silver",
    createdAt: "2023-09-15T08:00:00.000Z",
  },
  {
    id: "f_kisumu",
    name: "Kisumu County Health",
    type: "government",
    location: "Kisumu",
    focusAreas: ["HIV", "Adolescent SRH", "Immunization"],
    supports: "County co-funding for youth health and immunization coverage.",
    backed: [],
    avatarColor: "#c98a3c",
    verificationStatus: "verified",
    createdAt: "2023-08-20T08:00:00.000Z",
  },
  {
    id: "f_global",
    name: "Global Frontline Fund",
    type: "health-partner",
    location: "Remote / International",
    focusAreas: ["TB", "Nutrition", "Outbreak response"],
    supports: "Flexible grants for credible frontline health teams in East Africa.",
    backed: ["o_maji"],
    avatarColor: "#146879",
    verificationStatus: "verified",
    sponsorTierId: "sponsor_gold",
    createdAt: "2023-07-10T08:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Impact posts
// ---------------------------------------------------------------------------
export const posts: ImpactPost[] = [
  {
    id: "p_1",
    authorId: "u_amina",
    orgId: "o_silanga",
    location: "Silanga, Kibera",
    themes: ["Maternal health"],
    where: "3-day maternal clinic in Silanga, Kibera",
    peopleReached: "214 mothers seen",
    whatWeDid: "47 first antenatal visits, 12 high-risk cases referred, routine checks and iron supplements for everyone.",
    evidenceGap: "No night-time emergency transport. When labour starts at 2am there is no safe way to reach a hospital.",
    gapCategory: "Emergency transport & referral",
    statChips: [
      { label: "reached", value: "214" },
      { label: "new ANC", value: "47" },
      { label: "referrals", value: "12" },
    ],
    photos: [PHOTOS.maternal, PHOTOS.community],
    createdAt: isoDaysFromToday(-1),
  },
  {
    id: "p_2",
    authorId: "u_lokol",
    orgId: "o_maji",
    location: "Turkana",
    themes: ["WASH", "Nutrition"],
    where: "Water treatment and nutrition screening in Kalokol",
    peopleReached: "180 households visited",
    whatWeDid: "Set up 4 sand-filter points, screened 320 children, enrolled 28 into a feeding programme.",
    evidenceGap: "Dry-season water sources dry up by August. We need storage, not just filters.",
    gapCategory: "Water, sanitation & hygiene",
    statChips: [
      { label: "households", value: "180" },
      { label: "children screened", value: "320" },
      { label: "SAM enrolled", value: "28" },
    ],
    photos: [PHOTOS.wash],
    createdAt: isoDaysFromToday(-3),
  },
  {
    id: "p_3",
    authorId: "u_baraka",
    orgId: "o_mathare",
    location: "Mathare, Nairobi",
    themes: ["TB", "HIV"],
    where: "TB contact tracing week in Mathare 4A",
    peopleReached: "96 contacts traced",
    whatWeDid: "Found 9 new presumptive TB cases, started 6 on treatment, linked 3 to HIV care.",
    evidenceGap: "People miss appointments because a clinic visit costs a day's wages. We need community pickup of drugs.",
    gapCategory: "Health financing & affordability",
    statChips: [
      { label: "traced", value: "96" },
      { label: "new TB", value: "9" },
      { label: "on treatment", value: "6" },
    ],
    photos: [PHOTOS.community],
    createdAt: isoDaysFromToday(-6),
  },
  {
    id: "p_4",
    authorId: "u_faith",
    location: "Kisumu",
    themes: ["Adolescent SRH"],
    where: "School outreach on adolescent health in Kisumu",
    peopleReached: "260 students reached",
    whatWeDid: "Ran 4 school sessions, answered questions no one asks at home, referred 14 for confidential services.",
    evidenceGap: "Stockouts of contraceptives at the youth corner. Demand is there, supply isn't.",
    gapCategory: "Medicine & commodity stockouts",
    statChips: [
      { label: "students", value: "260" },
      { label: "sessions", value: "4" },
      { label: "referrals", value: "14" },
    ],
    photos: [PHOTOS.outreach],
    createdAt: isoDaysFromToday(-9),
  },
  {
    id: "p_5",
    authorId: "u_mercy",
    location: "Nyamira",
    themes: ["Immunization"],
    where: "Door-to-door immunization catch-up in Nyamira",
    peopleReached: "120 homes visited",
    whatWeDid: "Immunized 64 children who had missed doses, updated 90 growth cards.",
    evidenceGap: "Cold-chain gaps mean I sometimes carry vaccines too far. We lose doses to heat.",
    gapCategory: "Cold chain & logistics",
    statChips: [
      { label: "homes", value: "120" },
      { label: "children immunized", value: "64" },
    ],
    photos: [PHOTOS.outreach],
    createdAt: isoDaysFromToday(-11),
  },
  {
    id: "p_6",
    authorId: "u_daniel",
    location: "Mombasa",
    themes: ["Outbreak response", "WASH"],
    where: "Cholera case-finding after floods in Mombasa",
    peopleReached: "340 people reached with messaging",
    whatWeDid: "Found 22 suspected cases, set up 3 oral-rehydration points, chlorinated 5 wells.",
    evidenceGap: "We react after cases appear. We need early warning tied to the weather.",
    gapCategory: "Data & reporting systems",
    statChips: [
      { label: "reached", value: "340" },
      { label: "suspected cases", value: "22" },
      { label: "wells treated", value: "5" },
    ],
    photos: [PHOTOS.wash, PHOTOS.community],
    createdAt: isoDaysFromToday(-15),
  },
]

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
export const comments: Comment[] = [
  {
    id: "c_1",
    postId: "p_1",
    authorId: "f_ubuntu",
    text: "This night-transport gap is exactly what we want to fund. Please express interest on our open call.",
    createdAt: isoDaysFromToday(-1, 11),
  },
  {
    id: "c_2",
    postId: "p_1",
    authorId: "u_mercy",
    text: "Same problem in Nyamira. Two boda riders on standby changed everything for us.",
    createdAt: isoDaysFromToday(-1, 12),
  },
  {
    id: "c_3",
    postId: "p_2",
    authorId: "f_global",
    text: "Storage is a fair point. Let's talk about a small capital line for tanks.",
    createdAt: isoDaysFromToday(-3, 14),
  },
]

// ---------------------------------------------------------------------------
// Funding calls
// ---------------------------------------------------------------------------
export const fundingCalls: FundingCall[] = [
  {
    id: "fc_1",
    funderId: "f_ubuntu",
    title: "Adolescent SRH in informal settlements",
    theme: "Adolescent SRH",
    summary: "Up to KES 2M for youth-friendly reproductive-health work in urban-poor settlements.",
    description:
      "We are looking for small, credible teams already trusted by young people. Funds can cover staff time, commodities, and youth-corner set-up. We do not need a logframe. We need to see your last three months of real work.",
    amount: "up to KES 2,000,000",
    deadline: isoDaysFromToday(32, 23),
    location: "Nairobi informal settlements",
    themes: ["Adolescent SRH", "HIV"],
    eligibility: [
      "Individual health workers or small teams already working in an informal settlement",
      "At least three months of posted work on Afyashinani",
      "Verified seal, or verification in progress",
      "No registration certificate required for individuals",
    ],
    createdAt: isoDaysFromToday(-28, 8),
  },
  {
    id: "fc_2",
    funderId: "f_coastal",
    title: "Coastal outbreak-readiness micro-grants",
    theme: "Outbreak response",
    summary: "KES 300K - 800K for early warning and WASH readiness on the coast.",
    description:
      "Flexible micro-grants for teams that can move fast when cholera or dengue appears. Priority for community-based early warning tied to flooding.",
    amount: "KES 300,000 - 800,000",
    deadline: isoDaysFromToday(48, 23),
    location: "Mombasa & coastal counties",
    themes: ["Outbreak response", "WASH"],
    eligibility: [
      "Based in Mombasa, Kilifi, Kwale or Lamu",
      "Able to start within two weeks of an outbreak alert",
      "Community-based organisations, clinics or individual workers",
      "A named person who answers the phone at 2am",
    ],
    createdAt: isoDaysFromToday(-25, 8),
  },
  {
    id: "fc_3",
    funderId: "f_global",
    title: "Frontline TB & nutrition flexible grants",
    theme: "TB",
    summary: "Unrestricted grants up to KES 1.5M for credible frontline teams.",
    description:
      "Unrestricted funding for teams working on TB case-finding or child nutrition. We fund the work, not the reporting. Two light check-ins per year.",
    amount: "up to KES 1,500,000",
    deadline: isoDaysFromToday(64, 23),
    location: "East Africa",
    themes: ["TB", "Nutrition"],
    eligibility: [
      "Registered organisations only (CBO, NGO or clinic)",
      "Verified seal on Afyashinani",
      "At least one year of continuous frontline work",
      "Willing to do two light check-in calls a year",
    ],
    createdAt: isoDaysFromToday(-31, 8),
  },
]

// ---------------------------------------------------------------------------
// Conversations
// ---------------------------------------------------------------------------
export const conversations: Conversation[] = [
  {
    id: "conv_1",
    participantIds: ["u_amina", "f_ubuntu"],
    updatedAt: isoDaysFromToday(0, 10),
    messages: [
      {
        id: "m_1",
        conversationId: "conv_1",
        senderId: "f_ubuntu",
        text: "Amina, we saw your Silanga post. The night-transport gap is exactly our focus.",
        createdAt: isoDaysFromToday(0, 9),
      },
      {
        id: "m_2",
        conversationId: "conv_1",
        senderId: "u_amina",
        text: "Thank you. Two riders on standby would cover most of the risk. I can share numbers.",
        createdAt: isoDaysFromToday(0, 9),
      },
      {
        id: "m_3",
        conversationId: "conv_1",
        senderId: "f_ubuntu",
        text: "Please do. Express interest on our open call and we'll fast-track a call.",
        createdAt: isoDaysFromToday(0, 10),
      },
    ],
  },
  {
    id: "conv_2",
    participantIds: ["u_amina", "u_lokol"],
    updatedAt: isoDaysFromToday(-2, 16),
    messages: [
      {
        id: "m_4",
        conversationId: "conv_2",
        senderId: "u_lokol",
        text: "How did you set up your referral riders? We need the same in Turkana.",
        createdAt: isoDaysFromToday(-2, 15),
      },
      {
        id: "m_5",
        conversationId: "conv_2",
        senderId: "u_amina",
        text: "Happy to share. It's a small monthly stipend plus fuel. I'll send the sheet.",
        createdAt: isoDaysFromToday(-2, 16),
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// Verification requests (admin queue seed)
// ---------------------------------------------------------------------------
export const verificationRequests: VerificationRequest[] = [
  {
    id: "vr_1",
    subjectId: "u_baraka",
    subjectType: "worker",
    legalName: "Baraka Otieno",
    identifierNumber: "KMPDC/OT-48213",
    documents: [
      { key: "practice_license", name: "clinical-officer-license.pdf", size: "482 KB" },
      { key: "national_id", name: "national-id.pdf", size: "210 KB" },
      { key: "good_conduct", name: "dci-good-conduct-certificate.pdf", size: "340 KB" },
    ],
    note: "Registered clinical officer, board number attached. Working with Mathare Health CBO since 2018.",
    status: "pending",
    createdAt: isoDaysFromToday(-5, 8),
  },
  {
    id: "vr_2",
    subjectId: "o_mathare",
    subjectType: "organization",
    legalName: "Mathare Health CBO",
    identifierNumber: "CBO/NRB/2019/00452",
    documents: [
      { key: "registration_cert", name: "ngo-registration-certificate.pdf", size: "1.1 MB" },
      { key: "kra_pin", name: "kra-pin-certificate.pdf", size: "96 KB" },
      { key: "good_standing", name: "letter-of-good-standing.pdf", size: "150 KB" },
    ],
    note: "Local NGO registered with the NGO Coordination Board. Certificate attached.",
    status: "pending",
    createdAt: isoDaysFromToday(-4, 8),
  },
]

// ---------------------------------------------------------------------------
// Funding submissions (seeded so the funder role has a non-empty inbox)
// ---------------------------------------------------------------------------
export const submissions: Submission[] = [
  {
    id: "sub_seed_1",
    callId: "fc_1",
    applicantId: "u_faith",
    type: "application",
    note: "I run the youth corner at Kisumu Youth Health. Last quarter: 260 students reached, 14 confidential referrals. Funding would cover commodity stock and two outreach days a month.",
    status: "reviewing",
    createdAt: isoDaysFromToday(-7, 10),
  },
  {
    id: "sub_seed_2",
    callId: "fc_1",
    applicantId: "o_mathare",
    type: "interest",
    note: "We would like to extend our peer adherence groups to under-24s. Happy to share our tracing numbers.",
    status: "sent",
    createdAt: isoDaysFromToday(-2, 7),
  },
  {
    id: "sub_seed_3",
    callId: "fc_2",
    applicantId: "u_daniel",
    type: "application",
    note: "Cholera case-finding in Mombasa after the April floods: 340 people reached, 5 wells chlorinated. We want to pre-position ORS and set up a flood-linked early warning list.",
    status: "shortlisted",
    createdAt: isoDaysFromToday(-10, 13),
  },
  {
    id: "sub_seed_4",
    callId: "fc_3",
    applicantId: "o_maji",
    type: "interest",
    note: "Nutrition screening across Kalokol and Lodwar outskirts. Storage, not filters, is our gap.",
    status: "sent",
    createdAt: isoDaysFromToday(-13, 9),
  },
]

// ---------------------------------------------------------------------------
// Events (post-MVP)
// ---------------------------------------------------------------------------
export const events: Event[] = [
  {
    id: "ev_1",
    hostId: "o_silanga",
    title: "Night-referral clinic: what actually works",
    summary:
      "A practical half-day on setting up boda-boda referral for night-time obstetric emergencies. Bring your numbers, not slides.",
    location: "Silanga, Kibera",
    themes: ["Maternal health"],
    startsAt: isoDaysFromToday(45, 6),
    ticketTypes: [
      { id: "tt_1a", name: "Health worker", price: 0, note: "Free for frontline workers" },
      { id: "tt_1b", name: "Organisation", price: 1500, note: "Covers lunch and materials" },
      { id: "tt_1c", name: "Funder / partner", price: 5000, note: "Supports free worker places" },
    ],
    createdAt: isoDaysFromToday(-27, 8),
  },
  {
    id: "ev_2",
    hostId: "o_maji",
    title: "Dry-season water planning clinic",
    summary:
      "Mapping water points before August. Community scouts, sand filters and simple storage maths for Turkana teams.",
    location: "Turkana",
    themes: ["WASH", "Nutrition"],
    startsAt: isoDaysFromToday(23, 6),
    ticketTypes: [
      { id: "tt_2a", name: "Community scout", price: 0, note: "Free" },
      { id: "tt_2b", name: "Organisation", price: 2000, note: "Includes field kit" },
    ],
    createdAt: isoDaysFromToday(-24, 8),
  },
  {
    id: "ev_3",
    hostId: "f_ubuntu",
    title: "How we read your funding application",
    summary:
      "Ubuntu Health Foundation opens its review notes. What makes us say yes, what makes us stop reading.",
    location: "Nairobi",
    themes: ["Adolescent SRH", "Maternal health"],
    startsAt: isoDaysFromToday(7, 12),
    ticketTypes: [
      { id: "tt_3a", name: "General entry", price: 0, note: "Free, online" },
      { id: "tt_3b", name: "Small-group clinic", price: 800, note: "Limited to 20 people" },
    ],
    createdAt: isoDaysFromToday(-29, 8),
  },
]

// ---------------------------------------------------------------------------
// Research Hub publications (post-MVP)
// ---------------------------------------------------------------------------
export const publications: Publication[] = [
  {
    id: "pub_1",
    authorId: "u_amina",
    title: "Night-time obstetric referral in Kibera: a two-rider pilot",
    abstract:
      "Twelve months of a stipend-based boda-boda referral scheme in Silanga. We describe cost per referral, response times, and the three months where it nearly collapsed.",
    themes: ["Maternal health"],
    location: "Silanga, Kibera",
    pages: 18,
    priceKes: 600,
    readMinutes: 15,
    relatedGapCategory: "Emergency transport & referral",
    relatedPostId: "p_1",
    createdAt: "2025-05-14T08:00:00.000Z",
  },
  {
    id: "pub_2",
    authorId: "o_maji",
    title: "Sand filters and seasonality: WASH uptake across Turkana manyattas",
    abstract:
      "Uptake and abandonment of 36 sand-filter water points over two dry seasons, with household-level nutrition screening data from the same catchment.",
    themes: ["WASH", "Nutrition"],
    location: "Turkana",
    pages: 26,
    priceKes: 900,
    readMinutes: 15,
    relatedGapCategory: "Water, sanitation & hygiene",
    relatedPostId: "p_2",
    createdAt: "2025-04-02T08:00:00.000Z",
  },
  {
    id: "pub_3",
    authorId: "o_mathare",
    title: "Cost of a clinic visit: why TB patients miss appointments in Mathare",
    abstract:
      "A plain accounting of what a single clinic visit costs a Mathare household in lost wages and transport, and what community drug pickup would change.",
    themes: ["TB", "HIV"],
    location: "Mathare, Nairobi",
    pages: 14,
    priceKes: 450,
    readMinutes: 15,
    relatedGapCategory: "Health financing & affordability",
    relatedPostId: "p_3",
    createdAt: "2025-06-20T08:00:00.000Z",
  },
  {
    id: "pub_4",
    authorId: "u_mercy",
    title: "Cold chain on foot: vaccine loss in door-to-door immunization",
    abstract:
      "Measured temperature excursions across 4,800 home visits in Nyamira, and a simple carrier change that cut wastage by a third.",
    themes: ["Immunization"],
    location: "Nyamira",
    pages: 11,
    priceKes: 350,
    readMinutes: 15,
    relatedGapCategory: "Cold chain & logistics",
    relatedPostId: "p_5",
    createdAt: "2025-07-01T08:00:00.000Z",
  },
]

// ---------------------------------------------------------------------------
// Subscriptions, boost (post-MVP)
// ---------------------------------------------------------------------------
export const plans: Plan[] = [
  {
    id: "plan_free",
    name: "Afyashinani Free",
    tier: "free",
    priceKes: 0,
    audience: "Every health worker, always",
    features: [
      "Full profile and impact timeline",
      "Post impact updates with photo and voice note",
      "1:1 messaging with anyone",
      "Browse and apply to every funding call",
      "Request verification",
    ],
  },
  {
    id: "plan_pro",
    name: "Afyashinani Pro",
    tier: "paid",
    priceKes: 500,
    audience: "Workers and small teams chasing funding",
    features: [
      "Everything in Free",
      "AI Funder Assistant",
      "See who viewed your profile",
      "Priority placement in funder searches",
      "Download your impact record as a PDF",
    ],
  },
  {
    id: "plan_institution",
    name: "Afyashinani Institution",
    tier: "paid",
    priceKes: 6000,
    audience: "Organisations, funders and county teams",
    features: [
      "Everything in Pro, for up to 20 members",
      "Post funding calls and manage responses",
      "Publish to the Research Hub",
      "Host events and sell tickets",
      "Consortium dashboard access",
    ],
  },
]

export const boostOptions: BoostOption[] = [
  {
    id: "boost_post",
    name: "Boost one impact post",
    priceKes: 300,
    description: "Puts a single post at the top of the feed for funders whose focus areas match, for 7 days.",
  },
  {
    id: "boost_profile",
    name: "Boost your profile",
    priceKes: 900,
    description: "Your profile appears in the 'People to connect with' rail for matching funders, for 30 days.",
  },
  {
    id: "boost_call",
    name: "Boost a funding call",
    priceKes: 2500,
    description: "For funders: push a call to every verified worker in the matching counties and themes.",
  },
]

// ---------------------------------------------------------------------------
// Sponsor tiers (funder-side monetization, distinct from subscription plans).
// Modelled on the standard conference/open-source sponsor ladder.
// ---------------------------------------------------------------------------
export const sponsorTiers: SponsorTier[] = [
  {
    id: "sponsor_platinum",
    name: "Platinum",
    priceKes: 150000,
    period: "month",
    rank: 4,
    badgeColor: "#5b6472",
    benefits: [
      "Featured on the Afyashinani landing page",
      "Guaranteed top placement in the directory and funding-call listings",
      "Unlimited funding calls, boosted automatically",
      "Access to evidence-gap frequency analytics across all themes",
      "Co-branded webinars and training sessions",
      "Dedicated account support and worker introductions",
    ],
  },
  {
    id: "sponsor_gold",
    name: "Gold",
    priceKes: 75000,
    period: "month",
    rank: 3,
    badgeColor: "#c98a3c",
    benefits: [
      "Listed on the Afyashinani landing page",
      "Priority placement in the directory and funding-call listings",
      "3 free boosts a month",
      "Evidence-gap analytics for your chosen focus themes",
    ],
  },
  {
    id: "sponsor_silver",
    name: "Silver",
    priceKes: 30000,
    period: "month",
    rank: 2,
    badgeColor: "#9aa5ab",
    benefits: ["Listed as an Afyashinani partner", "1 free boost a month"],
  },
  {
    id: "sponsor_bronze",
    name: "Bronze",
    priceKes: 10000,
    period: "month",
    rank: 1,
    badgeColor: "#b08463",
    benefits: ["Bronze supporter badge", "20% off every boost purchase"],
  },
]

// ---------------------------------------------------------------------------
// Consortium (post-MVP)
// ---------------------------------------------------------------------------
export const consortiumMembers: ConsortiumMember[] = [
  {
    id: "cons_1",
    name: "Kisumu County Health",
    kind: "county",
    contribution: "Co-funds youth health and immunization coverage; shares county-level gap data.",
  },
  {
    id: "cons_2",
    name: "Ubuntu Health Foundation",
    kind: "funder",
    contribution: "Pooled fund for maternal and adolescent SRH in informal settlements.",
  },
  {
    id: "cons_3",
    name: "Maji Bora Initiative",
    kind: "ngo",
    contribution: "Field delivery across Turkana; runs the shared WASH monitoring template.",
  },
  {
    id: "cons_4",
    name: "Coastal Wellbeing Fund",
    kind: "funder",
    contribution: "Rapid outbreak-readiness window, released within 72 hours of an alert.",
  },
  {
    id: "cons_5",
    name: "Strathmore Institute of Healthcare Management",
    kind: "academic",
    contribution: "Reviews Research Hub submissions and runs the annual frontline evidence review.",
  },
]

// ---------------------------------------------------------------------------
// AI Funder Assistant: sample transcript shown behind the paywall gate
// ---------------------------------------------------------------------------
export const assistantSample: AssistantSampleTurn[] = [
  {
    role: "user",
    text: "I run night-time maternal referrals in Kibera with two boda riders. Which open call fits?",
  },
  {
    role: "assistant",
    text: "Ubuntu Health Foundation's 'Adolescent SRH in informal settlements' is the closest match. They fund people rather than paperwork, and their notes say they want three months of real posted work, which you have. Coastal Wellbeing is a poor fit: wrong county.",
  },
  {
    role: "user",
    text: "What should I put in the application?",
  },
  {
    role: "assistant",
    text: "Lead with your numbers, not your mission: 214 mothers seen, 47 first ANC visits, 12 high-risk referrals in three days. Then the gap in one sentence, no night transport, then the ask: two riders on stipend plus fuel, for twelve months. Skip the logframe; this funder says they do not read them.",
  },
]
