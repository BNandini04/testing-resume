import mammoth from 'mammoth';

// Helper function to read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// Helper function to read file as array buffer (for binary files)
function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Normalize extracted text to fix spacing issues from PDF extraction
function normalizeExtractedText(text: string): string {
  // Handle cases where PDF extraction adds spaces between every character
  // Pattern: "B .   N andini" -> "B. Nandini"
  let normalized = text;
  
  // Step 1: Fix patterns where single characters are separated by multiple spaces
  // This indicates character-by-character extraction
  // Pattern: char, 2+ spaces, char (likely should be together or single space)
  normalized = normalized.replace(/([A-Za-z0-9.,;:!?@])\s{2,}([A-Za-z0-9.,;:!?@])/g, (match, p1, p2) => {
    // If p1 is a period and p2 is a space or letter, they should be together
    if (p1 === '.' && /[A-Za-z0-9]/.test(p2)) {
      return p1 + p2; // "B . N" -> "B.N" (we'll fix spacing later)
    }
    // If p1 is punctuation, attach to next char
    if (/[.,;:!?]/.test(p1)) {
      return p1 + p2;
    }
    // If both are letters, check case to determine if same word
    if (/[A-Za-z]/.test(p1) && /[A-Za-z]/.test(p2)) {
      // Uppercase + lowercase = likely same word (e.g., "B" + "Nandini")
      if (/[A-Z]/.test(p1) && /[a-z]/.test(p2)) {
        return p1 + p2;
      }
      // Lowercase + lowercase = same word
      if (/[a-z]/.test(p1) && /[a-z]/.test(p2)) {
        return p1 + p2;
      }
      // Uppercase + Uppercase = might be acronym or word boundary
      // Keep space but reduce to single
      return p1 + ' ' + p2;
    }
    // If p1 is digit and p2 is letter/number, might be same token
    if (/[0-9]/.test(p1) && /[A-Za-z0-9]/.test(p2)) {
      return p1 + p2; // "8792364236" should stay together
    }
    // Default: single space
    return p1 + ' ' + p2;
  });
  
  // Step 2: Fix specific common patterns
  normalized = normalized.replace(/([A-Z])\s*\.\s*([A-Z])/g, '$1. $2'); // "B.N" -> "B. N" or "B . N" -> "B. N"
  normalized = normalized.replace(/([a-z])\s+([A-Z])/g, '$1 $2'); // "word Word" -> "word Word" (word boundary)
  
  // Step 3: Fix email addresses
  normalized = normalized.replace(/(\w+)\s+@\s+(\w+)/g, '$1@$2');
  normalized = normalized.replace(/(\w+@\w+)\s+\.\s+(\w+)/g, '$1.$2');
  
  // Step 4: Normalize all multiple spaces to single space
  normalized = normalized.replace(/[ \t]{2,}/g, ' ');
  
  // Step 5: Fix word boundaries - ensure proper spacing
  // Add space after period if followed by uppercase letter (sentence boundary)
  normalized = normalized.replace(/([a-z])\.([A-Z])/g, '$1. $2');
  // But keep "B. Nandini" format (initial + name)
  normalized = normalized.replace(/([A-Z])\.([A-Z][a-z])/g, '$1. $2');
  
  // Step 6: Normalize newlines
  normalized = normalized.replace(/\n\s*\n\s*\n+/g, '\n\n');
  normalized = normalized.replace(/\s+\n/g, '\n');
  normalized = normalized.replace(/\n\s+/g, '\n');
  
  return normalized.trim();
}

// Helper function to extract text from PDF using PDF.js from CDN
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Load PDF.js from CDN
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(script);
    
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = reject;
    });
    
    // @ts-ignore - PDF.js loaded from CDN
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const arrayBuffer = await readFileAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      
      // Better text extraction: use transform and position to determine spacing
      let pageText = '';
      let lastX = -1;
      let lastY = -1;
      const lineHeight = 8; // Approximate line height threshold
      const wordSpacing = 3; // Minimum X difference for word boundary
      
      for (const item of textContent.items) {
        const str = item.str || '';
        if (!str) continue;
        
        // Get position from transform matrix
        const transform = item.transform || [1, 0, 0, 1, 0, 0];
        const x = transform[4];
        const y = transform[5];
        const itemWidth = item.width || 0;
        
        // Determine if we need a space or newline
        if (lastX >= 0 && lastY >= 0) {
          const xDiff = x - lastX;
          const yDiff = Math.abs(y - lastY);
          
          // If Y changed significantly (more than line height), it's a new line
          if (yDiff > lineHeight) {
            pageText += '\n';
          }
          // If X moved forward significantly, add space (word boundary)
          else if (xDiff > wordSpacing) {
            pageText += ' ';
          }
          // If X moved backward significantly, it might be a new line or column
          else if (xDiff < -50) {
            pageText += '\n';
          }
          // If items are very close (xDiff <= wordSpacing), no space (same word)
        }
        
        pageText += str;
        lastX = x + itemWidth;
        lastY = y;
      }
      
      fullText += pageText + '\n';
    }
    
    // Normalize text: fix spacing issues from PDF extraction
    // This handles cases where PDF extraction adds spaces between every character
    fullText = normalizeExtractedText(fullText);
    
    // Additional fix: if text appears to be all on one line (no newlines except at end),
    // try to detect section headers and add line breaks
    const lines = fullText.split('\n');
    if (lines.length <= 2 && fullText.length > 200) {
      // Likely all text on one line, try to add line breaks at section headers
      fullText = fullText
        // Add line breaks before section headers
        .replace(/\s+(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION|SUMMARY|EXPERIENCE|SKILLS)/gi, '\n\n$1')
        // Add line breaks before job titles (pattern: word — word or word - word)
        .replace(/\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+[—\-]\s+([A-Z])/g, '\n$1 — $2')
        // Add line breaks before bullet points
        .replace(/\s+([•\-\*])\s+/g, '\n$1 ')
        // Normalize newlines
        .replace(/\n{3,}/g, '\n\n');
    }
    
    if (fullText.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF. The PDF may be image-based or scanned. Please use a PDF with selectable text.');
    }
    
    return fullText;
  } catch (error: any) {
    console.error('PDF extraction error:', error);
    // Fallback: try reading as text (for some text-based PDFs)
    try {
      const text = await readFileAsText(file);
      // Check if it looks like binary data
      if (text.length > 50 && !text.includes('\0')) {
        return text;
      }
    } catch (e) {
      // Ignore fallback error
    }
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Please ensure your PDF has selectable text, or convert it to DOCX format.'}`);
  }
}

// Helper function to extract text from file
async function extractTextFromFile(file: File): Promise<string> {
  try {
    const fileType = file.type || '';
    const fileName = file.name.toLowerCase();
    
    // For PDF files, use PDF.js for proper extraction
    if (fileType.includes('pdf') || fileName.endsWith('.pdf')) {
      return await extractTextFromPDF(file);
    }
    
    // For DOCX files, use mammoth to extract text
    if (fileType.includes('wordprocessingml') || fileName.endsWith('.docx')) {
      try {
        const arrayBuffer = await readFileAsArrayBuffer(file);
        const result = await mammoth.extractRawText({ arrayBuffer });
        const extractedText = result.value;
        
        // Validate extraction
        if (!extractedText || extractedText.trim().length === 0) {
          throw new Error('No text could be extracted from the DOCX file.');
        }
        
        console.log('DOCX extracted text length:', extractedText.length);
        return extractedText;
      } catch (e: any) {
        console.error('Error parsing DOCX:', e);
        throw new Error(`Failed to parse DOCX file: ${e.message || 'Unknown error'}`);
      }
    }
    
    // For text files, read directly
    const text = await readFileAsText(file);
    return text;
  } catch (error: any) {
    console.error('Error reading file:', error);
    if (error.message) {
      throw error;
    }
    throw new Error(`Failed to read file: ${file.name}. Please ensure it's a valid PDF, DOCX, or text file.`);
  }
}

// Client-side wrapper that calls the API route
export async function generateTailoredResume(resumeFile: File, jobDescriptionFile: File | null, jobDescriptionText: string | null) {
  try {
    const formData = new FormData();
    
    // Extract text from resume file (especially for PDFs which need client-side extraction)
    const resumeFileType = resumeFile.type || '';
    const resumeFileName = resumeFile.name.toLowerCase();
    let resumeText = '';
    
    if (resumeFileType.includes('pdf') || resumeFileName.endsWith('.pdf')) {
      // Extract PDF text client-side
      resumeText = await extractTextFromPDF(resumeFile);
      formData.append('resumeText', resumeText);
    } else {
      // For non-PDF files, send the file and let server extract
      formData.append('resumeFile', resumeFile);
    }
    
    // Handle job description
    if (jobDescriptionText) {
      formData.append('jobDescriptionText', jobDescriptionText);
    } else if (jobDescriptionFile) {
      // Extract text from job description file if it's a PDF
      const jobDescFileType = jobDescriptionFile.type || '';
      const jobDescFileName = jobDescriptionFile.name.toLowerCase();
      
      if (jobDescFileType.includes('pdf') || jobDescFileName.endsWith('.pdf')) {
        const extractedJobDescText = await extractTextFromPDF(jobDescriptionFile);
        formData.append('jobDescriptionText', extractedJobDescText);
      } else {
        formData.append('jobDescriptionFile', jobDescriptionFile);
      }
    }

    const response = await fetch('/api/generate-resume', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate resume');
    }

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error generating tailored resume:', error);
    throw new Error(error.message || 'An error occurred while generating your tailored resume. Please try again.');
  }
}

// Client-side wrapper that calls the API route
export async function generateInterviewQuestions(
  tailoredResume: string,
  originalResume: string,
  jobDescription: string
): Promise<string> {
  try {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tailoredResume,
        originalResume,
        jobDescription,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate interview questions');
    }

    const result = await response.json();
    return result.content;
  } catch (error: any) {
    console.error('Error generating interview questions:', error);
    throw new Error(error.message || 'An error occurred while generating interview questions. Please try again.');
  }
}

// Ensure the generated resume has the header (name, phone, email, location) at the top,
// and that it roughly follows the expected template even if the model missed parts.
function ensureHeaderAndTemplate(generated: string, originalResume: string): string {
  // Clean the generated text - remove any intro text
  let cleaned = generated.trim();
  
  // Always build header from original resume to ensure consistency
  const header = buildHeaderFromOriginal(originalResume);
  
  console.log('Built header:', header); // Debug log
  
  // Find where PROFESSIONAL SUMMARY starts in generated text
  const summaryIdx = cleaned.toUpperCase().indexOf('PROFESSIONAL SUMMARY');
  let rest = summaryIdx >= 0 ? cleaned.slice(summaryIdx) : cleaned;
  
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
  
  // Remove any leading blank lines or intro text from rest
  rest = rest.trimStart();
  
  // Ensure there's a blank line between header and first section
  const result = `${header}\n\n${rest}`;
  console.log('Final result starts with:', result.substring(0, 200)); // Debug log
  return result;
}

// Build a simple header from the original resume text
function buildHeaderFromOriginal(original: string): string {
  // Get all lines from original resume - look at more lines to catch all details
  const allLines = original.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
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
  const linkedinRegex = /(linkedin\.com\/in\/[\w-]+|linkedin\.com\/profile\/[\w-]+)/i;
  const portfolioRegex = /(github\.com\/[\w-]+|portfolio|website|http[s]?:\/\/[^\s]+)/i;

  // First pass: extract all information
  // Company name indicators to exclude
  const companyIndicators = /\b(engineers|technologies|solutions|corporation|corp|inc|llc|ltd|limited|company|systems|services|foundation|organization|institute|college|university|school|prinston|rubixe|magic)\b/i;
  const jobTitleIndicators = /\b(intern|developer|engineer|manager|executive|analyst|specialist|assistant|coordinator|director|lead|senior|junior|training|certification)\b/i;
  
  // First, try to find name in first few lines (most likely location)
  // Prioritize lines with initials (B. Nandini) as they're almost always names
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim(); // Trim whitespace to handle trailing spaces
    if (!name) {
      // Highest priority: Initial. Lastname pattern (B. Nandini)
      // Check if line starts with this pattern (even if there's more text after)
      const initialPatternMatch = line.match(/^([A-Z]\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      const hasInitialPattern = initialPatternMatch !== null;
      
      // Also check if the entire line matches the pattern (pure name line)
      const isPureInitialPattern = /^[A-Z]\.\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/.test(line);
      
      // Extract just the name part if pattern matches
      let extractedName = line;
      if (hasInitialPattern && initialPatternMatch) {
        extractedName = initialPatternMatch[1]; // Get just the name part
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
          !line.toUpperCase().includes('INTERN') &&
          !line.toUpperCase().includes('DEVELOPER') &&
          !line.toUpperCase().includes('TRAINING') &&
          !line.toLowerCase().includes('candidate');
      
      if (looksLikeName) {
        // If it's a pure initial pattern line, use the whole line; otherwise use extracted name
        name = isPureInitialPattern ? line : extractedName;
        console.log('Found name (initial pattern):', name, 'from line:', line);
        break; // Found it, stop looking
      }
    }
  }
  
  // If not found, look for full name patterns - check first 20 lines more carefully
  if (!name) {
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i].trim(); // Trim whitespace to handle cases like "B. Nandini   "
      
      // Try to extract name pattern from the start of the line
      let extractedName = line;
      
      // Check for full name pattern at start: "John Doe" or "John Doe something"
      const fullNameMatch = line.match(/^([A-Z][a-z]+\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/);
      const hasFullNamePattern = fullNameMatch !== null;
      
      // Check for initial middle pattern: "Firstname M. Lastname"
      const initialMiddleMatch = line.match(/^([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)/);
      const hasInitialMiddlePattern = initialMiddleMatch !== null;
      
      // Check for all caps name
      const hasAllCapsName = /^[A-Z][A-Z\s]+$/.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 5; // JOHN DOE
      
      // Extract name part if pattern found
      if (hasFullNamePattern && fullNameMatch) {
        extractedName = fullNameMatch[1];
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
          !line.toUpperCase().includes('INTERN') &&
          !line.toUpperCase().includes('DEVELOPER') &&
          !line.toUpperCase().includes('TRAINING') &&
          !line.toLowerCase().includes('candidate');
      
      if (looksLikeName) {
        name = extractedName; // Use extracted name (just the name part)
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
      // Format phone if it's just 10 digits
      if (phone && /^\d{10}$/.test(phone)) {
        phone = `+91-${phone}`;
      }
    }
    
    // Extract location
    if (!location) {
      // Check for "Location: ..." format
      if (/location:?\s*/i.test(line)) {
        location = line.replace(/^location:?\s*/i, '').trim();
      } 
      // Check for city, state format (Bengaluru, Karnataka or City, State pattern)
      else if (/,/.test(line) && 
               /(india|bangalore|bengaluru|karnataka|mumbai|delhi|hyderabad|chennai|pune|kolkata|noida|gurgaon|city|state|andhra|tamil|kerala|maharashtra|gujarat)/i.test(line) && 
               line.length < 80 &&
               !line.includes('@') &&
               !line.match(phoneRegex)) {
        // Clean up the location line
        let loc = line.replace(/^(City|State|Location|Address)[:\s]*/i, '').trim();
        // If it contains common location words, use it
        if (/(Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Chennai|Pune|Kolkata|Noida|Gurgaon|Karnataka|Maharashtra|Tamil Nadu|Andhra Pradesh)/i.test(loc)) {
          location = loc;
        }
      } 
      // Check for standalone city names
      else if (/^(Bengaluru|Bangalore|Mumbai|Delhi|Hyderabad|Chennai|Pune|Kolkata|Noida|Gurgaon)/i.test(line) && 
               line.length < 50 && 
               !line.includes('@') &&
               !line.match(phoneRegex) &&
               !line.match(companyIndicators)) {
        location = line;
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

  // Fallback for name - look for patterns that indicate a person's name
  if (!name) {
    // Try all lines with more flexible patterns - check more lines
    for (let i = 0; i < Math.min(20, lines.length); i++) {
      const line = lines[i];
      // Look for name patterns: Initial. Lastname or Firstname Lastname
      const hasInitial = /^[A-Z]\.\s+[A-Z][a-z]+/.test(line); // B. Nandini
      const hasFullName = /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line); // Firstname Lastname
      const hasAllCapsName = /^[A-Z][A-Z\s]+$/.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 5; // JOHN DOE
      const hasMixedCase = /^[A-Z][a-z]+(\s+[A-Z]\.?\s+)?[A-Z][a-z]+/.test(line); // John M. Doe
      
      const looksLikeName = (hasInitial || hasFullName || hasAllCapsName || hasMixedCase) &&
          line.length < 80 && 
          line.length > 2 &&
          !line.includes('@') && 
          !line.toLowerCase().includes('phone') &&
          !line.toLowerCase().includes('email') &&
          !line.toLowerCase().includes('location') &&
          !line.toLowerCase().includes('linkedin') &&
          !line.toLowerCase().includes('portfolio') &&
          !line.toLowerCase().includes('github') &&
          !line.match(phoneRegex) &&
          !line.match(companyIndicators) &&
          !line.match(jobTitleIndicators) &&
          !line.toUpperCase().includes('SUMMARY') &&
          !line.toUpperCase().includes('EXPERIENCE') &&
          !line.toUpperCase().includes('EDUCATION') &&
          !line.toUpperCase().includes('SKILLS') &&
          !line.toUpperCase().includes('CERTIFICATIONS') &&
          !line.toUpperCase().includes('PROJECTS') &&
          !line.toUpperCase().includes('INTERN') &&
          !line.toUpperCase().includes('DEVELOPER') &&
          !line.toUpperCase().includes('TRAINING') &&
          !line.toUpperCase().includes('CERTIFICATION') &&
          !line.toLowerCase().includes('candidate');
      
      if (looksLikeName) {
        name = line;
        console.log('Found name in fallback:', name);
        break;
      }
    }
    // Last resort: use first line if it doesn't look like a company or contact info
    if (!name && lines.length > 0) {
      const firstLine = lines[0];
      const isNotContactInfo = !firstLine.toLowerCase().includes('phone') &&
                               !firstLine.toLowerCase().includes('email') &&
                               !firstLine.toLowerCase().includes('location') &&
                               !firstLine.toLowerCase().includes('linkedin') &&
                               !firstLine.toLowerCase().includes('portfolio') &&
                               !firstLine.toLowerCase().includes('github');
      
      const isNotSectionHeader = !/^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(firstLine);
      
      // Very lenient check - if first line doesn't look like contact info, section header, or company, use it as name
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
        console.log('Using first line as name (last resort):', name);
      }
    }
    // Only use default if absolutely nothing found
    if (!name) {
      console.log('WARNING: Could not extract name from resume. First 5 lines:', lines.slice(0, 5));
      // Last last resort: if we have at least one line, try to extract name from it
      if (lines.length > 0) {
        const firstLine = lines[0];
        console.log('Checking first line as name (last resort):', firstLine);
        
        // If first line contains contact info (email, phone, etc.), try to extract just the name part
        if (firstLine.includes('@') || firstLine.match(phoneRegex) || firstLine.toLowerCase().includes('linkedin') || firstLine.toLowerCase().includes('email')) {
          // Try to extract name from the beginning of the line before contact info
          // Split by common separators: |, email, phone, linkedin, etc.
          let namePart = firstLine;
          
          // Remove email
          namePart = namePart.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i, '').trim();
          // Remove phone numbers
          namePart = namePart.replace(phoneRegex, '').trim();
          // Remove LinkedIn URLs
          namePart = namePart.replace(/linkedin\.com\/[^\s]+/i, '').trim();
          // Remove www. or http URLs
          namePart = namePart.replace(/https?:\/\/[^\s]+/gi, '').trim();
          namePart = namePart.replace(/www\.[^\s]+/gi, '').trim();
          // Remove separators like | and extra spaces
          namePart = namePart.split(/[|•\-\–\—]/)[0].trim();
          // Remove common location words that might appear after name
          namePart = namePart.replace(/\b(COIMBATORE|BANGALORE|MUMBAI|DELHI|HYDERABAD|CHENNAI|PUNE|KOLKATA|NOIDA|GURGAON|KARNATAKA|MAHARASHTRA|TAMIL NADU|ANDHRA PRADESH|INDIA)\b/i, '').trim();
          // Take first 2-4 words (typical name length)
          const words = namePart.split(/\s+/).filter(w => w.length > 0);
          if (words.length >= 1 && words.length <= 5) {
            name = words.join(' ');
            console.log('Extracted name from first line:', name);
          }
        } else {
          // First line doesn't have contact info, check if it's a valid name
          const isDefinitelyNotName = firstLine.toLowerCase().includes('phone') ||
                                      firstLine.toLowerCase().includes('email') ||
                                      firstLine.toLowerCase().includes('location') ||
                                      firstLine.toLowerCase().includes('linkedin') ||
                                      firstLine.toLowerCase().includes('portfolio') ||
                                      firstLine.toLowerCase().includes('github') ||
                                      /^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(firstLine) ||
                                      firstLine.toLowerCase().includes('candidate') ||
                                      firstLine.match(/^\d+$/) || // Just numbers
                                      firstLine.match(/^[^a-zA-Z]+$/); // Just special characters
          
          console.log('Is first line definitely not a name?', isDefinitelyNotName);
          
          if (!isDefinitelyNotName && firstLine.length > 0 && firstLine.length < 150) {
            name = firstLine;
            console.log('Using first line as name (absolute last resort):', name);
          }
        }
      }
      
    if (!name) {
      name = 'Candidate Name';
        console.log('Using default name - no name pattern found in resume');
      }
    }
  }

  // Debug logging
  console.log('Extracted details:', { name, phone, email, location, linkedin, portfolio });
  
  // Build header with all fields
  const headerLines = [
    name || 'Candidate Name',
    phone ? `Phone: ${phone}` : 'Phone: N/A',
    email ? `Email: ${email}` : 'Email: N/A',
    location ? `Location: ${location}` : 'Location: N/A',
    linkedin ? `LinkedIn: ${linkedin}` : 'LinkedIn: N/A',
    portfolio ? `Portfolio/GitHub (optional): ${portfolio}` : 'Portfolio/GitHub (optional): N/A',
  ];

  const header = headerLines.join('\n');
  console.log('Final header:', header);
  return header;
}  

// Lightweight export to reuse the file-to-text extraction logic in client components
export async function extractPlainTextFromFile(file: File): Promise<string> {
  return extractTextFromFile(file);
}

// Function to normalize resume text for ATS scoring (ensures consistency with file-extracted text)
// This function ensures the generated resume text matches the format that would be extracted from a file
export function normalizeResumeTextForAts(text: string): string {
  if (!text) return '';
  
  let normalized = text;
  
  // Remove any HTML tags if present
  normalized = normalized.replace(/<[^>]*>/g, '');
  
  // Decode HTML entities
  normalized = normalized
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
  
  // Remove markdown formatting if any
  normalized = normalized
    .replace(/\*\*(.+?)\*\*/g, '$1') // Bold
    .replace(/\*(.+?)\*/g, '$1') // Italic
    .replace(/^---+$/gm, '') // Horizontal rules
    .replace(/^#{1,6}\s+/gm, ''); // Headers
  
  // Normalize line breaks - preserve structure but clean up excessive whitespace
  // First, normalize all types of line breaks to \n
  normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Remove trailing whitespace from each line but preserve line structure
  const lines = normalized.split('\n').map(line => line.trimEnd());
  normalized = lines.join('\n');
  
  // Normalize multiple consecutive newlines (but keep at least one for section separation)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');
  
  // Normalize whitespace within lines - multiple spaces/tabs to single space
  normalized = normalized.replace(/[ \t]{2,}/g, ' ');
  
  // Clean up spaces around newlines
  normalized = normalized.replace(/\s+\n/g, '\n');
  normalized = normalized.replace(/\n\s+/g, '\n');
  
  // Remove any leading/trailing whitespace from the entire text
  normalized = normalized.trim();
  
  return normalized;
}