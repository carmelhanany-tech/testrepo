"use client"
import { useState } from "react"
import { BookOpen, Users, Plus, Edit2, ChevronDown } from "lucide-react"

interface WeekData {
  id: string
  number: number
  title: string
  sessions: {
    id: string
    title: string
    contentType: string
    questions: any[]
    terms: any[]
    progressCount: number
    notionUrl: string | null
    slidesUrl: string | null
    videoUrl: string | null
    textContent: string | null
  }[]
}

interface EmployeeData {
  id: string
  name: string
  email: string
  startDate: string
  managerName: string | null
  sessionsStarted: number
}

interface ManagerData {
  id: string
  name: string
  role: string
}

export default function AdminClient({
  weeks,
  employees,
  managers,
}: {
  weeks: WeekData[]
  employees: EmployeeData[]
  managers: ManagerData[]
}) {
  const [tab, setTab] = useState<"content" | "employees">("content")
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    password: "",
    managerId: "",
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  async function saveEmployee() {
    setSaving(true)
    setMsg("")
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee),
      })
      if (res.ok) {
        setMsg("✓ Employee created successfully!")
        setNewEmployee({ name: "", email: "", password: "", managerId: "" })
      } else {
        const err = await res.json()
        setMsg(`Error: ${err.error || "Failed to create employee"}`)
      }
    } catch {
      setMsg("Error: Network error")
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: "#F7FAFC" }}>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage content, sessions, and employee accounts
          </p>
        </div>

        {/* Nav */}
        <div className="flex gap-3 mb-6">
          <a
            href="/hr"
            className="text-sm font-medium px-4 py-2 rounded-xl bg-white text-gray-600 border border-gray-100 hover:bg-gray-50 transition-colors"
          >
            HR Overview
          </a>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white rounded-xl p-1 w-fit shadow-sm border border-gray-100">
          {(
            [
              { key: "content", label: "Content", Icon: BookOpen },
              { key: "employees", label: "Employees", Icon: Users },
            ] as const
          ).map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === key ? "text-white shadow-sm" : "text-gray-600 hover:text-gray-800"
              }`}
              style={tab === key ? { backgroundColor: "#ED8936" } : {}}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Content tab */}
        {tab === "content" && (
          <div className="space-y-4">
            {weeks.map((week) => (
              <div key={week.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div
                  className="px-6 py-4 border-b border-gray-100 flex items-center gap-3"
                  style={{ backgroundColor: "#FAFAFA" }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: "#ED8936" }}
                  >
                    {week.number}
                  </div>
                  <h3 className="font-bold text-gray-800">
                    Week {week.number}: {week.title}
                  </h3>
                  <span className="ml-auto text-xs text-gray-400">
                    {week.sessions.length} session{week.sessions.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="divide-y divide-gray-50">
                  {week.sessions.map((s) => (
                    <div key={s.id}>
                      <div
                        className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedSession(
                            expandedSession === s.id ? null : s.id
                          )
                        }
                      >
                        <div>
                          <div className="font-medium text-gray-800 text-sm">
                            {s.title}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-3">
                            <span
                              className="px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: "#FFF5EC", color: "#C05621" }}
                            >
                              {s.contentType}
                            </span>
                            <span>{s.questions.length} questions</span>
                            <span>{s.terms.length} terms</span>
                            <span>{s.progressCount} started</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Edit2 size={14} className="text-gray-400" />
                          <ChevronDown
                            size={14}
                            className={`text-gray-400 transition-transform ${
                              expandedSession === s.id ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </div>

                      {expandedSession === s.id && (
                        <div className="px-6 pb-5 bg-gray-50 border-t border-gray-100">
                          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-4 mb-3">
                            Content URLs
                          </p>
                          <div className="space-y-3">
                            {[
                              { label: "Notion URL", value: s.notionUrl },
                              { label: "Google Slides URL", value: s.slidesUrl },
                              { label: "Video URL (Loom/Vimeo)", value: s.videoUrl },
                            ].map((field) => (
                              <div key={field.label}>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  {field.label}
                                </label>
                                <input
                                  defaultValue={field.value ?? ""}
                                  placeholder={`Enter ${field.label}...`}
                                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none bg-white"
                                />
                              </div>
                            ))}
                            <p className="text-xs text-gray-400 mt-2">
                              Full content editing coming in the next version.
                            </p>
                          </div>

                          {s.terms.length > 0 && (
                            <>
                              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mt-5 mb-3">
                                Terms ({s.terms.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {s.terms.map((t: any) => (
                                  <span
                                    key={t.id}
                                    className="text-xs px-2.5 py-1 rounded-full"
                                    style={{ backgroundColor: "#FFF5EC", color: "#C05621" }}
                                  >
                                    {t.word}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Employees tab */}
        {tab === "employees" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Add employee form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                <Plus size={16} style={{ color: "#ED8936" }} />
                Add New Employee
              </h3>
              <div className="space-y-4">
                {[
                  {
                    key: "name",
                    label: "Full Name",
                    type: "text",
                    placeholder: "Jane Smith",
                  },
                  {
                    key: "email",
                    label: "Work Email",
                    type: "email",
                    placeholder: "jane@empathy.com",
                  },
                  {
                    key: "password",
                    label: "Temporary Password",
                    type: "password",
                    placeholder: "••••••••",
                  },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={(newEmployee as any)[f.key]}
                      onChange={(e) =>
                        setNewEmployee((n) => ({ ...n, [f.key]: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Assign Manager (optional)
                  </label>
                  <select
                    value={newEmployee.managerId}
                    onChange={(e) =>
                      setNewEmployee((n) => ({ ...n, managerId: e.target.value }))
                    }
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none bg-white"
                  >
                    <option value="">No manager assigned</option>
                    {managers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>

                {msg && (
                  <div
                    className="text-sm px-3 py-2 rounded-lg"
                    style={
                      msg.startsWith("✓")
                        ? { backgroundColor: "#F0FFF4", color: "#2F855A" }
                        : { backgroundColor: "#FFF5F5", color: "#C53030" }
                    }
                  >
                    {msg}
                  </div>
                )}

                <button
                  onClick={saveEmployee}
                  disabled={
                    saving ||
                    !newEmployee.name ||
                    !newEmployee.email ||
                    !newEmployee.password
                  }
                  className="w-full py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-50 transition-all hover:opacity-90"
                  style={{ backgroundColor: "#ED8936" }}
                >
                  {saving ? "Creating..." : "Create Employee Account"}
                </button>
              </div>
            </div>

            {/* Employee list */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-5">
                Current Employees ({employees.length})
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {employees.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    No employees yet.
                  </p>
                ) : (
                  employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="flex items-center justify-between p-3 rounded-xl"
                      style={{ backgroundColor: "#FAFAFA" }}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-gray-800 text-sm truncate">
                          {emp.name}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {emp.email}
                          {emp.managerName && ` · ${emp.managerName}`}
                        </div>
                      </div>
                      <span
                        className="text-xs font-semibold px-2.5 py-1 rounded-full ml-3 flex-shrink-0"
                        style={{ backgroundColor: "#FFF5EC", color: "#ED8936" }}
                      >
                        {emp.sessionsStarted} sessions
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
