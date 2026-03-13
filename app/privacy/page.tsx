import type { Metadata } from "next"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Privacy Policy - Resume Tailor",
  description: "Privacy policy for Resume Tailor service.",
}

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Privacy Policy</h1>
                <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  How we collect, use, and protect your personal information.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24">
          <div className="container px-4 md:px-6 max-w-3xl">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">1. Introduction</h2>
                <p>
                  At Resume Tailor, we respect your privacy and are committed to protecting your personal data. This
                  privacy policy will inform you about how we look after your personal data when you visit our website
                  and tell you about your privacy rights and how the law protects you.
                </p>
                <p>
                  This privacy policy applies to all users of Resume Tailor and to all information collected and used by
                  us.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">2. Information We Collect</h2>
                <p>We collect the following types of information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Personal Information:</strong> This includes your name, email address, and phone number when
                    you create an account, contact us, or make a payment.
                  </li>
                  <li>
                    <strong>Resume and Job Description Data:</strong> The content of your resume and job descriptions
                    that you upload or input into our system.
                  </li>
                  <li>
                    <strong>Payment Information:</strong> When you make a payment, we collect transaction data, but we
                    do not store complete payment card details on our servers.
                  </li>
                  <li>
                    <strong>Usage Data:</strong> Information about how you use our website and services, including your
                    IP address, browser type, pages visited, time spent on pages, and other diagnostic data.
                  </li>
                  <li>
                    <strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies
                    to track activity on our website and hold certain information.
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">3. How We Use Your Information</h2>
                <p>We use the information we collect for various purposes, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To process and complete transactions</li>
                  <li>To send you transaction confirmations and receipts</li>
                  <li>To analyze and improve our service</li>
                  <li>To respond to your inquiries and provide customer support</li>
                  <li>To detect, prevent, and address technical issues</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">4. Data Storage and Security</h2>
                <p>We implement appropriate security measures to protect your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>All data transmitted to and from our servers is encrypted using SSL/TLS protocols</li>
                  <li>Your resume and job description data are stored securely with encryption at rest</li>
                  <li>
                    We implement strict access controls to ensure only authorized personnel can access your information
                    when necessary
                  </li>
                  <li>We regularly review our security practices and update them as needed</li>
                </ul>
                <p>
                  We retain your data for as long as your account is active or as needed to provide you services. We
                  will delete your data upon your request or after a period of inactivity, except where we need to
                  retain it for legitimate business or legal purposes.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">5. Data Sharing and Third Parties</h2>
                <p>We do not sell your personal information to third parties. We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <strong>Service Providers:</strong> We use trusted third-party service providers to help us operate
                    our business and deliver services to you (e.g., payment processors, email delivery services).
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose your information if required by law,
                    regulation, legal process, or governmental request.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In the event of a merger, acquisition, or asset sale, your
                    personal data may be transferred as a business asset.
                  </li>
                </ul>
                <p>
                  All third parties we work with are required to respect the security of your personal data and to treat
                  it in accordance with the law.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">6. Your Data Protection Rights</h2>
                <p>Depending on your location, you may have the following rights regarding your personal data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The right to access your personal data</li>
                  <li>The right to correct inaccurate or incomplete data</li>
                  <li>The right to erasure (the "right to be forgotten")</li>
                  <li>The right to restrict processing of your data</li>
                  <li>The right to data portability</li>
                  <li>The right to object to the processing of your data</li>
                  <li>The right to withdraw consent at any time</li>
                </ul>
                <p>
                  To exercise any of these rights, please contact us through our{" "}
                  <a href="/contact" className="text-primary underline underline-offset-4">
                    Contact Page
                  </a>
                  .
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">7. Cookies Policy</h2>
                <p>
                  We use cookies and similar tracking technologies to track activity on our website and hold certain
                  information. Cookies are files with a small amount of data that may include an anonymous unique
                  identifier.
                </p>
                <p>
                  You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                  However, if you do not accept cookies, you may not be able to use some portions of our service.
                </p>
                <p>We use cookies for the following purposes:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>To maintain your session and remember your preferences</li>
                  <li>To authenticate users and prevent fraudulent use of accounts</li>
                  <li>To analyze how our website is used and improve our service</li>
                  <li>To track the effectiveness of our marketing campaigns</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">8. Children's Privacy</h2>
                <p>
                  Our service is not intended for use by children under the age of 18. We do not knowingly collect
                  personally identifiable information from children under 18. If you are a parent or guardian and you
                  are aware that your child has provided us with personal data, please contact us so that we can take
                  necessary actions.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">9. Changes to This Privacy Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the
                  new Privacy Policy on this page and updating the "Last updated" date.
                </p>
                <p>
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy
                  Policy are effective when they are posted on this page.
                </p>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">10. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our{" "}
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

