"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ResumeUploader } from "@/components/resume-uploader"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { UploadIllustration } from "@/components/illustrations/upload-illustration"
import useStore from "@/lib/store"

export default function ResumePage() {
  const router = useRouter()
  const resumeFile = useStore((state) => state.resume.file)
  const jobDescriptionText = useStore((state) => state.jobDescription.text)
  const jobDescriptionFile = useStore((state) => state.jobDescription.file)

  const handleGenerate = () => {
    if (!resumeFile || (!jobDescriptionText && !jobDescriptionFile)) {
      alert("Please upload both your resume and job description before proceeding.")
      return
    }
    router.push("/results")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-4xl py-12">
          <div className="mb-8">
            <Link
              href="/upload/job-description"
              className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Job Description
            </Link>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Upload Your Resume</h1>
                <p className="text-muted-foreground">
                  Step 2 of 3: Upload your existing resume that you want to tailor
                </p>
              </div>
              <div className="flex justify-center">
                <UploadIllustration />
              </div>
            </div>
          </div>

          <ResumeUploader />

          <div className="mt-8 flex justify-between">
            <Link href="/upload/job-description" passHref>
              <Button variant="outline">Previous Step</Button>
            </Link>
            <Button onClick={handleGenerate}>Generate Tailored Resume</Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

