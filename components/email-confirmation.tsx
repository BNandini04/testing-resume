"use client"

import { useState } from "react"
import { CheckCircle2, Copy, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface EmailConfirmationProps {
  email: string
  transactionId: string
  amount: number
  date: string
}

export function EmailConfirmation({ email, transactionId, amount, date }: EmailConfirmationProps) {
  const [copied, setCopied] = useState(false)

  const copyTransactionId = () => {
    navigator.clipboard.writeText(transactionId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Payment Receipt</CardTitle>
          <Mail className="h-5 w-5 text-muted-foreground" />
        </div>
        <CardDescription>A copy of this receipt has been sent to your email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date:</span>
            <span>{date}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-medium">₹{amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Transaction ID:</span>
            <div className="flex items-center space-x-1">
              <span className="font-mono text-xs">{transactionId}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyTransactionId}>
                {copied ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="font-medium">Resume Humanization</p>
          <p className="text-muted-foreground">One-time purchase</p>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
        <p>If you have any questions about this receipt, please contact our support team.</p>
      </CardFooter>
    </Card>
  )
}

