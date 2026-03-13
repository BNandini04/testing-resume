import Link from "next/link"
import type { Metadata } from "next"
import { JobDescriptionUploader } from "@/components/job-description-uploader"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { UploadIllustration } from "@/components/illustrations/upload-illustration"

export const metadata: Metadata = {
  title: "Upload Job Description - Resume Tailor",
  description: "Upload or paste a job description to tailor your resume.",
}

export default function JobDescriptionPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-4xl py-12">
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Upload Job Description</h1>
                <p className="text-muted-foreground">
                  Step 1 of 3: Upload the job description document (PDF or DOCX) you want to tailor your resume for
                </p>
              </div>
              <div className="flex justify-center">
                <UploadIllustration />
              </div>
            </div>
          </div>

          <JobDescriptionUploader />

          <div className="mt-8 flex justify-between">
            <Link href="/" passHref>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Link href="/upload/resume" passHref>
              <Button>Continue to Resume Upload</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

