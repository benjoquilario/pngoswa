import { redirect } from "next/navigation"

import { getCurrentPortalSession } from "@/lib/auth"

export default async function AdminIndexPage() {
  const session = await getCurrentPortalSession("ADMIN")

  if (session) {
    redirect("/admin/dashboard")
  }

  redirect("/admin/login")
}
