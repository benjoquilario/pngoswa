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
