import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Terms & Conditions - Resume Tailor",
  description: "Terms and conditions for using the Resume Tailor service.",
}

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Terms & Conditions</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Please read these terms carefully before using our service.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6 max-w-3xl">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                <p>
                  By accessing or using Resume Tailor, you agree to be bound by these Terms and Conditions and all
                  applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
                  using or accessing this site.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">2. Use License</h2>
                <p>
                  Permission is granted to temporarily use Resume Tailor for personal, non-commercial use only. This is
                  the grant of a license, not a transfer of title, and under this license you may not:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Modify or copy the materials</li>
                  <li>Use the materials for any commercial purpose</li>
                  <li>Attempt to decompile or reverse engineer any software contained on Resume Tailor</li>
                  <li>Remove any copyright or other proprietary notations from the materials</li>
                  <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                </ul>
                <p>
                  This license shall automatically terminate if you violate any of these restrictions and may be
                  terminated by Resume Tailor at any time.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
                <p>When using Resume Tailor, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and truthful information in your resume</li>
                  <li>Not use the service to create misleading or fraudulent resumes</li>
                  <li>Not upload content that contains viruses, malware, or other harmful code</li>
                  <li>Not attempt to gain unauthorized access to any part of the service</li>
                  <li>Be solely responsible for the content of your resume and job descriptions</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">4. Payment and Refunds</h2>
                <p>By purchasing the humanization service for ₹50, you agree to the following:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All payments are processed securely through our payment providers</li>
                  <li>The fee is non-refundable once the humanization process has begun</li>
                  <li>
                    If the humanization service fails to complete due to technical issues on our end, you may request a
                    refund within 24 hours
                  </li>
                  <li>We reserve the right to change our pricing at any time</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">5. Disclaimer</h2>
                <p>
                  The materials on Resume Tailor are provided on an 'as is' basis. Resume Tailor makes no warranties,
                  expressed or implied, and hereby disclaims and negates all other warranties including, without
                  limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or
                  non-infringement of intellectual property or other violation of rights.
                </p>
                <p>
                  Further, Resume Tailor does not warrant or make any representations concerning the accuracy, likely
                  results, or reliability of the use of the materials on its website or otherwise relating to such
                  materials or on any sites linked to this site.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">6. Limitations</h2>
                <p>
                  In no event shall Resume Tailor or its suppliers be liable for any damages (including, without
                  limitation, damages for loss of data or profit, or due to business interruption) arising out of the
                  use or inability to use Resume Tailor, even if Resume Tailor or a Resume Tailor authorized
                  representative has been notified orally or in writing of the possibility of such damage.
                </p>
                <p>
                  Resume Tailor does not guarantee that using our service will result in job interviews or employment
                  offers. The effectiveness of tailored resumes may vary based on numerous factors outside our control.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">7. Accuracy of Materials</h2>
                <p>
                  The materials appearing on Resume Tailor could include technical, typographical, or photographic
                  errors. Resume Tailor does not warrant that any of the materials on its website are accurate,
                  complete, or current. Resume Tailor may make changes to the materials contained on its website at any
                  time without notice.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">8. Links</h2>
                <p>
                  Resume Tailor has not reviewed all of the sites linked to its website and is not responsible for the
                  contents of any such linked site. The inclusion of any link does not imply endorsement by Resume
                  Tailor of the site. Use of any such linked website is at the user's own risk.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">9. Modifications</h2>
                <p>
                  Resume Tailor may revise these terms of service for its website at any time without notice. By using
                  this website, you are agreeing to be bound by the then current version of these terms of service.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">10. Governing Law</h2>
                <p>
                  These terms and conditions are governed by and construed in accordance with the laws of India and you
                  irrevocably submit to the exclusive jurisdiction of the courts in that location.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">11. Contact Information</h2>
                <p>
                  If you have any questions about these Terms & Conditions, please contact us through our{" "}
                  <a href="/contact" className="text-primary underline underline-offset-4">
                    Contact Page
                  </a>
                  .
                </p>
              </div>

              <div className="border-t pt-8">
                <p className="text-sm text-muted-foreground">Last updated: March 12, 2024</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

