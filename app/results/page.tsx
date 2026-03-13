import Link from "next/link"
import type { Metadata } from "next"
import { ResultsView } from "@/components/results-view"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { AnalysisIllustration } from "@/components/illustrations/analysis-illustration"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Your Tailored Resume - Resume Tailor",
  description: "View and download your tailored resume.",
}

export default function ResultsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-4xl py-12">
          <div className="mb-8">
            <Link
              href="/upload/resume"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Resume Upload
            </Link>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Your Tailored Resume</h1>
                <p className="text-muted-foreground">Step 3 of 3: Review and download your tailored resume</p>
              </div>
              <div className="flex justify-center">
                <AnalysisIllustration />
              </div>
            </div>
          </div>

          <ResultsView />

          <div className="mt-8 pt-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Start a New Resume</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/upload/job-description" passHref>
                <Button variant="outline" className="w-full">
                  Tailor for Another Job
                </Button>
              </Link>
              <Link href="/" passHref>
                <Button variant="secondary" className="w-full">
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

