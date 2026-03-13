"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface PaymentStatusProps {
  status: "pending" | "processing" | "success" | "failed"
  onStatusChange?: (status: "pending" | "processing" | "success" | "failed") => void
}

export function PaymentStatus({ status, onStatusChange }: PaymentStatusProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (status === "processing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            onStatusChange?.("success")
            return 100
          }
          return prev + 5
        })
      }, 200)

      return () => clearInterval(interval)
    }
  }, [status, onStatusChange])

  return (
    <div className="space-y-4">
      {status === "pending" && (
        <div className="flex items-center space-x-2 text-amber-500">
          <Clock className="h-5 w-5" />
          <span className="font-medium">Waiting for payment...</span>
        </div>
      )}

      {status === "processing" && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-blue-500">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span className="font-medium">Processing payment...</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground">Please do not close this window while we verify your payment.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span className="font-medium">Payment successful!</span>
        </div>
      )}

      {status === "failed" && (
        <div className="flex items-center space-x-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span className="font-medium">Payment failed. Please try again.</span>
        </div>
      )}
    </div>
  )
}

