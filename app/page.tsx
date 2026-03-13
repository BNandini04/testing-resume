import type { Metadata } from "next"
import Link from "next/link"
import { HowItWorks } from "@/components/how-it-works"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ResumeHeroIllustration } from "@/components/illustrations/resume-hero"
import { LogoText } from "@/components/brand/logo-text"

export const metadata: Metadata = {
  title: "Resume Tailor - Match Your Resume to Job Descriptions",
  description: "Upload your resume and job description to get a tailored resume that matches the job requirements.",
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="inline-block mb-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    AI-Powered Resume Optimization
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    Get More Interviews with <LogoText variant="gradient" size="xl" />
                  </h1>
                </div>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Our AI-powered tool analyzes job descriptions and your existing resume to create a perfectly tailored
                  version that highlights your relevant skills and experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/upload/job-description" passHref>
                    <Button size="lg" className="w-full sm:w-auto">
                      Tailor Your Resume
                    </Button>
                  </Link>
                  <Link href="/ats-score-checker" passHref>
                  <Button size="lg" className="w-full sm:w-auto">
                      Check ATS Score
                    </Button>
                  </Link>
                  <Link href="/pricing" passHref>
                  <Button size="lg" className="w-full sm:w-auto">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <ResumeHeroIllustration />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}

