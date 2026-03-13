import { NextRequest, NextResponse } from "next/server"
import axios from 'axios';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server API key is not configured." },
        { status: 500 }
      );
    }

    const { tailoredResume, originalResume, jobDescription } = await req.json();

    if (!tailoredResume || !originalResume || !jobDescription) {
      return NextResponse.json(
        { error: "tailoredResume, originalResume, and jobDescription are required." },
        { status: 400 }
      );
    }

    const prompt = `You are an expert interview preparation coach. Based on the tailored resume, original resume, and job description provided, generate a comprehensive list of relevant interview questions along with well-structured sample answers.

REQUIREMENTS:
1. Generate role-specific technical and HR interview questions
2. Questions must be directly related to the candidate's skills, projects, experience, and job role from the tailored resume
3. Provide clear, professional, and realistic sample answers (human-like, not robotic)
4. Ensure answers are concise, practical, and interview-ready (2-3 sentences per answer)
5. Do NOT include generic or irrelevant questions
6. Focus on questions that interviewers would actually ask based on the candidate's background and the job requirements

OUTPUT FORMAT:
- Use the exact section header: "INTERVIEW PREPARATION – EXPECTED QUESTIONS & ANSWERS"
- Format each question as: "Q: [Question text]"
- Format each answer as: "A: [Answer text]"
- Separate each Q&A pair with a blank line
- Group questions logically (Technical questions first, then HR/Behavioral questions)
- Generate 8-12 relevant questions total

GUIDELINES FOR QUESTIONS:
- Technical questions should focus on:
  * Skills and technologies mentioned in the resume
  * Projects the candidate has worked on
  * Technical challenges and problem-solving
  * Tools and frameworks relevant to the job role
  
- HR/Behavioral questions should focus on:
  * Experience and achievements from the resume
  * Teamwork and collaboration examples
  * Challenges faced and how they were overcome
  * Why the candidate is interested in this role/company
  * Career goals and aspirations

GUIDELINES FOR ANSWERS:
- Answers should be based on the candidate's actual experience from the resume
- Make answers sound natural and conversational, not scripted
- Include specific examples from projects or work experience
- Keep answers concise but informative (2-3 sentences)
- Show enthusiasm and confidence
- Connect answers back to the job requirements when relevant

TAILORED RESUME:
${tailoredResume}

ORIGINAL RESUME (for reference):
${originalResume}

JOB DESCRIPTION:
${jobDescription}

Now generate the interview preparation section with relevant questions and answers.`;

    // Try to generate using Gemini API
    let generatedText = '';
    let availableModels: string[] = [];
    
    try {
      const listResponse = await axios.get(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
      );
      if (listResponse.data?.models) {
        availableModels = listResponse.data.models
          .filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
          .map((m: any) => m.name.replace('models/', ''));
      }
    } catch (e) {
      // Continue with default models
    }
    
    const modelsToTry = availableModels.length > 0 
      ? availableModels 
      : [
          'gemini-1.5-flash',
          'gemini-1.5-pro',
          'gemini-pro',
          'models/gemini-1.5-flash',
          'models/gemini-1.5-pro'
        ];
    
    let lastError: any = null;
    
    for (const modelName of modelsToTry) {
      try {
        const cleanModelName = modelName.replace('models/', '');
        
        try {
          const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/${cleanModelName}:generateContent?key=${GEMINI_API_KEY}`,
            {
              contents: [{
                parts: [{
                  text: prompt
                }]
              }]
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );
          generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (generatedText) {
            break;
          }
        } catch (v1betaError: any) {
          try {
            const response = await axios.post(
              `https://generativelanguage.googleapis.com/v1/models/${cleanModelName}:generateContent?key=${GEMINI_API_KEY}`,
              {
                contents: [{
                  parts: [{
                    text: prompt
                  }]
                }]
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            );
            generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (generatedText) {
              break;
            }
          } catch (v1Error: any) {
            lastError = v1Error;
            continue;
          }
        }
      } catch (error: any) {
        lastError = error;
        continue;
      }
    }
    
    if (!generatedText) {
      return NextResponse.json(
        { 
          error: lastError?.response?.data?.error?.message || 
                 lastError?.message || 
                 'Failed to generate interview questions. Please try again.' 
        },
        { status: 500 }
      );
    }

    // Ensure the section header is present
    let finalText = generatedText.trim();
    if (!finalText.toUpperCase().includes('INTERVIEW PREPARATION')) {
      finalText = `INTERVIEW PREPARATION – EXPECTED QUESTIONS & ANSWERS\n\n${finalText}`;
    }

    return NextResponse.json({ content: finalText });
  } catch (error: any) {
    console.error('Error generating interview questions:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating interview questions. Please try again.' },
      { status: 500 }
    );
  }
}

