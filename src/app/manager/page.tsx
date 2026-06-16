import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function ManagerPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")
  const role = (session.user as any)?.role
  if (role === "EMPLOYEE") redirect("/dashboard")

  const manager = await prisma.user.findUnique({ where: { email: session.user.email! } })
  if (!manager) redirect("/login")

  const totalSessions = await prisma.session.count()

  const where =
    role === "MANAGER" ? { managerId: manager.id } : { role: "EMPLOYEE" }

  const team = await prisma.user.findMany({
    where,
    include: {
      progress: { include: { session: { include: { week: true } } } },
      checkupResults: true,
    },
    orderBy: { startDate: "desc" },
  })

  const teamData = team.map((emp) => {
    const completed = emp.progress.filter((p) => p.status === "COMPLETED").length
    const pct = totalSessions > 0 ? Math.round((completed / totalSessions) * 100) : 0
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
      startDate: emp.startDate.toISOString(),
      completed,
      total: totalSessions,
      pct,
      avgScore,
      currentSession: inProgress?.session?.title ?? null,
    }
  })

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#F7FAFC" }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {role === "MANAGER" ? "My Team" : "All Employees"}
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              {team.length} employee{team.length !== 1 ? "s" : ""} currently onboarding
            </p>
          </div>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: "#ED8936" }}
          >
            {manager.name.charAt(0)}
          </div>
        </div>

        {/* Nav links */}
        <div className="flex gap-3 mb-6">
          <a
            href="/manager"
            className="text-sm font-medium px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: "#ED8936" }}
          >
            Team View
          </a>
          {(role === "HR" || role === "ADMIN") && (
            <a
              href="/hr"
              className="text-sm font-medium px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              HR Overview
            </a>
          )}
          {role === "ADMIN" && (
            <a
              href="/admin"
              className="text-sm font-medium px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              Admin Panel
            </a>
          )}
        </div>

        {/* Team cards */}
        {teamData.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">👥</div>
            <p className="text-gray-500 text-sm">No team members onboarding yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {teamData.map((emp) => (
              <div key={emp.id} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ backgroundColor: "#4A5568" }}
                    >
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{emp.name}</div>
                      <div className="text-sm text-gray-400">{emp.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className="text-2xl font-bold"
                      style={{ color: "#ED8936" }}
                    >
                      {emp.pct}%
                    </div>
                    <div className="text-xs text-gray-400">
                      {emp.completed}/{emp.total} sessions
                    </div>
                  </div>
                </div>

                <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${emp.pct}%`, backgroundColor: "#ED8936" }}
                  />
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>
                    Started{" "}
                    {new Date(emp.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  {emp.avgScore !== null && (
                    <span>
                      Avg score:{" "}
                      <strong style={{ color: "#ED8936" }}>{emp.avgScore}%</strong>
                    </span>
                  )}
                  {emp.currentSession && (
                    <span>
                      Currently:{" "}
                      <strong className="text-gray-700">{emp.currentSession}</strong>
                    </span>
                  )}
                  {emp.pct === 100 && (
                    <span className="text-green-500 font-semibold">✓ Complete</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
