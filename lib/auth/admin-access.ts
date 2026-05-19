import { prisma } from "@/lib/db"

export function getConfiguredAdminEmails() {
  return Array.from(
    new Set(
      (process.env.ADMIN_EMAILS ?? "")
        .split(/[\s,;]+/)
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    )
  )
}

export function getConfiguredPresidentEmails() {
  const explicitPresidentEmails = Array.from(
    new Set(
      (process.env.PRESIDENT_EMAILS ?? "")
        .split(/[\s,;]+/)
        .map((entry) => entry.trim().toLowerCase())
        .filter(Boolean)
    )
  )

  if (explicitPresidentEmails.length > 0) {
    return explicitPresidentEmails
  }

  const adminEmails = getConfiguredAdminEmails()

  return adminEmails.length > 0 ? [adminEmails[0]] : []
}

export function isPresidentAdminEmail(emailInput: string) {
  const email = emailInput.trim().toLowerCase()

  return email ? getConfiguredPresidentEmails().includes(email) : false
}

export async function findAdminUserByEmail(emailInput: string) {
  const email = emailInput.trim().toLowerCase()

  if (!email) {
    return null
  }

  return prisma.user.findFirst({
    where: {
      email,
      role: "ADMIN",
    },
  })
}
