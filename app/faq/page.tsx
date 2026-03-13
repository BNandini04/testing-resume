import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { FAQContent } from "@/components/faq-content"

export const metadata: Metadata = {
  title: "Frequently Asked Questions - Resume Tailor",
  description: "Find answers to common questions about Resume Tailor's services, pricing, and features.",
}

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Frequently Asked Questions
                </h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Find answers to common questions about our services, features, and how Resume Tailor can help you land
                  your dream job.
                </p>
              </div>
            </div>
          </div>
        </section>

        <FAQContent />
      </main>
      <Footer />
    </div>
  )
}

