import Link from "next/link"
import { Logo } from "@/components/logo"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="transition-transform duration-300 group-hover:scale-110">
              <Logo />
            </div>
            <div className="relative">
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80 dark:from-foreground dark:to-foreground/70">
                Resume Tailor
              </span>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></div>
            </div>
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/ats-score-checker"
              className="text-sm font-medium text-purple-600 dark:text-purple-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300 relative group"
            >
              ATS Score Checker
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-medium text-purple-600 dark:text-purple-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300 relative group"
            >
              How It Works
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-purple-600 dark:text-purple-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300 relative group">
              Pricing
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
            <Link href="/faq" className="text-sm font-medium text-purple-600 dark:text-purple-400 transition-colors hover:text-purple-700 dark:hover:text-purple-300 relative group">
              FAQ
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 group-hover:w-full transition-all duration-300"></div>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

