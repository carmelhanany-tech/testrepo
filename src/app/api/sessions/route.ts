import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const weeks = await prisma.week.findMany({
    orderBy: { number: "asc" },
    include: {
      sessions: {
        orderBy: { order: "asc" },
        include: {
          progress: { where: { userId: user.id } },
          checkupResults: { where: { userId: user.id } },
          terms: true,
          questions: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  return NextResponse.json({ weeks, userId: user.id })
}
