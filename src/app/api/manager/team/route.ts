import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const manager = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!manager) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const totalSessions = await prisma.session.count()

  const where =
    manager.role === "MANAGER"
      ? { managerId: manager.id }
      : { role: "EMPLOYEE" }

  const team = await prisma.user.findMany({
    where,
    include: {
      progress: { include: { session: { include: { week: true } } } },
      checkupResults: true,
    },
  })

  const teamData = team.map((emp) => {
    const completed = emp.progress.filter((p) => p.status === "COMPLETED").length
    const avgScore =
      emp.checkupResults.length > 0
        ? Math.round(
            emp.checkupResults.reduce((a, b) => a + b.score, 0) /
              emp.checkupResults.length
          )
        : null
    const inProgress = emp.progress.find((p) => p.status === "IN_PROGRESS")
    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      startDate: emp.startDate,
      completed,
      total: totalSessions,
      avgScore,
      currentSession: inProgress?.session?.title ?? null,
    }
  })

  return NextResponse.json({ team: teamData })
}
