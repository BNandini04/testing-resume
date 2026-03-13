"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { FileUploader } from "@/components/file-uploader"
import { Progress } from "@/components/ui/progress"
import { ResumePreview } from "@/components/resume-preview"
import { InterviewQuestions } from "@/components/interview-questions"
import { Download, FileText, Image } from "lucide-react"
import { generateTailoredResume, generateInterviewQuestions, extractPlainTextFromFile } from "@/lib/api"
import { generatePDF, generateDOCX } from "@/lib/file-generator"

export default function ResumeBuilder() {
  const [jobDescription, setJobDescription] = useState("")
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescriptionFile, setJobDescriptionFile] = useState<File | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedResume, setGeneratedResume] = useState<{
    content: string;
    downloadUrl?: string;
  } | null>(null)
  const [interviewQuestions, setInterviewQuestions] = useState<string | null>(null)
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [originalResumeText, setOriginalResumeText] = useState<string>("")

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value)
  }

  const handleResumeUpload = (file: File) => {
    setResumeFile(file)
  }

  const handleJobDescriptionUpload = (file: File) => {
    setJobDescriptionFile(file)
  }

  const handleGenerate = async () => {
    // Validate inputs
    if ((!jobDescription && !jobDescriptionFile) || !resumeFile) {
      alert("Please provide both a job description and your resume")
      return
    }

    setIsGenerating(true)
    setProgress(0)

    try {
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 500)

      // Extract original resume text for interview questions
      const originalResumeText = await extractPlainTextFromFile(resumeFile)
      setOriginalResumeText(originalResumeText)
      
      // Extract job description text
      let jobDescriptionText = jobDescription
      if (jobDescriptionFile && !jobDescriptionText) {
        jobDescriptionText = await extractPlainTextFromFile(jobDescriptionFile)
      }
      
      // Call the API to generate the tailored resume
      const result = await generateTailoredResume(resumeFile, jobDescriptionFile, jobDescription)
      
      // Clear the progress interval and set to 100%
      clearInterval(progressInterval)
      setProgress(100)
      
      // Set the generated resume content
      setGeneratedResume({
        content: result.content,
        downloadUrl: result.downloadUrl
      })
      
      // Generate interview questions after resume is generated
      setIsGeneratingQuestions(true)
      try {
        const questions = await generateInterviewQuestions(
          result.content,
          originalResumeText,
          jobDescriptionText || ""
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

  const handleDownload = async (format: "pdf" | "docx") => {
    if (!generatedResume?.content) {
      alert(`Resume content not available. Please try generating the resume again.`)
      return
    }
    
    try {
      const filename = `tailored-resume.${format}`
      if (format === "pdf") {
        await generatePDF(generatedResume.content, filename)
    } else {
        await generateDOCX(generatedResume.content, filename)
      }
    } catch (error) {
      console.error('Error generating file:', error)
      alert('An error occurred while generating the file. Please try again.')
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Create Your Tailored Resume</h2>
        <p className="text-muted-foreground">Upload your job description and resume to get started</p>
      </div>

      {!generatedResume ? (
        <div className="grid gap-8 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Job Description</h3>
              <Tabs defaultValue="text">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="text">Enter Text</TabsTrigger>
                  <TabsTrigger value="upload-image">Upload Image</TabsTrigger>
                  <TabsTrigger value="upload-doc">Upload Document</TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="space-y-4 pt-4">
                  <Textarea
                    placeholder="Paste the job description here..."
                    className="min-h-[200px]"
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                  />
                </TabsContent>
                <TabsContent value="upload-image" className="space-y-4 pt-4">
                  <FileUploader
                    onFileUpload={handleJobDescriptionUpload}
                    acceptedFileTypes="image/*"
                    icon={<Image className="h-8 w-8 text-muted-foreground" />}
                    label="Upload Job Description Image"
                    description="Supports PNG, JPG, JPEG"
                  />
                  {jobDescriptionFile && (
                    <div className="text-sm text-muted-foreground">Uploaded: {jobDescriptionFile.name}</div>
                  )}
                </TabsContent>
                <TabsContent value="upload-doc" className="space-y-4 pt-4">
                  <FileUploader
                    onFileUpload={handleJobDescriptionUpload}
                    acceptedFileTypes=".pdf,.docx"
                    icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                    label="Upload Job Description Document"
                    description="Supports PDF, DOCX"
                  />
                  {jobDescriptionFile && (
                    <div className="text-sm text-muted-foreground">Uploaded: {jobDescriptionFile.name}</div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="text-xl font-semibold">Your Resume</h3>
              <FileUploader
                onFileUpload={handleResumeUpload}
                acceptedFileTypes=".pdf,.docx"
                icon={<FileText className="h-8 w-8 text-muted-foreground" />}
                label="Upload Your Resume"
                description="Supports PDF, DOCX"
              />
              {resumeFile && <div className="text-sm text-muted-foreground">Uploaded: {resumeFile.name}</div>}
            </CardContent>
          </Card>

          <div className="md:col-span-2">
            <Button
              size="lg"
              className="w-full"
              onClick={handleGenerate}
              disabled={isGenerating || (!jobDescription && !jobDescriptionFile) || !resumeFile}
            >
              {isGenerating ? "Generating..." : "Generate Tailored Resume"}
            </Button>

            {isGenerating && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Analyzing job requirements...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Your Tailored Resume</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleDownload("docx")}>
                <Download className="mr-2 h-4 w-4" />
                DOCX
              </Button>
              <Button onClick={() => handleDownload("pdf")}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          <ResumePreview content={generatedResume?.content || ''} />

          {isGeneratingQuestions && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Generating interview questions...</span>
              </div>
              <Progress value={undefined} className="h-2" />
            </div>
          )}

          {interviewQuestions && !isGeneratingQuestions && (
            <InterviewQuestions content={interviewQuestions} />
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setGeneratedResume(null)
              setInterviewQuestions(null)
              setProgress(0)
              setIsGenerating(false)
              setIsGeneratingQuestions(false)
            }}
          >
            Start Over
          </Button>
        </div>
      )}
    </div>
  )
}

