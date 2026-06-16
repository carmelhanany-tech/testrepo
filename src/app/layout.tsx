import type { Metadata } from "next"
import "./globals.css"
import { auth } from "@/lib/auth"
import AuthProvider from "@/components/AuthProvider"

export const metadata: Metadata = {
  title: "Empathy Onboarding",
  description: "Your onboarding journey at Empathy",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider session={session}>{children}</AuthProvider>
      </body>
    </html>
  )
}
