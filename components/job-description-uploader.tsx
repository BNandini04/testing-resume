"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { FileUploader } from "@/components/file-uploader"
import { FileText } from "lucide-react"
import useStore from "@/lib/store"

export function JobDescriptionUploader() {
  const jobDescriptionFile = useStore((state) => state.jobDescription.file)
  const setJobDescriptionFile = useStore((state) => state.setJobDescriptionFile)

  const [localFile, setLocalFile] = useState<File | null>(null)

  const handleJobDescriptionUpload = (file: File) => {
    setLocalFile(file)
    setJobDescriptionFile(file)
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <FileUploader
          onFileUpload={handleJobDescriptionUpload}
          acceptedFileTypes=".pdf,.docx"
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          label="Upload Job Description Document"
          description="Supports PDF, DOCX"
        />
        {(localFile || jobDescriptionFile) && (
          <div className="text-sm text-green-600 dark:text-green-400">
            Uploaded: {localFile?.name || jobDescriptionFile?.name}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

