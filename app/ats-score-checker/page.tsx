"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileUploader } from "@/components/file-uploader"
import { FileText } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { extractPlainTextFromFile } from "@/lib/api"
import useStore from "@/lib/store"

type Step = "job" | "resume" | "result"

export default function AtsScoreCheckerPage() {
  const router = useRouter()

  const [step, setStep] = useState<Step>("job")
  const [jobFile, setJobFile] = useState<File | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)

  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [score, setScore] = useState<number | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  // Store functions
  const storeSetJobDescriptionFile = useStore((state) => state.setJobDescriptionFile)
  const storeSetResumeFile = useStore((state) => state.setResumeFile)

  const handleJobUpload = (file: File) => {
    setJobFile(file)
    setError(null)
    // Automatically move to the next step after successful upload
    setStep("resume")
  }

  const handleResumeUpload = (file: File) => {
    setResumeFile(file)
    setError(null)
  }

  const handleCalculateScore = async () => {
    if (!jobFile || !resumeFile) {
      setError("Please upload both the job description and your resume.")
      return
    }

    setIsCalculating(true)
    setProgress(0)
    setError(null)
    setScore(null)

    try {
      // Simple progress simulation while we work
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval)
            return 90
          }
          return prev + 5
        })
      }, 150)

      const [jobText, resumeText] = await Promise.all([
        extractPlainTextFromFile(jobFile),
        extractPlainTextFromFile(resumeFile),
      ])

      const response = await fetch("/api/ats-score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: jobText,
          resume: resumeText,
        }),
      })

      clearInterval(interval)
      setProgress(100)

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || "Failed to calculate ATS score.")
      }

      const data = (await response.json()) as { score?: number; suggestions?: string[] }
      if (typeof data.score !== "number") {
        throw new Error("Invalid ATS score received from server.")
      }

      setScore(data.score)
      setSuggestions(data.suggestions || [])
      setStep("result")
    } catch (err: any) {
      console.error("ATS score calculation error:", err)
      setError(err?.message || "Something went wrong while calculating your ATS score.")
    } finally {
      setIsCalculating(false)
    }
  }

  const handleUpdateResume = async () => {
    if (!jobFile || !resumeFile) {
      setError("Please ensure both job description and resume files are uploaded.")
      return
    }

    try {
      // Store the files in the store
      storeSetJobDescriptionFile(jobFile)
      storeSetResumeFile(resumeFile)
      
      // Navigate to results page which will automatically generate the resume
      router.push("/results")
    } catch (err: any) {
      console.error("Error storing files:", err)
      setError("Failed to proceed. Please try again.")
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container max-w-3xl py-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">ATS Score Checker</h1>
            <p className="text-muted-foreground">
              Upload your job description and resume to instantly check how well your resume matches the role.
            </p>
          </div>

          <div className="space-y-6">
            {/* Step 1: Job Description Upload */}
            <Card className={step === "job" ? "border-primary" : ""}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">1. Upload Job Description</h2>
                  <p className="text-sm text-muted-foreground">
                    Start by uploading the job description for the role you&apos;re targeting.
                  </p>
                </div>

                <FileUploader
                  onFileUpload={handleJobUpload}
                  acceptedFileTypes=".pdf,.docx,.txt"
                  icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                  label="Upload Job Description File"
                  description="Supports PDF, DOCX, TXT"
                />

                {jobFile && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Uploaded job description: <span className="font-medium">{jobFile.name}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Step 2: Resume Upload */}
            <Card className={step === "resume" ? "border-primary" : ""}>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">2. Upload Your Resume</h2>
                  <p className="text-sm text-muted-foreground">
                    Next, upload the resume you plan to use for this job application.
                  </p>
                </div>

                <FileUploader
                  onFileUpload={handleResumeUpload}
                  acceptedFileTypes=".pdf,.docx"
                  icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                  label="Upload Resume File"
                  description="Supports PDF, DOCX"
                />

                {resumeFile && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Uploaded resume: <span className="font-medium">{resumeFile.name}</span>
                  </p>
                )}

                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleCalculateScore}
                    disabled={!jobFile || !resumeFile || isCalculating}
                  >
                    {isCalculating ? "Calculating ATS Score..." : "Check ATS Score"}
                  </Button>
                </div>

                {isCalculating && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {progress < 30
                          ? "Analyzing job description..."
                          : progress < 60
                            ? "Scanning your resume..."
                            : progress < 90
                              ? "Comparing keywords and experience..."
                              : "Finalizing your ATS score..."}
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400 pt-2">
                    {error}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Result */}
            {step === "result" && score !== null && (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6 space-y-4 text-center">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary uppercase tracking-wide">
                      ATS Analysis Complete
                    </p>
                    <p className="text-3xl md:text-4xl font-bold">
                      Your ATS Score:{" "}
                      <span
                        className={
                          score >= 80
                            ? "text-green-600 dark:text-green-400"
                            : score >= 70
                              ? "text-yellow-600 dark:text-yellow-400"
                              : "text-red-600 dark:text-red-400"
                        }
                      >
                        {score}%
                      </span>
                    </p>
                  </div>

                  {/* Improvement Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="text-left space-y-3 pt-4 border-t">
                      <h3 className="text-lg font-semibold text-center">Improvement Suggestions</h3>
                      <ul className="space-y-2 max-w-xl mx-auto">
                        {suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-primary font-bold mt-1">•</span>
                            <span className="text-sm text-muted-foreground flex-1">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {score >= 80 ? (
                    <>
                      <p className="text-sm text-green-600 dark:text-green-400 max-w-xl mx-auto font-medium">
                        Excellent! Your resume is well-optimized for ATS systems and matches the job description well.
                      </p>
                      <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                        Your resume has a strong alignment with the job requirements. You can still use our resume tailor to further enhance it if needed.
                      </p>
                      <div className="pt-2">
                        <Button size="lg" variant="outline" onClick={handleUpdateResume}>
                          Further Optimize Resume
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                        Your resume could be better optimized for ATS systems. Consider updating it to improve your chances.
                      </p>
                      <div className="pt-2">
                        <Button size="lg" onClick={handleUpdateResume}>
                          Update Resume
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}


