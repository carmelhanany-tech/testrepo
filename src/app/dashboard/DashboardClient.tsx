"use client"
import Sidebar, { WeekItem } from "@/components/Sidebar"
import Link from "next/link"
import { CheckCircle, Clock, Lock, Sparkles, ArrowRight } from "lucide-react"

interface Props {
  user: { name: string; email: string }
  weeks: any[]
  totalSessions: number
  completedSessions: number
  finalScore: number | null
}

export default function DashboardClient({
  user,
  weeks,
  totalSessions,
  completedSessions,
  finalScore,
}: Props) {
  const pct =
    totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  const sidebarWeeks: WeekItem[] = weeks.map((w) => ({
    id: w.id,
    number: w.number,
    title: w.title,
    sessions: w.sessions.map((s: any) => ({
      id: s.id,
      title: s.title,
      status: s.status,
      locked: s.locked,
    })),
  }))

  let nextSession: any = null
  for (const week of weeks) {
    for (const s of week.sessions) {
      if (!s.locked && s.status !== "COMPLETED") {
        nextSession = { ...s, weekNumber: week.number, weekTitle: week.title }
        break
      }
    }
    if (nextSession) break
  }

  const firstName = user.name.split(" ")[0]

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Sidebar weeks={sidebarWeeks} userName={user.name} role="EMPLOYEE" />

      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
            padding: "18px 32px",
          }}
        >
          <h1
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome back, {firstName}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Here&apos;s where you are in your onboarding journey.
          </p>
        </div>

        <div style={{ padding: "32px", maxWidth: "760px" }}>

          {/* Final score */}
          {finalScore !== null && (
            <div
              style={{
                borderRadius: "16px",
                padding: "24px",
                marginBottom: "24px",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                background: "linear-gradient(135deg, var(--text-primary), #2D4A63)",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(212, 132, 90, 0.2)",
                  border: "1px solid rgba(212, 132, 90, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles style={{ color: "var(--accent)" }} size={24} />
              </div>
              <div>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px" }}>
                  Onboarding Complete
                </p>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                  <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--accent)", letterSpacing: "-0.02em" }}>
                    {finalScore}
                  </span>
                  <span style={{ fontSize: "16px", color: "rgba(255,255,255,0.4)" }}>/10</span>
                </div>
              </div>
            </div>
          )}

          {/* Progress card */}
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "var(--shadow-sm)",
              border: "1px solid var(--border)",
              marginBottom: "20px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)" }}>
                Overall Progress
              </span>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--accent)" }}>
                {completedSessions}/{totalSessions} sessions
              </span>
            </div>

            {/* Bar */}
            <div
              style={{
                height: "6px",
                backgroundColor: "var(--surface-subtle)",
                borderRadius: "100px",
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: "100px",
                  background: pct === 100
                    ? "var(--success)"
                    : "linear-gradient(90deg, var(--accent-dark), var(--accent))",
                  transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>

            {/* Week steps */}
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              {weeks.map((week, i) => {
                const done = week.sessions.every((s: any) => s.status === "COMPLETED")
                const active = !done && week.sessions.some(
                  (s: any) => !s.locked
                )
                return (
                  <div
                    key={week.id}
                    style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}
                  >
                    {i > 0 && (
                      <div
                        style={{
                          height: "1px",
                          flex: 1,
                          backgroundColor: done ? "var(--accent)" : "var(--border)",
                        }}
                      />
                    )}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "11px",
                          fontWeight: "700",
                          flexShrink: 0,
                          ...(done
                            ? { backgroundColor: "var(--success)", color: "white" }
                            : active
                            ? { backgroundColor: "var(--accent-light)", color: "var(--accent)", border: "2px solid var(--accent)" }
                            : { backgroundColor: "var(--surface-subtle)", color: "var(--text-muted)", border: "1.5px solid var(--border)" }),
                        }}
                      >
                        {done ? "✓" : week.number}
                      </div>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: "600",
                          color: done ? "var(--success)" : active ? "var(--text-primary)" : "var(--text-muted)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {week.title.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Continue CTA */}
          {nextSession && (
            <div
              style={{
                backgroundColor: "var(--surface)",
                borderRadius: "16px",
                padding: "24px",
                boxShadow: "var(--shadow-sm)",
                border: "1px solid var(--border)",
                borderLeft: "4px solid var(--accent)",
                marginBottom: "20px",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "700",
                  color: "var(--accent)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  marginBottom: "6px",
                }}
              >
                {nextSession.status === "IN_PROGRESS" ? "Continue where you left off" : `Up next · Week ${nextSession.weekNumber}`}
              </p>
              <h3
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  letterSpacing: "-0.01em",
                  marginBottom: "16px",
                }}
              >
                {nextSession.title}
              </h3>
              <Link
                href={`/session/${nextSession.id}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 20px",
                  borderRadius: "10px",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                {nextSession.status === "IN_PROGRESS" ? "Continue Session" : "Start Session"}
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Week cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {weeks.map((week) => {
              const done = week.sessions.filter((s: any) => s.status === "COMPLETED").length
              const total = week.sessions.length
              const weekPct = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <div
                  key={week.id}
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "16px",
                    padding: "20px 24px",
                    boxShadow: "var(--shadow-sm)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
                    <div>
                      <p
                        style={{
                          fontSize: "10px",
                          fontWeight: "700",
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          marginBottom: "2px",
                        }}
                      >
                        Week {week.number}
                      </p>
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: "700",
                          color: "var(--text-primary)",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {week.title}
                      </h3>
                    </div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "4px 10px",
                        borderRadius: "100px",
                        ...(weekPct === 100
                          ? { backgroundColor: "var(--success-light)", color: "var(--success)" }
                          : { backgroundColor: "var(--accent-light)", color: "var(--accent)" }),
                      }}
                    >
                      {done}/{total}
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    {week.sessions.map((s: any) => (
                      <div
                        key={s.id}
                        style={{ display: "flex", alignItems: "center", gap: "10px" }}
                      >
                        {s.status === "COMPLETED" ? (
                          <CheckCircle size={14} style={{ color: "var(--success)", flexShrink: 0 }} />
                        ) : s.status === "IN_PROGRESS" ? (
                          <Clock size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        ) : s.locked ? (
                          <Lock size={14} style={{ color: "var(--locked)", flexShrink: 0 }} />
                        ) : (
                          <div
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              border: "1.5px solid var(--border)",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <span
                          style={{
                            fontSize: "13px",
                            color: s.locked ? "var(--locked)" : "var(--text-secondary)",
                            flex: 1,
                          }}
                        >
                          {s.title}
                        </span>
                        {s.checkupResults?.[0] && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "700",
                              color: "var(--accent)",
                            }}
                          >
                            {s.checkupResults[0].score}%
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
