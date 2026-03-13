"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { FileText } from "lucide-react"
import useStore from "@/lib/store"

export function ResumeUploader() {
  // Use selectors to prevent unnecessary re-renders
  const resumeFile = useStore((state) => state.resume.file)
  const setResumeFile = useStore((state) => state.setResumeFile)

  const [localFile, setLocalFile] = useState<File | null>(null)

  const handleResumeUpload = (file: File) => {
    setLocalFile(file)
    setResumeFile(file)
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <FileUploader
          onFileUpload={handleResumeUpload}
          acceptedFileTypes=".pdf,.docx"
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          label="Upload Your Resume"
          description="Supports PDF, DOCX"
        />
        {localFile || resumeFile ? (
          <div className="text-sm text-green-600 dark:text-green-400">
            Uploaded: {localFile?.name || resumeFile?.name}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground mt-4">
            <p className="font-medium">Tips for better results:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Make sure your resume is up-to-date</li>
              <li>Include all relevant work experience and skills</li>
              <li>Use a clean, well-formatted resume template</li>
              <li>Ensure text is extractable (not just an image)</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

