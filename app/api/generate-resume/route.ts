import { NextRequest, NextResponse } from "next/server"
import axios from 'axios';
import mammoth from 'mammoth';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

// Helper function to convert File to ArrayBuffer (server-side)
async function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  return arrayBuffer;
}

// Helper function to convert File to text (server-side)
async function fileToText(file: File): Promise<string> {
  return await file.text();
}

// Helper function to extract text from file (DOCX and text files only)
// PDFs should be extracted client-side and sent as text
// PDFs should be extracted client-side and sent as text
async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();
    
    // PDFs should not be processed here - they should be extracted client-side
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      throw new Error('PDF files must be extracted client-side. Please extract text before sending to API.');
    }
    
    // For DOCX files, use mammoth to extract text
    if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
      try {
        const arrayBuffer = await fileToArrayBuffer(file);
        // Convert ArrayBuffer to Buffer for mammoth (Node.js environment)
        const buffer = Buffer.from(arrayBuffer);
        const result = await mammoth.extractRawText({ buffer });
        const extractedText = result.value;
        
        // Validate extraction
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text could be extracted from the DOCX file.');
        }
        
        return extractedText;
      } catch (e: any) {
        throw new Error(`Failed to parse DOCX file: ${e.message || 'Unknown error'}`);
      }
    }
    
    // For text files, read directly
    const text = await fileToText(file);
    return text;
  } catch (error: any) {
    if (error.message) {
      throw error;
    }
    throw new Error(`Failed to read file: ${file.name}. Please ensure it's a valid DOCX or text file.`);
  }
}

// Build header from original resume text - comprehensive extraction
function buildHeaderFromOriginal(resumeText: string): string {
  // Get all lines from original resume - look at more lines to catch all details
  const allLines = resumeText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  const lines = allLines.slice(0, 30); // look at top 30 lines to catch all personal details
  
  console.log('Extracting name from resume. Total non-empty lines:', lines.length);
  console.log('First 10 lines for name extraction:', lines.slice(0, 10));

  let name = '';
  let phone = '';
  let email = '';
  let location = '';
  let linkedin = '';
  let portfolio = '';

  const phoneRegex = /(\+?\d{1,3}[\s\-]?\d{1,4}[\s\-]?\d{6,})|(\d{10,})/;
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const linkedinRegex = /(linkedin\.com\/in\/[\w-]+|linkedin\.com\/profile\/[\w-]+|www\.linkedin\.com\/in\/[\w-]+)/i;
  const portfolioRegex = /(github\.com\/[\w-]+|portfolio|website|http[s]?:\/\/[^\s]+)/i;

  // Company name indicators to exclude
  const companyIndicators = /\b(engineers|technologies|solutions|corporation|corp|inc|llc|ltd|limited|company|systems|services|foundation|organization|institute|college|university|school|prinston|rubixe|magic)\b/i;
  const jobTitleIndicators = /\b(intern|developer|engineer|manager|executive|analyst|specialist|assistant|coordinator|director|lead|senior|junior|training|certification)\b/i;
  
  // First, try to find name in first few lines - prioritize lines with initials (B. Nandini, Jerin S)
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    if (!name) {
      // Highest priority: Initial. Lastname pattern (B. Nandini, Jerin S)
      const initialPatternMatch = line.match(/^([A-Z]\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)|^([A-Z][a-z]+\s+[A-Z])/);
      const hasInitialPattern = initialPatternMatch !== null;
      const isPureInitialPattern = /^([A-Z]\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)$|^([A-Z][a-z]+\s+[A-Z])$/.test(line);
      
      // Extract just the name part if pattern matches
      let extractedName = line;
      if (hasInitialPattern && initialPatternMatch) {
        extractedName = initialPatternMatch[0]; // Get the matched name part
      }
      
      // Check if the line (or extracted name) looks like a name
      const nameToCheck = hasInitialPattern ? extractedName : line;
      const looksLikeName = (hasInitialPattern || isPureInitialPattern) &&
          nameToCheck.length < 100 && 
          nameToCheck.length > 2 &&
          !line.toLowerCase().includes('phone') && 
          !line.toLowerCase().includes('email') &&
          !line.toLowerCase().includes('location') &&
          !line.toLowerCase().includes('linkedin') &&
          !line.toLowerCase().includes('portfolio') &&
          !line.toLowerCase().includes('github') &&
          !line.includes('@') &&
          !line.match(phoneRegex) &&
          !line.match(companyIndicators) &&
          !line.match(jobTitleIndicators) &&
          !line.toUpperCase().includes('SUMMARY') &&
          !line.toUpperCase().includes('EXPERIENCE') &&
          !line.toUpperCase().includes('EDUCATION') &&
          !line.toUpperCase().includes('SKILLS') &&
          !line.toUpperCase().includes('CERTIFICATIONS') &&
          !line.toUpperCase().includes('PROJECTS') &&
          !line.toLowerCase().includes('candidate');
      
      if (looksLikeName) {
        // If it's a pure initial pattern line, use the whole line; otherwise use extracted name
        name = isPureInitialPattern ? line : extractedName.trim();
        console.log('Found name (initial pattern):', name, 'from line:', line);
        break;
      }
    }
  }
  
  // If not found, look for full name patterns
  if (!name) {
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim();
      
      // Try to extract name pattern from the start of the line
      let extractedName = line;
      
      // Check for full name pattern at start: "John Doe" or "Jerin S"
      const fullNameMatch = line.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)|^([A-Z][a-z]+\s+[A-Z])/);
      const hasFullNamePattern = fullNameMatch !== null;
      
      // Check for initial middle pattern: "Firstname M. Lastname"
      const initialMiddleMatch = line.match(/^([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)/);
      const hasInitialMiddlePattern = initialMiddleMatch !== null;
      
      // Check for all caps name
      const hasAllCapsName = /^[A-Z][A-Z\s]+$/.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 5;
      
      // Extract name part if pattern found
      if (hasFullNamePattern && fullNameMatch) {
        extractedName = fullNameMatch[0];
      } else if (hasInitialMiddlePattern && initialMiddleMatch) {
        extractedName = initialMiddleMatch[1];
      }
      
      const nameToCheck = (hasFullNamePattern || hasInitialMiddlePattern) ? extractedName : line;
      
      const looksLikeName = (hasFullNamePattern || hasInitialMiddlePattern || hasAllCapsName) &&
          nameToCheck.length < 100 && 
          nameToCheck.length > 2 &&
          !line.toLowerCase().includes('phone') && 
          !line.toLowerCase().includes('email') &&
          !line.toLowerCase().includes('location') &&
          !line.toLowerCase().includes('linkedin') &&
          !line.toLowerCase().includes('portfolio') &&
          !line.toLowerCase().includes('github') &&
          !line.includes('@') &&
          !line.match(phoneRegex) &&
          !line.match(companyIndicators) &&
          !line.match(jobTitleIndicators) &&
          !line.toUpperCase().includes('SUMMARY') &&
          !line.toUpperCase().includes('EXPERIENCE') &&
          !line.toUpperCase().includes('EDUCATION') &&
          !line.toUpperCase().includes('SKILLS') &&
          !line.toUpperCase().includes('CERTIFICATIONS') &&
          !line.toUpperCase().includes('PROJECTS') &&
          !line.toLowerCase().includes('candidate');
      
      if (looksLikeName) {
        name = extractedName.trim();
        console.log('Found name (full name pattern):', name, 'from line:', line);
        break;
      }
    }
  }
  
  // Continue extracting other details
  for (const line of lines) {
    // Extract email (can be standalone or in "Email: ..." format)
    if (!email) {
      const emailMatch = line.match(emailRegex);
      if (emailMatch) {
        email = emailMatch[0];
      }
    }
    
    // Extract phone (can be standalone or in "Phone: ..." format)
    if (!phone) {
      // Try to find phone in "Phone: ..." format first
      if (/phone:?\s*/i.test(line)) {
        const phoneMatch = line.match(phoneRegex);
        if (phoneMatch) {
          phone = phoneMatch[0].trim();
        }
      } else {
        // Try standalone phone number
        const phoneMatch = line.match(phoneRegex);
        if (phoneMatch && phoneMatch[0].length >= 10) {
          phone = phoneMatch[0].trim();
        }
      }
    }
    
    // Extract location
    if (!location) {
      // Check for "Location: ..." format
      if (/location:?\s*/i.test(line)) {
        location = line.replace(/^location:?\s*/i, '').trim();
      } 
      // Check for city, state format or standalone city names (COIMBATORE, Bengaluru, etc.)
      else if ((/,/.test(line) && 
               /(india|bangalore|bengaluru|karnataka|mumbai|delhi|hyderabad|chennai|pune|kolkata|noida|gurgaon|city|state|andhra|tamil|kerala|maharashtra|gujarat|coimbatore)/i.test(line) && 
               line.length < 80 &&
               !line.includes('@') &&
               !line.match(phoneRegex)) ||
              (/^(COIMBATORE|Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Chennai|Pune|Kolkata|Noida|Gurgaon)/i.test(line) && 
               line.length < 50 && 
               !line.includes('@') &&
               !line.match(phoneRegex) &&
               !line.match(companyIndicators))) {
        let loc = line.replace(/^(City|State|Location|Address)[:\s]*/i, '').trim();
        if (/(COIMBATORE|Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Chennai|Pune|Kolkata|Noida|Gurgaon|Karnataka|Maharashtra|Tamil Nadu|Andhra Pradesh)/i.test(loc)) {
          location = loc;
        } else if (line.length < 50 && !line.includes('@') && !line.match(phoneRegex)) {
          location = line;
        }
      }
    }
    
    // Extract LinkedIn
    if (!linkedin) {
      const m = line.match(linkedinRegex);
      if (m) {
        linkedin = m[0];
        if (!linkedin.startsWith('http')) {
          linkedin = `https://${linkedin}`;
        }
      }
    }
    
    // Extract portfolio/github
    if (!portfolio) {
      const m = line.match(portfolioRegex);
      if (m) {
        portfolio = m[0];
        if (!portfolio.startsWith('http') && portfolio.includes('github.com')) {
          portfolio = `https://${portfolio}`;
        }
      }
    }
  }

  // Fallback for name - use first line if it doesn't look like contact info or section header
  if (!name && lines.length > 0) {
    const firstLine = lines[0];
    const isNotContactInfo = !firstLine.toLowerCase().includes('phone') &&
                             !firstLine.toLowerCase().includes('email') &&
                             !firstLine.toLowerCase().includes('location') &&
                             !firstLine.toLowerCase().includes('linkedin') &&
                             !firstLine.toLowerCase().includes('portfolio') &&
                             !firstLine.toLowerCase().includes('github');
    
    const isNotSectionHeader = !/^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(firstLine);
    
    if (isNotContactInfo &&
        isNotSectionHeader &&
        !firstLine.match(companyIndicators) && 
        !firstLine.match(jobTitleIndicators) &&
        firstLine.length < 100 &&
        firstLine.length > 1 &&
        !firstLine.includes('@') &&
        !firstLine.match(phoneRegex) &&
        !firstLine.toLowerCase().includes('candidate') &&
        !firstLine.match(/^\d+$/) && // Not just numbers
        !firstLine.match(/^[^a-zA-Z]+$/)) { // Not just special characters
      name = firstLine;
      console.log('Using first line as name (fallback):', name);
    }
  }
  
  // Last resort: if still no name, try to extract from first line even if it has contact info
  if (!name && lines.length > 0) {
    const firstLine = lines[0];
    // Try to extract name from the beginning of the line before contact info
    let namePart = firstLine;
    
    // Remove email
    namePart = namePart.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, '').trim();
    // Remove phone numbers
    namePart = namePart.replace(phoneRegex, '').trim();
    // Remove LinkedIn URLs
    namePart = namePart.replace(/linkedin\.com\/[^\s]+/i, '').trim();
    namePart = namePart.replace(/www\.linkedin\.com\/in\/[^\s]+/i, '').trim();
    // Remove www. or http URLs
    namePart = namePart.replace(/https?:\/\/[^\s]+/gi, '').trim();
    namePart = namePart.replace(/www\.[^\s]+/gi, '').trim();
    // Remove separators like | and extra spaces
    namePart = namePart.split(/[|•\-\–\—]/)[0].trim();
    // Remove common location words that might appear after name
    namePart = namePart.replace(/\b(COIMBATORE|BANGALORE|MUMBAI|DELHI|HYDERABAD|CHENNAI|PUNE|KOLKATA|NOIDA|GURGAON|KARNATAKA|MAHARASHTRA|TAMIL NADU|ANDHRA PRADESH|INDIA)\b/i, '').trim();
    // Take first 2-5 words (typical name length)
    const words = namePart.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 1 && words.length <= 5 && namePart.length > 2 && namePart.length < 100) {
      name = words.join(' ');
      console.log('Extracted name from first line with contact info:', name);
    }
  }

  // Only use default if absolutely nothing found
  if (!name) {
    name = 'Candidate Name';
    console.log('WARNING: Could not extract name from resume. Using default. First 5 lines:', lines.slice(0, 5));
  }

  // Debug logging
  console.log('Extracted details:', { name, phone, email, location, linkedin, portfolio });
  
  // Build header with all fields
  const headerLines = [
    name || 'Candidate Name',
    phone ? `Phone: ${phone}` : '',
    email ? `Email: ${email}` : '',
    location ? `Location: ${location}` : '',
    linkedin ? `LinkedIn: ${linkedin}` : '',
    portfolio ? `Portfolio/GitHub (optional): ${portfolio}` : '',
  ].filter(line => line.length > 0); // Remove empty lines

  const header = headerLines.join('\n');
  console.log('Final header:', header);
  return header;
}

// Ensure the generated resume has the header
function ensureHeaderAndTemplate(generated: string, originalResume: string): string {
  let cleaned = generated.trim();
  const header = buildHeaderFromOriginal(originalResume);
  const summaryIdx = cleaned.toUpperCase().indexOf('PROFESSIONAL SUMMARY');
  let rest = summaryIdx >= 0 ? cleaned.slice(summaryIdx) : cleaned;
  
  if (summaryIdx < 0) {
    const firstSectionMatch = rest.match(/^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|EDUCATION|EXPERIENCE)/im);
    if (firstSectionMatch) {
      const idx = rest.indexOf(firstSectionMatch[0]);
      rest = rest.slice(idx);
    }
  }
  
  return `${header}\n\n${rest}`;
}

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Server API key is not configured." },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const resumeFile = formData.get('resumeFile') as File | null;
    const resumeText = formData.get('resumeText') as string | null;
    const jobDescriptionFile = formData.get('jobDescriptionFile') as File | null;
    const jobDescriptionText = formData.get('jobDescriptionText') as string | null;

    // Get resume text - either from extracted text or extract from file
    let finalResumeText = '';
    if (resumeText) {
      // Use pre-extracted text (for PDFs extracted client-side)
      finalResumeText = resumeText;
    } else if (resumeFile) {
      // Extract from file (for DOCX or text files)
      finalResumeText = await extractTextFromFile(resumeFile);
    } else {
      return NextResponse.json(
        { error: "Resume file or resume text is required." },
        { status: 400 }
      );
    }
    
    // Extract job description text
    let jobDescription = '';
    if (jobDescriptionText) {
      jobDescription = jobDescriptionText;
    } else if (jobDescriptionFile) {
      jobDescription = await extractTextFromFile(jobDescriptionFile);
    }

    // Create prompt (same as in original function)
    const prompt = `You are an expert resume tailor specializing in ATS (Applicant Tracking System) optimized resumes. Your goal is to create a resume that COMPLETELY MATCHES the job description and will achieve an ATS score of 85 or higher.

CRITICAL SUCCESS CRITERIA:
- The resume MUST achieve an ATS match score of 85+ when compared to the job description
- EVERY section must be optimized to match the job description requirements
- Keywords, skills, technologies, and responsibilities from the job description MUST be naturally integrated throughout
- The resume should demonstrate a PERFECT alignment between candidate experience and job requirements

Follow these instructions carefully:

1. DEEP ANALYSIS OF THE JOB DESCRIPTION:
   - Extract ALL keywords, skills, tools, technologies, frameworks, methodologies mentioned
   - Identify ALL required qualifications, responsibilities, and expectations
   - Note specific industry terms, technical jargon, and role-specific language
   - List ALL hard skills (programming languages, tools, software) and soft skills (communication, leadership, etc.)
   - Identify key responsibilities and expected outcomes
   - Note any certifications, degrees, or special requirements mentioned

2. MAXIMIZE ATS SCORE (TARGET: 85+):
   - MANDATORY: Incorporate EVERY relevant keyword from the job description naturally throughout the resume
   - Use EXACT terminology from the job description (e.g., if JD says "React.js", use "React.js" not just "React")
   - Match skill names exactly as they appear in the job description
   - Include ALL relevant technologies, tools, and frameworks mentioned in the JD
   - Ensure skills section contains at least 80% of the technical skills mentioned in the JD
   - Every work experience bullet point should reference skills, tools, or responsibilities from the JD
   - Professional Summary must include 3-5 key skills/technologies from the JD
   - Projects must use technologies and address responsibilities mentioned in the JD
   - Avoid keyword stuffing - integrate keywords naturally in context
   - Ensure proper ATS-friendly formatting (no complex tables, standard section headers)
   
   CRITICAL: Include ALL matching elements, not just keywords:
   - Include methodologies mentioned in JD (e.g., "Agile", "Scrum", "DevOps", "CI/CD")
   - Include industry-specific terms and jargon from the JD
   - Include responsibilities and task types mentioned in the JD (e.g., "API development", "database design", "code reviews")
   - Include soft skills and competencies mentioned in the JD (e.g., "team collaboration", "problem-solving", "leadership")
   - Include domain knowledge areas mentioned in JD (e.g., "fintech", "healthcare", "e-commerce")
   - Include work styles mentioned in JD (e.g., "remote work", "cross-functional teams", "fast-paced environment")
   - Include outcome types mentioned in JD (e.g., "scalability", "performance optimization", "cost reduction")
   - Match the experience level mentioned in JD (e.g., "5+ years", "senior level", "entry-level")

3. PRESERVE ORIGINAL INFORMATION (DO NOT MODIFY):
   - PERSONAL DETAILS: Keep EXACTLY the same as in the original resume (name, phone, email, address, location, LinkedIn, portfolio/GitHub - do not modify any personal information).
   - EDUCATION SECTION: Keep EXACTLY the same as in the original resume (do not change degree name, college/university name, year of graduation, marks, GPA, or any education details).

4. TAILOR EACH SECTION FOR MAXIMUM MATCH:

   PROFESSIONAL SUMMARY:
   - MUST include the exact job title or role name from the job description
   - MUST incorporate 3-5 key technical skills/tools mentioned in the JD (use exact names)
   - MUST mention 2-3 key responsibilities or areas of expertise from the JD
   - Highlight experience that directly matches job requirements
   - Use industry-specific terminology from the job description
   - Keep it concise (3-4 sentences) but packed with relevant keywords
   - Example structure: "[Years] of experience as [EXACT JOB TITLE FROM JD] with expertise in [KEY SKILLS FROM JD]. Proven track record in [KEY RESPONSIBILITIES FROM JD]..."

   CORE SKILLS:
   - MUST include at least 80% of the technical skills/tools mentioned in the job description
   - Use EXACT skill names as they appear in the JD (e.g., "Python" not "python", "React.js" not "React")
   - Prioritize skills in the order of importance as mentioned in the JD
   - Include ALL relevant programming languages, frameworks, tools, and technologies from the JD
   - Add soft skills mentioned in the JD (e.g., "Agile", "Scrum", "Team Leadership")
   - List 8-12 key skills that directly match the job requirements
   - If JD mentions specific versions (e.g., "Python 3.8+"), include version if possible

   PROFESSIONAL EXPERIENCE:
   - EVERY bullet point MUST reference at least one skill, tool, technology, or responsibility from the job description
   - Use strong action verbs (e.g., Developed, Implemented, Managed, Optimized, Led) that match the JD tone
   - Include measurable results and quantifiable achievements where possible
   - Emphasize experiences that DIRECTLY align with the job description requirements
   - For each role, ensure at least 60% of bullet points match JD requirements
   - Use exact terminology from the JD (e.g., if JD says "microservices", use "microservices" not "services")
   - Highlight responsibilities that match the JD's "What you'll do" or "Responsibilities" section
   - De-emphasize or shorten irrelevant experiences (but don't remove them entirely)
   - If a work experience doesn't match, reframe it to highlight transferable skills mentioned in the JD

   PROJECTS:
   - CRITICAL FOR ATS SCORE: Projects section is crucial for matching job description
   - MANDATORY: Every project MUST use at least 3-4 technologies/tools mentioned in the job description
   - MANDATORY: Project descriptions MUST address responsibilities or problem types mentioned in the JD
   - If the current projects are NOT relevant or do NOT align with the job description:
     * REPLACE them with new, realistic, and role-relevant projects that closely match the job requirements
     * OR ADD new relevant projects while keeping only the most relevant existing projects
     * Ensure ALL projects in the final resume are highly relevant to the job description
   - If the current projects ARE relevant to the job description:
     * Refine and adapt them to better highlight aspects that match the job requirements
     * Enhance them with MORE relevant keywords and technologies from the job description
     * Add technologies from the JD that weren't originally in the project
   - When creating or modifying projects:
     * Use EXACT technology names from the JD (e.g., if JD says "Docker", use "Docker" not "containerization")
     * Include at least 3-4 technologies/tools from the JD in each project
     * Align project responsibilities and outcomes with the job role expectations
     * Ensure projects demonstrate skills mentioned in the JD (e.g., if JD mentions "API development", include API projects)
     * Ensure projects are professional, believable, and ATS-optimized
     * Base new projects on realistic scenarios using skills and technologies from both the original resume and job description
     * Highlight measurable outcomes and impact relevant to the target role
     * Use action verbs and terminology from the JD
   - The final Projects section MUST contain 2-3 projects that are HIGHLY relevant and suitable for the job description
   - Each project should read like it was done specifically for this role

5. COMPREHENSIVE MATCHING CHECKLIST (MUST COMPLETE):
   - [ ] All technical skills/tools/technologies from JD are mentioned at least once in the resume
   - [ ] Job title/role name from JD appears in Professional Summary
   - [ ] Key responsibilities from JD are reflected in work experience bullets
   - [ ] Technologies/tools from JD are used in Projects section
   - [ ] Industry-specific terms and jargon from JD are naturally integrated
   - [ ] Methodologies from JD (Agile, Scrum, DevOps, etc.) are mentioned
   - [ ] Soft skills from JD (if mentioned) appear in Skills or Summary
   - [ ] Domain knowledge areas from JD are reflected (if applicable)
   - [ ] Work styles and environment types from JD are mentioned (if applicable)
   - [ ] Experience level matches JD requirements
   - [ ] Resume demonstrates candidate can perform ALL key responsibilities mentioned in JD
   - [ ] Resume shows alignment with JD's expected outcomes and impact areas

6. GENERAL REQUIREMENTS:
   - Keep the resume concise, human-like, and professional.
   - Maintain proper resume structure and formatting.
   - Do NOT include false information - keep it realistic and believable.
   - Do NOT invent fake experience, companies, or tools that are not in the original resume.
   - You may generalize or slightly rephrase, but not fabricate.
   - However, you MAY add relevant technologies/skills to projects if they align with the candidate's overall experience

7. OUTPUT FORMAT:
- DO NOT use markdown (no **, no --- separators, no #).
- Output plain text only.
- Use the EXACT SECTION HEADINGS AND ORDER from the template below.
- Keep one blank line between sections.
- Use simple bullet points starting with "-" or "•" at the start of the line.
- CRITICAL: Start DIRECTLY with the candidate's ACTUAL NAME from the original resume (e.g., "Jerin S", "B. Nandini") - NO intro sentences, NO placeholders, NO "Candidate Name".
- IMMEDIATELY after the name, include all personal details (Phone, Email, Location, LinkedIn, etc.) from the original resume.

HERE IS THE FIXED TEMPLATE YOU MUST FOLLOW (FILL IT USING THE CANDIDATE'S DATA + JOB DESCRIPTION):

[FULL NAME]
Phone: [PHONE]
Email: [EMAIL]
Location: [CITY, STATE]
LinkedIn: [LINKEDIN URL OR N/A]
Portfolio/GitHub (optional): [LINK OR N/A]

PROFESSIONAL SUMMARY
Results-driven [TARGET ROLE or FIELD] with experience in [MATCHED AREAS FROM RESUME], skilled in [CORE SKILLS MATCHED TO JD], and known for [KEY STRENGTHS/ACHIEVEMENTS]. Adept at handling [KEY RESPONSIBILITIES FROM JD] and delivering measurable outcomes. Seeking to contribute expertise to [TARGET ROLE or COMPANY TYPE] roles.

CORE SKILLS
Skill 1
Skill 2
Skill 3
Skill 4
Skill 5
Skill 6

PROFESSIONAL EXPERIENCE
Job Title — Company Name, Location
Start Month Year – End Month Year / Present
- Achieved [quantifiable result] by doing [action] aligned with the job description.
- Improved [metric] by X% through [initiative] relevant to the target role.
- Managed [tasks/teams/tools] ensuring [outcome] that matches JD responsibilities.
- Implemented [process/tool], leading to [efficiency/savings] in line with JD.

Job Title — Company Name, Location
Start Month Year – End Month Year
- Delivered [measurable impact] by [action].
- Supported [team/project] in [process] resulting in [outcome].
- Coordinated [stakeholders/departments] to achieve [goal].

EDUCATION
Institution Name, Location, Year of Graduation
Degree Name

CERTIFICATIONS (optional)
Certification Name – Issuing Organization – Year
Certification Name – Issuing Organization – Year

PROJECTS (optional)
Project Title
Brief 1-line description aligned with the JD.
Tools/Tech used: [List]
Outcome: [Result]

ADDITIONAL INFORMATION (optional)
Languages: [Languages]
Tools: [ATS keywords / tools relevant to job]
Availability: [Availability]

Use the ORIGINAL RESUME below as the source of truth for all details. CRITICAL REQUIREMENTS:
- MANDATORY: The FIRST LINE of your output MUST be the CANDIDATE'S ACTUAL NAME EXACTLY as it appears in the original resume (e.g., "Jerin S", "B. Nandini") - DO NOT use "Candidate Name" or any placeholder. DO NOT skip the name.
- MANDATORY: IMMEDIATELY after the name, include ALL PERSONAL DETAILS from the original resume:
  * Phone number (if present in original)
  * Email address (if present in original)
  * Location/City (if present in original, e.g., "COIMBATORE")
  * LinkedIn URL (if present in original)
  * Portfolio/GitHub (if present in original)
- Copy PERSONAL DETAILS EXACTLY as they appear in the original resume - DO NOT MODIFY, DO NOT OMIT.
- Copy EDUCATION SECTION EXACTLY as it appears in the original resume - DO NOT CHANGE degree, college, year, marks, or any education details.
- For other sections (Professional Summary, Skills, Experience, Projects), you may reorganize and rephrase to better match the job description, but do not invent fake experience.
- YOUR OUTPUT MUST START WITH THE CANDIDATE'S NAME - NO EXCEPTIONS. If you cannot find the name, use the first line of the original resume that looks like a name.

ORIGINAL RESUME TO TAILOR:
${finalResumeText}

TARGET JOB DESCRIPTION:
${jobDescription}

FINAL CRITICAL INSTRUCTIONS FOR ATS SCORE 85+:
- The resume MUST achieve an ATS match score of 85+ when evaluated against the job description
- This means the resume should match at least 85% of the job requirements, keywords, and expectations
- EVERY section must contribute to this high match score
- Before finalizing, mentally verify:
  * Are all key skills from JD in the Skills section? (YES/NO)
  * Does Professional Summary mention the job title and key skills? (YES/NO)
  * Do work experience bullets reference JD skills/responsibilities? (YES/NO)
  * Do projects use technologies from the JD? (YES/NO)
  * Is the resume optimized to pass ATS screening? (YES/NO)

CRITICAL: You MUST tailor the resume to COMPLETELY match the job description and achieve an ATS score of 85+. Do NOT simply copy the original resume.

COMPREHENSIVE MATCHING REQUIRED - Include ALL matching elements:
- Keywords: ALL technical skills, tools, technologies, frameworks, programming languages
- Responsibilities: ALL key responsibilities and task types mentioned in JD
- Methodologies: Agile, Scrum, DevOps, CI/CD, or other methodologies mentioned
- Industry terms: Domain-specific jargon and terminology from the JD
- Soft skills: Communication, leadership, collaboration, etc. if mentioned in JD
- Experience level: Match the years of experience or seniority level required
- Work context: Remote work, cross-functional teams, startup environment, etc. if mentioned
- Outcomes: Types of impact mentioned (scalability, performance, cost reduction, etc.)

DETAILED ACTIONS:
- Deeply analyze the job description to extract ALL keywords, skills, technologies, methodologies, responsibilities, and requirements
- Rewrite the Professional Summary to EXACTLY align with the job role, including job title, key skills, methodologies, and responsibilities from JD
- Update the Skills section to include AT LEAST 80% of technical skills mentioned in the job description (use exact names), plus methodologies and soft skills
- Modify Work Experience bullet points to highlight achievements and responsibilities that DIRECTLY match the JD, using exact terminology and addressing specific responsibilities mentioned
- CRITICAL - Projects Section:
  * FIRST: Evaluate if the current projects in the resume match the job description requirements, technologies, and responsibilities
  * If current projects are NOT relevant or do NOT match the job description:
    → REPLACE them with new, realistic, and role-relevant projects that are suitable for the JD
    → OR ADD new relevant projects while removing or keeping only the most relevant existing ones
    → The final Projects section MUST contain projects that are highly relevant and suitable for the job description
  * If current projects ARE relevant:
    → Refine and adapt them to better highlight aspects that match the job requirements
    → Enhance them with MORE relevant keywords and technologies from the job description
    → Add technologies from the JD that demonstrate alignment
  * All projects (existing or new) must be:
    - Professional, believable, and ATS-optimized
    - Aligned with job requirements, technologies, and responsibilities
    - Use EXACT technology names from the JD
    - Based on realistic scenarios using skills and technologies from both the original resume and job description
- Keep Personal Details and Education EXACTLY as in the original resume

VERIFICATION BEFORE OUTPUT:
Ask yourself: "If an ATS system compares this resume to the job description, will it score 85+?"
- If NO, add more keywords, skills, and matching content
- If YES, proceed to output

FINAL REMINDER - CRITICAL:
- Your output MUST start with the candidate's ACTUAL NAME from the original resume (NOT "Candidate Name")
- IMMEDIATELY after the name, include ALL personal details (Phone, Email, Location, LinkedIn, etc.) from the original resume
- DO NOT skip or omit the name and personal details section
- If the original resume has "Jerin S", your output must start with "Jerin S", not "Candidate Name"
- If the original resume has "COIMBATORE" as location, include it exactly as "COIMBATORE"

Now produce ONLY the FINAL TAILORED RESUME in the exact template structure above (all sections in the same order).
Replace all bracketed placeholders with the candidate's actual information and tailored content.
Ensure the resume is complete, ready-to-use, ATS-optimized (targeting 85+ score), and professionally tailored to COMPLETELY match the job description.
Do NOT include any reasoning, comments, or explanations.`;

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
                 'Failed to generate resume. Please try again.' 
        },
        { status: 500 }
      );
    }

    // Post-process to ensure header exists
    let finalText = ensureHeaderAndTemplate(generatedText, finalResumeText);
    
    // Always verify and enforce header presence
    const extractedHeader = buildHeaderFromOriginal(finalResumeText);
    const firstLines = finalText.split('\n').slice(0, 10).join('\n').toUpperCase();
    const hasName = extractedHeader.split('\n')[0] && !extractedHeader.split('\n')[0].includes('Candidate Name');
    const headerName = extractedHeader.split('\n')[0];
    
    // Check if the generated text starts with the correct name
    const generatedStartsWithName = headerName && finalText.trim().toUpperCase().startsWith(headerName.toUpperCase());
    
    // Check if personal details are present
    const hasPhone = firstLines.includes('PHONE') || finalText.match(/phone:?\s*\d+/i);
    const hasEmail = firstLines.includes('EMAIL') || finalText.match(/email:?\s*[\w\.-]+@[\w\.-]+\.\w+/i);
    const hasLocation = firstLines.includes('LOCATION') || firstLines.includes('COIMBATORE') || firstLines.includes('BANGALORE');
    
    // If header is missing or incomplete, force it
    if (!generatedStartsWithName || (!hasPhone && !hasEmail) || !hasName) {
      console.log('Header missing or incomplete. Forcing header inclusion.');
      console.log('Extracted header:', extractedHeader);
      console.log('Generated starts with name?', generatedStartsWithName);
      console.log('Has phone?', hasPhone, 'Has email?', hasEmail);
      
      // Find where PROFESSIONAL SUMMARY starts
      const summaryIdx = finalText.toUpperCase().indexOf('PROFESSIONAL SUMMARY');
      let rest = summaryIdx >= 0 ? finalText.slice(summaryIdx) : finalText;
      
      // If we couldn't find PROFESSIONAL SUMMARY, try to find the first section header
      if (summaryIdx < 0) {
        const firstSectionMatch = rest.match(/^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|EDUCATION|EXPERIENCE)/im);
        if (firstSectionMatch) {
          const matchIdx = rest.indexOf(firstSectionMatch[0]);
          if (matchIdx >= 0) {
            rest = rest.slice(matchIdx);
          }
        }
      }
      
      // Remove any existing header-like content from the beginning
      rest = rest.trimStart();
      
      // Prepend the extracted header
      finalText = `${extractedHeader}\n\n${rest}`;
    }

    return NextResponse.json({
      content: finalText,
      downloadUrl: undefined,
      isBinary: false
    });
  } catch (error: any) {
    console.error('Error generating tailored resume:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while generating your tailored resume. Please try again.' },
      { status: 500 }
    );
  }
}

