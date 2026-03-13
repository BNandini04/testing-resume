import { Card, CardContent } from "@/components/ui/card"
import { parseResumeToStructure } from "@/lib/resume-parser"
import {
  ClassicLayout,
  BarsLayout,
  GreenBannerLayout,
  YellowProfileLayout,
  SlateProfileLayout,
} from "@/components/resume-templates"

export type ResumeTemplateId = "classic" | "bars" | "green" | "yellow" | "slate"

export const RESUME_TEMPLATES: { id: ResumeTemplateId; name: string; description: string }[] = [
  { id: "classic", name: "Classic", description: "Single column, traditional order" },
  { id: "bars", name: "Bars", description: "Grey bar section headers, diamond bullets for roles" },
  { id: "green", name: "Green banner", description: "Large green header with green section titles" },
  { id: "yellow", name: "Yellow profile", description: "Yellow header with photo area and black pill section labels" },
  { id: "slate", name: "Slate profile", description: "Centered photo header with gray band and centered contact bar" },
]

interface ResumePreviewProps {
  content: string
  isHumanized?: boolean
  template?: ResumeTemplateId
}

function escapeForHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

// Fallback when content is HTML or parse yields no structure: render as simple single-column text
// Applies bold to project titles, Tools/Tech used:, and Outcome: in PROJECTS section
function formatResumeTextFallback(text: string): string {
  if (!text) return ""
  const cleaned = text
    .replace(/^---+$/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
  const lines = cleaned.split("\n")
  let inProjects = false
  let nextLineIsProjectTitle = false
  const processed = lines.map((line) => {
    const trimmed = line.trim()
    if (/^PROJECTS\b/i.test(trimmed)) {
      inProjects = true
      nextLineIsProjectTitle = true
      return `<strong>${escapeForHtml(line)}</strong>`
    }
    if (/^(PROFESSIONAL SUMMARY|CORE SKILLS|WORK EXPERIENCE|PROFESSIONAL EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|ADDITIONAL INFORMATION)/i.test(trimmed)) {
      inProjects = /projects/i.test(trimmed)
      nextLineIsProjectTitle = inProjects
      return `<strong>${escapeForHtml(line)}</strong>`
    }
    if (inProjects) {
      const toolsTech = trimmed.match(/^(tools\/tech used:?)(.*)/i)
      const outcome = trimmed.match(/^(outcome:?)(.*)/i)
      if (toolsTech) {
        nextLineIsProjectTitle = true
        return `<strong>${escapeForHtml(toolsTech[1])}</strong>${escapeForHtml(toolsTech[2] || "")}`
      }
      if (outcome) {
        nextLineIsProjectTitle = true
        return `<strong>${escapeForHtml(outcome[1])}</strong>${escapeForHtml(outcome[2] || "")}`
      }
      if (trimmed && !/^[•\-*]\s/.test(trimmed) && !/^\d+\.\s/.test(trimmed)) {
        const titleExpl = trimmed.match(/^([^:]+):\s*(.*)$/)
        if (titleExpl && !/^(tools\/tech used|outcome)/i.test(titleExpl[1].trim())) {
          nextLineIsProjectTitle = false
          return `<strong>${escapeForHtml(titleExpl[1].trim())}</strong>: ${escapeForHtml(titleExpl[2].trim())}`
        }
        const isTitle = nextLineIsProjectTitle
        nextLineIsProjectTitle = false
        return isTitle ? `<strong>${escapeForHtml(line)}</strong>` : escapeForHtml(line)
      }
      nextLineIsProjectTitle = false
    }
    return escapeForHtml(line)
  })
  return "<div class=\"whitespace-pre-wrap text-sm font-sans text-gray-700 dark:text-gray-300 text-justify leading-relaxed\">" + processed.join("\n") + "</div>"
}

function TemplateRenderer({
  template,
  data,
}: {
  template: ResumeTemplateId
  data: ReturnType<typeof parseResumeToStructure>
}) {
  switch (template) {
    case "slate":
      return <SlateProfileLayout data={data} />
    case "yellow":
      return <YellowProfileLayout data={data} />
    case "green":
      return <GreenBannerLayout data={data} />
    case "bars":
      return <BarsLayout data={data} />
    default:
      return <ClassicLayout data={data} />
  }
}

export function ResumePreview({ content, isHumanized = false, template = "classic" }: ResumePreviewProps) {
  const isHtml = content.includes("<") && content.includes(">")
  const parsed = !isHtml && content ? parseResumeToStructure(content) : null
  const hasStructure = parsed && (parsed.name || parsed.sections.length > 0)

  return (
    <Card className={isHumanized ? "border-green-500/20 bg-green-500/5" : ""}>
      <CardContent className="p-6 md:p-8">
        <div className="max-w-none">
          {!content ? (
            <p className="text-muted-foreground">No resume content available</p>
          ) : hasStructure ? (
            <TemplateRenderer template={template} data={parsed!} />
          ) : (
            <div
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 text-sm text-gray-700 dark:text-gray-300 font-sans"
              dangerouslySetInnerHTML={{ __html: formatResumeTextFallback(content) }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
