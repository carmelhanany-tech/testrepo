import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { id } = await params
  const { answers } = await req.json()

  const questions = await prisma.question.findMany({ where: { sessionId: id } })

  let correct = 0
  for (const q of questions) {
    if (answers[q.id] === q.answer) correct++
  }
  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0

  await prisma.checkupResult.upsert({
    where: { userId_sessionId: { userId: user.id, sessionId: id } },
    update: { answers: JSON.stringify(answers), score, total: questions.length, correct },
    create: {
      userId: user.id,
      sessionId: id,
      answers: JSON.stringify(answers),
      score,
      total: questions.length,
      correct,
    },
  })

  return NextResponse.json({ score, correct, total: questions.length })
}
