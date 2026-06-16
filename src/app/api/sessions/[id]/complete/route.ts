import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const { id } = await params

  await prisma.sessionProgress.upsert({
    where: { userId_sessionId: { userId: user.id, sessionId: id } },
    update: { status: "COMPLETED", completedAt: new Date() },
    create: { userId: user.id, sessionId: id, status: "COMPLETED", completedAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
