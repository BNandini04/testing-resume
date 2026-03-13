"use client"

import { useState, useCallback, type ReactNode } from "react"
import { useDropzone } from "react-dropzone"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

interface FileUploaderProps {
  onFileUpload: (file: File) => void
  acceptedFileTypes: string
  icon?: ReactNode
  label: string
  description: string
}

export function FileUploader({ onFileUpload, acceptedFileTypes, icon, label, description }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)

  // Update the onDrop callback to handle different file types
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0]
        onFileUpload(file)

        // You could add file type detection here if needed
        // const fileType = file.type;
        // console.log(`Uploaded file type: ${fileType}`);
      }
    },
    [onFileUpload],
  )

  // Update the accept property to properly handle the file types
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.split(",").reduce(
      (acc, type) => {
        acc[type.trim()] = []
        return acc
      },
      {} as Record<string, string[]>,
    ),
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        {icon || <Upload className="h-8 w-8 text-muted-foreground" />}
        <div className="space-y-1">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="max-w-xs text-xs text-muted-foreground">
          <p>Drag & drop or click to browse</p>
        </div>
      </div>
    </div>
  )
}

