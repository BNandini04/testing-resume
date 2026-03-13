"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react"

export function PricingPlans() {
  return (
    <section className="w-full py-12 md:py-24">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-8">
          <div className="max-w-3xl text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Humanize Your Tailored Resume</h2>
            <p className="text-muted-foreground text-lg">
              Refine your AI-generated resume for a more natural, personalized result that stands out to recruiters.
            </p>
          </div>

          <Card className="w-full max-w-md border-primary/50 bg-primary/[0.03] relative">
            <div className="absolute -top-4 left-0 right-0 flex justify-center">
              <div className="bg-primary text-primary-foreground text-sm font-medium py-1 px-3 rounded-full">
                One-time Payment
              </div>
            </div>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Humanize Tailored Resume</CardTitle>
              <CardDescription>Make your resume sound more natural and personalized</CardDescription>
              <div className="mt-4 flex items-center justify-center">
                <span className="text-4xl font-bold">₹50</span>
                <span className="text-muted-foreground ml-2">one-time</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Refine AI-generated content to sound more natural</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Reduce the likelihood of being detected as AI-generated</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Add personal touches that connect with recruiters</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Improve phrasing and language for better readability</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>Download in PDF and DOCX formats</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link href="/payment" className="w-full">
                <Button className="w-full group" size="lg">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Pay ₹50 to Humanize
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center text-sm text-muted-foreground max-w-2xl">
            <p>
              Our AI humanization technology refines your resume to sound more natural while maintaining professional
              quality. This helps your resume pass both ATS systems and human review, increasing your chances of getting
              interviews.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

