"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface InterviewQuestionsProps {
  content: string
}

export function InterviewQuestions({ content }: InterviewQuestionsProps) {
  if (!content) {
    return null
  }

  // Parse the content to extract questions and answers
  const parseContent = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)
    const items: Array<{ question: string; answer: string }> = []
    
    let currentQuestion = ''
    let currentAnswer = ''
    let inAnswer = false
    
    for (const line of lines) {
      // Skip the section header
      if (line.toUpperCase().includes('INTERVIEW PREPARATION')) {
        continue
      }
      
      // Check if it's a question
      if (line.startsWith('Q:') || line.startsWith('Q.')) {
        // Save previous Q&A if exists
        if (currentQuestion && currentAnswer) {
          items.push({ question: currentQuestion, answer: currentAnswer })
        }
        currentQuestion = line.replace(/^Q[:.]\s*/i, '').trim()
        currentAnswer = ''
        inAnswer = true
      }
      // Check if it's an answer
      else if (line.startsWith('A:') || line.startsWith('A.')) {
        currentAnswer = line.replace(/^A[:.]\s*/i, '').trim()
        inAnswer = true
      }
      // Continue building answer if we're in answer mode
      else if (inAnswer && currentAnswer) {
        currentAnswer += ' ' + line
      }
      // If we have a question but no answer yet, this might be continuation of question
      else if (currentQuestion && !currentAnswer) {
        currentQuestion += ' ' + line
      }
    }
    
    // Add the last Q&A pair
    if (currentQuestion && currentAnswer) {
      items.push({ question: currentQuestion, answer: currentAnswer })
    }
    
    return items
  }

  const qaItems = parseContent(content)

  // If parsing didn't work well, fallback to simple display
  if (qaItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Interview Preparation – Expected Questions & Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm">{content}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interview Preparation – Expected Questions & Answers</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {qaItems.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="font-semibold text-base text-foreground">
              Q{index + 1}: {item.question}
            </div>
            <div className="text-sm text-muted-foreground pl-4 border-l-2 border-primary/20">
              <span className="font-medium">A: </span>
              {item.answer}
            </div>
            {index < qaItems.length - 1 && <Separator className="my-4" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

