import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })
  if (!user || (user.role !== "ADMIN" && user.role !== "HR")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { name, email, password, managerId } = await req.json()
  const hashed = await bcrypt.hash(password, 10)

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role: "EMPLOYEE",
      managerId: managerId || null,
    },
  })

  return NextResponse.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email } })
}
