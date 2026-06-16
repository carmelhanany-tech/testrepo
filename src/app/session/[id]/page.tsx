import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import SessionClient from "./SessionClient"

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")

  const user = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!user) redirect("/login")

  const { id } = await params

  const dbSession = await prisma.session.findUnique({
    where: { id },
    include: {
      week: true,
      terms: true,
      questions: { orderBy: { order: "asc" } },
      progress: { where: { userId: user.id } },
      checkupResults: { where: { userId: user.id } },
    },
  })
  if (!dbSession) redirect("/dashboard")

  const weeks = await prisma.week.findMany({
    orderBy: { number: "asc" },
    include: {
      sessions: {
        orderBy: { order: "asc" },
        include: { progress: { where: { userId: user.id } } },
      },
    },
  })

  let unlockedNext = true
  const weeksProcessed = weeks.map((week) => ({
    ...week,
    sessions: week.sessions.map((s) => {
      const status = (s.progress[0]?.status ?? "NOT_STARTED") as
        | "NOT_STARTED"
        | "IN_PROGRESS"
        | "COMPLETED"
      const locked = !unlockedNext
      if (!locked && status !== "COMPLETED") unlockedNext = false
      return { ...s, status, locked }
    }),
  }))

  const thisSession = weeksProcessed
    .flatMap((w) => w.sessions)
    .find((s) => s.id === id)

  if (thisSession?.locked) redirect("/dashboard")

  // All terms from completed sessions + current session
  const completedSessionIds = weeksProcessed
    .flatMap((w) => w.sessions)
    .filter((s) => s.status === "COMPLETED")
    .map((s) => s.id)

  const allTerms = await prisma.term.findMany({
    where: { sessionId: { in: [...completedSessionIds, id] } },
    include: { session: { select: { title: true } } },
  })

  return (
    <SessionClient
      session={dbSession}
      userName={user.name}
      weeks={weeksProcessed}
      initialStatus={dbSession.progress[0]?.status ?? "NOT_STARTED"}
      existingResult={dbSession.checkupResults[0] ?? null}
      allTerms={allTerms}
    />
  )
}
