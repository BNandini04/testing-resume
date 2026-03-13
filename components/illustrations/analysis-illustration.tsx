export function AnalysisIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-full h-auto"
    >
      {/* Document */}
      <rect x="50" y="40" width="100" height="120" rx="4" className="fill-background stroke-border" strokeWidth="2" />
      <rect x="60" y="50" width="80" height="6" rx="1" className="fill-foreground/40" />
      <rect x="60" y="65" width="80" height="6" rx="1" className="fill-foreground/40" />
      <rect x="60" y="80" width="60" height="6" rx="1" className="fill-foreground/40" />
      <rect x="60" y="95" width="80" height="6" rx="1" className="fill-foreground/40" />
      <rect x="60" y="110" width="70" height="6" rx="1" className="fill-foreground/40" />
      <rect x="60" y="125" width="80" height="6" rx="1" className="fill-foreground/40" />
      <rect x="60" y="140" width="50" height="6" rx="1" className="fill-foreground/40" />

      {/* Analysis elements */}
      <path d="M160 100 L190 100" className="stroke-primary" strokeWidth="2" strokeDasharray="4 2" />

      {/* AI brain/processing */}
      <circle cx="210" cy="100" r="30" className="fill-primary/10" />
      <path
        d="M195 100 C195 90, 225 90, 225 100 C225 110, 195 110, 195 100 Z"
        className="stroke-primary"
        strokeWidth="2"
        fill="none"
      />
      <path d="M200 90 L220 90 M200 110 L220 110 M210 85 L210 115" className="stroke-primary" strokeWidth="1.5" />

      {/* Result document */}
      <rect
        x="150"
        y="40"
        width="100"
        height="120"
        rx="4"
        className="fill-background stroke-primary/30"
        strokeWidth="2"
      />
      <rect x="160" y="50" width="80" height="6" rx="1" className="fill-foreground/40" />
      <rect x="160" y="65" width="80" height="6" rx="1" className="fill-primary/40" />
      <rect x="160" y="80" width="60" height="6" rx="1" className="fill-primary/40" />
      <rect x="160" y="95" width="80" height="6" rx="1" className="fill-foreground/40" />
      <rect x="160" y="110" width="70" height="6" rx="1" className="fill-primary/40" />
      <rect x="160" y="125" width="80" height="6" rx="1" className="fill-foreground/40" />
      <rect x="160" y="140" width="50" height="6" rx="1" className="fill-primary/40" />
    </svg>
  )
}

