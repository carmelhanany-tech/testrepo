import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import DashboardClient from "./DashboardClient"

function buildWeeksWithStatus(weeks: any[], userId: string) {
  let unlockedNext = true
  return weeks.map((week) => ({
    ...week,
    sessions: week.sessions.map((s: any) => {
      const prog = s.progress[0]
      const status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" =
        prog?.status ?? "NOT_STARTED"
      const locked = !unlockedNext
      if (!locked && status !== "COMPLETED") unlockedNext = false
      return { ...s, status, locked }
    }),
  }))
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")
  const role = (session.user as any)?.role
  if (role === "MANAGER") redirect("/manager")
  if (role === "HR" || role === "ADMIN") redirect("/hr")

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) redirect("/login")

  const weeks = await prisma.week.findMany({
    orderBy: { number: "asc" },
    include: {
      sessions: {
        orderBy: { order: "asc" },
        include: {
          progress: { where: { userId: user.id } },
          checkupResults: { where: { userId: user.id } },
        },
      },
    },
  })

  const totalSessions = weeks.reduce((a, w) => a + w.sessions.length, 0)
  const completedSessions = weeks.reduce(
    (a, w) =>
      a + w.sessions.filter((s) => s.progress[0]?.status === "COMPLETED").length,
    0
  )

  const weeksProcessed = buildWeeksWithStatus(weeks, user.id)

  const allCheckups = weeks.flatMap((w) =>
    w.sessions.flatMap((s) => s.checkupResults)
  )
  const allDone = completedSessions === totalSessions && totalSessions > 0
  const finalScore =
    allDone && allCheckups.length === totalSessions
      ? Math.round(
          allCheckups.reduce((a, b) => a + b.score, 0) / allCheckups.length / 10
        )
      : null

  return (
    <DashboardClient
      user={{ name: user.name, email: user.email }}
      weeks={weeksProcessed}
      totalSessions={totalSessions}
      completedSessions={completedSessions}
      finalScore={finalScore}
    />
  )
}
