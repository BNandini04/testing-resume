"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ResumePreview, RESUME_TEMPLATES, type ResumeTemplateId } from "@/components/resume-preview"
import { InterviewQuestions } from "@/components/interview-questions"
import { Button } from "@/components/ui/button"
import { Download, Sparkles, RefreshCw, TrendingUp, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import Link from "next/link"
import useStore from "@/lib/store"
import { generateTailoredResume, generateInterviewQuestions, extractPlainTextFromFile, normalizeResumeTextForAts } from "@/lib/api"
import { generatePDF, generateDOCX } from "@/lib/file-generator"

export function ResultsView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const humanizedParam = searchParams.get("humanized")

  const [isGenerating, setIsGenerating] = useState(true)
  const [progress, setProgress] = useState(0)
  const [generatedResume, setGeneratedResume] = useState<{
    content: string;
    downloadUrl?: string;
    isBinary?: boolean;
  } | null>(null)
  const [isHumanizing, setIsHumanizing] = useState(false)
  const [humanizeProgress, setHumanizeProgress] = useState(0)
  const [isHumanized, setIsHumanized] = useState(humanizedParam === "true")
  const [showPricingDialog, setShowPricingDialog] = useState(false)
  const [humanizeStep, setHumanizeStep] = useState<'email' | 'payment' | 'confirmation'>('email')
  const [email, setEmail] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi'>('card')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [upiId, setUpiId] = useState('')
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [paymentReceipt, setPaymentReceipt] = useState('')
  const [interviewQuestions, setInterviewQuestions] = useState<string | null>(null)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [atsScore, setAtsScore] = useState<number | null>(null)
  const [isCalculatingAtsScore, setIsCalculatingAtsScore] = useState(false)
  const [atsSuggestions, setAtsSuggestions] = useState<string[]>([])
  const [isReOptimizing, setIsReOptimizing] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplateId>("classic")

  // Get the stored files from the store
  const resumeFile = useStore((state) => state.resume.file)
  const jobDescriptionFile = useStore((state) => state.jobDescription.file)
  const jobDescriptionText = useStore((state) => state.jobDescription.text)

  // Generate the resume when the component mounts
  useEffect(() => {
    const generateResume = async () => {
      if (!resumeFile || (!jobDescriptionFile && !jobDescriptionText)) {
        alert("Missing required files. Please go back and upload both your resume and job description.")
        router.push("/upload/resume")
        return
      }

      try {
        // Start progress animation
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval)
              return 90
            }
            return prev + 5
          })
        }, 200)

        // Extract original resume text for interview questions
        const originalResumeText = await extractPlainTextFromFile(resumeFile as File)
        
        // Extract job description text
        let finalJobDescriptionText = jobDescriptionText || ""
        if (jobDescriptionFile && !finalJobDescriptionText) {
          finalJobDescriptionText = await extractPlainTextFromFile(jobDescriptionFile)
        }
        
        // Call the API to generate the tailored resume
        const result = await generateTailoredResume(
          resumeFile as File,
          jobDescriptionFile || null,
          jobDescriptionText || null
        ) as { content: string; downloadUrl?: string; isBinary?: boolean }
        
        // Clear the progress interval and set to 100%
        clearInterval(progressInterval)
        setProgress(100)
        
        // Set the generated resume content
        setGeneratedResume(result)
        
        // Calculate ATS score after resume generation
        setIsCalculatingAtsScore(true)
        try {
          // Normalize the resume text to match the format that would be extracted from a file
          // This ensures consistent ATS scoring between generated resume and file upload
          const normalizedResumeText = normalizeResumeTextForAts(result.content)
          
          const atsResponse = await fetch("/api/ats-score", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              jobDescription: finalJobDescriptionText,
              resume: normalizedResumeText,
            }),
          })
          
          if (atsResponse.ok) {
            const atsData = await atsResponse.json()
            if (typeof atsData.score === "number") {
              setAtsScore(atsData.score)
            }
            if (Array.isArray(atsData.suggestions)) {
              setAtsSuggestions(atsData.suggestions)
            }
          }
        } catch (error) {
          console.error('Error calculating ATS score:', error)
          // Don't show alert for ATS score failure - it's optional
        } finally {
          setIsCalculatingAtsScore(false)
        }
        
        // Generate interview questions after resume is generated
        setIsGeneratingQuestions(true)
        try {
          const questions = await generateInterviewQuestions(
            result.content,
            originalResumeText,
            finalJobDescriptionText
          )
          setInterviewQuestions(questions)
        } catch (error) {
          console.error('Error generating interview questions:', error)
          // Don't show alert for interview questions failure - it's optional
        } finally {
          setIsGeneratingQuestions(false)
        }
      } catch (error) {
        console.error('Error generating resume:', error)
        alert('An error occurred while generating your tailored resume. Please try again.')
      } finally {
        setIsGenerating(false)
      }
    }

    generateResume()
  }, [resumeFile, jobDescriptionFile, jobDescriptionText, router])

  // Handle humanize button click
  const handleHumanize = () => {
    setShowPricingDialog(true)
    setHumanizeStep('email')
  }

  // Handle email submission
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setHumanizeStep('payment')
    }
  }

  // Handle payment submission
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate payment processing
    setPaymentComplete(true)
    setPaymentReceipt('PAY-' + Math.random().toString(36).substring(2, 15).toUpperCase())
    setHumanizeStep('confirmation')
  }

  // Simulate the humanization process
  const startHumanizing = () => {
    setIsHumanizing(true)
    setHumanizeProgress(0)

    const interval = setInterval(() => {
      setHumanizeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsHumanizing(false)
          setIsHumanized(true)
          return 100
        }
        return prev + 5
      })
    }, 100)
  }

  const handleDownload = async (format: "pdf" | "docx") => {
    if (!generatedResume?.content) {
      alert(`Resume content not available. Please try generating the resume again.`)
      return
    }
    const template = selectedTemplate
    try {
      const filename = `tailored-resume.${format}`
      if (format === "pdf") {
        await generatePDF(generatedResume.content, filename, template)
      } else {
        await generateDOCX(generatedResume.content, filename, template)
      }
    } catch (error) {
      console.error('Error generating file:', error)
      alert('An error occurred while generating the file. Please try again.')
    }
  }

  const handleReOptimize = async () => {
    if (!resumeFile || (!jobDescriptionFile && !jobDescriptionText)) {
      alert("Missing required files. Please go back and upload both your resume and job description.")
      return
    }

    setIsReOptimizing(true)
    try {
      // Extract job description text
      let finalJobDescriptionText = jobDescriptionText || ""
      if (jobDescriptionFile && !finalJobDescriptionText) {
        finalJobDescriptionText = await extractPlainTextFromFile(jobDescriptionFile)
      }

      // Create enhanced job description with suggestions
      const suggestionsText = atsSuggestions.length > 0 
        ? `\n\nCRITICAL OPTIMIZATION REQUIREMENTS - MUST IMPLEMENT THESE TO ACHIEVE 90%+ ATS SCORE:\n${atsSuggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nIMPORTANT: The resume MUST address ALL of the above suggestions. These are specific gaps identified between the current resume and the job description that need to be filled to achieve a score of 90% or higher.`
        : ''
      
      const enhancedJobDescription = finalJobDescriptionText + suggestionsText

      // Call the API to re-generate the tailored resume with suggestions
      const result = await generateTailoredResume(
        resumeFile as File,
        null, // Don't send file, send text with suggestions
        enhancedJobDescription
      ) as { content: string; downloadUrl?: string; isBinary?: boolean }
      
      // Update the generated resume
      setGeneratedResume(result)
      
      // Recalculate ATS score
      setIsCalculatingAtsScore(true)
      try {
        const normalizedResumeText = normalizeResumeTextForAts(result.content)
        
        const atsResponse = await fetch("/api/ats-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobDescription: finalJobDescriptionText, // Use original JD for scoring
            resume: normalizedResumeText,
          }),
        })
        
        if (atsResponse.ok) {
          const atsData = await atsResponse.json()
          if (typeof atsData.score === "number") {
            setAtsScore(atsData.score)
          }
          if (Array.isArray(atsData.suggestions)) {
            setAtsSuggestions(atsData.suggestions)
          }
        }
      } catch (error) {
        console.error('Error calculating ATS score:', error)
      } finally {
        setIsCalculatingAtsScore(false)
      }
    } catch (error) {
      console.error('Error re-optimizing resume:', error)
      alert('An error occurred while re-optimizing your resume. Please try again.')
    } finally {
      setIsReOptimizing(false)
    }
  }

  return (
    <div className="space-y-6">
      {isGenerating ? (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Generating Your Tailored Resume</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>
                    {progress < 30
                      ? "Analyzing job requirements..."
                      : progress < 60
                        ? "Matching your skills and experience..."
                        : progress < 90
                          ? "Optimizing resume content..."
                          : "Finalizing your tailored resume..."}
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              <p className="text-sm text-muted-foreground">
                This may take a minute. We're carefully analyzing the job description and your resume to create the best
                match.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* ATS Score Display */}
          {atsScore !== null && !isCalculatingAtsScore && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-primary uppercase tracking-wide">
                      Updated ATS Score
                    </p>
                    <p className="text-3xl md:text-4xl font-bold">
                      Your ATS Score:{" "}
                      <span
                        className={
                          atsScore >= 90
                            ? "text-green-600 dark:text-green-400"
                            : atsScore >= 80
                              ? "text-green-600 dark:text-green-400"
                              : atsScore >= 70
                                ? "text-yellow-600 dark:text-yellow-400"
                                : "text-red-600 dark:text-red-400"
                        }
                      >
                        {atsScore}%
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      This is your ATS score after optimizing your resume for the job description.
                    </p>
                  </div>
                  
                  {/* Further Optimize Section - Show when score < 90% */}
                  {atsScore < 90 && atsSuggestions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-primary/20">
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="h-5 w-5 text-primary" />
                          <p className="text-sm font-semibold text-primary">
                            Improve Your Score to 90%+
                          </p>
                        </div>
                        <div className="bg-background/50 rounded-lg p-4 space-y-3">
                          <p className="text-sm font-medium text-center">
                            Suggested Improvements:
                          </p>
                          <ul className="space-y-2 text-left">
                            {atsSuggestions.map((suggestion, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                                <span>{suggestion}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <Button 
                          onClick={handleReOptimize} 
                          disabled={isReOptimizing}
                          className="w-full"
                          size="lg"
                        >
                          {isReOptimizing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Optimizing...
                            </>
                          ) : (
                            <>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Further Optimize Resume
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          We'll apply these suggestions to improve your ATS score.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Success message when score >= 90% */}
                  {atsScore >= 90 && (
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <p className="text-sm font-medium">
                          Excellent! Your resume is well-optimized for this job.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {isCalculatingAtsScore && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">Calculating updated ATS score...</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col gap-4">
            {generatedResume?.isBinary ? (
              <Card>
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Your Resume is Ready!</h3>
                    <p className="text-muted-foreground">
                      Your tailored resume has been generated as a PDF or DOCX file. 
                      Please use the download buttons below to view it.
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button onClick={() => handleDownload("pdf")}>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      <Button onClick={() => handleDownload("docx")}>
                        <Download className="mr-2 h-4 w-4" />
                        Download DOCX
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : generatedResume?.content ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Resume template:</span>
                  <div className="flex flex-wrap gap-2">
                    {RESUME_TEMPLATES.map((t) => (
                      <Button
                        key={t.id}
                        variant={selectedTemplate === t.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTemplate(t.id)}
                      >
                        {t.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <ResumePreview
                  content={generatedResume.content}
                  isHumanized={isHumanized}
                  template={selectedTemplate}
                />
              </>
            ) : null}

            {!isHumanized && generatedResume?.isBinary ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Humanize Your Resume
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Make your AI-generated resume sound more natural and personalized to reduce the likelihood of it
                        being detected as AI-generated.
                      </p>
                    </div>

                    {isHumanizing ? (
                      <div className="w-full md:w-48">
                        <div className="flex justify-between text-sm mb-2">
                          <span>Humanizing...</span>
                          <span>{humanizeProgress}%</span>
                        </div>
                        <Progress value={humanizeProgress} className="h-2" />
                      </div>
                    ) : (
                      <Button onClick={handleHumanize} className="w-full md:w-auto" size="lg">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Humanize Resume
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : !generatedResume?.isBinary ? (
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-primary">
                        <Sparkles className="h-5 w-5" />
                        Resume Humanized
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your resume has been refined to sound more natural and personalized. It now has a more human
                        touch while maintaining professional quality.
                      </p>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full md:w-auto">
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Humanize Again
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Humanize Your Resume</DialogTitle>
                          <DialogDescription>
                            Make your resume sound more natural and personalized for better results.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col space-y-4 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="rounded-full bg-primary/10 p-2">
                              <Sparkles className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">One-time payment of ₹50</p>
                              <p className="text-sm text-muted-foreground">
                                Get more interviews with naturally-worded, personalized resumes that stand out to
                                recruiters.
                              </p>
                            </div>
                          </div>
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                          <DialogClose asChild>
                            <Button variant="outline" className="sm:w-auto w-full">
                              Cancel
                            </Button>
                          </DialogClose>
                          <Link href="/payment" passHref className="sm:w-auto w-full">
                            <Button className="w-full">Pay ₹50 to Humanize</Button>
                          </Link>
                          {/* For demo purposes, allow humanizing anyway */}
                          <Button variant="secondary" onClick={startHumanizing} className="sm:w-auto w-full">
                            Try It Once
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {isGeneratingQuestions && (
              <Card className="mt-6">
                <CardContent className="p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generating interview questions...</span>
                    </div>
                    <Progress value={undefined} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {interviewQuestions && !isGeneratingQuestions && (
              <div className="mt-6">
                <InterviewQuestions content={interviewQuestions} />
              </div>
            )}
          </div>

          {!generatedResume?.isBinary && (
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => handleDownload("docx")}>
                <Download className="mr-2 h-4 w-4" />
                Download DOCX
              </Button>
              <Button onClick={() => handleDownload("pdf")}>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </>
      )}

      {/* Humanize Dialog */}
      <Dialog open={showPricingDialog} onOpenChange={setShowPricingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Humanize Your Resume</DialogTitle>
            <DialogDescription>
              Make your resume sound more natural and personalized for better results.
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Email */}
          {humanizeStep === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="your@email.com"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  We'll send your receipt and humanized resume to this email address.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </DialogClose>
                <Button type="submit">Continue to Payment</Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 2: Payment */}
          {humanizeStep === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payment Method</label>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={paymentMethod === 'card' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setPaymentMethod('card')}
                  >
                    Credit Card
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === 'upi' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setPaymentMethod('upi')}
                  >
                    UPI
                  </Button>
                </div>
              </div>

              {paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="cardNumber" className="text-sm font-medium">
                      Card Number
                    </label>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="cardExpiry" className="text-sm font-medium">
                        Expiry Date
                      </label>
                      <input
                        id="cardExpiry"
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="cardCvv" className="text-sm font-medium">
                        CVV
                      </label>
                      <input
                        id="cardCvv"
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="123"
                        required
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="upiId" className="text-sm font-medium">
                    UPI ID
                  </label>
                  <input
                    id="upiId"
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="username@upi"
                    required
                  />
                </div>
              )}

              <div className="flex items-center space-x-4 mt-4">
                <div className="rounded-full bg-primary/10 p-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">One-time payment of ₹50</p>
                  <p className="text-sm text-muted-foreground">
                    Get more interviews with naturally-worded, personalized resumes that stand out to
                    recruiters.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setHumanizeStep('email')}>
                  Back
                </Button>
                <Button type="submit">Pay ₹50</Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 3: Confirmation */}
          {humanizeStep === 'confirmation' && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium">Payment Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your receipt has been sent to {email}
                </p>
              </div>

              <div className="bg-muted p-4 rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Receipt Number:</span>
                  <span className="font-medium">{paymentReceipt}</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Amount:</span>
                  <span className="font-medium">₹50</span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span>Date:</span>
                  <span className="font-medium">{new Date().toLocaleDateString()}</span>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => {
                  setShowPricingDialog(false)
                  startHumanizing()
                }}>
                  Start Humanizing
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

