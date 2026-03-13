import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PricingPlans } from "@/components/pricing-plans"
import { CheckCircle2, Sparkles } from "lucide-react"

export const metadata: Metadata = {
  title: "Humanize Your Resume - Resume Tailor",
  description: "Make your AI-generated resume sound more natural and personalized for just ₹50.",
}

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Humanize Your Resume</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Make your AI-generated resume sound more natural and personalized for better results.
                </p>
              </div>
            </div>
          </div>
        </section>

        <PricingPlans />

        <section className="w-full py-12 md:py-24 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Why Humanize Your Resume?</h2>
                <p className="text-muted-foreground">
                  AI-generated content can sometimes sound robotic or formulaic. Our humanization process adds natural
                  language patterns and personal touches that make your resume more authentic and engaging.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Avoid being filtered out by AI detection systems</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Create a stronger connection with human recruiters</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Stand out from other candidates using generic AI content</span>
                  </li>
                </ul>
              </div>
              <div className="rounded-lg border bg-card p-8 shadow-sm">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">Before & After</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Before Humanization:</p>
                      <p className="text-sm p-3 bg-muted rounded-md">
                        "Implemented CI/CD pipelines that reduced deployment time by 40%"
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">After Humanization:</p>
                      <p className="text-sm p-3 bg-primary/10 rounded-md border border-primary/20">
                        "Designed and implemented CI/CD pipelines using GitHub Actions, cutting our deployment time from
                        2 hours to just 30 minutes"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

