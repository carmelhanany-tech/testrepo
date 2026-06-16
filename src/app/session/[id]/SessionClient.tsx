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
    .replace(/(<li>[^]*?<\/li>(\n)?)+/gm, (m) => `<ul>${m}</ul>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hpuol])/gm, '')
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

  // Checkup state
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
      ? "#38A169"
      : result && result.score >= 60
      ? "#ED8936"
      : "#E53E3E"

  const scoreMessage =
    result && result.score >= 80
      ? "Excellent work! 🌟"
      : result && result.score >= 60
      ? "Good job! 👍"
      : "Keep learning! 💪"

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F7FAFC" }}>
      <Sidebar weeks={sidebarWeeks} userName={userName} role="EMPLOYEE" />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Top stepper */}
        <div className="bg-white border-b border-gray-100 px-8 py-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <span>Week {session.week.number}</span>
            <ChevronRight size={12} />
            <span className="text-gray-600 font-medium">{session.title}</span>
          </div>
          <div className="flex items-center gap-4">
            {(["content", "checkup", "complete"] as Step[]).map((s, i) => {
              const labels = ["Content", "Knowledge Check", "Complete"]
              const isActive = step === s
              const isDone =
                (step === "checkup" && i === 0) ||
                (step === "complete" && i <= 1)
              return (
                <div key={s} className="flex items-center gap-3">
                  {i > 0 && (
                    <div
                      className="h-px w-8 transition-all"
                      style={{ backgroundColor: isDone ? "#ED8936" : "#E2E8F0" }}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                      style={
                        isDone || isActive
                          ? { backgroundColor: "#ED8936", color: "white" }
                          : { backgroundColor: "#EDF2F7", color: "#A0AEC0" }
                      }
                    >
                      {isDone ? "✓" : i + 1}
                    </div>
                    <span
                      className="text-sm font-medium hidden sm:block"
                      style={{ color: isActive ? "#1A202C" : "#A0AEC0" }}
                    >
                      {labels[i]}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-3xl mx-auto">

            {/* ── CONTENT STEP ── */}
            {step === "content" && (
              <div>
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">{session.title}</h1>
                  {session.description && (
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                      {session.description}
                    </p>
                  )}
                </div>

                {/* Content card */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                  {/* Text content */}
                  {session.textContent && (
                    <div
                      className="prose"
                      dangerouslySetInnerHTML={{
                        __html: `<p>${renderMarkdown(session.textContent)}</p>`,
                      }}
                    />
                  )}

                  {/* Google Slides */}
                  {session.slidesUrl && (
                    <div className="mt-6">
                      <iframe
                        src={getSlidesEmbed(session.slidesUrl)}
                        className="w-full rounded-xl border border-gray-100"
                        style={{ height: "480px" }}
                        allowFullScreen
                      />
                    </div>
                  )}

                  {/* Video (Loom / Vimeo) */}
                  {session.videoUrl && (
                    <div className="mt-6">
                      <iframe
                        src={getVideoEmbed(session.videoUrl)}
                        className="w-full rounded-xl border border-gray-100"
                        style={{ height: "480px" }}
                        allowFullScreen
                        allow="autoplay; fullscreen"
                      />
                    </div>
                  )}

                  {/* Notion link */}
                  {session.notionUrl && (
                    <div className="mt-6">
                      <a
                        href={session.notionUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <BookOpen size={16} style={{ color: "#ED8936" }} />
                        Open in Notion
                        <ExternalLink size={14} className="text-gray-400" />
                      </a>
                    </div>
                  )}
                </div>

                {/* Terms card */}
                {session.terms.length > 0 && (
                  <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2 text-sm">
                      <BookOpen size={16} style={{ color: "#ED8936" }} />
                      Key Terms in this Session
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {session.terms.map((term) => (
                        <button
                          key={term.id}
                          onClick={() => setSelectedTerm(term)}
                          className="text-left p-3 rounded-xl transition-colors hover:shadow-sm"
                          style={{ backgroundColor: "#FFF5EC" }}
                        >
                          <div
                            className="font-semibold text-sm mb-1"
                            style={{ color: "#C05621" }}
                          >
                            {term.word}
                          </div>
                          <div className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                            {term.definition}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep("checkup")}
                  className="w-full py-4 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#ED8936" }}
                >
                  I&apos;m done reading → Take Knowledge Check
                  <Brain size={18} />
                </button>
              </div>
            )}

            {/* ── CHECKUP STEP (questions) ── */}
            {step === "checkup" && !showResults && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#ED8936" }}
                  >
                    <Brain className="text-white" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Knowledge Check</h2>
                    <p className="text-sm text-gray-400">
                      Question {currentQ + 1} of {questions.length}
                    </p>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex gap-1.5 mb-8">
                  {questions.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor:
                          i < currentQ
                            ? "#48BB78"
                            : i === currentQ
                            ? "#ED8936"
                            : "#E2E8F0",
                      }}
                    />
                  ))}
                </div>

                <div className="bg-white rounded-2xl shadow-sm p-8">
                  <h3 className="text-base font-semibold text-gray-800 mb-6 leading-relaxed">
                    {currentQuestion?.text}
                  </h3>

                  {/* Multiple choice / True-False */}
                  {(currentQuestion?.type === "MULTIPLE_CHOICE" ||
                    currentQuestion?.type === "TRUE_FALSE") && (
                    <div className="space-y-3">
                      {options.map((opt) => {
                        const selected = answers[currentQuestion.id] === opt
                        return (
                          <button
                            key={opt}
                            onClick={() =>
                              setAnswers((a) => ({ ...a, [currentQuestion.id]: opt }))
                            }
                            className="w-full text-left px-5 py-3.5 rounded-xl border-2 transition-all text-sm font-medium"
                            style={
                              selected
                                ? {
                                    backgroundColor: "#ED8936",
                                    borderColor: "#ED8936",
                                    color: "white",
                                  }
                                : {
                                    backgroundColor: "white",
                                    borderColor: "#E2E8F0",
                                    color: "#4A5568",
                                  }
                            }
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* Short answer */}
                  {currentQuestion?.type === "SHORT_ANSWER" && (
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 text-sm focus:outline-none focus:border-orange-300 resize-none transition-all"
                      rows={3}
                      placeholder="Type your answer here..."
                      value={answers[currentQuestion.id] ?? ""}
                      onChange={(e) =>
                        setAnswers((a) => ({
                          ...a,
                          [currentQuestion.id]: e.target.value,
                        }))
                      }
                    />
                  )}

                  {/* Navigation */}
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
                      disabled={currentQ === 0}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-gray-500 disabled:opacity-30 hover:bg-gray-100 transition-colors text-sm font-medium"
                    >
                      <ChevronLeft size={16} /> Back
                    </button>

                    {currentQ < questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQ((q) => q + 1)}
                        disabled={!answers[currentQuestion?.id]}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all hover:opacity-90"
                        style={{ backgroundColor: "#ED8936" }}
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={submitCheckup}
                        disabled={!answers[currentQuestion?.id] || submitting}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 transition-all hover:opacity-90"
                        style={{ backgroundColor: "#4A5568" }}
                      >
                        {submitting ? "Submitting..." : "Submit Answers ✓"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── CHECKUP RESULTS ── */}
            {step === "checkup" && showResults && result && (
              <div>
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-6">
                  {/* Score */}
                  <div className="text-center mb-8">
                    <div
                      className="w-24 h-24 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${scoreColor}15` }}
                    >
                      <div>
                        <div
                          className="text-2xl font-bold"
                          style={{ color: scoreColor }}
                        >
                          {result.correct}/{result.total}
                        </div>
                        <div className="text-xs font-semibold" style={{ color: scoreColor }}>
                          {result.score}%
                        </div>
                      </div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 mb-1">
                      {scoreMessage}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      You answered {result.correct} out of {result.total} questions correctly.
                    </p>
                  </div>

                  {/* Question breakdown */}
                  <div className="space-y-3">
                    {questions.map((q) => {
                      const userAnswer = answers[q.id]
                      const isCorrect = userAnswer === q.answer
                      return (
                        <div
                          key={q.id}
                          className="p-4 rounded-xl border-l-4"
                          style={{
                            backgroundColor: isCorrect ? "#F0FFF4" : "#FFF5F5",
                            borderColor: isCorrect ? "#68D391" : "#FC8181",
                          }}
                        >
                          <p className="font-medium text-gray-800 text-sm mb-1">
                            {q.text}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: isCorrect ? "#2F855A" : "#C53030" }}
                          >
                            Correct answer: {q.answer}
                          </p>
                          {!isCorrect && userAnswer && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              Your answer: {userAnswer}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                <button
                  onClick={completeSession}
                  className="w-full py-4 rounded-xl text-white font-semibold text-base transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#ED8936" }}
                >
                  Complete Session & Continue →
                </button>
              </div>
            )}

            {/* ── COMPLETE STEP ── */}
            {step === "complete" && (
              <div className="text-center py-16">
                <div
                  className="w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: "#F0FFF4" }}
                >
                  <CheckCircle size={48} style={{ color: "#38A169" }} />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Session Complete! 🎉
                </h2>
                <p className="text-gray-500 mb-6 text-sm">
                  Great work on &ldquo;{session.title}&rdquo;. Keep the momentum going!
                </p>
                {result && (
                  <div
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl mb-8"
                    style={{ backgroundColor: "#FFF5EC" }}
                  >
                    <Star size={16} style={{ color: "#ED8936" }} />
                    <span className="font-semibold text-gray-700 text-sm">
                      Score: {result.score}% ({result.correct}/{result.total})
                    </span>
                  </div>
                )}
                <div>
                  <a
                    href="/dashboard"
                    className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-90 inline-block"
                    style={{ backgroundColor: "#ED8936" }}
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
        className="fixed bottom-6 right-6 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center text-white transition-all hover:opacity-90 hover:shadow-xl z-40"
        style={{ backgroundColor: "#4A5568" }}
        title="Open Glossary"
      >
        <BookOpen size={20} />
      </button>

      {/* Term detail modal */}
      {selectedTerm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTerm(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-800">{selectedTerm.word}</h3>
              <button
                onClick={() => setSelectedTerm(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm">
              {selectedTerm.definition}
            </p>
          </div>
        </div>
      )}

      {/* Glossary drawer */}
      {glossaryOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex justify-end"
          onClick={() => setGlossaryOpen(false)}
        >
          <div
            className="bg-white w-80 h-full shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-100 p-5 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="font-bold text-gray-800">Glossary</h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {allTerms.length} terms
                </p>
              </div>
              <button
                onClick={() => setGlossaryOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {allTerms.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-8">
                  Complete sessions to build your glossary.
                </p>
              ) : (
                allTerms.map((term) => (
                  <div
                    key={term.id}
                    className="p-3 rounded-xl cursor-pointer hover:shadow-sm transition-all"
                    style={{ backgroundColor: "#FFF5EC" }}
                    onClick={() => setSelectedTerm(term)}
                  >
                    <div
                      className="font-semibold text-sm mb-1"
                      style={{ color: "#C05621" }}
                    >
                      {term.word}
                    </div>
                    <div className="text-gray-500 text-xs leading-relaxed line-clamp-2">
                      {term.definition}
                    </div>
                    {term.session && (
                      <div className="text-gray-300 text-xs mt-1">
                        {term.session.title}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
