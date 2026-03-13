import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { PaymentFlow } from "@/components/payment-flow"
import { PaymentIllustration } from "@/components/illustrations/payment-illustration"

export const metadata: Metadata = {
  title: "Complete Your Purchase - Resume Tailor",
  description: "Humanize your resume with our premium service.",
}

export default function PaymentPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6 max-w-3xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter">Humanize Your Resume</h1>
                <p className="text-muted-foreground md:text-lg">
                  Make your resume sound more natural and personalized to increase your chances of getting interviews.
                </p>
              </div>
              <div className="w-full max-w-xs">
                <PaymentIllustration />
              </div>
            </div>

            <PaymentFlow />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

