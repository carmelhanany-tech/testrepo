"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle, Circle, Lock, LayoutDashboard } from "lucide-react"

export interface SessionItem {
  id: string
  title: string
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
  locked: boolean
}

export interface WeekItem {
  id: string
  number: number
  title: string
  sessions: SessionItem[]
}

interface SidebarProps {
  weeks: WeekItem[]
  userName: string
  role?: string
}

export default function Sidebar({ weeks, userName, role }: SidebarProps) {
  const pathname = usePathname()
  const totalSessions = weeks.reduce((a, w) => a + w.sessions.length, 0)
  const completedSessions = weeks.reduce(
    (a, w) => a + w.sessions.filter((s) => s.status === "COMPLETED").length,
    0
  )
  const pct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  return (
    <aside
      style={{
        width: "272px",
        flexShrink: 0,
        backgroundColor: "var(--surface-warm)",
        borderRight: "1px solid var(--border)",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "700",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          E
        </div>
        <div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: "700",
              color: "var(--text-primary)",
              lineHeight: 1.2,
            }}
          >
            Empathy
          </div>
          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
            Onboarding Platform
          </div>
        </div>
      </div>

      {/* Progress arc */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: "600",
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Journey Progress
          </span>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              color: "var(--accent)",
            }}
          >
            {pct}%
          </span>
        </div>
        <div
          style={{
            height: "4px",
            backgroundColor: "var(--border)",
            borderRadius: "100px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              borderRadius: "100px",
              background:
                pct === 100
                  ? "var(--success)"
                  : "linear-gradient(90deg, var(--accent-dark), var(--accent))",
              transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
        <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>
          {completedSessions} of {totalSessions} sessions complete
        </p>
      </div>

      {/* Navigation */}
      <div style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
        <Link
          href="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 10px",
            borderRadius: "10px",
            fontSize: "13px",
            fontWeight: "600",
            marginBottom: "20px",
            textDecoration: "none",
            backgroundColor: pathname === "/dashboard" ? "var(--accent)" : "transparent",
            color: pathname === "/dashboard" ? "white" : "var(--text-secondary)",
          }}
        >
          <LayoutDashboard size={15} />
          Overview
        </Link>

        <p
          style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "var(--text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 10px",
            marginBottom: "12px",
          }}
        >
          My Journey
        </p>

        {/* Timeline */}
        <div style={{ position: "relative" }}>
          {/* Vertical thread line */}
          <div
            style={{
              position: "absolute",
              left: "19px",
              top: "12px",
              bottom: "12px",
              width: "1.5px",
              backgroundColor: "var(--border)",
              zIndex: 0,
            }}
          />

          {weeks.map((week) => (
            <WeekSection key={week.id} week={week} currentPath={pathname} />
          ))}
        </div>
      </div>

      {/* User footer */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            backgroundColor: "var(--text-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "11px",
            fontWeight: "700",
            flexShrink: 0,
          }}
        >
          {userName.charAt(0).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "600",
              color: "var(--text-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {userName}
          </div>
          {role && (
            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                textTransform: "capitalize",
              }}
            >
              {role.toLowerCase()}
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

function WeekSection({
  week,
  currentPath,
}: {
  week: WeekItem
  currentPath: string
}) {
  const allCompleted = week.sessions.every((s) => s.status === "COMPLETED")

  return (
    <div style={{ marginBottom: "20px", position: "relative", zIndex: 1 }}>
      {/* Week label */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "4px 10px",
          marginBottom: "4px",
        }}
      >
        <div
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "10px",
            fontWeight: "700",
            flexShrink: 0,
            zIndex: 2,
            position: "relative",
            ...(allCompleted
              ? { backgroundColor: "var(--success)", color: "white" }
              : {
                  backgroundColor: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-muted)",
                }),
          }}
        >
          {allCompleted ? "✓" : week.number}
        </div>
        <span
          style={{
            fontSize: "11px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: allCompleted ? "var(--success)" : "var(--text-secondary)",
          }}
        >
          Week {week.number}
        </span>
      </div>

      {/* Sessions */}
      <div style={{ paddingLeft: "8px" }}>
        {week.sessions.map((session) => {
          const isActive = currentPath === `/session/${session.id}`

          if (session.locked) {
            return (
              <div
                key={session.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 10px 6px 20px",
                  marginBottom: "2px",
                }}
              >
                <Lock size={11} style={{ color: "var(--locked)", flexShrink: 0 }} />
                <span
                  style={{
                    fontSize: "12px",
                    color: "var(--locked)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {session.title}
                </span>
              </div>
            )
          }

          return (
            <Link
              key={session.id}
              href={`/session/${session.id}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 10px 6px 20px",
                marginBottom: "2px",
                borderRadius: "8px",
                textDecoration: "none",
                position: "relative",
                ...(isActive
                  ? {
                      backgroundColor: "var(--accent)",
                      boxShadow: "0 2px 8px rgba(212, 132, 90, 0.3)",
                    }
                  : {
                      backgroundColor: "transparent",
                    }),
              }}
            >
              {/* Status dot — the signature element */}
              <div style={{ flexShrink: 0, position: "relative", zIndex: 2 }}>
                {session.status === "COMPLETED" ? (
                  <CheckCircle
                    size={13}
                    style={{ color: isActive ? "white" : "var(--success)" }}
                  />
                ) : session.status === "IN_PROGRESS" ? (
                  <div
                    style={{
                      width: "13px",
                      height: "13px",
                      borderRadius: "50%",
                      border: `2px solid ${isActive ? "white" : "var(--accent)"}`,
                      backgroundColor: isActive ? "rgba(255,255,255,0.3)" : "var(--accent-light)",
                      boxShadow: isActive ? "none" : "0 0 0 3px var(--accent-light)",
                    }}
                  />
                ) : (
                  <Circle
                    size={13}
                    style={{ color: isActive ? "white" : "var(--border)" }}
                  />
                )}
              </div>

              <span
                style={{
                  fontSize: "12px",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive
                    ? "white"
                    : session.status === "COMPLETED"
                    ? "var(--text-secondary)"
                    : "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {session.title}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
