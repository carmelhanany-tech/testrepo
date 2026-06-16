import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect("/login")
  const role = (session.user as any)?.role
  if (role === "MANAGER") redirect("/manager")
  if (role === "HR" || role === "ADMIN") redirect("/hr")
  redirect("/dashboard")
}
