"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function FAQContent() {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would filter the FAQs based on the search query
    console.log("Searching for:", searchQuery)
  }

  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        {/* Search Bar */}
        <div className="mx-auto max-w-2xl mb-12">
          <form onSubmit={handleSearch} className="flex w-full items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for answers..."
                className="w-full bg-background pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* FAQ Categories */}
        <Tabs defaultValue="general" className="mx-auto max-w-4xl">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* General FAQs */}
          <TabsContent value="general" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="general-1">
                <AccordionTrigger>What is Resume Tailor?</AccordionTrigger>
                <AccordionContent>
                  Resume Tailor is an AI-powered platform that helps job seekers create tailored resumes that match
                  specific job descriptions. Our technology analyzes job requirements and your existing resume to
                  highlight relevant skills and experience, increasing your chances of getting past Applicant Tracking
                  Systems (ATS) and catching the attention of recruiters.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-2">
                <AccordionTrigger>How does Resume Tailor work?</AccordionTrigger>
                <AccordionContent>
                  <p>Our process is simple:</p>
                  <ol className="list-decimal pl-5 space-y-2 mt-2">
                    <li>Upload a job description (text, image, PDF, or DOCX)</li>
                    <li>Upload your existing resume (PDF or DOCX)</li>
                    <li>Our AI analyzes both documents to identify key requirements and match them with your skills</li>
                    <li>We generate a tailored resume that emphasizes relevant experience</li>
                    <li>Optional: Humanize your resume to make it sound more natural</li>
                    <li>Download your new resume in PDF or DOCX format</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-3">
                <AccordionTrigger>How long does it take to create a tailored resume?</AccordionTrigger>
                <AccordionContent>
                  The entire process typically takes 2-5 minutes from uploading your documents to receiving your
                  tailored resume. The exact time depends on the complexity of the job description and your resume. The
                  humanization process adds approximately 1-2 minutes if you choose that option.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-4">
                <AccordionTrigger>Will my tailored resume pass ATS systems?</AccordionTrigger>
                <AccordionContent>
                  Yes! Our AI is specifically designed to optimize your resume for Applicant Tracking Systems. We
                  analyze the job description for key requirements and ensure your resume includes the relevant keywords
                  and phrases that ATS systems look for, significantly increasing your chances of getting past the
                  initial screening.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="general-5">
                <AccordionTrigger>Do I need to create an account to use Resume Tailor?</AccordionTrigger>
                <AccordionContent>
                  For the Basic plan, you can generate one resume per month without creating an account. However, to
                  save your work, access premium features like humanization, or use the Premium or Unlimited plans,
                  you'll need to create an account. Account creation is free and only takes a minute.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Pricing FAQs */}
          <TabsContent value="pricing" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="pricing-1">
                <AccordionTrigger>What are the different pricing plans?</AccordionTrigger>
                <AccordionContent>
                  <p>We offer three main pricing plans:</p>
                  <ul className="list-disc pl-5 space-y-2 mt-2">
                    <li>
                      <strong>Basic (Free):</strong> 1 AI-tailored resume per month, PDF downloads only
                    </li>
                    <li>
                      <strong>Premium ($14.99 per resume):</strong> Pay-per-download, includes humanization, PDF & DOCX
                      formats
                    </li>
                    <li>
                      <strong>Unlimited ($24.99/month or $19.99/month billed annually):</strong> Unlimited resumes and
                      humanization
                    </li>
                  </ul>
                  <p className="mt-2">
                    You can view our full pricing details on our{" "}
                    <Link href="/pricing" className="text-primary underline underline-offset-4">
                      pricing page
                    </Link>
                    .
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pricing-2">
                <AccordionTrigger>What's included in the free Basic plan?</AccordionTrigger>
                <AccordionContent>
                  The Basic plan allows you to create one AI-tailored resume per month. You'll be able to upload a job
                  description and your resume, and our AI will generate a tailored version that matches the job
                  requirements. You can download the result in PDF format. The Basic plan does not include humanization
                  or DOCX downloads.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pricing-3">
                <AccordionTrigger>Can I cancel my subscription at any time?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can cancel your subscription at any time. If you cancel, you'll still have access to the
                  service until the end of your current billing period. We don't offer refunds for partial subscription
                  periods, but you won't be charged again after cancellation.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pricing-4">
                <AccordionTrigger>Do you offer discounts for students or job seekers?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer a 20% discount for students and recent graduates. To qualify, you'll need to verify your
                  student status with a valid .edu email address or provide proof of graduation within the last 12
                  months. Contact our support team after signing up to apply for this discount.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pricing-5">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple
                  Pay. All payments are processed securely through our payment processor, and we never store your full
                  credit card information on our servers.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Technical FAQs */}
          <TabsContent value="technical" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="technical-1">
                <AccordionTrigger>What file formats do you support?</AccordionTrigger>
                <AccordionContent>
                  <p>
                    <strong>For job descriptions:</strong>
                  </p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Text (paste directly)</li>
                    <li>Images (JPG, PNG)</li>
                    <li>PDF documents</li>
                    <li>DOCX (Microsoft Word) documents</li>
                  </ul>

                  <p className="mt-2">
                    <strong>For resumes:</strong>
                  </p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>PDF documents</li>
                    <li>DOCX (Microsoft Word) documents</li>
                  </ul>

                  <p className="mt-2">
                    <strong>For downloads:</strong>
                  </p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>PDF (all plans)</li>
                    <li>DOCX (Premium and Unlimited plans only)</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-2">
                <AccordionTrigger>Is there a file size limit?</AccordionTrigger>
                <AccordionContent>
                  Yes, there are file size limits to ensure optimal processing:
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Resume files: Maximum 5MB</li>
                    <li>Job description files: Maximum 10MB</li>
                    <li>Images: Maximum 5MB</li>
                  </ul>
                  If your file exceeds these limits, try compressing it or converting it to a different format.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-3">
                <AccordionTrigger>Can I use Resume Tailor on my mobile device?</AccordionTrigger>
                <AccordionContent>
                  Yes, Resume Tailor is fully responsive and works on smartphones and tablets. You can upload files,
                  generate tailored resumes, and download the results directly from your mobile device. For the best
                  experience on smaller screens, we recommend using our mobile app, available for iOS and Android.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-4">
                <AccordionTrigger>What browsers are supported?</AccordionTrigger>
                <AccordionContent>
                  Resume Tailor works with all modern browsers, including:
                  <ul className="list-disc pl-5 space-y-1 mt-2">
                    <li>Google Chrome (recommended)</li>
                    <li>Mozilla Firefox</li>
                    <li>Safari</li>
                    <li>Microsoft Edge</li>
                    <li>Opera</li>
                  </ul>
                  We recommend keeping your browser updated to the latest version for the best experience.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical-5">
                <AccordionTrigger>What if my resume has a complex format or design?</AccordionTrigger>
                <AccordionContent>
                  Our system works best with standard resume formats. If your resume has a very complex design, custom
                  graphics, or unusual formatting, some elements might not be perfectly preserved in the tailored
                  version. For best results, we recommend using a clean, professional template with standard sections
                  (summary, experience, education, skills). If you encounter issues, our support team can help.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Privacy FAQs */}
          <TabsContent value="privacy" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="privacy-1">
                <AccordionTrigger>How is my data protected?</AccordionTrigger>
                <AccordionContent>
                  We take data security very seriously. All data transmitted to and from our servers is encrypted using
                  industry-standard SSL/TLS protocols. Your resume and job description data are stored securely with
                  encryption at rest, and we implement strict access controls to ensure only authorized personnel can
                  access your information when necessary for support purposes.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy-2">
                <AccordionTrigger>Do you keep my resume and job description data?</AccordionTrigger>
                <AccordionContent>
                  For Basic users, we retain your data for 30 days after generation to allow you to return and download
                  your resume. For Premium and Unlimited users, we store your data for as long as your account is active
                  to provide access to your history and allow for revisions. You can manually delete your data at any
                  time from your account settings. All user data is automatically deleted 90 days after account closure.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy-3">
                <AccordionTrigger>Do you share my data with third parties?</AccordionTrigger>
                <AccordionContent>
                  We never sell your personal information or resume data to third parties. We use trusted third-party
                  services for specific functions like payment processing and email delivery, but these partners are
                  bound by strict confidentiality agreements and only process the minimum data necessary for their
                  function. Our AI processing is done on our secure servers, not through external AI providers.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy-4">
                <AccordionTrigger>Can I delete my data from your systems?</AccordionTrigger>
                <AccordionContent>
                  Yes, you have complete control over your data. You can delete individual resumes and job descriptions
                  from your account dashboard at any time. To delete all your data, you can either use the "Delete All
                  Data" option in your account settings or contact our support team. When you delete your account, all
                  your personal information and documents are permanently removed from our systems within 90 days.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="privacy-5">
                <AccordionTrigger>Do you use my resume to train your AI?</AccordionTrigger>
                <AccordionContent>
                  No, we do not use your resume or job description data to train our AI models. Your personal
                  information and documents are used solely for providing the service to you. We may use anonymized,
                  aggregated statistics (such as average processing time or common file formats) for improving our
                  service, but these never contain any personal or identifiable information.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>

          {/* Features FAQs */}
          <TabsContent value="features" className="mt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="features-1">
                <AccordionTrigger>What is the humanization feature?</AccordionTrigger>
                <AccordionContent>
                  The humanization feature is our premium offering that refines AI-generated content to sound more
                  natural and personalized. It analyzes the language patterns in your resume and makes subtle
                  adjustments to ensure the text flows naturally, varies in structure, and maintains a consistent
                  personal voice. This reduces the likelihood of your resume being detected as AI-generated and helps it
                  connect better with human recruiters.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features-2">
                <AccordionTrigger>Can I edit my resume after it's generated?</AccordionTrigger>
                <AccordionContent>
                  Yes! All plans allow you to download your resume. The Premium and Unlimited plans provide DOCX format
                  for easy editing in Microsoft Word or Google Docs. The Basic plan provides PDF format only, which has
                  limited editing capabilities. We recommend making any final adjustments to perfectly match your style
                  and add any personal touches.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features-3">
                <AccordionTrigger>Does Resume Tailor support multiple languages?</AccordionTrigger>
                <AccordionContent>
                  Currently, Resume Tailor fully supports English (US, UK, Canadian, and Australian variants). We offer
                  beta support for Spanish, French, and German. Our team is actively working on adding more languages.
                  If you need support for a specific language not listed here, please contact our support team to check
                  on availability or timelines.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features-4">
                <AccordionTrigger>Can I save multiple versions of my tailored resume?</AccordionTrigger>
                <AccordionContent>
                  Yes, Premium and Unlimited plan users can save multiple versions of their tailored resumes in their
                  account dashboard. This allows you to create different versions for different job applications and
                  keep track of which version you sent to each employer. Basic plan users can download their resume but
                  cannot save versions in our system.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features-5">
                <AccordionTrigger>Do you offer resume templates?</AccordionTrigger>
                <AccordionContent>
                  Yes, we offer a variety of professional resume templates. Basic users have access to 3 standard
                  templates, while Premium and Unlimited users can choose from 15+ professionally designed templates,
                  including industry-specific options. All templates are ATS-friendly and designed to highlight your
                  skills and experience effectively.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="features-6">
                <AccordionTrigger>Can Resume Tailor help with cover letters too?</AccordionTrigger>
                <AccordionContent>
                  Yes! Premium and Unlimited plan users can also generate tailored cover letters that match their
                  resumes and the job description. This feature uses the same AI technology to create personalized cover
                  letters that highlight your relevant experience and express your interest in the position. Cover
                  letter generation and humanization are included in these plans at no extra cost.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold tracking-tight">Still have questions?</h2>
          <p className="mt-2 text-muted-foreground">
            Our support team is here to help you with any questions you may have.
          </p>
          <div className="mt-6">
            <Link href="/contact" passHref>
              <Button size="lg">Contact Support</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

