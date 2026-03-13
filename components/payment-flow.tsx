"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckCircle2, CreditCard, Mail, Lock, ArrowRight, Sparkles, QrCode, Smartphone } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { UpiQrCode } from "@/components/upi-qr-code"
import { PaymentStatus } from "@/components/payment-status"
import { EmailConfirmation } from "@/components/email-confirmation"
import { SuccessIllustration } from "@/components/illustrations/success-illustration"

// Email schema
const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
})

// Payment schema
const paymentSchema = z.object({
  cardName: z.string().min(2, { message: "Name is required" }).optional(),
  cardNumber: z.string().min(16, { message: "Please enter a valid card number" }).optional(),
  expiryDate: z.string().min(5, { message: "Please enter a valid expiry date" }).optional(),
  cvv: z.string().min(3, { message: "Please enter a valid CVV" }).optional(),
  upiId: z.string().optional(),
  paymentMethod: z.enum(["credit", "paypal", "upi"], {
    required_error: "Please select a payment method",
  }),
})

type EmailFormValues = z.infer<typeof emailSchema>
type PaymentFormValues = z.infer<typeof paymentSchema>

export function PaymentFlow() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "payment" | "processing" | "success">("email")
  const [email, setEmail] = useState("")
  const [progress, setProgress] = useState(0)
  const [upiMethod, setUpiMethod] = useState<"manual" | "qrcode">("manual")
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false)
  const [upiPaymentStatus, setUpiPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [upiReference] = useState(`RT-${Math.floor(100000 + Math.random() * 900000)}`)
  // Add state for transaction details
  const [transactionId] = useState(`TXN-${Math.floor(100000 + Math.random() * 900000)}`)
  const [transactionDate] = useState(
    new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  )

  // Email form
  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  // Payment form
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      upiId: "",
      paymentMethod: "credit",
    },
  })

  // Handle email submission
  function onEmailSubmit(data: EmailFormValues) {
    setEmail(data.email)
    setStep("payment")
  }

  // Handle payment submission
  function onPaymentSubmit(data: PaymentFormValues) {
    setStep("processing")

    // Simulate payment processing
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setStep("success")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  // Handle completion
  function handleComplete() {
    // In a real app, you would redirect to the results page with the humanized resume
    router.push("/results?humanized=true")
  }

  function verifyUpiPayment() {
    setIsVerifyingUpi(true)

    // Simulate UPI payment verification
    setTimeout(() => {
      setIsVerifyingUpi(false)
      setStep("processing")

      // Simulate payment processing
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            setStep("success")
            return 100
          }
          return prev + 10
        })
      }, 300)
    }, 2000)
  }

  return (
    <div className="space-y-8">
      {/* Progress indicator */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "email" || step === "payment" || step === "processing" || step === "success" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <Mail className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium">Email</div>
        </div>
        <div className="h-px w-12 bg-muted" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "payment" || step === "processing" || step === "success" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium">Payment</div>
        </div>
        <div className="h-px w-12 bg-muted" />
        <div className="flex items-center gap-2">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "success" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium">Confirmation</div>
        </div>
      </div>

      {/* Email step */}
      {step === "email" && (
        <Card>
          <CardHeader>
            <CardTitle>Enter your email address</CardTitle>
            <CardDescription>
              We'll send your receipt and humanized resume access instructions to this email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...emailForm}>
              <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                <FormField
                  control={emailForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormDescription>We'll never share your email with anyone else.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Continue to Payment <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Payment step */}
      {step === "payment" && (
        <Card>
          <CardHeader>
            <CardTitle>Payment details</CardTitle>
            <CardDescription>Complete your purchase to humanize your resume.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium flex items-center">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" />
                    Resume Humanization
                  </h3>
                  <p className="text-sm text-muted-foreground">One-time purchase</p>
                </div>
                <div className="text-lg font-bold">₹50</div>
              </div>
            </div>

            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-6">
                <FormField
                  control={paymentForm.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="credit" id="credit" />
                            <Label htmlFor="credit" className="flex-1 cursor-pointer">
                              Credit Card
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="paypal" id="paypal" />
                            <Label htmlFor="paypal" className="flex-1 cursor-pointer">
                              PayPal
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md p-3">
                            <RadioGroupItem value="upi" id="upi" />
                            <Label htmlFor="upi" className="flex-1 cursor-pointer">
                              UPI Payment
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {paymentForm.watch("paymentMethod") === "credit" && (
                  <div className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on card</FormLabel>
                          <FormControl>
                            <Input placeholder="John Smith" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card number</FormLabel>
                          <FormControl>
                            <Input placeholder="1234 5678 9012 3456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={paymentForm.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={paymentForm.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}

                {paymentForm.watch("paymentMethod") === "upi" && (
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-4 mb-4">
                      <Button
                        type="button"
                        variant={upiMethod === "manual" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setUpiMethod("manual")}
                      >
                        <Smartphone className="mr-2 h-4 w-4" />
                        Enter UPI ID
                      </Button>
                      <Button
                        type="button"
                        variant={upiMethod === "qrcode" ? "default" : "outline"}
                        className="flex-1"
                        onClick={() => setUpiMethod("qrcode")}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Scan QR Code
                      </Button>
                    </div>

                    {upiMethod === "manual" ? (
                      <FormField
                        control={paymentForm.control}
                        name="upiId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UPI ID</FormLabel>
                            <FormControl>
                              <Input placeholder="yourname@upi" {...field} />
                            </FormControl>
                            <FormDescription>Enter your UPI ID (e.g., name@bank, phone@upi)</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="flex flex-col items-center space-y-4">
                        <UpiQrCode
                          amount={50}
                          reference={upiReference}
                          onRefresh={() => {
                            // In a real app, this would generate a new QR code
                            setUpiPaymentStatus("pending")
                          }}
                        />

                        <div className="w-full mt-4">
                          <PaymentStatus
                            status={upiPaymentStatus}
                            onStatusChange={(status) => {
                              setUpiPaymentStatus(status)
                              if (status === "success") {
                                // Wait a moment before proceeding to processing
                                setTimeout(() => {
                                  setStep("processing")

                                  // Simulate payment processing
                                  const interval = setInterval(() => {
                                    setProgress((prev) => {
                                      if (prev >= 100) {
                                        clearInterval(interval)
                                        setStep("success")
                                        return 100
                                      }
                                      return prev + 10
                                    })
                                  }, 300)
                                }, 1000)
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="pt-4">
                      <Button
                        type="button"
                        className="w-full"
                        onClick={verifyUpiPayment}
                        disabled={isVerifyingUpi || (upiMethod === "manual" && !paymentForm.watch("upiId"))}
                      >
                        {isVerifyingUpi ? (
                          <>
                            <span className="mr-2">Verifying Payment</span>
                            <svg
                              className="animate-spin h-4 w-4"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </>
                        ) : (
                          <>
                            <Lock className="mr-2 h-4 w-4" />
                            Pay ₹50
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Your payment information is secure and encrypted.
                      </p>
                    </div>
                  </div>
                )}

                {paymentForm.watch("paymentMethod") === "credit" && (
                  <div className="pt-4">
                    <Button type="submit" className="w-full">
                      <Lock className="mr-2 h-4 w-4" />
                      Pay ₹50
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Your payment information is encrypted and secure.
                    </p>
                  </div>
                )}

                {paymentForm.watch("paymentMethod") === "paypal" && (
                  <div className="pt-4">
                    <Button
                      type="button"
                      className="w-full bg-[#0070ba] hover:bg-[#005ea6]"
                      onClick={() => {
                        // Simulate PayPal redirect
                        setStep("processing")

                        // Simulate payment processing
                        const interval = setInterval(() => {
                          setProgress((prev) => {
                            if (prev >= 100) {
                              clearInterval(interval)
                              setStep("success")
                              return 100
                            }
                            return prev + 10
                          })
                        }, 300)
                      }}
                    >
                      <span className="mr-2">Pay with</span>
                      <span className="font-bold">PayPal</span>
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      You'll be redirected to PayPal to complete your payment.
                    </p>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Processing step */}
      {step === "processing" && (
        <Card>
          <CardHeader>
            <CardTitle>Processing your payment</CardTitle>
            <CardDescription>Please wait while we process your payment.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Progress value={progress} className="w-full mb-4" />
            <p className="text-sm text-muted-foreground">
              {progress < 50 ? "Verifying payment details..." : "Finalizing your purchase..."}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Success step */}
      {step === "success" && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex justify-center">
              <SuccessIllustration />
            </div>
            <CardTitle>Payment Successful!</CardTitle>
            <CardDescription>Your resume is now being humanized.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <p>
                We've sent a confirmation email to <span className="font-medium">{email}</span> with your receipt and
                instructions.
              </p>
              <div className="rounded-lg bg-muted p-4 text-left">
                <h4 className="font-medium mb-2">What happens next?</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <span>Your resume is being humanized by our AI</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <span>You'll be redirected to view and download your humanized resume</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <span>A receipt has been automatically sent to your email</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                    <span>You can access your humanized resume anytime from the email we sent you</span>
                  </li>
                </ul>
              </div>
            </div>

            <EmailConfirmation email={email} transactionId={transactionId} amount={50} date={transactionDate} />
          </CardContent>
          <CardFooter>
            <Button onClick={handleComplete} className="w-full">
              View Your Humanized Resume
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

