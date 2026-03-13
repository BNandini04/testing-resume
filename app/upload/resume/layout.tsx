import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Upload Resume - Resume Tailor",
  description: "Upload your existing resume to be tailored for the job description.",
}

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 