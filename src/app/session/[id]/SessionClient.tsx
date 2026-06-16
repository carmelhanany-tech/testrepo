"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar, { WeekItem } from "@/components/Sidebar"
import {
  CheckCircle,
  Brain,
  BookOpen,
  X,
  ChevronRight,
  ChevronLeft,
  Star,
  ExternalLink,
} from "lucide-react"

interface Term {
  id: string
  word: string
  definition: string
  session?: { title: string }
}

interface Question {
  id: string
  text: string
  type: string
  options: string | null
  answer: string
  order: number
}

interface SessionData {
  id: string
  title: string
  description: string | null
  contentType: string
  textContent: string | null
  slidesUrl: string | null
  videoUrl: string | null
  notionUrl: string | null
  week: { number: number; title: string }
  terms: Term[]
  questions: Question[]
}

type Step = "content" | "checkup" | "complete"

interface Props {
  session: SessionData
  userName: string
  weeks: any[]
  initialStatus: string
  existingResult: { score: number; correct: number; total: number } | null
  allTerms: Term[]
}

function renderMarkdown(text: string): string {
  return text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^---$/gm, '<hr />')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
}

function getVideoEmbed(url: string): string {
  if (url.includes("loom.com/share")) {
    const id = url.split("/share/")[1]?.split("?")[0]
    return `https://www.loom.com/embed/${id}`
  }
  if (url.includes("vimeo.com")) {
    const id = url.split("vimeo.com/")[1]?.split("?")[0]
    return `https://player.vimeo.com/video/${id}`
  }
  return url
}

function getSlidesEmbed(url: string): string {
  if (url.includes("docs.google.com/presentation")) {
    if (url.includes("/embed")) return url
    return url
      .replace(/\/edit.*$/, "/embed?start=false&loop=false&delayms=3000")
      .replace(/\/pub\?.*$/, "/embed?start=false&loop=false&delayms=3000")
  }
  return url
}

export default function SessionClient({
  session,
  userName,
  weeks,
  initialStatus,
  existingResult,
  allTerms,
}: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>(
    initialStatus === "COMPLETED" ? "complete" : "content"
  )
  const [glossaryOpen, setGlossaryOpen] = useState(false)
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [result, setResult] = useState(existingResult)
  const [submitting, setSubmitting] = useState(false)
  const [showResults, setShowResults] = useState(
    initialStatus === "COMPLETED" && !!existingResult
  )

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

  useEffect(() => {
    if (initialStatus === "NOT_STARTED") {
      fetch(`/api/sessions/${session.id}/start`, { method: "POST" })
    }
  }, [session.id, initialStatus])

  async function submitCheckup() {
    setSubmitting(true)
    const res = await fetch(`/api/sessions/${session.id}/checkup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    })
    const data = await res.json()
    setResult(data)
    setShowResults(true)
    setSubmitting(false)
  }

  async function completeSession() {
    await fetch(`/api/sessions/${session.id}/complete`, { method: "POST" })
    setStep("complete")
    router.refresh()
  }

  const questions = session.questions
  const currentQuestion = questions[currentQ]
  const options: string[] = currentQuestion?.options
    ? JSON.parse(currentQuestion.options)
    : []

  const scoreColor =
    result && result.score >= 80
      ? "var(--success)"
      : result && result.score >= 60
      ? "var(--accent)"
      : "#C0392B"

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "var(--bg)" }}>
      <Sidebar weeks={sidebarWeeks} userName={userName} role="EMPLOYEE" />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Session stepper bar */}
        <div
          style={{
            backgroundColor: "var(--surface)",
            borderBottom: "1px solid var(--border)",
            padding: "14px 32px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
              color: "var(--text-muted)",
              marginBottom: "12px",
            }}
          >
            <span>Week {session.week.number}: {session.week.title}</span>
            <ChevronRight size={12} />
            <span style={{ color: "var(--text-primary)", fontWeight: "600" }}>
              {session.title}
            </span>
          </div>

          {/* Steps */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            {(["content", "checkup", "complete"] as Step[]).map((s, i) => {
              const labels = ["Read & Explore", "Knowledge Check", "Complete"]
              const isActive = step === s
              const isDone =
                (step === "checkup" && i === 0) ||
                (step === "complete" && i <= 1)
              return (
                <div key={s} style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                  {i > 0 && (
                    <div
                      style={{
                        height: "1px",
                        width: "32px",
                        backgroundColor: isDone ? "var(--accent)" : "var(--border)",
                      }}
                    />
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "11px",
                        fontWeight: "700",
                        flexShrink: 0,
                        ...(isDone
                          ? { backgroundColor: "var(--success)", color: "white" }
                          : isActive
                          ? { backgroundColor: "var(--accent)", color: "white" }
                          : { backgroundColor: "var(--surface-subtle)", color: "var(--text-muted)" }),
                      }}
                    >
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: isActive ? "700" : "500",
                        color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                      }}
                    >
                      {labels[i]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content area */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 32px" }}>
          <div style={{ maxWidth: "680px", margin: "0 auto" }}>

            {/* ── CONTENT STEP ── */}
            {step === "content" && (
              <div>
                <div style={{ marginBottom: "28px" }}>
                  <p
                    style={{
                      fontSize: "11px",
                      fontWeight: "700",
                      color: "var(--accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: "8px",
                    }}
                  >
                    Week {session.week.number} · Session
                  </p>
                  <h1
                    style={{
                      fontSize: "26px",
                      fontWeight: "800",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.025em",
                      lineHeight: 1.2,
                      marginBottom: "10px",
                    }}
                  >
                    {session.title}
                  </h1>
                  {session.description && (
                    <p
                      style={{
                        fontSize: "15px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        fontFamily: "Lora, Georgia, serif",
                        fontStyle: "italic",
                      }}
                    >
                      {session.description}
                    </p>
                  )}
                </div>

                {/* Reading content */}
                {session.textContent && (
                  <div
                    style={{
                      backgroundColor: "var(--surface)",
                      borderRadius: "16px",
                      padding: "36px 40px",
                      boxShadow: "var(--shadow-sm)",
                      border: "1px solid var(--border)",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      className="reading-prose"
                      dangerouslySetInnerHTML={{
                        __html: `<p>${renderMarkdown(session.textContent)}</p>`,
                      }}
                    />
                  </div>
                )}

                {/* Slides embed */}
                {session.slidesUrl && (
                  <div
                    style={{
                      backgroundColor: "var(--surface)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      marginBottom: "20px",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <iframe
                      src={getSlidesEmbed(session.slidesUrl)}
                      style={{ width: "100%", height: "480px", display: "block" }}
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Video embed */}
                {session.videoUrl && (
                  <div
                    style={{
                      backgroundColor: "var(--surface)",
                      borderRadius: "16px",
                      overflow: "hidden",
                      border: "1px solid var(--border)",
                      marginBottom: "20px",
                      boxShadow: "var(--shadow-sm)",
                    }}
                  >
                    <iframe
                      src={getVideoEmbed(session.videoUrl)}
                      style={{ width: "100%", height: "480px", display: "block" }}
                      allowFullScreen
                      allow="autoplay; fullscreen"
                    />
                  </div>
                )}

                {/* Notion link */}
                {session.notionUrl && (
                  <div
                    style={{
                      backgroundColor: "var(--surface)",
                      borderRadius: "16px",
                      padding: "20px 24px",
                      border: "1px solid var(--border)",
                      marginBottom: "20px",
                    }}
                  >
                    <a
                      href={session.notionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--text-primary)",
                        textDecoration: "none",
                      }}
                    >
                      <BookOpen size={16} style={{ color: "var(--accent)" }} />
                      Open in Notion
                      <ExternalLink size={13} style={{ color: "var(--text-muted)" }} />
                    </a>
                  </div>
                )}

                {/* Terms */}
                {session.terms.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "var(--surface)",
                      borderRadius: "16px",
                      padding: "24px",
                      border: "1px solid var(--border)",
                      marginBottom: "28px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: "14px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <BookOpen size={14} style={{ color: "var(--accent)" }} />
                      Key Terms
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {session.terms.map((term) => (
                        <button
                          key={term.id}
                          onClick={() => setSelectedTerm(term)}
                          style={{
                            textAlign: "left",
                            padding: "12px 14px",
                            borderRadius: "10px",
                            backgroundColor: "var(--accent-light)",
                            border: "1px solid #EDD5C4",
                            cursor: "pointer",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "700",
                              color: "var(--accent-dark)",
                              marginBottom: "3px",
                            }}
                          >
                            {term.word}
                          </div>
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                              lineHeight: 1.5,
                              overflow: "hidden",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                            }}
                          >
                            {term.definition}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep("checkup")}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    cursor: "pointer",
                    border: "none",
                  }}
                >
                  I&apos;ve finished reading — take the knowledge check
                  <Brain size={16} />
                </button>
              </div>
            )}

            {/* ── CHECKUP QUESTIONS ── */}
            {step === "checkup" && !showResults && (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    marginBottom: "24px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      backgroundColor: "var(--accent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Brain className="text-white" size={20} />
                  </div>
                  <div>
                    <h2
                      style={{
                        fontSize: "18px",
                        fontWeight: "800",
                        color: "var(--text-primary)",
                        letterSpacing: "-0.02em",
                      }}
                    >
                      Knowledge Check
                    </h2>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Question {currentQ + 1} of {questions.length}
                    </p>
                  </div>
                </div>

                {/* Progress track */}
                <div
                  style={{
                    display: "flex",
                    gap: "4px",
                    marginBottom: "28px",
                  }}
                >
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: "3px",
                        flex: 1,
                        borderRadius: "100px",
                        backgroundColor:
                          i < currentQ
                            ? "var(--success)"
                            : i === currentQ
                            ? "var(--accent)"
                            : "var(--border)",
                        transition: "background-color 0.3s ease",
                      }}
                    />
                  ))}
                </div>

                <div
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "16px",
                    padding: "28px 32px",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      lineHeight: 1.5,
                      marginBottom: "24px",
                      fontFamily: "Lora, Georgia, serif",
                    }}
                  >
                    {currentQuestion?.text}
                  </h3>

                  {(currentQuestion?.type === "MULTIPLE_CHOICE" ||
                    currentQuestion?.type === "TRUE_FALSE") && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {options.map((opt) => {
                        const selected = answers[currentQuestion.id] === opt
                        return (
                          <button
                            key={opt}
                            onClick={() =>
                              setAnswers((a) => ({ ...a, [currentQuestion.id]: opt }))
                            }
                            style={{
                              textAlign: "left",
                              padding: "14px 18px",
                              borderRadius: "12px",
                              fontSize: "14px",
                              fontWeight: "500",
                              cursor: "pointer",
                              transition: "all 0.15s ease",
                              ...(selected
                                ? {
                                    backgroundColor: "var(--accent)",
                                    border: "2px solid var(--accent)",
                                    color: "white",
                                    boxShadow: "0 4px 12px rgba(212, 132, 90, 0.3)",
                                  }
                                : {
                                    backgroundColor: "var(--surface)",
                                    border: "1.5px solid var(--border)",
                                    color: "var(--text-primary)",
                                  }),
                            }}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {currentQuestion?.type === "SHORT_ANSWER" && (
                    <textarea
                      style={{
                        width: "100%",
                        padding: "14px",
                        borderRadius: "12px",
                        border: "1.5px solid var(--border)",
                        fontSize: "14px",
                        color: "var(--text-primary)",
                        resize: "none",
                        outline: "none",
                        backgroundColor: "var(--surface)",
                        fontFamily: "Lora, Georgia, serif",
                      }}
                      rows={3}
                      placeholder="Type your answer here…"
                      value={answers[currentQuestion.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                    />
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "24px",
                    }}
                  >
                    <button
                      onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                      disabled={currentQ === 0}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "8px 14px",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "var(--text-muted)",
                        backgroundColor: "transparent",
                        border: "none",
                        cursor: currentQ === 0 ? "not-allowed" : "pointer",
                        opacity: currentQ === 0 ? 0.4 : 1,
                      }}
                    >
                      <ChevronLeft size={15} /> Back
                    </button>

                    {currentQ < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQ((q) => q + 1)}
                        disabled={!answers[currentQuestion?.id]}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "white",
                          backgroundColor: "var(--accent)",
                          border: "none",
                          cursor: !answers[currentQuestion?.id] ? "not-allowed" : "pointer",
                          opacity: !answers[currentQuestion?.id] ? 0.5 : 1,
                        }}
                      >
                        Next <ChevronRight size={15} />
                      </button>
                    ) : (
                      <button
                        onClick={submitCheckup}
                        disabled={!answers[currentQuestion?.id] || submitting}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "10px 20px",
                          borderRadius: "10px",
                          fontSize: "13px",
                          fontWeight: "700",
                          color: "white",
                          backgroundColor: "var(--text-primary)",
                          border: "none",
                          cursor: !answers[currentQuestion?.id] || submitting ? "not-allowed" : "pointer",
                          opacity: !answers[currentQuestion?.id] || submitting ? 0.5 : 1,
                        }}
                      >
                        {submitting ? "Submitting…" : "Submit ✓"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── CHECKUP RESULTS ── */}
            {step === "checkup" && showResults && result && (
              <div>
                <div
                  style={{
                    backgroundColor: "var(--surface)",
                    borderRadius: "16px",
                    padding: "32px",
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-sm)",
                    marginBottom: "16px",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "20px",
                      margin: "0 auto 16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: `${scoreColor}15`,
                      border: `2px solid ${scoreColor}30`,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "800",
                          color: scoreColor,
                          lineHeight: 1,
                        }}
                      >
                        {result.correct}/{result.total}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "600",
                          color: scoreColor,
                        }}
                      >
                        {result.score}%
                      </div>
                    </div>
                  </div>

                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: "var(--text-primary)",
                      letterSpacing: "-0.02em",
                      marginBottom: "6px",
                    }}
                  >
                    {result.score >= 80
                      ? "Excellent work!"
                      : result.score >= 60
                      ? "Good effort!"
                      : "Keep it up!"}
                  </h2>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                    You answered {result.correct} of {result.total} questions correctly.
                  </p>
                </div>

                {/* Breakdown */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                    marginBottom: "20px",
                  }}
                >
                  {questions.map((q) => {
                    const userAnswer = answers[q.id]
                    const isCorrect = userAnswer === q.answer
                    return (
                      <div
                        key={q.id}
                        style={{
                          padding: "14px 18px",
                          borderRadius: "12px",
                          borderLeft: `4px solid ${isCorrect ? "var(--success)" : "#E07070"}`,
                          backgroundColor: isCorrect ? "var(--success-light)" : "#FEF2F2",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "var(--text-primary)",
                            marginBottom: "4px",
                          }}
                        >
                          {q.text}
                        </p>
                        <p
                          style={{
                            fontSize: "12px",
                            color: isCorrect ? "var(--success)" : "#B91C1C",
                          }}
                        >
                          Correct: {q.answer}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <button
                  onClick={completeSession}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "12px",
                    backgroundColor: "var(--accent)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "14px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  Complete Session & Continue →
                </button>
              </div>
            )}

            {/* ── COMPLETE STEP ── */}
            {step === "complete" && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "20px",
                    backgroundColor: "var(--success-light)",
                    margin: "0 auto 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <CheckCircle size={40} style={{ color: "var(--success)" }} />
                </div>
                <h2
                  style={{
                    fontSize: "26px",
                    fontWeight: "800",
                    color: "var(--text-primary)",
                    letterSpacing: "-0.025em",
                    marginBottom: "8px",
                  }}
                >
                  Session complete!
                </h2>
                <p
                  style={{
                    fontSize: "15px",
                    color: "var(--text-secondary)",
                    fontFamily: "Lora, Georgia, serif",
                    fontStyle: "italic",
                    marginBottom: "24px",
                  }}
                >
                  Great work on &ldquo;{session.title}&rdquo;. Keep the momentum going.
                </p>
                {result && (
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 20px",
                      borderRadius: "100px",
                      backgroundColor: "var(--accent-light)",
                      marginBottom: "28px",
                    }}
                  >
                    <Star size={14} style={{ color: "var(--accent)" }} />
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "700",
                        color: "var(--accent-dark)",
                      }}
                    >
                      Score: {result.score}% · {result.correct}/{result.total} correct
                    </span>
                  </div>
                )}
                <div>
                  <a
                    href="/dashboard"
                    style={{
                      display: "inline-block",
                      padding: "12px 24px",
                      borderRadius: "12px",
                      backgroundColor: "var(--accent)",
                      color: "white",
                      fontWeight: "700",
                      fontSize: "14px",
                      textDecoration: "none",
                    }}
                  >
                    Back to Dashboard →
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Glossary FAB */}
      <button
        onClick={() => setGlossaryOpen(true)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          backgroundColor: "var(--text-primary)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-lg)",
          border: "none",
          cursor: "pointer",
          zIndex: 40,
        }}
        title="Open Glossary"
      >
        <BookOpen size={18} />
      </button>

      {/* Term modal */}
      {selectedTerm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(28, 43, 58, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: "16px",
          }}
          onClick={() => setSelectedTerm(null)}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "400px",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                {selectedTerm.word}
              </span>
              <button
                onClick={() => setSelectedTerm(null)}
                style={{
                  color: "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <p
              style={{
                fontSize: "14px",
                color: "var(--text-secondary)",
                lineHeight: 1.7,
                fontFamily: "Lora, Georgia, serif",
              }}
            >
              {selectedTerm.definition}
            </p>
          </div>
        </div>
      )}

      {/* Glossary drawer */}
      {glossaryOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(28, 43, 58, 0.4)",
            zIndex: 50,
            display: "flex",
            justifyContent: "flex-end",
          }}
          onClick={() => setGlossaryOpen(false)}
        >
          <div
            style={{
              backgroundColor: "var(--surface)",
              width: "320px",
              height: "100%",
              boxShadow: "var(--shadow-lg)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: "20px",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: "14px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  Glossary
                </h3>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "2px" }}>
                  {allTerms.length} terms
                </p>
              </div>
              <button
                onClick={() => setGlossaryOpen(false)}
                style={{
                  color: "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {allTerms.length === 0 ? (
                <p
                  style={{
                    fontSize: "13px",
                    color: "var(--text-muted)",
                    textAlign: "center",
                    padding: "32px 0",
                    fontFamily: "Lora, Georgia, serif",
                    fontStyle: "italic",
                  }}
                >
                  Complete sessions to build your glossary.
                </p>
              ) : (
                allTerms.map((term) => (
                  <button
                    key={term.id}
                    style={{
                      textAlign: "left",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      backgroundColor: "var(--accent-light)",
                      border: "1px solid #EDD5C4",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedTerm(term)}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: "700",
                        color: "var(--accent-dark)",
                        marginBottom: "3px",
                      }}
                    >
                      {term.word}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        lineHeight: 1.5,
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {term.definition}
                    </div>
                    {term.session && (
                      <div style={{ fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
                        {term.session.title}
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
