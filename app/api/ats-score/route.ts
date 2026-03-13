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
        { status: 500 },
      )
    }

    const { jobDescription, resume } = (await req.json()) as {
      jobDescription?: string
      resume?: string
    }

    if (!jobDescription || !resume) {
      return NextResponse.json(
        { error: "Both jobDescription and resume are required." },
        { status: 400 },
      )
    }

    const prompt = `You are an expert Applicant Tracking System (ATS) scoring assistant. Analyze the resume against the job description and calculate a comprehensive ATS match score.

SCORING CRITERIA (Total: 100 points):

1. KEYWORD & SKILL MATCHING (30 points):
   - Extract ALL technical skills, tools, technologies, frameworks, and programming languages mentioned in the job description
   - Check how many of these keywords appear in the resume (exact matches or close variations)
   - Score: (Number of matched keywords / Total keywords in JD) × 30
   - Give partial credit for related/similar terms (e.g., "React" matches "React.js")
   - Check if skills appear in multiple sections (Skills section, Experience, Projects, Summary)

2. JOB TITLE & ROLE ALIGNMENT (15 points):
   - Does the resume mention the exact job title or very similar role titles?
   - Does the Professional Summary indicate experience in this role/field?
   - Score: 15 if exact match, 10 if similar role, 5 if related field, 0 if no match

3. EXPERIENCE RELEVANCE (25 points):
   - Do work experience bullet points demonstrate the key responsibilities mentioned in the job description?
   - Are the technologies, tools, and methodologies from the JD reflected in the experience section?
   - Does the candidate's experience level match the requirements (junior/mid/senior)?
   - Score based on how well experience aligns with JD requirements (0-25)

4. EDUCATION & QUALIFICATIONS (10 points):
   - Does the education match or exceed the requirements in the JD?
   - Are any required certifications, degrees, or qualifications present?
   - Score: 10 if exceeds requirements, 7 if matches, 3 if partially matches, 0 if doesn't match

5. PROJECTS & PORTFOLIO (15 points):
   - Do projects use technologies/tools mentioned in the job description?
   - Do projects demonstrate skills relevant to the role?
   - Are projects aligned with the type of work described in the JD?
   - Score based on relevance and technology alignment (0-15)

6. OVERALL FIT & PRESENTATION (5 points):
   - Is the resume well-structured and ATS-friendly?
   - Does the Professional Summary effectively communicate fit for the role?
   - Are achievements and responsibilities clearly articulated?
   - Score: 5 if excellent, 3 if good, 1 if acceptable, 0 if poor

CALCULATION INSTRUCTIONS:
- Analyze the job description thoroughly to extract ALL requirements, keywords, and expectations
- Check the resume against EACH criterion above
- Calculate points for each section
- Sum all points to get the final score (0-100)
- Be generous with partial credit - if a keyword appears in a related form, give credit
- If the resume demonstrates transferable skills even if exact keywords don't match, give partial credit
- Consider context: if "Python" is in JD and resume has "Python 3.8", that's a match
- If "React" is in JD and resume has "React.js" or "ReactJS", that's a match
- If "AWS" is in JD and resume has "Amazon Web Services", that's a match
- If "JavaScript" is in JD and resume has "JS" or "ES6", give partial credit
- If "Machine Learning" is in JD and resume has "ML" or "Deep Learning", give credit
- If methodologies match (e.g., "Agile" in JD and "Scrum" in resume), give partial credit
- If responsibilities align even with different wording, give credit

IMPORTANT SCORING GUIDELINES:
- A score of 85-100 means excellent match - most keywords, skills, and requirements are present
- A score of 70-84 means good match - many keywords and requirements are present
- A score of 50-69 means moderate match - some keywords and requirements are present
- A score below 50 means poor match - few keywords and requirements are present
- Be fair and accurate - don't inflate or deflate scores
- If the resume is well-tailored and matches most requirements, score should be 80+

Job Description:
${jobDescription}

Resume:
${resume}

STEP-BY-STEP ANALYSIS:
1. Extract all keywords, skills, technologies from the job description
2. Check how many appear in the resume (exact or related matches)
3. Evaluate job title/role alignment
4. Assess experience relevance to JD requirements
5. Check education/qualifications match
6. Evaluate projects relevance
7. Assess overall presentation and fit
8. Calculate total score (0-100)
9. Identify 2-3 specific areas where the resume can be improved to increase the ATS score

Now analyze the resume against the job description using the scoring criteria above. 

CRITICAL: Return your response in the following JSON format:
{
  "score": <integer from 0 to 100>,
  "suggestions": [
    "<specific improvement suggestion 1>",
    "<specific improvement suggestion 2>",
    "<specific improvement suggestion 3>"
  ]
}

The suggestions should be:
- Specific and actionable (e.g., "Add React.js to your Skills section" not "Improve skills")
- Focused on the most impactful improvements that would increase the ATS score
- Based on gaps you identified between the job description and resume
- Maximum 2-3 suggestions (prioritize the most important ones)

Example response:
{
  "score": 72,
  "suggestions": [
    "Add 'Docker' and 'Kubernetes' to your Skills section as these are mentioned in the job description",
    "Update your Professional Summary to include the exact job title 'Senior Software Engineer'",
    "Enhance your work experience bullets to mention 'microservices architecture' which is a key requirement"
  ]
}`

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
                 'Failed to get ATS score from model.' 
        },
        { status: 502 }
      );
    }

    const rawContent = generatedText.trim();

    // Try to parse as JSON first
    let score: number
    let suggestions: string[] = []
    
    try {
      // Extract JSON from the response (handle cases where there might be extra text)
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        score = parsed.score
        suggestions = parsed.suggestions || []
      } else {
        // Fallback: try to extract just the number
        const match = rawContent.match(/(\d{1,3})/)
        if (!match) {
          throw new Error("Could not parse response")
        }
        score = Number.parseInt(match[1], 10)
      }
    } catch (parseError) {
      // Fallback: try to extract just a number between 0 and 100
      const match = rawContent.match(/(\d{1,3})/)
      if (!match) {
        return NextResponse.json(
          { error: "Could not parse ATS score from model response." },
          { status: 500 },
        )
      }
      score = Number.parseInt(match[1], 10)
    }

    if (Number.isNaN(score)) {
      return NextResponse.json(
        { error: "Model returned an invalid score." },
        { status: 500 },
      )
    }

    // Clamp to [0, 100] just in case
    if (score < 0) score = 0
    if (score > 100) score = 100

    // Ensure suggestions is an array with 2-3 items
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      // Generate default suggestions if none provided
      suggestions = [
        "Add more keywords from the job description to your Skills section",
        "Update your Professional Summary to better align with the job requirements",
        "Enhance your work experience bullets to highlight relevant responsibilities"
      ]
    }
    
    // Limit to 3 suggestions max
    if (suggestions.length > 3) {
      suggestions = suggestions.slice(0, 3)
    }

    return NextResponse.json({ score, suggestions })
  } catch (error: any) {
    console.error("Unexpected ATS score handler error:", error)
    return NextResponse.json(
      { error: error.message || "Unexpected error while calculating ATS score." },
      { status: 500 },
    )
  }
}


