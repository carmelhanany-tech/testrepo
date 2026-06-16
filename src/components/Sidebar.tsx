"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CheckCircle, Circle, Lock, BookOpen, LayoutDashboard } from "lucide-react"

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

  return (
    <aside
      className="w-72 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col"
      style={{ height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}
    >
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0"
            style={{ backgroundColor: "#ED8936" }}
          >
            E
          </div>
          <div>
            <div className="font-bold text-gray-800 text-sm leading-tight">Empathy</div>
            <div className="text-xs text-gray-400">Onboarding Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 p-4 overflow-y-auto">
        <Link
          href="/dashboard"
          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium mb-5 transition-all ${
            pathname === "/dashboard" ? "text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
          }`}
          style={pathname === "/dashboard" ? { backgroundColor: "#ED8936" } : {}}
        >
          <LayoutDashboard size={16} />
          My Dashboard
        </Link>

        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
          My Journey
        </div>

        {weeks.map((week) => (
          <WeekSection key={week.id} week={week} currentPath={pathname} />
        ))}
      </div>

      {/* User footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ backgroundColor: "#4A5568" }}
          >
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-gray-700 truncate">{userName}</div>
            {role && (
              <div className="text-xs text-gray-400 capitalize">{role.toLowerCase()}</div>
            )}
          </div>
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
    <div className="mb-5">
      <div className="flex items-center gap-2.5 px-3 py-1.5 mb-1">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all"
          style={
            allCompleted
              ? { backgroundColor: "#ED8936", color: "white" }
              : { backgroundColor: "#EDF2F7", color: "#718096" }
          }
        >
          {week.number}
        </div>
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
          Week {week.number}
        </span>
      </div>

      <div className="ml-2 pl-4 border-l-2 border-gray-100 space-y-0.5">
        {week.sessions.map((session) => {
          const isActive = currentPath === `/session/${session.id}`

          if (session.locked) {
            return (
              <div
                key={session.id}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
              >
                <Lock size={13} className="flex-shrink-0 text-gray-300" />
                <span className="text-xs text-gray-300 truncate">{session.title}</span>
              </div>
            )
          }

          return (
            <Link
              key={session.id}
              href={`/session/${session.id}`}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-xs font-medium truncate ${
                isActive ? "text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
              }`}
              style={isActive ? { backgroundColor: "#ED8936" } : {}}
            >
              {session.status === "COMPLETED" ? (
                <CheckCircle
                  size={13}
                  className="flex-shrink-0"
                  style={{ color: isActive ? "white" : "#48BB78" }}
                />
              ) : session.status === "IN_PROGRESS" ? (
                <div
                  className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                  style={{
                    borderColor: isActive ? "white" : "#ED8936",
                    backgroundColor: isActive ? "rgba(255,255,255,0.3)" : "transparent",
                  }}
                />
              ) : (
                <Circle size={13} className="flex-shrink-0 text-gray-300" />
              )}
              <span className="truncate">{session.title}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
