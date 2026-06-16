import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function HRPage() {
  const session = await auth()
  if (!session?.user?.email) redirect("/login")
  const role = (session.user as any)?.role
  if (role === "EMPLOYEE") redirect("/dashboard")
  if (role === "MANAGER") redirect("/manager")

  const totalSessions = await prisma.session.count()

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    include: { manager: true, progress: true, checkupResults: true },
    orderBy: { startDate: "desc" },
  })

  const enriched = employees.map((emp) => {
    const completed = emp.progress.filter((p) => p.status === "COMPLETED").length
    const pct = totalSessions > 0 ? Math.round((completed / totalSessions) * 100) : 0
    const avgScore =
      emp.checkupResults.length > 0
        ? Math.round(
            emp.checkupResults.reduce((a, b) => a + b.score, 0) /
              emp.checkupResults.length
          )
        : null
    const status =
      pct === 100
        ? "COMPLETED"
        : emp.progress.some((p) => p.status === "IN_PROGRESS") || emp.progress.length > 0
        ? "IN_PROGRESS"
        : "NOT_STARTED"
    return {
      id: emp.id,
      name: emp.name,
      email: emp.email,
      startDate: emp.startDate.toISOString(),
      manager: emp.manager?.name ?? "—",
      completed,
      total: totalSessions,
      pct,
      avgScore,
      status,
    }
  })

  const stats = {
    total: employees.length,
    inProgress: enriched.filter((e) => e.status === "IN_PROGRESS").length,
    completed: enriched.filter((e) => e.status === "COMPLETED").length,
    avgScore:
      employees.flatMap((e) => e.checkupResults).length > 0
        ? Math.round(
            employees
              .flatMap((e) => e.checkupResults)
              .reduce((a, b) => a + b.score, 0) /
              employees.flatMap((e) => e.checkupResults).length
          )
        : 0,
  }

  const statusLabel: Record<string, string> = {
    COMPLETED: "Completed",
    IN_PROGRESS: "In Progress",
    NOT_STARTED: "Not Started",
  }
  const statusStyle: Record<string, { backgroundColor: string; color: string }> = {
    COMPLETED: { backgroundColor: "#F0FFF4", color: "#38A169" },
    IN_PROGRESS: { backgroundColor: "#FFF5EC", color: "#ED8936" },
    NOT_STARTED: { backgroundColor: "#F7FAFC", color: "#A0AEC0" },
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#F7FAFC" }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-1">Onboarding Overview</h1>
        <p className="text-gray-500 text-sm mb-6">
          Track all employees through their first-month journey
        </p>

        {/* Nav */}
        <div className="flex gap-3 mb-8">
          {role === "ADMIN" && (
            <a
              href="/admin"
              className="text-sm font-medium px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
            >
              Admin Panel
            </a>
          )}
          <a
            href="/manager"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            Team View
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Onboarding", value: stats.total, color: "#4A5568" },
            { label: "In Progress", value: stats.inProgress, color: "#ED8936" },
            { label: "Completed", value: stats.completed, color: "#38A169" },
            {
              label: "Avg Knowledge Score",
              value: stats.avgScore > 0 ? `${stats.avgScore}%` : "—",
              color: "#ED8936",
            },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-5 shadow-sm">
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-700 text-sm">All Employees</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {[
                    "Employee",
                    "Manager",
                    "Started",
                    "Progress",
                    "Avg Score",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-10 text-center text-gray-400 text-sm"
                    >
                      No employees onboarding yet.
                    </td>
                  </tr>
                )}
                {enriched.map((emp) => (
                  <tr
                    key={emp.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-gray-800 text-sm">
                        {emp.name}
                      </div>
                      <div className="text-xs text-gray-400">{emp.email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{emp.manager}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {new Date(emp.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${emp.pct}%`,
                              backgroundColor: "#ED8936",
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {emp.completed}/{emp.total}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: emp.avgScore !== null ? "#ED8936" : "#CBD5E0" }}
                      >
                        {emp.avgScore !== null ? `${emp.avgScore}%` : "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={statusStyle[emp.status]}
                      >
                        {statusLabel[emp.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
