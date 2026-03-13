export function ResumeHeroIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 500 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-full h-auto"
    >
      <rect x="100" y="50" width="300" height="300" rx="10" className="fill-background stroke-border" strokeWidth="2" />

      {/* Document header */}
      <rect x="130" y="80" width="240" height="40" rx="4" className="fill-muted/30" />
      <circle cx="150" cy="100" r="15" className="fill-primary/20" />
      <rect x="175" y="90" width="120" height="8" rx="2" className="fill-foreground/70" />
      <rect x="175" y="105" width="80" height="6" rx="2" className="fill-muted-foreground" />

      {/* Document content */}
      <rect x="130" y="140" width="240" height="20" rx="2" className="fill-muted/50" />
      <rect x="130" y="170" width="240" height="60" rx="2" className="fill-muted/30" />
      <rect x="140" y="180" width="220" height="6" rx="1" className="fill-foreground/40" />
      <rect x="140" y="195" width="220" height="6" rx="1" className="fill-foreground/40" />
      <rect x="140" y="210" width="160" height="6" rx="1" className="fill-foreground/40" />

      <rect x="130" y="250" width="240" height="20" rx="2" className="fill-muted/50" />
      <rect x="130" y="280" width="240" height="50" rx="2" className="fill-muted/30" />
      <rect x="140" y="290" width="220" height="6" rx="1" className="fill-foreground/40" />
      <rect x="140" y="305" width="220" height="6" rx="1" className="fill-foreground/40" />

      {/* Person */}
      <circle cx="400" cy="120" r="30" className="fill-primary/20" />
      <rect x="385" y="160" width="30" height="60" rx="4" className="fill-primary/30" />

      {/* AI enhancement elements */}
      <circle
        cx="70"
        cy="150"
        r="25"
        className="fill-primary/10 stroke-primary"
        strokeWidth="2"
        strokeDasharray="4 2"
      />
      <circle
        cx="70"
        cy="220"
        r="25"
        className="fill-primary/10 stroke-primary"
        strokeWidth="2"
        strokeDasharray="4 2"
      />
      <circle
        cx="70"
        cy="290"
        r="25"
        className="fill-primary/10 stroke-primary"
        strokeWidth="2"
        strokeDasharray="4 2"
      />

      <path d="M95 150 L 120 150" className="stroke-primary" strokeWidth="2" strokeDasharray="4 2" />
      <path d="M95 220 L 120 220" className="stroke-primary" strokeWidth="2" strokeDasharray="4 2" />
      <path d="M95 290 L 120 290" className="stroke-primary" strokeWidth="2" strokeDasharray="4 2" />

      {/* Checkmark */}
      <circle cx="430" cy="290" r="30" className="fill-primary/20" />
      <path
        d="M415 290 L 425 300 L 445 280"
        className="stroke-primary"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

