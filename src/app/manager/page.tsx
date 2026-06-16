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
  const where = role === "MANAGER" ? { managerId: manager.id } : { role: "EMPLOYEE" }

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
        ? Math.round(emp.checkupResults.reduce((a, b) => a + b.score, 0) / emp.checkupResults.length)
        : null
    const inProgress = emp.progress.find((p) => p.status === "IN_PROGRESS")
    return {
      id: emp.id, name: emp.name, email: emp.email,
      startDate: emp.startDate.toISOString(),
      completed, total: totalSessions, pct, avgScore,
      currentSession: (inProgress as any)?.session?.title ?? null,
    }
  })

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Top bar */}
      <div style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#D4845A", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px" }}>E</div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              {role === "MANAGER" ? "My Team" : "All Employees"}
            </h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>
              {team.length} employee{team.length !== 1 ? "s" : ""} onboarding
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {(role === "HR" || role === "ADMIN") && (
            <a href="/hr" style={{ fontSize: "12px", fontWeight: "600", padding: "7px 14px", borderRadius: "8px", backgroundColor: "var(--surface-subtle)", color: "var(--text-secondary)", textDecoration: "none", border: "1px solid var(--border)" }}>HR Overview</a>
          )}
          {role === "ADMIN" && (
            <a href="/admin" style={{ fontSize: "12px", fontWeight: "600", padding: "7px 14px", borderRadius: "8px", backgroundColor: "var(--surface-subtle)", color: "var(--text-secondary)", textDecoration: "none", border: "1px solid var(--border)" }}>Admin</a>
          )}
        </div>
      </div>

      <div style={{ padding: "32px 40px", maxWidth: "900px" }}>
        {teamData.length === 0 ? (
          <div style={{ backgroundColor: "var(--surface)", borderRadius: "16px", padding: "60px", textAlign: "center", border: "1px solid var(--border)" }}>
            <p style={{ color: "var(--text-muted)", fontFamily: "Lora, Georgia, serif", fontStyle: "italic" }}>No team members onboarding yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {teamData.map((emp) => (
              <div key={emp.id} style={{ backgroundColor: "var(--surface)", borderRadius: "16px", padding: "22px 26px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px", flexShrink: 0 }}>
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "var(--text-primary)" }}>{emp.name}</div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>{emp.email}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "26px", fontWeight: "800", color: "var(--accent)", letterSpacing: "-0.02em", lineHeight: 1 }}>{emp.pct}%</div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>{emp.completed}/{emp.total} sessions</div>
                  </div>
                </div>

                <div style={{ height: "4px", backgroundColor: "var(--surface-subtle)", borderRadius: "100px", overflow: "hidden", marginBottom: "12px" }}>
                  <div style={{ height: "100%", width: `${emp.pct}%`, borderRadius: "100px", background: emp.pct === 100 ? "var(--success)" : "linear-gradient(90deg, var(--accent-dark), var(--accent))", transition: "width 0.6s ease" }} />
                </div>

                <div style={{ display: "flex", gap: "20px", fontSize: "12px", color: "var(--text-muted)", flexWrap: "wrap" }}>
                  <span>Started {new Date(emp.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  {emp.avgScore !== null && <span>Avg score: <strong style={{ color: "var(--accent)" }}>{emp.avgScore}%</strong></span>}
                  {emp.currentSession && <span>Currently: <strong style={{ color: "var(--text-secondary)" }}>{emp.currentSession}</strong></span>}
                  {emp.pct === 100 && <span style={{ color: "var(--success)", fontWeight: "600" }}>✓ Complete</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
