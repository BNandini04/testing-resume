"use client"

import type { ParsedResume, Block, ResumeSection } from "@/lib/resume-parser"

function escapeHtml(text: string): string {
  const map: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

function isSkillsSection(title: string): boolean {
  return /core skills|^skills$/i.test(title.trim())
}

function isProjectsSection(title: string): boolean {
  return /projects/i.test(title.trim())
}

function isExperienceSection(title: string): boolean {
  return /work experience|professional experience/i.test(title.trim())
}

function renderBlocks(blocks: Block[], baseClass: string, sectionTitle?: string): React.ReactNode[] {
  const isSkills = sectionTitle ? isSkillsSection(sectionTitle) : false
  const isProjects = sectionTitle ? isProjectsSection(sectionTitle) : false
  const isExperience = sectionTitle ? isExperienceSection(sectionTitle) : false

  if (isSkills) {
    return [
      <ul key="skills" className={`${baseClass} list-disc list-inside ml-4 mb-2 space-y-0.5`}>
        {blocks.map((b, i) => (
          <li key={i} className="text-sm leading-snug">
            {escapeHtml(b.text)}
          </li>
        ))}
      </ul>,
    ]
  }

  if (isProjects) {
    const out: React.ReactNode[] = []
    let discItems: string[] = []
    let nextParagraphIsTitle = true
    const flushDisc = () => {
      if (discItems.length > 0) {
        out.push(
          <ul key={`uld-${out.length}`} className={`${baseClass} list-disc list-inside ml-4 mb-2 space-y-0.5`}>
            {discItems.map((text, i) => (
              <li key={i} className="text-sm leading-snug">
                {escapeHtml(text)}
              </li>
            ))}
          </ul>
        )
        discItems = []
      }
    }
    blocks.forEach((b) => {
      if (b.type === "jobHeader") {
        flushDisc()
        nextParagraphIsTitle = false
        out.push(
          <ul key={`pt-${out.length}`} className="list-none ml-4 mb-2 pl-0">
            <li className="text-sm leading-snug flex gap-2 items-start">
              <span className="text-gray-600 dark:text-gray-400 shrink-0" aria-hidden>
                •
              </span>
              <span className="font-bold">{escapeHtml(b.text)}</span>
            </li>
          </ul>
        )
      } else if (b.type === "bullet") {
        discItems.push(b.text)
        nextParagraphIsTitle = false
      } else {
        flushDisc()
        const trimmed = b.text.trim()
        const toolsTechMatch = trimmed.match(/^(tools\/tech used:?)(.*)/i)
        const outcomeMatch = trimmed.match(/^(outcome:?)(.*)/i)
        const titleExplanationMatch = trimmed.match(/^([^:]+):\s*(.*)$/)
        if (toolsTechMatch) {
          nextParagraphIsTitle = true
          out.push(
            <p key={out.length} className="text-sm leading-snug mb-1 ml-4">
              <span className="font-bold">{escapeHtml(toolsTechMatch[1])}</span>
              {toolsTechMatch[2] ? <span>{escapeHtml(toolsTechMatch[2])}</span> : null}
            </p>
          )
        } else if (outcomeMatch) {
          nextParagraphIsTitle = true
          out.push(
            <p key={out.length} className="text-sm leading-snug mb-1 ml-4">
              <span className="font-bold">{escapeHtml(outcomeMatch[1])}</span>
              {outcomeMatch[2] ? <span>{escapeHtml(outcomeMatch[2])}</span> : null}
            </p>
          )
        } else if (titleExplanationMatch && !/^(tools\/tech used|outcome)/i.test(titleExplanationMatch[1].trim())) {
          nextParagraphIsTitle = false
          out.push(
            <p key={out.length} className="text-sm leading-snug mb-1 ml-4">
              <span className="font-bold">{escapeHtml(titleExplanationMatch[1].trim())}</span>
              {titleExplanationMatch[2] ? <span>: {escapeHtml(titleExplanationMatch[2].trim())}</span> : null}
            </p>
          )
        } else {
          const isTitle = nextParagraphIsTitle
          nextParagraphIsTitle = false
          out.push(
            <p key={out.length} className={`text-sm leading-snug mb-1 ml-4 ${isTitle ? "font-bold" : ""}`}>
              {escapeHtml(b.text)}
            </p>
          )
        }
      }
    })
    flushDisc()
    return out
  }

  const out: React.ReactNode[] = []
  let listItems: string[] = []
  const flushList = () => {
    if (listItems.length > 0) {
      out.push(
        <ul key={`ul-${out.length}`} className={`${baseClass} list-disc list-inside ml-4 mb-2 space-y-0.5`}>
          {listItems.map((text, i) => (
            <li key={i} className="text-sm leading-snug">
              {escapeHtml(text)}
            </li>
          ))}
        </ul>
      )
      listItems = []
    }
  }
  blocks.forEach((b) => {
    if (b.type === "bullet") {
      listItems.push(b.text)
    } else {
      flushList()
      if (b.type === "jobHeader") {
        out.push(
          <div key={out.length} className={`${isExperience ? "font-bold" : "font-semibold"} text-sm mt-2 mb-0.5`}>
            {escapeHtml(b.text)}
          </div>
        )
      } else {
        // In experience section, paragraphs (title, company, address) are bold
        const paraClass = isExperience ? "font-bold" : ""
        out.push(
          <p key={out.length} className={`text-sm leading-snug mb-1 ${paraClass}`}>
            {escapeHtml(b.text)}
          </p>
        )
      }
    }
  })
  flushList()
  return out
}

function SectionBlock({ section, baseClass }: { section: ResumeSection; baseClass: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-sm font-bold uppercase border-b border-black dark:border-gray-400 pb-px mb-1 text-gray-900 dark:text-gray-100">
        {escapeHtml(section.title)}
      </h2>
      <div className={`text-gray-700 dark:text-gray-300 ${resumeContentClass}`}>{renderBlocks(section.blocks, baseClass, section.title)}</div>
    </div>
  )
}

const resumeBase = "bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
const resumeContentClass = "text-justify leading-relaxed"

/** Single column: name, contact, then all sections stacked (traditional format) */
export function ClassicLayout({ data }: { data: ParsedResume }) {
  return (
    <div className={`${resumeBase} p-8 max-w-2xl mx-auto font-sans text-sm ${resumeContentClass}`}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{escapeHtml(data.name)}</h1>
        {data.contact && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{escapeHtml(data.contact)}</p>
        )}
        <div className="border-b border-black dark:border-gray-400 mt-3 mb-8" />
      </div>
      <div className="space-y-1">
        {data.sections.map((s) => (
          <SectionBlock key={s.title} section={s} baseClass="resume-list" />
        ))}
      </div>
    </div>
  )
}

/** Bars (Tiffany): grey bar section headers, diamond bullets for roles, contact bar phone left / email right */
export function BarsLayout({ data }: { data: ParsedResume }) {
  const contactParts = data.contact ? data.contact.split("|").map((p) => p.trim()).filter(Boolean) : []
  const phonePart = contactParts.find((p) => /\d{7,}/.test(p)) || contactParts[0] || ""
  const emailPart = contactParts.find((p) => p.includes("@")) || contactParts[contactParts.length - 1] || ""
  const addressPart = contactParts.filter((p) => p !== phonePart && p !== emailPart).join(" | ")
  return (
    <div className={`${resumeBase} p-8 max-w-2xl mx-auto font-sans text-sm ${resumeContentClass}`}>
      <div className="text-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{escapeHtml(data.name)}</h1>
        {addressPart && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{escapeHtml(addressPart)}</p>
        )}
      </div>
      <div className="border-t border-gray-400 dark:border-gray-500 pt-3 mb-6 flex justify-between items-center gap-4">
        {phonePart && <span className="text-gray-700 dark:text-gray-300">{escapeHtml(phonePart)}</span>}
        {emailPart && <span className="text-gray-700 dark:text-gray-300 ml-auto">{escapeHtml(emailPart)}</span>}
      </div>
      <div className="space-y-0">
        {data.sections.map((s) => (
          <div key={s.title} className="mb-6">
            <div className="bg-gray-200 dark:bg-gray-700 py-2 px-3 mb-0">
              <h2 className="text-sm font-bold uppercase text-center text-gray-900 dark:text-gray-100">
                {escapeHtml(s.title)}
              </h2>
            </div>
            <div className="h-1 bg-gray-300 dark:bg-gray-600 w-full" />
            <div className="pt-3 text-gray-700 dark:text-gray-300 bars-section-content">
              {renderBlocksForBars(s.blocks, s.title)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Green banner (reference image): large green header, green section titles */
export function GreenBannerLayout({ data }: { data: ParsedResume }) {
  const contactParts = data.contact ? data.contact.split("|").map((p) => p.trim()).filter(Boolean) : []
  return (
    <div className={`${resumeBase} max-w-2xl mx-auto font-sans text-sm ${resumeContentClass}`}>
      <div className="bg-[#7CAA6A] text-white px-8 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-t-lg">
        <h1 className="text-3xl font-bold leading-tight">{escapeHtml(data.name)}</h1>
        {contactParts.length > 0 && (
          <div className="text-sm text-right space-y-0.5">
            {contactParts.map((part, i) => (
              <p key={i}>{escapeHtml(part)}</p>
            ))}
          </div>
        )}
      </div>
      <div className="px-8 py-6 space-y-6">
        {data.sections.map((s) => (
          <div key={s.title} className="mb-2">
            <h2 className="text-xl font-semibold text-[#4E7C4E] mb-1">
              {escapeHtml(s.title)}
            </h2>
            <div className="text-gray-800 dark:text-gray-200">
              {renderBlocks(s.blocks, "resume-list", s.title)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Yellow profile (Sebastian-style): yellow banner with photo area, black pill section headers */
export function YellowProfileLayout({ data }: { data: ParsedResume }) {
  const contactParts = data.contact ? data.contact.split("|").map((p) => p.trim()).filter(Boolean) : []
  return (
    <div className={`${resumeBase} max-w-2xl mx-auto font-sans text-sm ${resumeContentClass}`}>
      <div className="bg-[#F5C947] px-8 py-6 flex items-center gap-6 rounded-t-lg">
        <div className="w-20 h-20 rounded-full bg-gray-300 flex-shrink-0" />
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold tracking-wide text-gray-900">
            {escapeHtml(data.name)}
          </h1>
          {contactParts.length > 0 && (
            <div className="mt-2 text-sm text-gray-900 space-y-0.5">
              {contactParts.map((part, i) => (
                <p key={i}>{escapeHtml(part)}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="px-8 py-6 space-y-6">
        {data.sections.map((s) => (
          <div key={s.title} className="space-y-2">
            <div className="inline-block bg-black text-white text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded">
              {escapeHtml(s.title)}
            </div>
            <div className="text-gray-800 dark:text-gray-200">
              {renderBlocksForYellow(s.blocks, s.title)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderBlocksForYellow(blocks: Block[], sectionTitle?: string): React.ReactNode[] {
  const isSkills = sectionTitle ? isSkillsSection(sectionTitle) : false
  const isLanguages = sectionTitle ? /languages/i.test(sectionTitle) : false

  if (isSkills || isLanguages) {
    const items = blocks
      .filter((b) => b.type === "bullet" || b.type === "paragraph")
      .map((b) => b.text)
    if (!items.length) return []
    return [
      <div key="skills" className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
        {items.map((text, i) => (
          <div key={i} className="flex items-start text-sm leading-snug">
            <span className="mt-1 mr-2 text-xs text-gray-700">•</span>
            <span>{escapeHtml(text)}</span>
          </div>
        ))}
      </div>,
    ]
  }

  return renderBlocks(blocks, "resume-list", sectionTitle)
}

/** Slate profile (Daryl-style): centered photo header with centered name and contact bar */
export function SlateProfileLayout({ data }: { data: ParsedResume }) {
  const contactParts = data.contact ? data.contact.split("|").map((p) => p.trim()).filter(Boolean) : []
  const contactLine = contactParts.join("  •  ")
  return (
    <div className={`${resumeBase} max-w-2xl mx-auto font-sans text-sm ${resumeContentClass}`}>
      <div className="bg-[#6B6257] px-8 pt-8 pb-6 flex flex-col items-center text-white rounded-t-lg">
        <div className="w-20 h-20 rounded-full bg-gray-300 mb-3" />
        <h1 className="text-2xl font-semibold tracking-wide uppercase">
          {escapeHtml(data.name)}
        </h1>
      </div>
      {contactLine && (
        <div className="bg-[#6B6257] px-8 pb-4 text-xs text-gray-100 flex justify-center">
          <span>{escapeHtml(contactLine)}</span>
        </div>
      )}
      <div className="px-8 py-6 space-y-6">
        {data.sections.map((s) => (
          <div key={s.title} className="space-y-2">
            <div className="bg-[#6B6257] text-white text-xs font-semibold tracking-wide uppercase px-3 py-1 rounded text-center">
              {escapeHtml(s.title)}
            </div>
            <div className="text-gray-800 dark:text-gray-200">
              {renderBlocks(s.blocks, "resume-list", s.title)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function renderBlocksForBars(blocks: Block[], sectionTitle?: string): React.ReactNode[] {
  const isExperience = sectionTitle ? /work experience|professional experience|experience/i.test(sectionTitle) : false
  const isEducation = sectionTitle ? /education/i.test(sectionTitle) : false
  const isProjects = sectionTitle ? /projects/i.test(sectionTitle) : false
  const useDiamond = isExperience || isEducation
  const out: React.ReactNode[] = []
  let listItems: string[] = []
  let nextParagraphIsProjectTitle = isProjects
  const flushList = () => {
    if (listItems.length > 0) {
      out.push(
        <ul key={`ul-${out.length}`} className="list-disc list-inside ml-4 mb-2 space-y-0.5 text-justify">
          {listItems.map((text, i) => (
            <li key={i} className="text-sm leading-snug">{escapeHtml(text)}</li>
          ))}
        </ul>
      )
      listItems = []
    }
  }
  blocks.forEach((b) => {
    if (b.type === "bullet") {
      listItems.push(b.text)
    } else {
      flushList()
      if (b.type === "jobHeader" && useDiamond) {
        const parts = b.text.split(/\s*[—–-]\s*/).map((p) => p.trim()).filter(Boolean)
        const titlePart = parts.length >= 2 ? parts.slice(0, -2).join(" — ") : parts[0] || b.text
        const datePart = parts.length >= 2 ? parts[parts.length - 2] : ""
        const locationPart = parts.length >= 3 ? parts[parts.length - 1] : ""
        out.push(
          <div key={out.length} className="mt-3 mb-1">
            <div className="flex flex-wrap justify-between gap-x-4 items-baseline">
              <span className="font-bold text-sm">
                <span className="text-gray-700 dark:text-gray-400 mr-1" aria-hidden>♦</span>
                {escapeHtml(titlePart)}
              </span>
              {datePart && <span className="text-xs text-gray-600 dark:text-gray-400 text-right shrink-0">{escapeHtml(datePart)}</span>}
            </div>
            {locationPart && (
              <div className="text-xs text-gray-600 dark:text-gray-400 text-right mt-0.5">{escapeHtml(locationPart)}</div>
            )}
          </div>
        )
      } else if (b.type === "jobHeader") {
        out.push(
          <div key={out.length} className="font-semibold text-sm mt-2 mb-0.5">
            {escapeHtml(b.text)}
          </div>
        )
      } else if (isProjects) {
        const trimmed = b.text.trim()
        const toolsTechMatch = trimmed.match(/^(tools\/tech used:?)(.*)/i)
        const outcomeMatch = trimmed.match(/^(outcome:?)(.*)/i)
        const labelMatch = toolsTechMatch || outcomeMatch

        if (labelMatch) {
          nextParagraphIsProjectTitle = true
          const label = labelMatch[1]
          const rest = (labelMatch[2] || "").trim()
          out.push(
            <p key={out.length} className="text-sm leading-snug mb-1 text-justify">
              <span className="font-semibold">{escapeHtml(label)}</span>
              {rest && <> {escapeHtml(rest)}</>}
            </p>
          )
        } else {
          const titleExplMatch = trimmed.match(/^([^:]+):\s*(.*)$/)
          if (titleExplMatch && !/^(tools\/tech used|outcome)/i.test(titleExplMatch[1].trim())) {
            nextParagraphIsProjectTitle = false
            const title = titleExplMatch[1].trim()
            const expl = titleExplMatch[2].trim()
            out.push(
              <p key={out.length} className="text-sm leading-snug mb-1 text-justify">
                <span className="font-semibold">{escapeHtml(title)}</span>
                {expl && (
                  <>
                    {": "}
                    {escapeHtml(expl)}
                  </>
                )}
              </p>
            )
          } else {
            const isTitle = nextParagraphIsProjectTitle
            nextParagraphIsProjectTitle = false
            const paragraphClass = isTitle
              ? "text-sm leading-snug mb-1 text-justify font-semibold"
              : "text-sm leading-snug mb-1 text-justify"
            out.push(
              <p key={out.length} className={paragraphClass}>
                {escapeHtml(b.text)}
              </p>
            )
          }
        }
      } else {
        const paragraphClass = isExperience
          ? "text-sm leading-snug mb-1 text-justify font-semibold"
          : "text-sm leading-snug mb-1 text-justify"
        out.push(
          <p key={out.length} className={paragraphClass}>
            {escapeHtml(b.text)}
          </p>
        )
      }
    }
  })
  flushList()
  return out
}
