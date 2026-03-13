import { cn } from "@/lib/utils"

interface LogoTextProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  variant?: "default" | "gradient"
}

export function LogoText({ className, size = "md", variant = "default" }: LogoTextProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <span
      className={cn(
        "font-bold tracking-tight",
        sizeClasses[size],
        variant === "gradient" && "bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/90 to-primary/70",
        className,
      )}
    >
      Resume Tailor
    </span>
  )
}

