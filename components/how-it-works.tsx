"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FileText, Upload, Download, Sparkles, ArrowRight } from "lucide-react"

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: Upload,
      title: "Upload Job Description",
      description: "Upload a job description in any format - text, image, PDF, or DOCX. Our AI will analyze the key requirements.",
    },
    {
      number: "02",
      icon: FileText,
      title: "Upload Your Resume",
      description: "Upload your existing resume in PDF or DOCX format. Our system will extract your skills and experience.",
    },
    {
      number: "03",
      icon: Sparkles,
      title: "AI Tailoring & Humanization",
      description: "Our AI refines the language to sound more natural and personalized, making your resume stand out.",
    },
    {
      number: "04",
      icon: Download,
      title: "Download Your Resume",
      description: "Get your tailored and humanized resume in PDF or DOCX format, ready to send to employers.",
    },
  ]

  return (
    <section id="how-it-works" className="w-full py-16 md:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-primary/5" />
      
      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              How It Works
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-lg">
              Our AI-powered platform makes it easy to create tailored resumes that match job requirements
            </p>
          </div>
        </div>

        {/* Steps Flow */}
        <div className="mx-auto max-w-7xl">
          <div className="relative">
            {/* Connection line for desktop */}
            <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-10 lg:gap-12 xl:gap-16">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={index} className="relative group">
                    {/* Step number badge */}
                    <div className="flex items-center justify-center mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 backdrop-blur-sm">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary/80 flex items-center justify-center text-xs font-bold text-primary-foreground">
                          {step.number}
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4 text-center px-2">
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>

                    {/* Arrow connector for mobile/tablet */}
                    {index < steps.length - 1 && (
                      <>
                        <div className="lg:hidden flex items-center justify-center my-10">
                          <ArrowRight className="h-6 w-6 text-primary/50 rotate-90" />
                        </div>
                        <div className="hidden lg:block absolute top-24 -right-6 xl:-right-8 z-10">
                          <ArrowRight className="h-6 w-6 text-primary/50" />
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="flex justify-center mt-16">
          <Link href="/upload/job-description" passHref>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
              Start Tailoring Your Resume
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

