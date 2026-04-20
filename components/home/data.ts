export type Statement = {
  name: string;
  copy: string;
  icon: "eye" | "target" | "flag";
  bg: string;
  accent: string;
};

export const statements: Statement[] = [
  {
    name: "Vision",
    copy: "A society where all NGO social workers are empowered, valued, and equipped to deliver high-quality, sustainable social services that ensure the well-being and development of every community.",
    icon: "eye",
    bg: "var(--navy-50)",
    accent: "var(--navy)",
  },
  {
    name: "Mission",
    copy: "To advocate for the rights and welfare of NGO social workers, enhance their professional development, and foster a collaborative network that drives impactful social change across the country.",
    icon: "target",
    bg: "#FEF2F2",
    accent: "var(--crimson)",
  },
  {
    name: "Goal",
    copy: "To create a unified and empowered community of NGO social workers that promotes excellence, fairness, and sustainability in social service delivery.",
    icon: "flag",
    bg: "#F5F0FF",
    accent: "var(--violet)",
  },
];

export const aboutSummary =
  "unites social workers in the NGO sector to strengthen advocacy, professional growth, and social impact across the Philippines.";

export const aboutFullDescription =
  "The Philippine NGO Social Workers Association (PNGOSWA) is a professional organization established in 2024, exclusively serving social workers in the non-governmental sector. We address the distinct needs of NGO-based practitioners from faith-based organizations and civil society groups to foundations and development projects while championing their rights, welfare, and professional excellence.";

export type GalleryImage = {
  src: string;
  alt: string;
  title: string;
};

export const galleryImages: GalleryImage[] = [
  {
    src: "/gallery-1.jpg",
    alt: "PNGOSWA members during a field engagement activity",
    title: "Community Field Engagement",
  },
  {
    src: "/gallery02.jpg",
    alt: "Social workers joining a collaborative planning session",
    title: "Collaborative Planning Session",
  },
  {
    src: "/gallery03.jpg",
    alt: "Members participating in a regional capability workshop",
    title: "Regional Capability Workshop",
  },
  {
    src: "/gallery04.jpg",
    alt: "Team photo from a social welfare outreach event",
    title: "Outreach and Community Care",
  },
  {
    src: "/gallery05.jpg",
    alt: "PNGOSWA social workers in a knowledge-sharing activity",
    title: "Knowledge Sharing Activity",
  },
  {
    src: "/gallery06.jpg",
    alt: "Association members during a leadership and advocacy forum",
    title: "Leadership and Advocacy Forum",
  },
  {
    src: "/gallery07.jpg",
    alt: "Professional networking event among NGO social workers",
    title: "Professional Networking Event",
  },
  {
    src: "/gallery08.jpg",
    alt: "PNGOSWA participants at a development-focused gathering",
    title: "Development-Focused Gathering",
  },
];

export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "Why should I be part of PNGOSWA?",
    answer:
      "PNGOSWA gives NGO social workers a unified platform where your voice is represented, your welfare is advocated, and your profession is strengthened through shared standards and support.",
  },
  {
    question: "What is in it for me as a member?",
    answer:
      "Members gain access to trainings, seminars, certifications, networking opportunities, and practical resources that support both day-to-day practice and long-term career growth.",
  },
  {
    question: "Why would I join now?",
    answer:
      "Joining early allows you to help shape programs, influence sector priorities, and build meaningful partnerships with peers and institutions across the country.",
  },
  {
    question: "What are the advantages if I join?",
    answer:
      "You receive formal membership recognition, learning opportunities, policy and legal support pathways, and stronger professional visibility in the NGO social work community.",
  },
];

export type ProgramItem = { label: string; detail: string };
export type Program = { title: string; items: ProgramItem[] };

export const objectives = [
  "Advocate for the rights, welfare, and protection of all NGO social workers, and lobby for fair wages, benefits, and working conditions.",
  "Provide continuous training and professional development opportunities to strengthen skills and knowledge across the sector.",
  "Create a platform for knowledge sharing and collaboration among NGO social workers across regions and settings.",
  "Develop recognition programs that honor the outstanding contributions of NGO social workers.",
  "Implement programs that support mental health and overall well-being of NGO social workers.",
  "Offer technical assistance and capacity-building support to NGOs to improve human resource and organizational practices.",
  "Build strong local and international partnerships for the continued advancement of NGO social work in the Philippines.",
];

export const programs: Program[] = [
  {
    title: "Advocacy & Policy Reform",
    items: [
      {
        label: "Policy Advocacy",
        detail:
          "Conduct campaigns and lobbying efforts to promote fair wages, benefits, and working conditions.",
      },
      {
        label: "Legal Assistance",
        detail:
          "Provide legal support and resources for NGO social workers facing employment-related concerns.",
      },
    ],
  },
  {
    title: "Professional Development",
    items: [
      {
        label: "Training & Workshops",
        detail:
          "Offer regular capability sessions on social work best practices and specialized competencies.",
      },
      {
        label: "Certification & Accreditation",
        detail:
          "Develop standards-focused certification pathways for NGO social work practice.",
      },
      {
        label: "Scholarships & Grants",
        detail:
          "Facilitate access to scholarship and grant opportunities for further studies.",
      },
    ],
  },
  {
    title: "Resource Sharing & Networking",
    items: [
      {
        label: "Conferences & Seminars",
        detail:
          "Organize annual and regional gatherings that promote collaboration and professional exchange.",
      },
      {
        label: "Online Resource Center",
        detail:
          "Create a central online platform with tools and practical resources for NGO social workers.",
      },
    ],
  },
  {
    title: "Health & Well-being Support",
    items: [
      {
        label: "Mental Health Services",
        detail:
          "Implement counseling support, stress management, and wellness programs for members.",
      },
      {
        label: "Health Insurance Access",
        detail:
          "Advocate for affordable and comprehensive health insurance opportunities.",
      },
      {
        label: "Safety Protocols",
        detail:
          "Develop safety protocols and preparedness training for high-risk contexts.",
      },
    ],
  },
  {
    title: "Recognition & Growth",
    items: [
      {
        label: "Awards & Recognition",
        detail:
          "Establish annual recognition initiatives that celebrate exceptional contributions.",
      },
      {
        label: "Career Development",
        detail:
          "Create growth pathways and practical support for long-term professional advancement.",
      },
    ],
  },
  {
    title: "Organizational Strengthening",
    items: [
      {
        label: "Capacity Building",
        detail:
          "Deliver capacity-building support to NGOs to improve systems and workplace practices.",
      },
      {
        label: "Partnership Development",
        detail:
          "Facilitate collaboration with local and international organizations.",
      },
      {
        label: "Funding Assistance",
        detail:
          "Support NGOs in accessing funding opportunities that improve service delivery.",
      },
    ],
  },
  {
    title: "Monitoring & Evaluation",
    items: [
      {
        label: "Impact Assessment",
        detail:
          "Regularly evaluate the effectiveness of programs and use data to improve outcomes.",
      },
      {
        label: "Feedback Mechanisms",
        detail:
          "Implement robust feedback channels where members can suggest improvements.",
      },
    ],
  },
  {
    title: "Community Engagement",
    items: [
      {
        label: "Grassroots Mobilization",
        detail:
          "Engage communities in identifying needs and co-developing social welfare initiatives.",
      },
      {
        label: "Empowerment Workshops",
        detail:
          "Conduct workshops that help communities become self-reliant and proactive.",
      },
    ],
  },
  {
    title: "Information & Awareness",
    items: [
      {
        label: "Public Awareness",
        detail:
          "Launch campaigns that highlight the role, value, and contributions of NGO social workers.",
      },
      {
        label: "Educational Outreach",
        detail:
          "Develop educational materials and outreach activities for communities and stakeholders.",
      },
    ],
  },
  {
    title: "Crisis Intervention",
    items: [
      {
        label: "Emergency Response",
        detail:
          "Establish rapid response support for NGO social workers during crises and emergencies.",
      },
      {
        label: "Peer Support Networks",
        detail:
          "Build peer support spaces where social workers can share experiences and practical support.",
      },
    ],
  },
];

export const scopeCoverage = [
  "Community-based NGOs",
  "NGOs with residential centers",
  "Business or corporate settings",
  "Faith-based organizations",
  "International and humanitarian organizations",
  "Private school practitioners",
  "Private hospitals and clinics practitioners",
  "Individual practitioners and consultants",
];

export const membershipRequirements = [
  "Complete the PNGOSWA membership application form (online system in development).",
  "Submit documentary requirements: valid PRC license and NGO employment certificate.",
  "Pay membership fees (annual or lifetime) and monthly dues as determined by the officers.",
  "Attend PNGOSWA orientation and seminars.",
  "Abide by PNGOSWA policies, code of conduct, and association standards.",
  "Actively support association programs, services, and activities.",
];

export const memberBenefits = [
  "PNGOSWA membership identification and controlled member verification.",
  "Certificate of participation for orientation, seminars, trainings, and conferences.",
  "Access to networking opportunities, professional development updates, advocacy participation, committees, and recognition pathways.",
  "Access to discounted event rates and endorsements for local and international training activities.",
];
