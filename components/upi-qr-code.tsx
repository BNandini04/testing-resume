"use client"

import { useState, useEffect } from "react"
import { QrCode, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UpiQrCodeProps {
  amount: number
  reference: string
  onRefresh: () => void
}

export function UpiQrCode({ amount, reference, onRefresh }: UpiQrCodeProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Simulate QR code loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="border-2 border-dashed border-muted-foreground/20 p-4 rounded-lg">
        <div className="bg-card p-4 rounded">
          {isLoading ? (
            <div className="aspect-square w-48 h-48 flex items-center justify-center bg-muted/20 animate-pulse">
              <QrCode className="h-12 w-12 text-muted-foreground/50" />
            </div>
          ) : (
            <div className="aspect-square w-48 h-48 bg-card relative">
              {/* This would be a real QR code in production */}
              <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 gap-1">
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} className={`bg-foreground ${Math.random() > 0.6 ? "opacity-100" : "opacity-0"}`} />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-card p-2 rounded-lg">
                  <QrCode className="h-8 w-8 text-primary" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm font-medium">
          Amount: <span className="font-bold">₹{amount}</span>
        </p>
        <p className="text-sm text-muted-foreground">Reference: {reference}</p>
        <p className="text-xs text-muted-foreground">Scan this QR code with any UPI app to make payment</p>
      </div>

      <Button variant="outline" size="sm" onClick={onRefresh}>
        <RefreshCw className="mr-2 h-3 w-3" />
        Refresh QR Code
      </Button>
    </div>
  )
}

