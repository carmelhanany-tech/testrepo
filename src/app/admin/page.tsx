import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import AdminClient from "./AdminClient"

export default async function AdminPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")
  const role = (session.user as any)?.role
  if (role !== "ADMIN" && role !== "HR") redirect("/dashboard")

  const weeks = await prisma.week.findMany({
    orderBy: { number: "asc" },
    include: {
      sessions: {
        orderBy: { order: "asc" },
        include: {
          terms: true,
          questions: true,
          _count: { select: { progress: true } },
        },
      },
    },
  })

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: { manager: true, progress: true },
    orderBy: { startDate: "desc" },
  })

  const managers = await prisma.user.findMany({
    where: { role: { in: ["MANAGER", "HR", "ADMIN"] } },
    select: { id: true, name: true, role: true },
  })

  const weeksData = weeks.map((w) => ({
    ...w,
    sessions: w.sessions.map((s) => ({
      ...s,
      progressCount: s._count.progress,
    })),
  }))

  const empData = employees.map((e) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    startDate: e.startDate.toISOString(),
    managerName: e.manager?.name ?? null,
    sessionsStarted: e.progress.length,
  }))

  return (
    <AdminClient
      weeks={weeksData as any}
      employees={empData}
      managers={managers}
    />
  )
}
