"use client"
import { useState } from "react"
import { BookOpen, Users, Plus, ChevronDown } from "lucide-react"

interface WeekData {
  id: string; number: number; title: string
  sessions: { id: string; title: string; contentType: string; questions: any[]; terms: any[]; progressCount: number; notionUrl: string | null; slidesUrl: string | null; videoUrl: string | null }[]
}
interface EmployeeData { id: string; name: string; email: string; startDate: string; managerName: string | null; sessionsStarted: number }
interface ManagerData { id: string; name: string; role: string }

export default function AdminClient({ weeks, employees, managers }: { weeks: WeekData[]; employees: EmployeeData[]; managers: ManagerData[] }) {
  const [tab, setTab] = useState<"content" | "employees">("content")
  const [newEmployee, setNewEmployee] = useState({ name: "", email: "", password: "", managerId: "" })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [expandedSession, setExpandedSession] = useState<string | null>(null)

  async function saveEmployee() {
    setSaving(true); setMsg("")
    const res = await fetch("/api/admin/employees", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(newEmployee) })
    if (res.ok) { setMsg("✓ Employee created!"); setNewEmployee({ name: "", email: "", password: "", managerId: "" }) }
    else { const e = await res.json(); setMsg(`Error: ${e.error || "Failed"}`) }
    setSaving(false)
  }

  const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: "10px", border: "1.5px solid var(--border)", fontSize: "13px", color: "var(--text-primary)", backgroundColor: "var(--surface)", outline: "none" }
  const labelStyle: React.CSSProperties = { display: "block", fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--bg)" }}>
      {/* Top bar */}
      <div style={{ backgroundColor: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "20px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "8px", backgroundColor: "#D4845A", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px" }}>E</div>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>Admin Panel</h1>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "1px" }}>Manage content and employees</p>
          </div>
        </div>
        <a href="/hr" style={{ fontSize: "12px", fontWeight: "600", padding: "7px 14px", borderRadius: "8px", backgroundColor: "var(--surface-subtle)", color: "var(--text-secondary)", textDecoration: "none", border: "1px solid var(--border)" }}>HR Overview</a>
      </div>

      <div style={{ padding: "32px 40px" }}>
        {/* Tabs */}
        <div style={{ display: "inline-flex", backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "12px", padding: "4px", gap: "4px", marginBottom: "28px" }}>
          {([["content", "Content", BookOpen], ["employees", "Employees", Users]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key as any)}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 18px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", border: "none", cursor: "pointer", transition: "all 0.15s ease", ...(tab === key ? { backgroundColor: "var(--accent)", color: "white" } : { backgroundColor: "transparent", color: "var(--text-secondary)" }) }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* Content tab */}
        {tab === "content" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {weeks.map((week) => (
              <div key={week.id} style={{ backgroundColor: "var(--surface)", borderRadius: "16px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
                <div style={{ padding: "16px 24px", backgroundColor: "var(--surface-warm)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "11px", fontWeight: "700", flexShrink: 0 }}>{week.number}</div>
                  <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)" }}>Week {week.number}: {week.title}</h3>
                  <span style={{ marginLeft: "auto", fontSize: "11px", color: "var(--text-muted)" }}>{week.sessions.length} sessions</span>
                </div>
                <div>
                  {week.sessions.map((s, i) => (
                    <div key={s.id}>
                      <div
                        onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", cursor: "pointer", borderTop: i > 0 ? "1px solid var(--border-subtle)" : "none" }}
                      >
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "3px" }}>{s.title}</div>
                          <div style={{ display: "flex", gap: "12px", fontSize: "11px", color: "var(--text-muted)" }}>
                            <span style={{ padding: "2px 8px", borderRadius: "100px", backgroundColor: "var(--accent-light)", color: "var(--accent-dark)", fontWeight: "600" }}>{s.contentType}</span>
                            <span>{s.questions.length} questions</span>
                            <span>{s.terms.length} terms</span>
                            <span>{s.progressCount} started</span>
                          </div>
                        </div>
                        <ChevronDown size={14} style={{ color: "var(--text-muted)", transition: "transform 0.2s", transform: expandedSession === s.id ? "rotate(180deg)" : "rotate(0)" }} />
                      </div>
                      {expandedSession === s.id && (
                        <div style={{ padding: "16px 24px 20px", backgroundColor: "var(--surface-warm)", borderTop: "1px solid var(--border-subtle)" }}>
                          <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Content URLs</p>
                          {[["Notion URL", s.notionUrl], ["Google Slides URL", s.slidesUrl], ["Video URL (Loom/Vimeo)", s.videoUrl]].map(([label, val]) => (
                            <div key={label as string} style={{ marginBottom: "10px" }}>
                              <label style={labelStyle}>{label as string}</label>
                              <input defaultValue={val ?? ""} placeholder={`Paste ${label}…`} style={inputStyle} />
                            </div>
                          ))}
                          {s.terms.length > 0 && (
                            <>
                              <p style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginTop: "16px", marginBottom: "8px" }}>Terms</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {s.terms.map((t: any) => (
                                  <span key={t.id} style={{ fontSize: "11px", fontWeight: "600", padding: "3px 10px", borderRadius: "100px", backgroundColor: "var(--accent-light)", color: "var(--accent-dark)" }}>{t.word}</span>
                                ))}
                              </div>
                            </>
                          )}
                          <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "14px", fontStyle: "italic" }}>Full editing in the next version.</p>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            {/* Add form */}
            <div style={{ backgroundColor: "var(--surface)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Plus size={14} style={{ color: "var(--accent)" }} /> Add New Employee
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {[["name", "Full Name", "text", "Jane Smith"], ["email", "Work Email", "email", "jane@empathy.com"], ["password", "Temporary Password", "password", "••••••••"]].map(([key, label, type, placeholder]) => (
                  <div key={key}>
                    <label style={labelStyle}>{label}</label>
                    <input type={type} placeholder={placeholder} value={(newEmployee as any)[key]}
                      onChange={(e) => setNewEmployee((n) => ({ ...n, [key]: e.target.value }))} style={inputStyle} />
                  </div>
                ))}
                <div>
                  <label style={labelStyle}>Assign Manager (optional)</label>
                  <select value={newEmployee.managerId} onChange={(e) => setNewEmployee((n) => ({ ...n, managerId: e.target.value }))}
                    style={{ ...inputStyle, appearance: "none" }}>
                    <option value="">No manager</option>
                    {managers.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.role})</option>)}
                  </select>
                </div>
                {msg && (
                  <div style={{ fontSize: "12px", padding: "10px 14px", borderRadius: "8px", ...(msg.startsWith("✓") ? { backgroundColor: "var(--success-light)", color: "var(--success)" } : { backgroundColor: "#FEF2F2", color: "#B91C1C" }) }}>
                    {msg}
                  </div>
                )}
                <button onClick={saveEmployee} disabled={saving || !newEmployee.name || !newEmployee.email || !newEmployee.password}
                  style={{ padding: "12px", borderRadius: "10px", backgroundColor: "var(--accent)", color: "white", fontSize: "13px", fontWeight: "700", border: "none", cursor: saving || !newEmployee.name ? "not-allowed" : "pointer", opacity: saving || !newEmployee.name || !newEmployee.email || !newEmployee.password ? 0.5 : 1 }}>
                  {saving ? "Creating…" : "Create Employee"}
                </button>
              </div>
            </div>

            {/* Employee list */}
            <div style={{ backgroundColor: "var(--surface)", borderRadius: "16px", padding: "24px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <h3 style={{ fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "16px" }}>Current Employees ({employees.length})</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "400px", overflowY: "auto" }}>
                {employees.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "24px 0", fontFamily: "Lora, Georgia, serif", fontStyle: "italic" }}>No employees yet.</p>
                ) : employees.map((emp) => (
                  <div key={emp.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: "10px", backgroundColor: "var(--surface-warm)", border: "1px solid var(--border-subtle)" }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.name}</div>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{emp.email}{emp.managerName ? ` · ${emp.managerName}` : ""}</div>
                    </div>
                    <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "100px", backgroundColor: "var(--accent-light)", color: "var(--accent-dark)", flexShrink: 0, marginLeft: "10px" }}>
                      {emp.sessionsStarted} sessions
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
