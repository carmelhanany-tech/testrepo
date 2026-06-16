"use client"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("We couldn't find an account with those credentials.")
      setLoading(false)
    } else {
      router.push("/")
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Left panel — brand statement */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] flex-shrink-0 p-12"
        style={{ backgroundColor: "var(--text-primary)" }}
      >
        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: "var(--accent)" }}
          >
            E
          </div>
          <span className="text-white font-semibold text-sm tracking-wide">Empathy</span>
        </div>

        {/* Central message */}
        <div>
          <p
            className="text-sm font-medium uppercase tracking-widest mb-6"
            style={{ color: "var(--accent)" }}
          >
            Welcome to the team
          </p>
          <h1
            className="text-4xl font-bold leading-tight mb-6"
            style={{ color: "#FFFFFF", letterSpacing: "-0.02em" }}
          >
            Your first month,<br />
            <em style={{ color: "var(--accent)", fontStyle: "italic" }}>guided.</em>
          </h1>
          <p className="text-base leading-relaxed" style={{ color: "#8E9BAE" }}>
            Everything you need to understand who we are,
            what we build, and how you fit into the mission —
            in four thoughtful weeks.
          </p>
        </div>

        {/* Footer quote */}
        <div
          className="border-l-2 pl-4"
          style={{ borderColor: "var(--accent)" }}
        >
          <p className="text-sm italic leading-relaxed" style={{ color: "#8E9BAE" }}>
            &ldquo;Every person at Empathy takes full ownership
            of their work. Welcome to yours.&rdquo;
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center text-white font-bold text-xs"
              style={{ backgroundColor: "var(--accent)" }}
            >
              E
            </div>
            <span className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Empathy
            </span>
          </div>

          <h2
            className="text-2xl font-bold mb-1"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Sign in
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-secondary)" }}>
            Continue your onboarding journey
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="you@empathy.com"
                required
                autoFocus
              />
            </div>

            <div>
              <label
                className="block text-xs font-semibold mb-1.5 uppercase tracking-wider"
                style={{ color: "var(--text-secondary)" }}
              >
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  backgroundColor: "var(--surface)",
                  border: "1.5px solid var(--border)",
                  color: "var(--text-primary)",
                }}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-xl text-sm"
                style={{
                  backgroundColor: "#FDF2EE",
                  color: "var(--accent-dark)",
                  border: "1px solid #F5D9CC",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2"
              style={{
                backgroundColor: loading ? "var(--text-muted)" : "var(--accent)",
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Continue →"
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div
            className="mt-8 p-4 rounded-xl"
            style={{ backgroundColor: "var(--surface-warm)", border: "1px solid var(--border)" }}
          >
            <p
              className="text-xs font-semibold mb-2 uppercase tracking-wider"
              style={{ color: "var(--text-muted)" }}
            >
              Demo accounts · password: empathy123
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {[
                "employee@empathy.com",
                "manager@empathy.com",
                "hr@empathy.com",
                "admin@empathy.com",
              ].map((e) => (
                <button
                  key={e}
                  onClick={() => setEmail(e)}
                  className="text-left text-xs truncate"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
