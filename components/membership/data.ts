export type MembershipCategory = {
  name: string
  badge: string
  badgeBg: string
  accent: string
  fee: string
  feeNote: string
  annual: string
  eligibility: string[]
  privileges: string[]
  validity: string
  requirements: string[]
}

export type MembershipTypeOption = {
  value: string
  label: string
  desc: string
}

export const categories: MembershipCategory[] = [
  {
    name: "Regular Member",
    badge: "Most Popular",
    badgeBg: "var(--navy)",
    accent: "var(--navy)",
    fee: "₱1,000",
    feeNote: "one-time (covers ID & shirt)",
    annual: "₱500 / year",
    eligibility: [
      "Licensed social workers (RSw)",
      "Currently working or with prior experience in NGOs, CSOs, foundations, faith-based organizations, or development projects",
    ],
    privileges: [
      "Voting rights and eligibility to hold office",
      "Participation in general assemblies and meetings",
      "Priority access and discounted rates for PNGOSWA trainings, forums, and conferences",
      "Access to professional resources, advisories, and practice tools",
      "Inclusion in official membership registry",
      "Issuance of membership certificate and ID",
      "Eligibility for endorsements, recognitions, or certifications",
    ],
    validity: "1 year, renewable annually",
    requirements: [
      "Curriculum Vitae (CV) / Resume",
      "Proof of employment or experience in an NGO",
      "PRC License (if applicable)",
      "Contact details and personal information",
    ],
  },
  {
    name: "Lifetime Member",
    badge: "Premium",
    badgeBg: "var(--amber)",
    accent: "var(--amber)",
    fee: "₱3,000",
    feeNote: "one-time (covers ID & shirt)",
    annual: "No annual dues",
    eligibility: [
      "Management-level social workers (supervisors, coordinators, managers, directors)",
      "Minimum 10-15 years of NGO social work experience, with at least 5 years in a supervisory or leadership role",
    ],
    privileges: [
      "Lifetime recognition",
      "Advisory or mentorship roles within the Association",
      "Invitations to major PNGOSWA activities and special events",
      "Priority or complimentary access to selected trainings and forums",
    ],
    validity: "Lifetime",
    requirements: [
      "CV highlighting leadership and supervisory experience",
      "Proof of current or past management-level position in an NGO",
      "PRC License (if applicable)",
      "Contact details",
    ],
  },
  {
    name: "Honorary Member",
    badge: "By Nomination",
    badgeBg: "var(--violet)",
    accent: "var(--violet)",
    fee: "None",
    feeNote: "",
    annual: "None",
    eligibility: [
      "Distinguished NGO social workers or retired professionals",
      "Individuals who have made exceptional contributions or impact in NGO social work, advocacy, policy, or institutional development",
    ],
    privileges: [
      "Lifetime recognition",
      "Advisory or mentorship roles (non-voting, unless otherwise provided in By-Laws)",
      "Invitation to key Association events",
    ],
    validity: "Lifetime",
    requirements: [
      "CV / Resume detailing contributions to NGO social work",
      "Recommendation or endorsement from peers, supervisors, or the Board",
      "Contact details",
    ],
  },
]

export const generalPrivileges = [
  "Official Certificate of Membership",
  "Issuance of Membership ID",
  "Access to professional development activities (trainings, forums, conferences)",
  "Practice advisories and updates relevant to NGO social work",
  "Networking and peer support opportunities",
  "Participation in advocacy initiatives, consultations, and policy discussions",
  "Inclusion in official membership registry",
  "Eligibility for recognition and awards programs",
]

export const docOptions = [
  "CV / Resume",
  "Proof of Employment / Leadership Role",
  "PRC License (if applicable)",
  "Recommendation / Endorsement (for Honorary Membership)",
]

export const membershipTypeOptions: MembershipTypeOption[] = [
  {
    value: "regular",
    label: "Regular Member",
    desc: "Licensed RSw with NGO experience - ₱1,000 + ₱500/year",
  },
  {
    value: "lifetime",
    label: "Lifetime Member",
    desc: "Management-level, 10-15+ years - ₱3,000 one-time",
  },
  {
    value: "honorary",
    label: "Honorary Member",
    desc: "Distinguished / retired professionals - By nomination",
  },
]
