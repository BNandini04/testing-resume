import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function PricingFAQ() {
  return (
    <section className="w-full py-12 md:py-24 bg-muted/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Frequently Asked Questions</h2>
            <p className="max-w-[700px] text-muted-foreground">
              Find answers to common questions about our pricing and plans.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl mt-12">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>What's the difference between AI-tailored and humanized resumes?</AccordionTrigger>
              <AccordionContent>
                AI-tailored resumes match your skills and experience to the job description automatically. Humanized
                resumes take this a step further by refining the language to sound more natural and personalized,
                reducing the likelihood of being detected as AI-generated and increasing your chances of getting past
                both ATS systems and human recruiters.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>Can I edit my resume after it's generated?</AccordionTrigger>
              <AccordionContent>
                Yes! All plans allow you to download your resume. The Premium and Unlimited plans provide DOCX format
                for easy editing in Microsoft Word or Google Docs. The Basic plan provides PDF format only, which has
                limited editing capabilities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How many resumes can I create with each plan?</AccordionTrigger>
              <AccordionContent>
                The Basic plan allows 1 AI-tailored resume per month. The Premium plan is pay-per-download, so you can
                create as many as you're willing to purchase. The Unlimited plan, as the name suggests, allows unlimited
                resume creation and humanization during your subscription period.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>Can I cancel my subscription at any time?</AccordionTrigger>
              <AccordionContent>
                Absolutely. You can cancel your subscription at any time. If you cancel, you'll still have access to the
                service until the end of your current billing period. We don't offer refunds for partial subscription
                periods.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>Is my data secure?</AccordionTrigger>
              <AccordionContent>
                Yes, we take data security very seriously. Your resume data and job descriptions are encrypted and
                stored securely. We never share your personal information with third parties without your explicit
                consent. You can review our privacy policy for more details.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
              <AccordionContent>
                We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, and Apple Pay.
                All payments are processed securely through our payment processor.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </section>
  )
}

