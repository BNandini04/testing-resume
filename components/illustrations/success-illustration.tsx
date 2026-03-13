export function SuccessIllustration() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 300 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="max-w-full h-auto"
    >
      {/* Success circle */}
      <circle cx="150" cy="100" r="60" className="fill-primary/10" />
      <circle cx="150" cy="100" r="50" className="fill-background stroke-primary" strokeWidth="2" />
      <path
        d="M125 100 L145 120 L175 80"
        className="stroke-primary"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Sparkles */}
      <path d="M80 70 L90 70 M85 65 L85 75" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M220 70 L230 70 M225 65 L225 75" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M80 130 L90 130 M85 125 L85 135" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M220 130 L230 130 M225 125 L225 135"
        className="stroke-primary"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* Document */}
      <rect x="210" y="90" width="40" height="50" rx="4" className="fill-background stroke-border" strokeWidth="1.5" />
      <rect x="215" y="95" width="30" height="3" rx="1" className="fill-foreground/40" />
      <rect x="215" y="102" width="30" height="3" rx="1" className="fill-foreground/40" />
      <rect x="215" y="109" width="20" height="3" rx="1" className="fill-foreground/40" />
      <rect x="215" y="116" width="30" height="3" rx="1" className="fill-foreground/40" />
      <rect x="215" y="123" width="25" height="3" rx="1" className="fill-foreground/40" />
      <rect x="215" y="130" width="15" height="3" rx="1" className="fill-foreground/40" />
    </svg>
  )
}

