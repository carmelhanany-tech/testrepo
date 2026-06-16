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
        ? Math.round(emp.checkupResults.reduce((a, b) => a + b.score, 0) / emp.checkupResults.length)
        : null
    const status =
      pct === 100 ? "COMPLETED"
      : emp.progress.length > 0 ? "IN_PROGRESS"
      : "NOT_STARTED"
    return { id: emp.id, name: emp.name, email: emp.email, startDate: emp.startDate.toISOString(), manager: emp.manager?.name ?? "—", completed, total: totalSessions, pct, avgScore, status }
  })

  const stats = {
    total: employees.length,
    inProgress: enriched.filter((e) => e.status === "IN_PROGRESS").length,
    completed: enriched.filter((e) => e.status === "COMPLETED").length,
    avgScore: employees.flatMap((e) => e.checkupResults).length > 0
      ? Math.round(employees.flatMap((e) => e.checkupResults).reduce((a, b) => a + b.score, 0) / employees.flatMap((e) => e.checkupResults).length)
      : 0,
  }

  const statusLabel: Record<string, string> = { COMPLETED: "Complete", IN_PROGRESS: "In Progress", NOT_STARTED: "Not Started" }
  const statusStyle: Record<string, React.CSSProperties> = {
    COMPLETED: { backgroundColor: "var(--success-light)", color: "var(--success)" },
    IN_PROGRESS: { backgroundColor: "var(--accent-light)", color: "var(--accent-dark)" },
    NOT_STARTED: { backgroundColor: "var(--surface-subtle)", color: "var(--text-muted)" },
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Top bar */}
      <div style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#D4845A", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px" }}>E</div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Onboarding Overview</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>First-month journey tracking</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {role === "ADMIN" && (
            <a href="/admin" style={{ fontSize: "12px", fontWeight: "600", padding: "7px 14px", borderRadius: "8px", backgroundColor: "var(--surface-subtle)", color: "var(--text-secondary)", textDecoration: "none", border: "1px solid var(--border)" }}>Admin</a>
          )}
          <a href="/manager" style={{ fontSize: "12px", fontWeight: "600", padding: "7px 14px", borderRadius: "8px", backgroundColor: "var(--surface-subtle)", color: "var(--text-secondary)", textDecoration: "none", border: "1px solid var(--border)" }}>Team View</a>
        </div>
      </div>

      <div style={{ padding: "32px 40px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "28px" }}>
          {[
            { label: "Total Onboarding", value: stats.total, color: "var(--text-primary)" },
            { label: "In Progress", value: stats.inProgress, color: "var(--accent)" },
            { label: "Completed", value: stats.completed, color: "var(--success)" },
            { label: "Avg Score", value: stats.avgScore > 0 ? `${stats.avgScore}%` : "—", color: "var(--accent)" },
          ].map((stat) => (
            <div key={stat.label} style={{ backgroundColor: "var(--surface)", borderRadius: "14px", padding: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: stat.color, letterSpacing: "-0.02em", lineHeight: 1, marginBottom: "6px" }}>{stat.value}</div>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ backgroundColor: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)", overflow: "hidden" }}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
            <h2 style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-secondary)" }}>All Employees</h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  {["Employee", "Manager", "Started", "Progress", "Avg Score", "Status"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 20px", fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {enriched.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", fontSize: "13px", color: "var(--text-muted)", fontFamily: "Lora, Georgia, serif", fontStyle: "italic" }}>No employees onboarding yet.</td></tr>
                )}
                {enriched.map((emp, i) => (
                  <tr key={emp.id} style={{ borderBottom: i < enriched.length - 1 ? "1px solid var(--border-subtle)" : "none" }}>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>{emp.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{emp.email}</div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", color: "var(--text-secondary)" }}>{emp.manager}</td>
                    <td style={{ padding: "14px 20px", fontSize: "12px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(emp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ height: "4px", width: "80px", backgroundColor: "var(--surface-subtle)", borderRadius: "100px", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${emp.pct}%`, backgroundColor: emp.pct === 100 ? "var(--success)" : "var(--accent)", borderRadius: "100px" }} />
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap" }}>{emp.completed}/{emp.total}</span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 20px", fontSize: "13px", fontWeight: "700", color: emp.avgScore !== null ? "var(--accent)" : "var(--locked)" }}>
                      {emp.avgScore !== null ? `${emp.avgScore}%` : "—"}
                    </td>
                    <td style={{ padding: "14px 20px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "700", padding: "4px 10px", borderRadius: "100px", whiteSpace: "nowrap", ...statusStyle[emp.status] }}>
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
