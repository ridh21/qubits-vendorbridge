import { redirect } from "next/navigation"
import { getSessionUser } from "@/lib/rbac"

export default async function Root() {
  const user = await getSessionUser()
  redirect(user ? "/dashboard" : "/login")
}
