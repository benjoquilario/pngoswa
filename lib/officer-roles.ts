export const officerRoleOptions = [
  "President",
  "Vice President for Internal Affairs",
  "Vice President for External Affairs",
  "Secretary",
  "Assistant Secretary",
  "Treasurer",
  "Auditor",
  "Public Relations Officer - NCR",
  "Public Relations Officer - Luzon",
  "Public Relations Officer - Visayas",
  "Public Relations Officer",
] as const

export function formatOfficerRoleName(roleName: string | null | undefined) {
  const normalized = roleName?.trim()

  return normalized?.length ? normalized : "Member"
}
