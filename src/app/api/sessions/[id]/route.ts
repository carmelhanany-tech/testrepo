import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

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

  return NextResponse.json({ session: dbSession, userId: user.id })
}
