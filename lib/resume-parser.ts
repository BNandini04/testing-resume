/**
 * Parses plain-text resume into structured data for different layout templates.
 */

const SECTION_HEADER =
  /^(PROFESSIONAL SUMMARY|CORE SKILLS|CODE SKILLS|SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i

export type Block =
  | { type: "bullet"; text: string }
  | { type: "jobHeader"; text: string }
  | { type: "paragraph"; text: string }

export interface ResumeSection {
  title: string
  blocks: Block[]
}

export interface ParsedResume {
  name: string
  contact: string
  sections: ResumeSection[]
}

function cleanText(text: string): string {
  return text
    .replace(/^---+$/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
}

function isSectionHeader(line: string): boolean {
  return SECTION_HEADER.test(line.trim())
}

function isProfessionalSummary(line: string): boolean {
  return /^PROFESSIONAL SUMMARY/i.test(line.trim())
}

function isContactLine(line: string): boolean {
  const t = line.trim()
  const hasLabel = /^(Phone|Email|Location|LinkedIn|Portfolio\/GitHub)/i.test(t) ||
    t.includes("Phone:") ||
    t.includes("Email:") ||
    t.includes("Location:") ||
    t.includes("LinkedIn:") ||
    t.includes("Portfolio/GitHub")
  const hasContactInfo = /\d{10,}/.test(t) || t.includes("@")
  return hasLabel || (hasContactInfo && (t.includes("|") || t.length < 80))
}

function looksLikeName(line: string): { name: string; contactFromLine?: string } | null {
  const trimmedLine = line.trim()
  if (!trimmedLine || trimmedLine.length > 100 || trimmedLine.length < 3) return null
  if (trimmedLine.toLowerCase().includes("candidate")) return null

  const initialMatch = trimmedLine.match(/^([A-Z]\.\s+[A-Z][a-z]+(?:\s+[A-Z]\.?\s+[A-Z][a-z]+)*)/)
  const fullNameMatch = trimmedLine.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/)
  const middleMatch = trimmedLine.match(/^([A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+)/)
  const allCaps = /^[A-Z][A-Z\s]+$/.test(trimmedLine) && trimmedLine.split(/\s+/).length >= 2 && trimmedLine.split(/\s+/).length <= 5

  let name = ""
  if (initialMatch) name = initialMatch[1]
  else if (fullNameMatch) name = fullNameMatch[1]
  else if (middleMatch) name = middleMatch[1]
  else if (allCaps) name = trimmedLine
  else return null

  const phoneRegex = /(\+?\d{1,3}[\s\-]?\d{1,4}[\s\-]?\d{6,})|(\d{10,})/
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
  const rest = trimmedLine.slice(name.length).trim()
  const hasContact = rest && (rest.includes("|") || phoneRegex.test(rest) || emailRegex.test(rest))
  return { name: name.trim(), contactFromLine: hasContact ? rest : undefined }
}

function cleanContactItem(info: string): string {
  return info
    .replace(/^(Phone|Email|Location|LinkedIn|Portfolio\/GitHub)\s*:\s*/i, "")
    .replace(/^(Phone|Email|Location|LinkedIn|Portfolio\/GitHub)\s*/i, "")
    .trim()
}

export function parseResumeToStructure(text: string): ParsedResume {
  const result: ParsedResume = { name: "", contact: "", sections: [] }
  if (!text) return result

  const raw = cleanText(text)
  const lines = raw.split("\n").map((l) => l.trimEnd())

  const contactParts: string[] = []
  let headerEndIndex = -1

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()
    if (isSectionHeader(t)) {
      headerEndIndex = i
      break
    }
    if (isContactLine(t)) {
      contactParts.push(cleanContactItem(t))
      continue
    }
    if (!result.name && i < 15) {
      const parsed = looksLikeName(line)
      if (parsed) {
        result.name = parsed.name
        if (parsed.contactFromLine) {
          if (parsed.contactFromLine.includes("|")) {
            contactParts.push(...parsed.contactFromLine.split("|").map((p) => cleanContactItem(p.trim())).filter(Boolean))
          } else {
            contactParts.push(cleanContactItem(parsed.contactFromLine))
          }
        }
      }
    }
  }

  if (!result.name && headerEndIndex > 0) {
    for (let i = 0; i < Math.min(headerEndIndex, 10); i++) {
      const t = lines[i].trim()
      if (!t || isContactLine(t)) continue
      const parsed = looksLikeName(lines[i])
      if (parsed) {
        result.name = parsed.name
        if (parsed.contactFromLine) {
          if (parsed.contactFromLine.includes("|")) {
            contactParts.push(...parsed.contactFromLine.split("|").map((p) => cleanContactItem(p.trim())).filter(Boolean))
          } else {
            contactParts.push(cleanContactItem(parsed.contactFromLine))
          }
        }
        break
      }
      const notContact =
        !t.includes("Phone") &&
        !t.includes("Email") &&
        !t.includes("Location") &&
        !t.includes("LinkedIn") &&
        !t.includes("Portfolio") &&
        !t.includes("GitHub") &&
        !t.includes("@") &&
        !/\d{10,}/.test(t) &&
        t.length < 80 &&
        t.length > 2
      if (notContact) {
        result.name = t
        break
      }
    }
  }

  if (!result.name && lines[0]) {
    const first = lines[0].trim()
    if (first && !isSectionHeader(first) && first.length < 100) {
      const parsed = looksLikeName(lines[0])
      if (parsed) {
        result.name = parsed.name
        if (parsed.contactFromLine) {
          if (parsed.contactFromLine.includes("|")) {
            contactParts.push(...parsed.contactFromLine.split("|").map((p) => cleanContactItem(p.trim())).filter(Boolean))
          } else {
            contactParts.push(cleanContactItem(parsed.contactFromLine))
          }
        }
      } else if (
        !first.toLowerCase().includes("phone") &&
        !first.toLowerCase().includes("email") &&
        !first.includes("@") &&
        !/\d{10,}/.test(first)
      ) {
        result.name = first
      }
    }
  }

  result.contact = contactParts.filter(Boolean).join(" | ")

  const startIndex = headerEndIndex >= 0 ? headerEndIndex : 0
  let currentSection: ResumeSection | null = null

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i]
    const t = line.trim()
    if (!t) {
      continue
    }
    if (isSectionHeader(t)) {
      if (currentSection && currentSection.blocks.length > 0) {
        result.sections.push(currentSection)
      }
      currentSection = isProfessionalSummary(t)
        ? { title: "Professional Summary", blocks: [] }
        : { title: t, blocks: [] }
      continue
    }
    if (!currentSection) {
      currentSection = { title: "Summary", blocks: [] }
    }
    const isBullet = /^[•\-*]\s/.test(t) || /^\d+\.\s/.test(t)
    const hasDate = /\d{4}|\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b/i.test(t)
    const isJobHeader = t.includes("—") && (hasDate || t.includes("Present"))
    if (isBullet) {
      const content = t.replace(/^[•\-*]\s/, "").replace(/^\d+\.\s/, "").trim()
      currentSection.blocks.push({ type: "bullet", text: content })
    } else if (isJobHeader) {
      currentSection.blocks.push({ type: "jobHeader", text: t })
    } else {
      currentSection.blocks.push({ type: "paragraph", text: t })
    }
  }
  if (currentSection && currentSection.blocks.length > 0) {
    result.sections.push(currentSection)
  }

  return result
}
