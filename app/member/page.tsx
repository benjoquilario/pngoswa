import { redirect } from "next/navigation"

import { getCurrentPortalSession } from "@/lib/auth"

export default async function MemberIndexPage() {
  const session = await getCurrentPortalSession("MEMBER")

  if (session) {
    redirect("/member/profile")
  }

  redirect("/member/login")
}
