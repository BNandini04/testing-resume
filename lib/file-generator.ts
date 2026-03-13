import jsPDF from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell } from 'docx';
import { parseResumeToStructure, type ParsedResume, type Block, type ResumeSection as ParsedSection } from '@/lib/resume-parser';

export type ResumeTemplateId = 'classic' | 'bars' | 'green' | 'yellow' | 'slate';

// Parse resume text into structured sections
interface ResumeSection {
  type: 'header' | 'section' | 'job' | 'bullet' | 'text' | 'project';
  content: string;
  level?: number;
}

function parseResumeText(text: string): ResumeSection[] {
  if (!text) return [];
  
  const lines = text.split('\n').map(line => line.trimEnd());
  const sections: ResumeSection[] = [];
  let headerEndIndex = -1;
  
  // First pass: find where header ends
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    const isSectionHeader = /^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(trimmedLine);
    if (isSectionHeader) {
      headerEndIndex = i;
      break;
    }
  }
  
  // Process header section (before first section header)
  const headerLines = headerEndIndex >= 0 ? lines.slice(0, headerEndIndex) : lines.slice(0, 10);
  for (const line of headerLines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    sections.push({
      type: 'header',
      content: trimmedLine
    });
  }
  
  // Process rest of resume
  const startIndex = headerEndIndex >= 0 ? headerEndIndex : 0;
  let inProjectsSection = false;
  let inSkillsSection = false;
  let nextLineIsProjectTitle = false;
  let previousLineWasOutcome = false;
  let previousLineWasToolsTech = false;
  
  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      // Don't reset flags on empty lines - they might separate projects
      continue; // Skip empty lines
    }
    
    // Check for section headers
    const sectionHeaderMatch = trimmedLine.match(/^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i);
    if (sectionHeaderMatch) {
      const sectionName = sectionHeaderMatch[0].toUpperCase();
      inProjectsSection = sectionName === 'PROJECTS';
      inSkillsSection = sectionName === 'CORE SKILLS';
      nextLineIsProjectTitle = inProjectsSection; // Next non-empty line after PROJECTS is likely a title
      previousLineWasOutcome = false; // Reset when entering new section
      previousLineWasToolsTech = false;
      sections.push({
        type: 'section',
        content: trimmedLine.toUpperCase(),
        level: 1
      });
      continue;
    }
    
    // Check if we're in projects section and previous line was "Outcome:" - next line is likely a new project title
    if (inProjectsSection && previousLineWasOutcome) {
      // After "Outcome:" line, if this is not a bullet, job header, or section header, it's likely a new project title
      const isBullet = /^[•\-\*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine);
      const hasDate = /\d{4}|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(trimmedLine);
      // Job headers have dates, project titles in projects section might have "—" but usually don't have dates
      const isJobHeader = trimmedLine.includes('—') && (hasDate || trimmedLine.includes('Present')) && !inProjectsSection;
      const isSectionHeader = /^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(trimmedLine);
      const isToolsTech = /^tools\/tech used:/i.test(trimmedLine);
      const isOutcome = /^outcome:?/i.test(trimmedLine);
      
      // In projects section, if line has "—" but no dates, it's likely a project title
      const hasProjectDash = trimmedLine.includes('—') && !hasDate;
      
      // If it's not any of these, or if it has a dash (project title pattern), it's likely a new project title
      if ((!isBullet && !isJobHeader && !isSectionHeader && !isToolsTech && !isOutcome) || hasProjectDash) {
        sections.push({
          type: 'project',
          content: trimmedLine
        });
        previousLineWasOutcome = false;
        previousLineWasToolsTech = false;
        continue;
      }
    }
    
    // Check if current line is "Outcome:" - mark that next line might be a project title
    if (inProjectsSection && /^outcome:?/i.test(trimmedLine)) {
      previousLineWasOutcome = true;
      previousLineWasToolsTech = false;
      nextLineIsProjectTitle = false;
      // Still add this as regular text
      sections.push({
        type: 'text',
        content: trimmedLine
      });
      continue;
    }
    
    // Check if current line is "Tools/Tech used:" - mark it
    if (inProjectsSection && /^tools\/tech used:/i.test(trimmedLine)) {
      previousLineWasToolsTech = true;
      previousLineWasOutcome = false;
      nextLineIsProjectTitle = false;
      sections.push({
        type: 'text',
        content: trimmedLine
      });
      continue;
    }
    
    // Check for bullet points
    if (/^[•\-\*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine)) {
      nextLineIsProjectTitle = false;
      previousLineWasOutcome = false;
      previousLineWasToolsTech = false;
      const bulletContent = trimmedLine.replace(/^[•\-\*]\s/, '').replace(/^\d+\.\s/, '').trim();
      sections.push({
        type: 'bullet',
        content: bulletContent
      });
      continue;
    }
    
    // Check for job title/company (has — separator)
    // In projects section, lines with "—" are project titles, not job headers
    const hasDate = /\d{4}|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(trimmedLine);
    // Job title line: has "—" separator (even if date is on next line)
    const isJobTitleLine = trimmedLine.includes('—') && !inProjectsSection;
    // Date line: has date pattern but no "—" (follows job title)
    const isDateLine = hasDate && !trimmedLine.includes('—') && !trimmedLine.includes('•') && !trimmedLine.includes('-') && !/^[•\-\*]\s/.test(trimmedLine);
    
    if (isJobTitleLine) {
      nextLineIsProjectTitle = false;
      previousLineWasOutcome = false;
      previousLineWasToolsTech = false;
      sections.push({
        type: 'job',
        content: trimmedLine
      });
      continue;
    }
    
    // Date line that follows job title (should be regular text, not bold)
    if (isDateLine && sections.length > 0 && sections[sections.length - 1].type === 'job') {
      sections.push({
        type: 'text',
        content: trimmedLine
      });
      continue;
    }
    
    // In projects section, if line has "—" (em dash), it's likely a project title
    // This handles project titles that come after "Outcome:" or are the first project
    if (inProjectsSection && trimmedLine.includes('—') && !hasDate) {
      const isBullet = /^[•\-\*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine);
      const isToolsTech = /^tools\/tech used:/i.test(trimmedLine);
      const isOutcome = /^outcome:?/i.test(trimmedLine);
      const isSectionHeader = /^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(trimmedLine);
      
      if (!isBullet && !isToolsTech && !isOutcome && !isSectionHeader) {
        sections.push({
          type: 'project',
          content: trimmedLine
        });
        previousLineWasOutcome = false;
        previousLineWasToolsTech = false;
        nextLineIsProjectTitle = false;
        continue;
      }
    }
    
    // Check for project title (first non-bullet, non-job line after PROJECTS section)
    if (inProjectsSection && nextLineIsProjectTitle) {
      // This is likely a project title - first line after PROJECTS header
      nextLineIsProjectTitle = false; // Reset so next lines are regular text
      previousLineWasOutcome = false;
      previousLineWasToolsTech = false;
      sections.push({
        type: 'project',
        content: trimmedLine
      });
      continue;
    }
    
    // Check if we're in CORE SKILLS section - treat each non-bullet line as a skill bullet point
    if (inSkillsSection) {
      // Skip if it's already a bullet point or if it's a section header
      const isBullet = /^[•\-\*]\s/.test(trimmedLine) || /^\d+\.\s/.test(trimmedLine);
      const isSectionHeader = /^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(trimmedLine);
      if (!isBullet && !isSectionHeader) {
        // Treat as a skill bullet point
        sections.push({
          type: 'bullet',
          content: trimmedLine
        });
        continue;
      }
    }
    
    // Regular text
    nextLineIsProjectTitle = false;
    // Don't reset previousLineWasOutcome here - we need it to persist across empty lines
    sections.push({
      type: 'text',
      content: trimmedLine
    });
  }
  
  return sections;
}

// Extract header information
function extractHeaderInfo(sections: ResumeSection[]): {
  name: string;
  contactInfo: string[];
} {
  const headerSections = sections.filter(s => s.type === 'header');
  
  // Find name (first line that looks like a name)
  let name = 'Candidate Name';
  const contactInfo: string[] = [];
  const phoneRegex = /(\+?\d{1,3}[\s\-]?\d{1,4}[\s\-]?\d{6,})|(\d{10,})/
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  
  for (const section of headerSections) {
    const line = section.content.trim();
    
    // Pattern 1: Initial. Lastname (e.g., "B. Nandini")
    const initialPatternMatch = line.match(/^([A-Z]\.\s+[A-Z][a-z]+(?:\s+[A-Z]\.?\s+[A-Z][a-z]+)*)/)
    const hasInitialPattern = initialPatternMatch !== null
    const isPureInitialPattern = /^[A-Z]\.\s+[A-Z][a-z]+(\s+[A-Z]\.?\s+[A-Z][a-z]+)*$/.test(line)
    
    // Pattern 2: Firstname Lastname (e.g., "John Doe")
    const fullNameMatch = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
    const hasFullNamePattern = fullNameMatch !== null
    
    // Pattern 3: All caps name
    const hasAllCapsPattern = /^[A-Z][A-Z\s]+$/.test(line) && line.split(/\s+/).length >= 2 && line.split(/\s+/).length <= 5
    
    // Pattern 4: Mixed case with middle initial
    const middleInitialMatch = line.match(/^([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)/)
    const hasMiddleInitialPattern = middleInitialMatch !== null
    
    // Extract name part if pattern found
    let extractedName = line
    if (hasInitialPattern && initialPatternMatch) {
      extractedName = initialPatternMatch[1]
    } else if (hasFullNamePattern && fullNameMatch) {
      extractedName = fullNameMatch[1]
    } else if (hasMiddleInitialPattern && middleInitialMatch) {
      extractedName = middleInitialMatch[1]
    }
    
    const nameToCheck = (hasInitialPattern || hasFullNamePattern || hasMiddleInitialPattern) ? extractedName : line
    
    // Check if the line contains contact info after the name
    const hasContactInfo = line.includes('|') || phoneRegex.test(line) || emailRegex.test(line) || 
                          line.toLowerCase().includes('location') || line.toLowerCase().includes('bengaluru') ||
                          line.toLowerCase().includes('karnataka') || line.toLowerCase().includes('bangalore')
    
    const looksLikeName = (hasInitialPattern || isPureInitialPattern || hasFullNamePattern || hasAllCapsPattern || hasMiddleInitialPattern) &&
      nameToCheck.length < 100 &&
      nameToCheck.length > 2 &&
      !line.toLowerCase().includes('candidate')
    
    if (looksLikeName && name === 'Candidate Name') {
      // If it's a pure initial pattern line with no contact info, use the whole line; otherwise use extracted name
      name = (isPureInitialPattern && !hasContactInfo) ? line : extractedName
      
      // If the line contains contact info after the name, extract it
      if (hasContactInfo && extractedName.length < line.length) {
        const remainingText = line.substring(extractedName.length).trim()
        // Check if remaining text looks like contact info
        if (remainingText && (remainingText.includes('|') || phoneRegex.test(remainingText) || emailRegex.test(remainingText) || 
            remainingText.toLowerCase().includes('location') || remainingText.toLowerCase().includes('bengaluru') ||
            remainingText.toLowerCase().includes('karnataka') || remainingText.toLowerCase().includes('bangalore'))) {
          // Extract contact info parts (split by | or detect individual parts)
          if (remainingText.includes('|')) {
            const parts = remainingText.split('|').map(p => p.trim()).filter(p => p.length > 0)
            contactInfo.push(...parts)
          } else {
            // Single contact info item
            contactInfo.push(remainingText)
          }
        }
      }
      
      // If we found a name, continue to collect other contact info lines
      continue
    }
    
    // Check if this is a contact info line (starts with Phone, Email, Location, etc.)
    const isContactLine = /^(Phone|Email|Location|LinkedIn|Portfolio\/GitHub)/i.test(line) ||
                         (line.includes('Phone:') || line.includes('Email:') || 
                          line.includes('Location:') || line.includes('LinkedIn:') ||
                          line.includes('Portfolio/GitHub') || line.includes('Portfolio/GitHub (optional):'))
    
    if (isContactLine && line) {
      // Clean up contact info - remove labels if present
      const cleanedInfo = line
        .replace(/^(Phone|Email|Location|LinkedIn|Portfolio\/GitHub)\s*:\s*/i, '')
        .replace(/^(Phone|Email|Location|LinkedIn|Portfolio\/GitHub)\s*/i, '')
        .trim()
      if (cleanedInfo && cleanedInfo.length > 0) {
        contactInfo.push(cleanedInfo)
      }
    } else if (line && name !== 'Candidate Name' && line !== name) {
      // If we already have a name and this line isn't the name, check if it's contact info
      if (phoneRegex.test(line) || emailRegex.test(line) || line.includes('|') ||
          line.toLowerCase().includes('location') || line.toLowerCase().includes('bengaluru') ||
          line.toLowerCase().includes('karnataka') || line.toLowerCase().includes('bangalore')) {
        contactInfo.push(line)
      }
    }
  }
  
  // Fallback: if no name found, try to extract from first header line
  if (name === 'Candidate Name' && headerSections.length > 0) {
    const firstLine = headerSections[0].content.trim()
    const nameMatch = firstLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+|[A-Z]\.\s+[A-Z][a-z]+)/)
    if (nameMatch && firstLine.length < 150 && firstLine.length > 1) {
      name = nameMatch[1]
      
      // Extract contact info if present
      const hasContactInfo = firstLine.includes('|') || phoneRegex.test(firstLine) || emailRegex.test(firstLine)
      if (hasContactInfo && nameMatch[1].length < firstLine.length) {
        const remainingText = firstLine.substring(nameMatch[1].length).trim()
        if (remainingText && (remainingText.includes('|') || phoneRegex.test(remainingText) || emailRegex.test(remainingText))) {
          if (remainingText.includes('|')) {
            const parts = remainingText.split('|').map(p => p.trim()).filter(p => p.length > 0)
            contactInfo.push(...parts)
          } else {
            contactInfo.push(remainingText)
          }
        }
      }
    }
  }
  
  return { name, contactInfo };
}

// Build ParsedResume from legacy parseResumeText when parseResumeToStructure returns empty (so template is still applied)
function buildParsedResumeFromLegacy(content: string): ParsedResume {
  const sections = parseResumeText(content);
  const { name, contactInfo } = extractHeaderInfo(sections);
  const parsedSections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  for (const s of sections) {
    if (s.type === 'header') continue;
    if (s.type === 'section') {
      if (current && current.blocks.length > 0) parsedSections.push(current);
      current = { title: s.content, blocks: [] };
      continue;
    }
    if (!current) current = { title: 'Summary', blocks: [] };
    if (s.type === 'job') current.blocks.push({ type: 'jobHeader', text: s.content });
    else if (s.type === 'bullet') current.blocks.push({ type: 'bullet', text: s.content });
    else current.blocks.push({ type: 'paragraph', text: s.content });
  }
  if (current && current.blocks.length > 0) parsedSections.push(current);
  return {
    name: name && name !== 'Candidate Name' ? name : (sections.find((s) => s.type === 'header')?.content || ''),
    contact: contactInfo.filter(Boolean).join(' | '),
    sections: parsedSections,
  };
}

// --- Template-based PDF from ParsedResume ---
const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 25;
const LINE_H = 7;
const LINE_H_COMPACT = 5.5;

function isSkillsSection(title: string): boolean {
  return /core skills|^skills$/i.test(title.trim());
}

function isProjectsSection(title: string): boolean {
  return /projects/i.test(title.trim());
}

function isExperienceSection(title: string): boolean {
  return /work experience|professional experience/i.test(title.trim());
}

function drawJustifiedText(
  doc: jsPDF,
  text: string,
  x: number,
  yRef: { y: number },
  width: number,
  lineH: number,
  pageH: number,
  margin: number
) {
  const lines = doc.splitTextToSize(text, width);
  lines.forEach((line: string, index: number) => {
    if (yRef.y + lineH > pageH - margin) {
      doc.addPage();
      yRef.y = margin;
    }
    const trimmed = line.trim();
    const isLastLine = index === lines.length - 1;
    if (!isLastLine && trimmed.length > 0) {
        const words = trimmed.split(/\s+/);
      if (words.length > 1) {
        const wordsWidth = words.reduce((sum, w) => sum + doc.getTextWidth(w + ' '), 0) - doc.getTextWidth(' ');
        const extraSpace = (width - wordsWidth) / (words.length - 1);
        let xPos = x;
        words.forEach((word, i) => {
          doc.text(word, xPos, yRef.y);
          if (i < words.length - 1) {
            xPos += doc.getTextWidth(word + ' ') + extraSpace;
          }
        });
      } else {
        doc.text(trimmed, x, yRef.y);
      }
    } else {
      doc.text(trimmed, x, yRef.y);
    }
    yRef.y += lineH;
  });
}

function addParsedBlocksToPDF(
  doc: jsPDF,
  blocks: Block[],
  opts: { x: number; width: number; yRef: { y: number }; lineH: number; fontTitle: number; fontBody: number; margin: number; sectionTitle?: string }
) {
  const { yRef, lineH, fontTitle, fontBody, margin, sectionTitle } = opts;
  let { x, width } = opts;
  const isSkills = sectionTitle ? isSkillsSection(sectionTitle) : false;
  const isProjects = sectionTitle ? isProjectsSection(sectionTitle) : false;
  const isExperience = sectionTitle ? isExperienceSection(sectionTitle) : false;
  let nextParagraphIsProjectTitle = true;

  for (const b of blocks) {
    if (yRef.y + lineH > PAGE_H - margin) {
      doc.addPage();
      yRef.y = margin;
    }
    doc.setFontSize(fontBody);
    doc.setFont('helvetica', 'normal');
    if (isSkills) {
      // For skills, keep bullets left-aligned and collapse extra spaces to avoid large gaps between words
      const cleaned = b.text.replace(/\s+/g, ' ');
      const lines = doc.splitTextToSize('• ' + cleaned, width);
      for (const line of lines as string[]) {
        if (yRef.y + lineH > PAGE_H - margin) {
          doc.addPage();
          yRef.y = margin;
        }
        doc.text(line, x, yRef.y);
        yRef.y += lineH;
      }
      yRef.y += 1;
      continue;
    }
    if (b.type === 'jobHeader') {
      nextParagraphIsProjectTitle = false;
      doc.setFont('helvetica', 'bold');
      drawJustifiedText(doc, b.text, x, yRef, width, lineH, PAGE_H, margin);
      yRef.y += 2;
    } else if (b.type === 'bullet') {
      nextParagraphIsProjectTitle = false;
      doc.setFont('helvetica', 'normal');
      drawJustifiedText(doc, '• ' + b.text, x, yRef, width, lineH, PAGE_H, margin);
      yRef.y += 1;
    } else {
      // In experience section, paragraphs (title, company, address) are bold
      // In projects section, project titles and Tools/Tech used:/Outcome: labels are bold
      const trimmed = b.text.trim();
      const isToolsTech = /^tools\/tech used:?/i.test(trimmed);
      const isOutcome = /^outcome:?/i.test(trimmed);
      if (isExperience) {
        doc.setFont('helvetica', 'bold');
      } else if (isProjects && (isToolsTech || isOutcome)) {
        nextParagraphIsProjectTitle = true;
        const labelMatch = trimmed.match(/^(tools\/tech used:?|outcome:?)(.*)/i);
        if (labelMatch) {
          doc.setFont('helvetica', 'bold');
          drawJustifiedText(doc, labelMatch[1], x, yRef, width, lineH, PAGE_H, margin);
          if (labelMatch[2].trim()) {
            doc.setFont('helvetica', 'normal');
            drawJustifiedText(doc, labelMatch[2].trim(), x, yRef, width, lineH, PAGE_H, margin);
          }
          yRef.y += 2;
          continue;
        }
      } else if (isProjects) {
        const titleExplMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
        if (titleExplMatch && !/^(tools\/tech used|outcome)/i.test(titleExplMatch[1].trim())) {
          nextParagraphIsProjectTitle = false;
          const match = titleExplMatch;
          doc.setFont('helvetica', 'bold');
          drawJustifiedText(doc, match[1].trim(), x, yRef, width, lineH, PAGE_H, margin);
          if (match[2].trim()) {
            doc.setFont('helvetica', 'normal');
            drawJustifiedText(doc, ': ' + match[2].trim(), x, yRef, width, lineH, PAGE_H, margin);
          }
          yRef.y += 2;
          continue;
        }
        const isTitle = nextParagraphIsProjectTitle;
        nextParagraphIsProjectTitle = false;
        doc.setFont('helvetica', isTitle ? 'bold' : 'normal');
      }
      drawJustifiedText(doc, b.text, x, yRef, width, lineH, PAGE_H, margin);
      yRef.y += 2;
    }
  }
}

function addParsedSectionToPDF(
  doc: jsPDF,
  section: ParsedSection,
  opts: { x: number; width: number; yRef: { y: number }; lineH: number; fontTitle: number; fontBody: number; margin: number }
) {
  const { yRef, lineH, fontTitle, fontBody, margin } = opts;
  const { x, width } = opts;
  if (yRef.y + lineH * 3 > PAGE_H - margin) {
    doc.addPage();
    yRef.y = margin;
  }
  doc.setFontSize(fontTitle);
  doc.setFont('helvetica', 'bold');
  const titleLines = doc.splitTextToSize(section.title.toUpperCase(), width);
  titleLines.forEach((line: string) => {
    doc.text(line, x, yRef.y);
    yRef.y += lineH;
  });
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.4);
  doc.line(x, yRef.y + 0.5, x + width, yRef.y + 0.5);
  yRef.y += 6;
  addParsedBlocksToPDF(doc, section.blocks, { ...opts, fontBody: opts.fontBody || 10, sectionTitle: section.title });
  yRef.y += 2;
}

function addParsedSectionToPDFGreen(
  doc: jsPDF,
  section: ParsedSection,
  opts: { x: number; width: number; yRef: { y: number }; lineH: number; fontTitle: number; fontBody: number; margin: number }
) {
  const { yRef, lineH, fontTitle, fontBody, margin } = opts;
  const { x, width } = opts;
  if (yRef.y + lineH * 3 > PAGE_H - margin) {
    doc.addPage();
    yRef.y = margin;
  }
  // Green section title
  doc.setFontSize(fontTitle + 2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(78, 124, 78);
  const titleLines = doc.splitTextToSize(section.title, width);
  titleLines.forEach((line: string) => {
    doc.text(line, x, yRef.y);
    yRef.y += lineH;
  });
  // Minimal gap after title; no extra blank line
  yRef.y += 1;
  doc.setTextColor(0, 0, 0);
  addParsedBlocksToPDF(doc, section.blocks, { ...opts, fontBody: opts.fontBody || 10, sectionTitle: section.title });
  yRef.y += 2;
}

function addParsedSectionToPDFYellow(
  doc: jsPDF,
  section: ParsedSection,
  opts: { x: number; width: number; yRef: { y: number }; lineH: number; fontTitle: number; fontBody: number; margin: number }
) {
  const { yRef, lineH, fontTitle, fontBody, margin } = opts;
  const { x, width } = opts;
  if (yRef.y + lineH * 3 > PAGE_H - margin) {
    doc.addPage();
    yRef.y = margin;
  }
  // Black pill label for section title
  doc.setFontSize(fontTitle - 1);
  doc.setFont('helvetica', 'bold');
  const title = section.title.toUpperCase();
  const textW = doc.getTextWidth(title);
  const padX = 2;
  const pillH = lineH + 1;
  const pillW = width;
  const pillX = x;
  doc.setFillColor(0, 0, 0);
  doc.rect(pillX, yRef.y, pillW, pillH, 'F');
  doc.setTextColor(255, 255, 255);
  const textX = x + (width - textW) / 2;
  doc.text(title, textX, yRef.y + pillH - 2);
  yRef.y += pillH + 4;
  doc.setTextColor(0, 0, 0);
  addParsedBlocksToPDF(doc, section.blocks, { ...opts, fontBody: opts.fontBody || 10, sectionTitle: section.title });
  yRef.y += 2;
}

function addParsedSectionToPDFSlate(
  doc: jsPDF,
  section: ParsedSection,
  opts: { x: number; width: number; yRef: { y: number }; lineH: number; fontTitle: number; fontBody: number; margin: number }
) {
  const { yRef, lineH, fontTitle, fontBody, margin } = opts;
  const { x, width } = opts;
  if (yRef.y + lineH * 3 > PAGE_H - margin) {
    doc.addPage();
    yRef.y = margin;
  }
  doc.setFontSize(fontTitle - 1);
  doc.setFont('helvetica', 'bold');
  const title = section.title.toUpperCase();
  const textW = doc.getTextWidth(title);
  const padX = 2;
  const pillH = lineH + 1;
  const pillW = width;
  const pillX = x;
  doc.setFillColor(107, 98, 87);
  doc.rect(pillX, yRef.y, pillW, pillH, 'F');
  doc.setTextColor(255, 255, 255);
  const textX = x + (width - textW) / 2;
  doc.text(title, textX, yRef.y + pillH - 2);
  yRef.y += pillH + 4;
  doc.setTextColor(0, 0, 0);
  addParsedBlocksToPDF(doc, section.blocks, { ...opts, fontBody: opts.fontBody || 10, sectionTitle: section.title });
  yRef.y += 2;
}

// Bars template: diamond bullet for experience/education jobHeader, date/location right-aligned
function addParsedBlocksToPDFBars(
  doc: jsPDF,
  blocks: Block[],
  opts: { x: number; width: number; yRef: { y: number }; lineH: number; fontBody: number; margin: number; sectionTitle?: string }
) {
  const { yRef, lineH, fontBody, margin } = opts;
  let { x, width } = opts;
  const isExperience = opts.sectionTitle ? /work experience|professional experience|experience/i.test(opts.sectionTitle) : false;
  const isEducation = opts.sectionTitle ? /education/i.test(opts.sectionTitle) : false;
  const useDiamond = isExperience || isEducation;
  const isProjects = opts.sectionTitle ? isProjectsSection(opts.sectionTitle) : false;
  let nextParagraphIsProjectTitle = true;

  for (const b of blocks) {
    if (yRef.y + lineH > PAGE_H - margin) {
      doc.addPage();
      yRef.y = margin;
    }
    doc.setFontSize(fontBody);
    doc.setFont('helvetica', 'normal');
    if (b.type === 'jobHeader') {
      nextParagraphIsProjectTitle = false;
      doc.setFont('helvetica', 'bold');
      if (useDiamond) {
        const parts = b.text.split(/\s*[—–-]\s*/).map((p: string) => p.trim()).filter(Boolean);
        const titlePart = parts.length >= 2 ? parts.slice(0, -2).join(' — ') : parts[0] || b.text;
        const datePart = parts.length >= 2 ? parts[parts.length - 2] : '';
        const locationPart = parts.length >= 3 ? parts[parts.length - 1] : '';
        const leftText = '\u25C6 ' + titlePart;
        doc.text(leftText, x, yRef.y);
        if (datePart) {
          const dateW = doc.getTextWidth(datePart);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(fontBody - 1);
          doc.text(datePart, x + width - dateW, yRef.y);
          doc.setFontSize(fontBody);
        }
        yRef.y += lineH;
        if (locationPart) {
          doc.setFont('helvetica', 'normal');
          const locW = doc.getTextWidth(locationPart);
          doc.text(locationPart, x + width - locW, yRef.y);
          yRef.y += lineH;
        }
      } else {
        drawJustifiedText(doc, b.text, x, yRef, width, lineH, PAGE_H, margin);
        yRef.y += 2;
      }
    } else if (b.type === 'bullet') {
      nextParagraphIsProjectTitle = false;
      doc.setFont('helvetica', 'normal');
      drawJustifiedText(doc, '• ' + b.text, x, yRef, width, lineH, PAGE_H, margin);
      yRef.y += 1;
    } else {
      const trimmed = b.text.trim();
      const isToolsTech = /^tools\/tech used:?/i.test(trimmed);
      const isOutcome = /^outcome:?/i.test(trimmed);
      if (isProjects && (isToolsTech || isOutcome)) {
        nextParagraphIsProjectTitle = true;
        const labelMatch = trimmed.match(/^(tools\/tech used:?|outcome:?)(.*)/i);
        if (labelMatch) {
          doc.setFont('helvetica', 'bold');
          drawJustifiedText(doc, labelMatch[1], x, yRef, width, lineH, PAGE_H, margin);
          if (labelMatch[2].trim()) {
            doc.setFont('helvetica', 'normal');
            drawJustifiedText(doc, labelMatch[2].trim(), x, yRef, width, lineH, PAGE_H, margin);
          }
          yRef.y += 2;
          continue;
        }
      } else if (isProjects) {
        const titleExplMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
        if (titleExplMatch && !/^(tools\/tech used|outcome)/i.test(titleExplMatch[1].trim())) {
          nextParagraphIsProjectTitle = false;
          doc.setFont('helvetica', 'bold');
          drawJustifiedText(doc, titleExplMatch[1].trim(), x, yRef, width, lineH, PAGE_H, margin);
          if (titleExplMatch[2].trim()) {
            doc.setFont('helvetica', 'normal');
            drawJustifiedText(doc, ': ' + titleExplMatch[2].trim(), x, yRef, width, lineH, PAGE_H, margin);
          }
          yRef.y += 2;
          continue;
        }
        const isTitle = nextParagraphIsProjectTitle;
        nextParagraphIsProjectTitle = false;
        doc.setFont('helvetica', isTitle ? 'bold' : 'normal');
      } else if (isExperience) {
        // In Professional Experience section, non-bullet paragraphs (title/company/address) should be bold
        doc.setFont('helvetica', 'bold');
      }
      drawJustifiedText(doc, b.text, x, yRef, width, lineH, PAGE_H, margin);
      yRef.y += 2;
    }
  }
}

function addParsedSectionToPDFBars(
  doc: jsPDF,
  section: ParsedSection,
  opts: { x: number; width: number; yRef: { y: number }; lineH: number; fontTitle: number; fontBody: number; margin: number }
) {
  const { yRef, lineH, fontTitle, fontBody, margin } = opts;
  const { x, width } = opts;
  const barHeight = 8;
  if (yRef.y + barHeight + lineH * 4 > PAGE_H - margin) {
    doc.addPage();
    yRef.y = margin;
  }
  // jsPDF uses 0-255 for RGB; light grey bar
  doc.setFillColor(232, 232, 232);
  doc.rect(x, yRef.y, width, barHeight, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(fontTitle - 1);
  doc.setFont('helvetica', 'bold');
  const titleStr = section.title.toUpperCase();
  const titleW = doc.getTextWidth(titleStr);
  doc.text(titleStr, x + (width - titleW) / 2, yRef.y + barHeight - 2);
  yRef.y += barHeight;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(x, yRef.y, x + width, yRef.y);
  yRef.y += 6;
  addParsedBlocksToPDFBars(doc, section.blocks, { ...opts, fontBody: fontBody || 10, sectionTitle: section.title });
  yRef.y += 4;
}

function generatePDFFromParsed(data: ParsedResume, filename: string, template: ResumeTemplateId): void {
  const doc = new jsPDF();
  const margin = MARGIN;
  const maxWidth = PAGE_W - margin * 2;
  const lineH = LINE_H;
  const fontName = 18;
  const fontContact = 10;
  const fontSection = 12;
  const fontBody = 10;
  const yRef = { y: margin };

  if (template === 'bars') {
    // Bars header: centered name, address line, thin line, contact bar (phone left / email right)
    const contactParts = data.contact ? data.contact.split('|').map((p: string) => p.trim()).filter(Boolean) : [];
    const phonePart = contactParts.find((p: string) => /\d{7,}/.test(p)) || contactParts[0] || '';
    const emailPart = contactParts.find((p: string) => p.includes('@')) || contactParts[contactParts.length - 1] || '';
    const addressPart = contactParts.filter((p: string) => p !== phonePart && p !== emailPart).join(' | ');

    doc.setFontSize(fontName);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(data.name, maxWidth);
    const nameW = Math.min(...nameLines.map((l: string) => doc.getTextWidth(l)));
    nameLines.forEach((line: string) => {
      doc.text(line, margin + (maxWidth - doc.getTextWidth(line)) / 2, yRef.y);
      yRef.y += lineH;
    });
    yRef.y += 2;
    if (addressPart) {
      doc.setFontSize(fontContact);
      doc.setFont('helvetica', 'normal');
      const addrW = doc.getTextWidth(addressPart);
      doc.text(addressPart, margin + (maxWidth - addrW) / 2, yRef.y);
      yRef.y += lineH + 2;
    }
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(margin, yRef.y, PAGE_W - margin, yRef.y);
    yRef.y += 6;
    doc.setFontSize(fontContact);
    doc.setFont('helvetica', 'normal');
    if (phonePart) doc.text(phonePart, margin, yRef.y);
    if (emailPart) {
      const emailW = doc.getTextWidth(emailPart);
      doc.text(emailPart, margin + maxWidth - emailW, yRef.y);
    }
    yRef.y += lineH + 6;

    data.sections.forEach((s) => {
      addParsedSectionToPDFBars(doc, s, { x: margin, width: maxWidth, yRef, lineH, fontTitle: fontSection, fontBody, margin });
    });
  } else if (template === 'green') {
    // Green banner header similar to reference image
    const headerHeight = 26;
    doc.setFillColor(124, 170, 106);
    doc.rect(margin, yRef.y, maxWidth, headerHeight, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(data.name, maxWidth - 10);
    const nameBlockHeight = nameLines.length * lineH;
    let localY = yRef.y + (headerHeight - nameBlockHeight) / 2 + lineH * 0.8;
    nameLines.forEach((line: string) => {
      doc.text(line, margin + 4, localY);
      localY += lineH;
    });
    const contactParts = data.contact ? data.contact.split('|').map((p: string) => p.trim()).filter(Boolean) : [];
    if (contactParts.length > 0) {
      doc.setFontSize(10);
      let contactY = yRef.y + 8;
      const contactWidth = Math.max(...contactParts.map((p: string) => doc.getTextWidth(p)));
      contactParts.forEach((part: string) => {
        doc.text(part, margin + maxWidth - contactWidth - 4, contactY, { align: 'left' as any });
        contactY += lineH - 1;
      });
    }
    yRef.y += headerHeight + 8;
    doc.setTextColor(0, 0, 0);

    data.sections.forEach((s) => {
      addParsedSectionToPDFGreen(doc, s, { x: margin, width: maxWidth, yRef, lineH, fontTitle: fontSection, fontBody, margin });
    });
  } else if (template === 'yellow') {
    // Yellow header with circular photo area and name + details centered vertically
    const contactParts = data.contact ? data.contact.split('|').map((p: string) => p.trim()).filter(Boolean) : [];
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');

    // Fixed photo size so layout is stable
    const photoDiameter = 24;
    const photoRadius = photoDiameter / 2;
    const photoCx = margin + 4 + photoRadius;
    const photoCyTop = yRef.y + 4;

    // Text starts just to the right of the photo circle
    const textX = photoCx + photoRadius + 6;
    const textWidth = maxWidth - (textX - margin) - 6;
    const nameLines = doc.splitTextToSize(data.name, textWidth);

    const totalLines = nameLines.length + contactParts.length;
    const totalHeight = totalLines * lineH;
    const headerHeight = Math.max(30, totalHeight + 10, photoDiameter + 8);

    // Yellow bar background
    doc.setFillColor(245, 201, 71);
    doc.rect(margin, yRef.y, maxWidth, headerHeight, 'F');
    // Photo placeholder (circle), vertically centered in banner
    doc.setFillColor(220, 220, 220);
    const photoCy = yRef.y + (headerHeight - photoDiameter) / 2 + photoRadius;
    doc.circle(photoCx, photoCy, photoRadius, 'F');

    // Vertically center name + contact block within banner, slightly nudged downward
    let localY = yRef.y + (headerHeight - totalHeight) / 2 + lineH * 0.8;
    nameLines.forEach((line: string) => {
      doc.text(line, textX, localY);
      localY += lineH;
    });
    if (contactParts.length > 0) {
      doc.setFontSize(fontContact);
      doc.setFont('helvetica', 'normal');
      contactParts.forEach((part: string) => {
        doc.text(part, textX, localY);
        localY += lineH;
      });
    }
    yRef.y += headerHeight + 10;
    data.sections.forEach((s) => {
      addParsedSectionToPDFYellow(doc, s, { x: margin, width: maxWidth, yRef, lineH, fontTitle: fontSection, fontBody, margin });
    });
  } else if (template === 'slate') {
    // Slate header: centered circular photo, name, and contact bar
    const contactParts = data.contact ? data.contact.split('|').map((p: string) => p.trim()).filter(Boolean) : [];
    const contactLine = contactParts.join('  •  ');
    const headerHeight = 42;
    const centerX = margin + maxWidth / 2;

    // Background band
    doc.setFillColor(107, 98, 87);
    doc.rect(margin, yRef.y, maxWidth, headerHeight, 'F');

    // Photo circle
    const photoRadius = 8;
    const photoCy = yRef.y + 12;
    doc.setFillColor(220, 220, 220);
    doc.circle(centerX, photoCy, photoRadius, 'F');

    // Name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(fontName);
    doc.setFont('helvetica', 'bold');
    const nameWidth = doc.getTextWidth(data.name);
    const nameY = yRef.y + headerHeight - 14;
    doc.text(data.name, centerX - nameWidth / 2, nameY);

    // Contact line inside the gray band, just below the name
    if (contactLine) {
      doc.setTextColor(230, 230, 230);
      doc.setFontSize(fontContact);
      doc.setFont('helvetica', 'normal');
      const cWidth = doc.getTextWidth(contactLine);
      const contactY = nameY + lineH - 1;
      doc.text(contactLine, margin + (maxWidth - cWidth) / 2, contactY);
    }

    yRef.y += headerHeight + 6;
    // Sections with slate-colored pill headings
    data.sections.forEach((s) => {
      addParsedSectionToPDFSlate(doc, s, { x: margin, width: maxWidth, yRef, lineH, fontTitle: fontSection, fontBody, margin });
    });
  } else {
    // Classic
    doc.setFontSize(fontName);
    doc.setFont('helvetica', 'bold');
    const nameLines = doc.splitTextToSize(data.name, maxWidth);
    const nameW = Math.min(...nameLines.map((l: string) => doc.getTextWidth(l)));
    nameLines.forEach((line: string) => {
      doc.text(line, margin, yRef.y);
      yRef.y += lineH;
    });
    yRef.y += 2;
    if (data.contact) {
      doc.setFontSize(fontContact);
      doc.setFont('helvetica', 'normal');
      const contactLines = doc.splitTextToSize(data.contact, maxWidth);
      contactLines.forEach((line: string) => {
        doc.text(line, margin, yRef.y);
        yRef.y += lineH;
      });
      yRef.y += 4;
    }
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, yRef.y, PAGE_W - margin, yRef.y);
    yRef.y += 11;

    data.sections.forEach((s) => {
      addParsedSectionToPDF(doc, s, { x: margin, width: maxWidth, yRef, lineH, fontTitle: fontSection, fontBody, margin });
    });
  }

  doc.save(filename);
}

// Generate PDF from resume content
export async function generatePDF(content: string, filename: string = 'resume.pdf', template?: ResumeTemplateId): Promise<void> {
  if (template) {
    let data = parseResumeToStructure(content);
    if (!data.name && data.sections.length === 0) {
      data = buildParsedResumeFromLegacy(content);
    }
    if (data.name || data.sections.length > 0) {
      generatePDFFromParsed(data, filename, template);
      return;
    }
  }
  const doc = new jsPDF();
  const sections = parseResumeText(content);
  const { name, contactInfo } = extractHeaderInfo(sections);
  
  let yPos = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  const lineHeight = 7;
  const sectionSpacing = 5;
  
  // Helper to add text with word wrap and optional justification
  const addText = (text: string, fontSize: number, isBold: boolean = false, color: number[] = [0, 0, 0], justify: boolean = false) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, maxWidth);
    if (yPos + (lines.length * lineHeight) > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = 20;
    }
    
    lines.forEach((line: string, index: number) => {
      const isLastLine = index === lines.length - 1;
      const trimmedLine = line.trim();
      
      if (justify && !isLastLine && trimmedLine.length > 0) {
        // Justify the line by distributing space between words
        const words = trimmedLine.split(/\s+/);
        if (words.length > 1) {
          const wordsWidth = words.reduce((sum, word) => sum + doc.getTextWidth(word + ' '), 0) - doc.getTextWidth(' ');
          const totalSpaces = words.length - 1;
          const availableSpace = maxWidth - wordsWidth;
          const spaceBetween = totalSpaces > 0 ? availableSpace / totalSpaces : 0;
          
          let xPos = margin;
          words.forEach((word, wordIndex) => {
            doc.text(word, xPos, yPos);
            if (wordIndex < words.length - 1) {
              xPos += doc.getTextWidth(word + ' ') + spaceBetween;
            }
          });
        } else {
          doc.text(trimmedLine, margin, yPos);
        }
      } else {
        // Left align for last line or non-justified text
        doc.text(trimmedLine, margin, yPos);
      }
      yPos += lineHeight;
    });
    
    return yPos;
  };
  
  // Add header
  addText(name, 18, true);
  yPos += 3;
  
  if (contactInfo.length > 0) {
    const contactLine = contactInfo.join(' | ');
    addText(contactLine, 10);
    yPos += sectionSpacing;
    
    // Add separator line after header (darker and thicker)
    doc.setDrawColor(0, 0, 0); // Full black color
    doc.setLineWidth(0.6); // Thicker line (increased from default 0.5)
    doc.line(margin, yPos, pageWidth - margin, yPos);
    // Reset line width to default for other lines
    doc.setLineWidth(0.5);
    yPos += sectionSpacing + 3;
  }
  
  // Process sections (skip header sections as they're already processed)
  let inBulletList = false;
  let headerProcessed = false;
  
  for (const section of sections) {
    // Skip header sections - we've already processed them
    if (section.type === 'header') {
      if (!headerProcessed) {
        headerProcessed = true;
      }
      continue;
    }
    
    // Ensure we've processed header before other sections
    if (!headerProcessed) {
      headerProcessed = true;
    }
    
    if (section.type === 'section') {
      if (inBulletList) {
        yPos += 3;
        inBulletList = false;
      }
      yPos += sectionSpacing;
      
      // Add section heading
      const headingFontSize = 14;
      doc.setFontSize(headingFontSize);
      doc.setFont('helvetica', 'bold');
      const sectionLines = doc.splitTextToSize(section.content, maxWidth);
      let headingBaseline = yPos;
      sectionLines.forEach((line: string) => {
        if (yPos + lineHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        headingBaseline = yPos; // Track the baseline of the last line
        yPos += lineHeight;
      });
      
      // Position line below the heading with 1 unit gap
      // headingBaseline is where the text was drawn (baseline)
      // For 14pt font, text extends below baseline, so we add a small offset
      // Then add 1 unit gap before the line
      const lineY = headingBaseline + 2 + 1; // Small offset to clear text (3) + 1 unit gap
      doc.setDrawColor(0, 0, 0); // Black color
      doc.setLineWidth(0.5);
      doc.line(margin, lineY, pageWidth - margin, lineY);
      
      // Set yPos to 2 units after the line for next content (increased from 1 to prevent overlap)
      yPos = lineY + 5;
    } else if (section.type === 'job') {
      if (inBulletList) {
        yPos += 3;
        inBulletList = false;
      }
      yPos += sectionSpacing;
      // Ensure job title and company name are bold
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      const jobLines = doc.splitTextToSize(section.content, maxWidth);
      jobLines.forEach((line: string) => {
        if (yPos + lineHeight > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, margin, yPos);
        yPos += lineHeight;
      });
      yPos += 2;
    } else if (section.type === 'project') {
      if (inBulletList) {
        yPos += 3;
        inBulletList = false;
      }
      yPos += sectionSpacing;
      addText(section.content, 11, true); // Project titles in bold
      yPos += 2;
    } else if (section.type === 'bullet') {
      if (!inBulletList) {
        inBulletList = true;
      }
      // Bullet points should be justified
      addText(`• ${section.content}`, 10, false, [0, 0, 0], true);
      yPos += 1;
    } else if (section.type === 'text') {
      if (inBulletList) {
        yPos += 3;
        inBulletList = false;
      }
      // Check if this is "Tools/Tech used:" or "Outcome:" label - make only the label bold
      const trimmedContent = section.content.trim();
      const isToolsTechLabel = /^tools\/tech used:/i.test(trimmedContent);
      const isOutcomeLabel = /^outcome:?/i.test(trimmedContent);
      
      if (isToolsTechLabel || isOutcomeLabel) {
        // Extract just the label part (e.g., "Tools/Tech used:" or "Outcome:")
        const labelMatch = trimmedContent.match(/^(tools\/tech used:|outcome:?)(.*)/i);
        if (labelMatch) {
          const label = labelMatch[1];
          const content = labelMatch[2].trim();
          
          // Render label in bold
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const labelWidth = doc.getTextWidth(label);
          
          // If there's content after the label, render it in regular font with proper wrapping
          if (content) {
            // Calculate available width after label (with some spacing)
            const spacing = 2; // Small spacing after label
            const availableWidth = maxWidth - labelWidth - spacing;
            const contentX = margin + labelWidth + spacing;
            
            // Set regular font for content
            doc.setFont('helvetica', 'normal');
            
            // Split content to fit available width
            const contentLines = doc.splitTextToSize(content, availableWidth);
            
            // Render label on first line
            doc.setFont('helvetica', 'bold');
            doc.text(label, margin, yPos);
            
            if (contentLines.length > 0) {
              // Render first line of content on same line as label
              doc.setFont('helvetica', 'normal');
              doc.text(contentLines[0], contentX, yPos);
              
              // Render remaining lines on new lines
              for (let i = 1; i < contentLines.length; i++) {
                yPos += lineHeight;
                if (yPos + lineHeight > doc.internal.pageSize.getHeight() - 20) {
                  doc.addPage();
                  yPos = 20;
                }
                doc.text(contentLines[i], margin, yPos);
              }
            }
          } else {
            // No content, just render label
            doc.text(label, margin, yPos);
          }
          
          yPos += lineHeight;
        } else {
          // Fallback: render entire line in bold if pattern matches
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          const labelLines = doc.splitTextToSize(trimmedContent, maxWidth);
          labelLines.forEach((line: string) => {
            if (yPos + lineHeight > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              yPos = 20;
            }
            doc.text(line, margin, yPos);
            yPos += lineHeight;
          });
        }
      } else {
        // Regular text paragraphs should be justified
        addText(section.content, 10, false, [0, 0, 0], true);
      }
      yPos += 2;
    }
  }
  
  // Save PDF
  doc.save(filename);
}

// Generate DOCX from resume content. When barsStyle is true, section title gets grey shading and is centered.
function sectionToDOCXParagraphs(section: ParsedSection, compact: boolean, barsStyle?: boolean): Paragraph[] {
  const size = compact ? 18 : 22;
  const spacing = compact ? { before: 200, after: 100 } : { before: 400, after: 200 };
  const out: Paragraph[] = [];
  out.push(
    new Paragraph({
      text: section.title.toUpperCase(),
      heading: HeadingLevel.HEADING_2,
      spacing,
      alignment: barsStyle ? AlignmentType.CENTER : undefined,
      shading: barsStyle ? { fill: 'E8E8E8' } : undefined,
      border: { bottom: { color: barsStyle ? 'E0E0E0' : 'CCCCCC', size: barsStyle ? 1 : 1, style: BorderStyle.SINGLE } },
    })
  );
  if (isSkillsSection(section.title)) {
    section.blocks.forEach((b) => {
      out.push(
        new Paragraph({
          text: b.text,
          bullet: { level: 0 },
          spacing: { after: 80 },
          run: { size: compact ? 18 : 20 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    });
    return out;
  }
  const isProjects = isProjectsSection(section.title);
  const bulletItems: Paragraph[] = [];
  let nextParagraphIsProjectTitle = true;
  for (const b of section.blocks) {
    if (b.type === 'jobHeader') {
      if (bulletItems.length) {
        out.push(...bulletItems);
        bulletItems.length = 0;
      }
      nextParagraphIsProjectTitle = false;
      out.push(
        new Paragraph({
          text: b.text,
          spacing: { before: 200, after: 100 },
          run: { bold: true, size: compact ? 20 : 22 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    } else if (b.type === 'bullet') {
      bulletItems.push(
        new Paragraph({
          text: b.text,
          bullet: { level: 0 },
          spacing: { after: 80 },
          run: { size: compact ? 18 : 20 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
      nextParagraphIsProjectTitle = false;
    } else {
      if (bulletItems.length) {
        out.push(...bulletItems);
        bulletItems.length = 0;
      }
      const isExperience = isExperienceSection(section.title);
      const trimmed = b.text.trim();
      const toolsTechMatch = isProjects ? trimmed.match(/^(tools\/tech used:?)(.*)/i) : null;
      const outcomeMatch = isProjects ? trimmed.match(/^(outcome:?)(.*)/i) : null;
      const labelMatch = toolsTechMatch || outcomeMatch;
      if (labelMatch) {
        nextParagraphIsProjectTitle = true;
        const runs: TextRun[] = [
          new TextRun({ text: labelMatch[1], bold: true, size: compact ? 18 : 20 }),
        ];
        if (labelMatch[2].trim()) {
          runs.push(new TextRun({ text: labelMatch[2], size: compact ? 18 : 20 }));
        }
        out.push(
          new Paragraph({
            children: runs,
            spacing: { after: 100 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      } else if (isProjects) {
        const titleExplMatch = trimmed.match(/^([^:]+):\s*(.*)$/);
        if (titleExplMatch && !/^(tools\/tech used|outcome)/i.test(titleExplMatch[1].trim())) {
          nextParagraphIsProjectTitle = false;
          const runs: TextRun[] = [
            new TextRun({ text: titleExplMatch[1].trim(), bold: true, size: compact ? 18 : 20 }),
          ];
          if (titleExplMatch[2].trim()) {
            runs.push(new TextRun({ text: ': ' + titleExplMatch[2].trim(), size: compact ? 18 : 20 }));
          }
          out.push(
            new Paragraph({
              children: runs,
              spacing: { after: 100 },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        } else {
          const isTitle = nextParagraphIsProjectTitle;
          nextParagraphIsProjectTitle = false;
          out.push(
            new Paragraph({
              text: b.text,
              spacing: { after: 100 },
              run: { size: compact ? 18 : 20, bold: isTitle },
              alignment: AlignmentType.JUSTIFIED,
            })
          );
        }
      } else {
        const isBold = isExperience;
        out.push(
          new Paragraph({
            text: b.text,
            spacing: { after: 100 },
            run: { size: compact ? 18 : 20, bold: isBold },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    }
  }
  if (bulletItems.length) out.push(...bulletItems);
  return out;
}

async function generateDOCXFromParsed(data: ParsedResume, filename: string, template: ResumeTemplateId): Promise<void> {
  const sizeName = 32;
  const sizeContact = 20;

  const children: (Paragraph | Table)[] = [];
  if (template === 'bars') {
    const contactParts = data.contact ? data.contact.split('|').map((p: string) => p.trim()).filter(Boolean) : [];
    const phonePart = contactParts.find((p: string) => /\d{7,}/.test(p)) || contactParts[0] || '';
    const emailPart = contactParts.find((p: string) => p.includes('@')) || contactParts[contactParts.length - 1] || '';
    const addressPart = contactParts.filter((p: string) => p !== phonePart && p !== emailPart).join(' | ');

    children.push(
      new Paragraph({
        text: data.name,
        heading: HeadingLevel.HEADING_1,
        run: { size: sizeName, bold: true },
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
    if (addressPart) {
      children.push(
        new Paragraph({
          text: addressPart,
          run: { size: sizeContact },
          alignment: AlignmentType.CENTER,
          spacing: { after: 150 },
        })
      );
    }
    children.push(
      new Paragraph({
        text: '',
        border: { bottom: { color: '999999', size: 1, style: BorderStyle.SINGLE } },
        spacing: { after: 200 },
      })
    );
    if (phonePart || emailPart) {
      children.push(
        new Table({
          columnWidths: [4500, 4500],
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      text: phonePart,
                      run: { size: sizeContact },
                      alignment: AlignmentType.LEFT,
                    }),
                  ],
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      text: emailPart,
                      run: { size: sizeContact },
                      alignment: AlignmentType.RIGHT,
                    }),
                  ],
                }),
              ],
            }),
          ],
        })
      );
      children.push(
        new Paragraph({
          text: '',
          spacing: { after: 300 },
        })
      );
    }
    data.sections.forEach((s) => children.push(...sectionToDOCXParagraphs(s, false, true)));
  } else if (template === 'green') {
    const contactParts = data.contact ? data.contact.split('|').map((p: string) => p.trim()).filter(Boolean) : [];
    children.push(
      new Paragraph({
        text: data.name,
        heading: HeadingLevel.HEADING_1,
        run: { size: sizeName, bold: true, color: 'FFFFFF' },
        alignment: AlignmentType.LEFT,
        shading: { fill: '7CAA6A' },
        spacing: { after: 100 },
      })
    );
    if (contactParts.length > 0) {
      children.push(
        new Paragraph({
          children: contactParts.map((part, idx) => new TextRun({ text: part + (idx < contactParts.length - 1 ? ' | ' : ''), size: sizeContact })),
          alignment: AlignmentType.RIGHT,
          spacing: { after: 200 },
        })
      );
    }
    data.sections.forEach((s) => children.push(...sectionToDOCXParagraphs(s, false)));
  } else {
    children.push(
      new Paragraph({
        text: data.name,
        heading: HeadingLevel.HEADING_1,
        run: { size: sizeName, bold: true },
        alignment: AlignmentType.LEFT,
        spacing: { after: 200 },
      })
    );
    if (data.contact) {
      children.push(
        new Paragraph({
          text: data.contact,
          run: { size: sizeContact },
          alignment: AlignmentType.LEFT,
          spacing: { after: 300 },
        })
      );
      children.push(
        new Paragraph({
          text: '',
          border: { bottom: { color: 'CCCCCC', size: 1, style: BorderStyle.SINGLE } },
          spacing: { after: 400 },
        })
      );
    }
    data.sections.forEach((s) => children.push(...sectionToDOCXParagraphs(s, false)));
  }

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export async function generateDOCX(content: string, filename: string = 'resume.docx', template?: ResumeTemplateId): Promise<void> {
  if (template) {
    let data = parseResumeToStructure(content);
    if (!data.name && data.sections.length === 0) {
      data = buildParsedResumeFromLegacy(content);
    }
    if (data.name || data.sections.length > 0) {
      await generateDOCXFromParsed(data, filename, template);
      return;
    }
  }
  const sections = parseResumeText(content);
  const { name, contactInfo } = extractHeaderInfo(sections);
  
  const children: Paragraph[] = [];
  
  // Add header
  children.push(
    new Paragraph({
      text: name,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );
  
  if (contactInfo.length > 0) {
    const contactLine = contactInfo.join(' | ');
    children.push(
      new Paragraph({
        text: contactLine,
        spacing: { after: 300 },
      })
    );
    
    // Add separator
    children.push(
      new Paragraph({
        text: '',
        border: {
          bottom: {
            color: "CCCCCC",
            size: 1,
            style: BorderStyle.SINGLE,
          },
        },
        spacing: { after: 400 },
      })
    );
  }
  
  // Process sections (skip header sections as they're already processed)
  let inBulletList = false;
  let bulletItems: Paragraph[] = [];
  let headerProcessed = false;
  
  for (const section of sections) {
    // Skip header sections - we've already processed them
    if (section.type === 'header') {
      if (!headerProcessed) {
        headerProcessed = true;
      }
      continue;
    }
    
    // Ensure we've processed header before other sections
    if (!headerProcessed) {
      headerProcessed = true;
    }
    
    if (section.type === 'section') {
      // Close any open bullet list
      if (inBulletList && bulletItems.length > 0) {
        children.push(...bulletItems);
        bulletItems = [];
        inBulletList = false;
      }
      
      children.push(
        new Paragraph({
          text: section.content,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 },
          border: {
            bottom: {
              color: "CCCCCC",
              size: 1,
              style: BorderStyle.SINGLE,
            },
          },
        })
      );
    } else if (section.type === 'job') {
      // Close any open bullet list
      if (inBulletList && bulletItems.length > 0) {
        children.push(...bulletItems);
        bulletItems = [];
        inBulletList = false;
      }
      
      children.push(
        new Paragraph({
          text: section.content,
          spacing: { before: 300, after: 200 },
          run: {
            bold: true,
            size: 22, // 11pt
          },
        })
      );
    } else if (section.type === 'project') {
      // Close any open bullet list
      if (inBulletList && bulletItems.length > 0) {
        children.push(...bulletItems);
        bulletItems = [];
        inBulletList = false;
      }
      
      children.push(
        new Paragraph({
          text: section.content,
          spacing: { before: 300, after: 200 },
          run: {
            bold: true,
            size: 22, // 11pt
          },
        })
      );
    } else if (section.type === 'bullet') {
      if (!inBulletList) {
        inBulletList = true;
      }
      bulletItems.push(
        new Paragraph({
          text: section.content,
          bullet: {
            level: 0,
          },
          alignment: AlignmentType.JUSTIFIED,
          spacing: { after: 100 },
        })
      );
    } else if (section.type === 'text') {
      // Close any open bullet list
      if (inBulletList && bulletItems.length > 0) {
        children.push(...bulletItems);
        bulletItems = [];
        inBulletList = false;
      }
      
      // Check if this is "Tools/Tech used:" or "Outcome:" label - make only the label bold
      const trimmedContent = section.content.trim();
      const isToolsTechLabel = /^tools\/tech used:/i.test(trimmedContent);
      const isOutcomeLabel = /^outcome:?/i.test(trimmedContent);
      
      if (isToolsTechLabel || isOutcomeLabel) {
        // Extract just the label part (e.g., "Tools/Tech used:" or "Outcome:")
        const labelMatch = trimmedContent.match(/^(tools\/tech used:|outcome:?)(.*)/i);
        if (labelMatch) {
          const label = labelMatch[1];
          const content = labelMatch[2].trim();
          
          // Create paragraph with bold label and regular content
          const runs: TextRun[] = [
            new TextRun({
              text: label,
              bold: true,
              size: 20, // 10pt
            })
          ];
          
          if (content) {
            runs.push(
              new TextRun({
                text: ` ${content}`,
                size: 20, // 10pt
              })
            );
          }
          
          children.push(
            new Paragraph({
              children: runs,
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            })
          );
        } else {
          // Fallback: render entire line in bold
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.content,
                  bold: true,
                  size: 20, // 10pt
                })
              ],
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200 },
            })
          );
        }
      } else {
        // Regular text paragraphs
        children.push(
          new Paragraph({
            text: section.content,
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
          })
        );
      }
    }
  }
  
  // Close any remaining bullet list
  if (inBulletList && bulletItems.length > 0) {
    children.push(...bulletItems);
  }
  
  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });
  
  // Generate and download
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

