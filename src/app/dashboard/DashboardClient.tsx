"use client"
import Sidebar, { WeekItem } from "@/components/Sidebar"
import Link from "next/link"
import { CheckCircle, Clock, Lock, Star, ArrowRight, Sparkles } from "lucide-react"

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
    <div className="flex min-h-screen" style={{ backgroundColor: "#F7FAFC" }}>
      <Sidebar weeks={sidebarWeeks} userName={user.name} role="EMPLOYEE" />

      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-3xl mx-auto">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {firstName} 👋
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Here&apos;s your onboarding progress. Keep going — you&apos;re doing great.
            </p>
          </div>

          {/* Final score banner */}
          {finalScore !== null && (
            <div
              className="rounded-2xl p-6 mb-6 flex items-center gap-5 shadow-sm"
              style={{ background: "linear-gradient(135deg, #ED8936, #C05621)" }}
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="text-white" size={28} />
              </div>
              <div>
                <div className="text-white/80 text-sm font-medium">
                  Onboarding Complete!
                </div>
                <div className="text-white text-3xl font-bold mt-0.5">
                  {finalScore}
                  <span className="text-white/60 text-lg font-normal">/10</span>
                </div>
                <div className="text-white/70 text-xs mt-1">
                  Final score across all 7 sessions
                </div>
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-gray-700 text-sm">Overall Progress</span>
              <span className="text-sm font-bold" style={{ color: "#ED8936" }}>
                {pct}%
              </span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, backgroundColor: "#ED8936" }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {completedSessions} of {totalSessions} sessions completed
            </p>

            {/* Week steps */}
            <div className="flex items-center gap-2 mt-5 pt-4 border-t border-gray-50">
              {weeks.map((week, i) => {
                const done = week.sessions.every((s: any) => s.status === "COMPLETED")
                const active = week.sessions.some(
                  (s: any) => s.status === "IN_PROGRESS" || (!s.locked && s.status === "NOT_STARTED")
                )
                return (
                  <div key={week.id} className="flex items-center gap-2 flex-1 min-w-0">
                    {i > 0 && (
                      <div
                        className="h-px flex-shrink-0 w-4"
                        style={{ backgroundColor: done ? "#ED8936" : "#E2E8F0" }}
                      />
                    )}
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={
                          done
                            ? { backgroundColor: "#ED8936", color: "white" }
                            : active
                            ? { backgroundColor: "#FFF5EC", color: "#ED8936", border: "2px solid #ED8936" }
                            : { backgroundColor: "#EDF2F7", color: "#A0AEC0" }
                        }
                      >
                        {done ? "✓" : week.number}
                      </div>
                      <span
                        className="text-xs font-medium truncate hidden sm:block"
                        style={{ color: done ? "#ED8936" : active ? "#2D3748" : "#A0AEC0" }}
                      >
                        Wk {week.number}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Continue CTA */}
          {nextSession && (
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6 border-l-4" style={{ borderColor: "#ED8936" }}>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                {nextSession.status === "IN_PROGRESS" ? "Continue where you left off" : "Up next · Week " + nextSession.weekNumber}
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {nextSession.title}
              </h3>
              <Link
                href={`/session/${nextSession.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90"
                style={{ backgroundColor: "#ED8936" }}
              >
                {nextSession.status === "IN_PROGRESS" ? "Continue Session" : "Start Session"}
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

          {!nextSession && completedSessions === 0 && (
            <div className="bg-white rounded-2xl p-8 shadow-sm mb-6 text-center">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-bold text-gray-800 mb-2">Ready to begin your journey?</h3>
              <p className="text-gray-500 text-sm mb-4">
                Your onboarding is waiting. Click on Week 1 in the sidebar to get started.
              </p>
            </div>
          )}

          {/* Week cards */}
          <div className="space-y-4">
            {weeks.map((week) => {
              const done = week.sessions.filter((s: any) => s.status === "COMPLETED").length
              const total = week.sessions.length
              const weekPct = total > 0 ? Math.round((done / total) * 100) : 0

              return (
                <div key={week.id} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                        Week {week.number}
                      </div>
                      <h3 className="font-bold text-gray-800 mt-0.5">{week.title}</h3>
                    </div>
                    <span
                      className="text-xs font-bold px-2.5 py-1 rounded-full"
                      style={
                        weekPct === 100
                          ? { backgroundColor: "#F0FFF4", color: "#38A169" }
                          : { backgroundColor: "#FFF5EC", color: "#ED8936" }
                      }
                    >
                      {done}/{total} sessions
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {week.sessions.map((s: any) => (
                      <div key={s.id} className="flex items-center gap-2.5">
                        {s.status === "COMPLETED" ? (
                          <CheckCircle size={14} style={{ color: "#48BB78" }} className="flex-shrink-0" />
                        ) : s.status === "IN_PROGRESS" ? (
                          <Clock size={14} style={{ color: "#ED8936" }} className="flex-shrink-0" />
                        ) : s.locked ? (
                          <Lock size={14} className="text-gray-200 flex-shrink-0" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                        )}
                        <span
                          className="text-sm"
                          style={{ color: s.locked ? "#CBD5E0" : "#4A5568" }}
                        >
                          {s.title}
                        </span>
                        {s.checkupResults?.[0] && (
                          <span className="ml-auto text-xs font-semibold" style={{ color: "#ED8936" }}>
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
