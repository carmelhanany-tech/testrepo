import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const totalSessions = await prisma.session.count()

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: { manager: true, progress: true, checkupResults: true },
    orderBy: { startDate: "desc" },
  })

  const data = employees.map((emp) => {
    const completed = emp.progress.filter((p) => p.status === "COMPLETED").length
    const avgScore =
      emp.checkupResults.length > 0
        ? Math.round(
            emp.checkupResults.reduce((a, b) => a + b.score, 0) /
              emp.checkupResults.length
          )
        : null
    const finalScore =
      emp.checkupResults.length === totalSessions && avgScore !== null
        ? Math.round((avgScore / 100) * 10 * 10) / 10
        : null
    const status =
      completed === totalSessions
        ? "COMPLETED"
        : emp.progress.some((p) => p.status === "IN_PROGRESS")
        ? "IN_PROGRESS"
        : emp.progress.length > 0
        ? "IN_PROGRESS"
        : "NOT_STARTED"

    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      startDate: emp.startDate,
      manager: emp.manager?.name ?? "—",
      completed,
      total: totalSessions,
      avgScore,
      finalScore,
      status,
    }
  })

  return NextResponse.json({ employees: data, totalSessions })
}
